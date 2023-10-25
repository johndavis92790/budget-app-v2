import {
  addCategory,
  addNonRecurringExpense,
  addNonRecurringRefund,
  addTag,
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
  value: number;
  type: string;
  notes: string;
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
  setTags: (value: string[] | ((prev: string[]) => string[])) => void,
  currentCategory: string,
  categories: string[],
  setCategories: (value: string[] | ((prev: string[]) => string[])) => void,
  currentDate: string,
  currentAmount: number | null,
  currentNotes: string,
  setMonthlyGoal: (value: number) => void,
  setNonRecurringExpenses: (
    value:
      | NonRecurringEntry[]
      | ((prev: NonRecurringEntry[]) => NonRecurringEntry[]),
  ) => void,
  monthlyGoal: number,
  setCurrentCategory: (value: React.SetStateAction<string>) => void,
  setCurrentTags: (value: React.SetStateAction<string[]>) => void,
  setCurrentDate: (value: React.SetStateAction<string>) => void,
  setCurrentAmount: (value: React.SetStateAction<number | null>) => void,
  setCurrentNotes: (value: React.SetStateAction<string>) => void,
) => {
  if (currentTags.length === 0) {
    alert("Please choose or enter a tag.");
    return;
  }

  const newTags = currentTags.filter((tag) => !tags.includes(tag));
  for (const tag of newTags) {
    await addTag(tag);
    setTags((prev) => [...prev, tag]);
  }

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
    const newEntry = {
      category: currentCategory,
      tags: currentTags,
      date: currentDate,
      value: currentAmount,
      type,
      notes: currentNotes,
    };

    if (type === "expense") {
      await addNonRecurringExpense(newEntry);
      const updatedGoal = monthlyGoal - currentAmount;
      setMonthlyGoal(updatedGoal);
      updateMonthlyGoal(updatedGoal);
    } else {
      await addNonRecurringRefund(newEntry);
      const updatedGoal = monthlyGoal + currentAmount;
      setMonthlyGoal(updatedGoal);
      updateMonthlyGoal(updatedGoal);
    }

    setNonRecurringExpenses((prev) => [...prev, newEntry]);

    setCurrentCategory("");
    setCurrentTags([]);
    setCurrentDate(todaysDate);
    setCurrentAmount(null);
    setCurrentNotes("");
    window.location.reload();
  } else {
    alert("Please ensure all fields are filled in.");
  }
};

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
