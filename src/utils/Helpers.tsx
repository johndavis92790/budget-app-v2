import { DocumentReference, Timestamp, doc } from "firebase/firestore";
import {
  NonRecurringEntry,
  RecurringEntry,
  addCategory,
  addnonRecurringEntry,
  addNonRecurringRefund,
  addTag,
  calculateFiscalWeekRef,
  fetchEntriesAfterDate,
  fetchMostRecentEntryBeforeDate,
  updateEntries,
  updateMonthlyGoal,
  updateWeeklyCurrentGoal,
} from "./FirebaseHelpers";
import { firestore } from "./firebase";

export function formatAsCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export const getLast28DaysStartDate = (): Date => {
  const date = new Date();
  date.setDate(date.getDate() - 28);
  return date;
};

export const shortMonths = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const todaysDate = new Date()
  .toLocaleDateString("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
  .split("/")
  .reverse()
  .join("-");

export const formatFirestoreTimestamp = (timestamp: Timestamp): string => {
  if (!timestamp) {
    return "";
  }
  const date = timestamp.toDate(); // Convert to JavaScript Date
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short", // 'short', 'long', or 'narrow'
    month: "short", // 'short', 'long', or 'narrow'
    day: "numeric", // 'numeric' or '2-digit'
  };
  return date.toLocaleDateString("en-US", options); // Format the date
};

export const handleCurrencyChange = (
  e: React.ChangeEvent<HTMLInputElement>,
) => {
  // Strip out all non-numeric characters except for the decimal point
  const value = e.target.value.replace(/[^\d.]/g, "");
  return Number(value);
};

export const handleNewEntry = async (
  type: "expense" | "refund",
  currentTags: string[],
  tags: string[],
  setTags: React.Dispatch<React.SetStateAction<string[]>>,
  currentCategory: string,
  categories: string[],
  setCategories: React.Dispatch<React.SetStateAction<string[]>>,
  currentDate: string,
  currentAmount: number | null,
  currentNotes: string,
  monthlyGoal: number,
  setMonthlyGoal: React.Dispatch<React.SetStateAction<number>>,
  weeklyGoal: number,
  setWeeklyGoal: React.Dispatch<React.SetStateAction<number>>,
  setnonRecurringEntries: React.Dispatch<
    React.SetStateAction<NonRecurringEntry[]>
  >,
  setCurrentCategory: React.Dispatch<React.SetStateAction<string>>,
  setCurrentTags: React.Dispatch<React.SetStateAction<string[]>>,
  setCurrentDate: React.Dispatch<React.SetStateAction<string>>,
  setCurrentAmount: React.Dispatch<React.SetStateAction<number | null>>,
  setCurrentNotes: React.Dispatch<React.SetStateAction<string>>,
): Promise<void> => {
  if (currentTags.length === 0) {
    alert("Please choose or enter a tag.");
    return;
  }

  const newTags = currentTags.filter((tag) => !tags.includes(tag));
  await Promise.all(
    newTags.map(async (tag) => {
      await addTag(tag);
      setTags((prev) => [...prev, tag]);
    }),
  );

  if (!categories.includes(currentCategory)) {
    await addCategory(currentCategory);
    setCategories((prev) => [...prev, currentCategory]);
  }

  if (
    currentCategory &&
    currentTags.length > 0 &&
    currentDate &&
    currentAmount !== null
  ) {
    let selectedDateTimestamp;
    const entryDate = new Date(currentDate);
    const today = new Date(todaysDate);

    // Reset the time components to 0 to compare only the date part
    entryDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    if (entryDate.getTime() === today.getTime()) {
      selectedDateTimestamp = Timestamp.now();
    } else {
      const currentTime = new Date();
      const selectedDate = new Date(currentDate);

      // Set the time of selectedDate to the current time
      selectedDate.setHours(
        currentTime.getHours(),
        currentTime.getMinutes(),
        currentTime.getSeconds(),
        currentTime.getMilliseconds(),
      );

      selectedDateTimestamp = Timestamp.fromDate(selectedDate);
    }

    const mostRecentEntryBefore = await fetchMostRecentEntryBeforeDate(
      selectedDateTimestamp,
    );
    const monthlyGoalFrom = mostRecentEntryBefore
      ? mostRecentEntryBefore.monthlyGoalTo!
      : monthlyGoal;
    const weeklyGoalFrom = mostRecentEntryBefore
      ? mostRecentEntryBefore.weeklyGoalTo!
      : weeklyGoal;
    const fiscalWeekString: string = calculateFiscalWeekRef(currentDate);
    const fiscalWeekRef: DocumentReference | undefined = fiscalWeekString
      ? doc(firestore, "fiscalWeeks", fiscalWeekString)
      : undefined;
    let newEntry = createNewEntry(
      currentCategory,
      currentTags,
      currentDate,
      selectedDateTimestamp,
      currentAmount,
      type,
      currentNotes,
      monthlyGoalFrom,
      weeklyGoalFrom,
      fiscalWeekRef!,
    );

    const newEntryDocRef = await (type === "expense"
      ? addnonRecurringEntry(newEntry)
      : addNonRecurringRefund(newEntry));
    newEntry.docId = newEntryDocRef.id;

    if (entryDate < today) {
      const subsequentEntries = await fetchEntriesAfterDate(
        selectedDateTimestamp,
      );
      const allEntries = sortEntries([newEntry, ...subsequentEntries]);
      recalculateAndUpdateEntries(
        currentDate,
        allEntries,
        setnonRecurringEntries,
        setMonthlyGoal,
        updateMonthlyGoal,
        setWeeklyGoal,
        updateWeeklyCurrentGoal,
      );
    } else {
      setMonthlyGoal(newEntry.monthlyGoalTo || 0);
      updateMonthlyGoal(newEntry.monthlyGoalTo || 0);
      setWeeklyGoal(newEntry.weeklyGoalTo || 0);
      updateWeeklyCurrentGoal(currentDate, newEntry.weeklyGoalTo || 0);
      setnonRecurringEntries((prev) => [...prev, newEntry]);
    }

    resetFormState(
      setCurrentCategory,
      setCurrentTags,
      setCurrentDate,
      setCurrentAmount,
      setCurrentNotes,
    );
  } else {
    alert("Please ensure all fields are filled in.");
  }
};

