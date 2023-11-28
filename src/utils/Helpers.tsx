import { Timestamp } from "firebase/firestore";
import {
  addCategory,
  addNonRecurringExpense,
  addNonRecurringRefund,
  addTag,
  fetchEntriesAfterDate,
  fetchMostRecentEntryBeforeDate,
  updateEntries,
  updateMonthlyGoal,
} from "./FirebaseHelpers";

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

export type NonRecurringEntry = {
  docId?: string;
  category: string;
  tags: string[];
  date: string;
  dateTime: Timestamp;
  value: number;
  type: string;
  notes: string;
  goalFrom?: number;
  goalTo?: number;
};

export type RecurringEntry = {
  name: string;
  value: number;
};

export const todaysDate = new Date().toISOString().split("T")[0];

export function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split("-").map((s) => parseInt(s, 10));
  const dateObj = new Date(year, month - 1, day);
  const options = { weekday: "short", month: "short", day: "numeric" } as const;
  return dateObj.toLocaleDateString(undefined, options).replace(",", "");
}

export const handleCurrencyChange = (
  e: React.ChangeEvent<HTMLInputElement>
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
  setMonthlyGoal: React.Dispatch<React.SetStateAction<number>>,
  setNonRecurringExpenses: React.Dispatch<React.SetStateAction<NonRecurringEntry[]>>,
  monthlyGoal: number,
  setCurrentCategory: React.Dispatch<React.SetStateAction<string>>,
  setCurrentTags: React.Dispatch<React.SetStateAction<string[]>>,
  setCurrentDate: React.Dispatch<React.SetStateAction<string>>,
  setCurrentAmount: React.Dispatch<React.SetStateAction<number | null>>,
  setCurrentNotes: React.Dispatch<React.SetStateAction<string>>
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
    })
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
    const selectedDateTimestamp = Timestamp.fromDate(
      new Date(currentDate + "T00:00:00")
    );
    const entryDate = new Date(currentDate);
    const today = new Date(todaysDate);

    const mostRecentEntryBefore =
      await fetchMostRecentEntryBeforeDate(currentDate);
      const goalFrom = mostRecentEntryBefore
      ? mostRecentEntryBefore.goalTo!
      : monthlyGoal;
    
    let newEntry = createNewEntry(
      currentCategory,
      currentTags,
      currentDate,
      selectedDateTimestamp,
      currentAmount,
      type,
      currentNotes,
      goalFrom
    );

    if (entryDate < today) {
      const newEntryDocRef = await (type === "expense"
        ? addNonRecurringExpense(newEntry)
        : addNonRecurringRefund(newEntry));
      newEntry.docId = newEntryDocRef.id;

      const subsequentEntries = await fetchEntriesAfterDate(currentDate);
      const allEntries = sortEntries([newEntry, ...subsequentEntries]);
      recalculateAndUpdateEntries(
        allEntries,
        setNonRecurringExpenses,
        setMonthlyGoal,
        updateMonthlyGoal
      );
    } else {
      addLatestEntry(
        newEntry,
        type,
        setMonthlyGoal,
        updateMonthlyGoal,
        setNonRecurringExpenses
      );
    }

    resetFormState(
      setCurrentCategory,
      setCurrentTags,
      setCurrentDate,
      setCurrentAmount,
      setCurrentNotes
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
  goalFrom: number
): NonRecurringEntry {
  return {
    category,
    tags,
    date,
    dateTime,
    value,
    type,
    notes,
    goalFrom,
    goalTo: type === "expense" ? goalFrom - value : goalFrom + value,
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
  entries: NonRecurringEntry[],
  setNonRecurringExpenses: React.Dispatch<React.SetStateAction<NonRecurringEntry[]>>,
  setMonthlyGoal: React.Dispatch<React.SetStateAction<number>>,
  updateMonthlyGoal: (value: number) => Promise<void>
): Promise<void> {
  let runningTotal = entries[0].goalTo;
  entries.forEach((entry, index) => {
    if (index !== 0) {
      entry.goalFrom = runningTotal;
      runningTotal =
        entry.type === "expense"
          ? runningTotal! - entry.value
          : runningTotal! + entry.value;
      entry.goalTo = runningTotal;
    }
  });

  await updateEntries(entries);
  const lastEntryGoalTo = entries[entries.length - 1].goalTo || 0;
  setMonthlyGoal(lastEntryGoalTo);
  updateMonthlyGoal(lastEntryGoalTo);
  setNonRecurringExpenses(entries);
}

async function addLatestEntry(
  newEntry: NonRecurringEntry,
  type: "expense" | "refund",
  setMonthlyGoal: React.Dispatch<React.SetStateAction<number>>,
  updateMonthlyGoal: (value: number) => Promise<void>,
  setNonRecurringExpenses: React.Dispatch<React.SetStateAction<NonRecurringEntry[]>>
): Promise<void> {
  const newEntryDocRef =
    type === "expense"
      ? await addNonRecurringExpense(newEntry)
      : await addNonRecurringRefund(newEntry);
  newEntry.docId = newEntryDocRef.id;

  setMonthlyGoal(newEntry.goalTo || 0);
  updateMonthlyGoal(newEntry.goalTo || 0);
  setNonRecurringExpenses((prev) => [...prev, newEntry]);
}

function resetFormState(
  setCurrentCategory: React.Dispatch<React.SetStateAction<string>>,
  setCurrentTags: React.Dispatch<React.SetStateAction<string[]>>,
  setCurrentDate: React.Dispatch<React.SetStateAction<string>>,
  setCurrentAmount: React.Dispatch<React.SetStateAction<number | null>>,
  setCurrentNotes: React.Dispatch<React.SetStateAction<string>>
): void {
  setCurrentCategory("");
  setCurrentTags([]);
  setCurrentDate(todaysDate);
  setCurrentAmount(null);
  setCurrentNotes("");
}

export const calculateTotals = (
  incomes: RecurringEntry[],
  expenses: RecurringEntry[]
) => {
  const totalIncome = incomes.reduce(
    (acc: number, curr: RecurringEntry) => acc + curr.value,
    0
  );
  const tithing: RecurringEntry = {
    name: "Tithing",
    value: totalIncome * 0.1,
  };
  const totalExpense =
    expenses.reduce(
      (acc: number, curr: RecurringEntry) => acc + curr.value,
      0
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