function createNewEntry(
  category: string,
  tags: string[],
  date: string,
  dateTime: Timestamp,
  value: number,
  type: "expense" | "refund",
  notes: string,
  monthlyGoalFrom: number,
  weeklyGoalFrom: number,
  fiscalWeekRef: DocumentReference,
): NonRecurringEntry {
  return {
    category,
    tags,
    date,
    dateTime,
    value,
    type,
    notes,
    monthlyGoalFrom,
    monthlyGoalTo:
      type === "expense" ? monthlyGoalFrom - value : monthlyGoalFrom + value,
    weeklyGoalFrom,
    weeklyGoalTo:
      type === "expense" ? weeklyGoalFrom - value : weeklyGoalFrom + value,
    fiscalWeekRef,
  };
}

function sortEntries(entries: NonRecurringEntry[]): NonRecurringEntry[] {
  return entries.sort((a, b) => {
    const aTime = a.dateTime.toDate().getTime();
    const bTime = b.dateTime.toDate().getTime();
    return aTime - bTime;
  });
}

async function recalculateAndUpdateEntries(
  currentDate: string,
  entries: NonRecurringEntry[],
  setnonRecurringEntries: React.Dispatch<
    React.SetStateAction<NonRecurringEntry[]>
  >,
  setMonthlyGoal: React.Dispatch<React.SetStateAction<number>>,
  updateMonthlyGoal: (value: number) => Promise<void>,
  setWeeklyGoal: React.Dispatch<React.SetStateAction<number>>,
  updateWeeklyGoal: (currentDate: string, value: number) => Promise<void>,
): Promise<void> {
  let runningTotal = entries[0].monthlyGoalTo;
  entries.forEach((entry, index) => {
    if (index !== 0) {
      entry.monthlyGoalFrom = runningTotal;
      entry.weeklyGoalFrom = runningTotal;
      runningTotal =
        entry.type === "expense"
          ? runningTotal! - entry.value
          : runningTotal! + entry.value;
      entry.monthlyGoalTo = runningTotal;
      entry.weeklyGoalTo = runningTotal;
    }
  });

  await updateEntries(entries);
  const lastEntryMonthlyGoalTo = entries[entries.length - 1].monthlyGoalTo || 0;
  setMonthlyGoal(lastEntryMonthlyGoalTo);
  updateMonthlyGoal(lastEntryMonthlyGoalTo);
  const lastEntryWeeklyGoalTo = entries[entries.length - 1].weeklyGoalTo || 0;
  setWeeklyGoal(lastEntryWeeklyGoalTo);
  updateWeeklyGoal(currentDate, lastEntryWeeklyGoalTo);
  setnonRecurringEntries(entries);
}

function resetFormState(
  setCurrentCategory: React.Dispatch<React.SetStateAction<string>>,
  setCurrentTags: React.Dispatch<React.SetStateAction<string[]>>,
  setCurrentDate: React.Dispatch<React.SetStateAction<string>>,
  setCurrentAmount: React.Dispatch<React.SetStateAction<number | null>>,
  setCurrentNotes: React.Dispatch<React.SetStateAction<string>>,
): void {
  setCurrentCategory("");
  setCurrentTags([]);
  setCurrentDate(todaysDate);
  setCurrentAmount(null);
  setCurrentNotes("");
}

export const calculateTotals = (
  incomes: RecurringEntry[],
  expenses: RecurringEntry[],
) => {
  const totalIncome = incomes.reduce(
    (acc: number, curr: RecurringEntry) => acc + curr.value,
    0,
  );
  const tithing: RecurringEntry = {
    name: "Tithing",
    value: totalIncome * 0.1,
  };
  const totalExpense =
    expenses.reduce(
      (acc: number, curr: RecurringEntry) => acc + curr.value,
      0,
    ) + tithing.value;

  const monthlyIncome = totalIncome;
  const yearlyIncome = monthlyIncome * 12;

  const monthlyExpenses = totalExpense;
  const yearlyExpenses = monthlyExpenses * 12;

  const availableMonthly = monthlyIncome - monthlyExpenses;
  const availableFiscalMonthly = ((yearlyIncome - yearlyExpenses) / 365) * 28;
  const availableWeekly = ((yearlyIncome - yearlyExpenses) / 365) * 7;

  return {
    tithing,
    totalIncome,
    totalExpense,
    monthlyIncome,
    yearlyIncome,
    monthlyExpenses,
    yearlyExpenses,
    availableMonthly,
    availableFiscalMonthly,
    availableWeekly,
  };
};

export const ordinal = (i: number) => {
  const j = i % 10,
    k = i % 100;
  if (j === 1 && k !== 11) {
    return i + "st";
  }
  if (j === 2 && k !== 12) {
    return i + "nd";
  }
  if (j === 3 && k !== 13) {
    return i + "rd";
  }
  return i + "th";
};
