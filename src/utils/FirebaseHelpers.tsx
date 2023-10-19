import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  runTransaction,
} from "firebase/firestore";
import { firestore } from "./firebase";
import { RecurringEntry, NonRecurringEntry } from "./Helpers";

export const addRecurringEntry = async (entry: {
  type: "income" | "expense";
  name: string;
  value: number;
}) => {
  const budgetRef = doc(firestore, "familyBudget", "budget");
  const budgetSnap = await getDoc(budgetRef);

  const newEntry = { name: entry.name, value: entry.value };

  if (budgetSnap.exists()) {
    if (entry.type === "income") {
      await updateDoc(budgetRef, {
        incomes: arrayUnion(newEntry),
      });
    } else {
      await updateDoc(budgetRef, {
        expenses: arrayUnion(newEntry),
      });
    }
  } else {
    if (entry.type === "income") {
      await setDoc(budgetRef, {
        incomes: [newEntry],
        expenses: [],
      });
    } else {
      await setDoc(budgetRef, {
        incomes: [],
        expenses: [newEntry],
      });
    }
  }
};

export const fetchRecurringEntries = async () => {
  const budgetRef = doc(firestore, "familyBudget", "budget");
  const budgetSnap = await getDoc(budgetRef);
  return budgetSnap.data();
};

export const updateRecurringEntry = async (
  type: "income" | "expense",
  oldName: string,
  oldValue: number,
  newName: string,
  newValue: number
) => {
  const budgetRef = doc(firestore, "familyBudget", "budget");
  const newEntry = { name: newName, value: newValue };

  await runTransaction(firestore, async (transaction) => {
    const currentData = await transaction.get(budgetRef);
    if (!currentData.exists()) {
      throw new Error("Document does not exist!");
    }

    if (type === "income") {
      transaction.update(budgetRef, {
        incomes: [
          ...currentData
            .data()
            .incomes.filter(
              (entry: RecurringEntry) =>
                entry.name !== oldName && entry.value !== oldValue
            ),
          newEntry,
        ],
      });
    } else {
      transaction.update(budgetRef, {
        expenses: [
          ...currentData
            .data()
            .expenses.filter(
              (entry: RecurringEntry) =>
                entry.name !== oldName && entry.value !== oldValue
            ),
          newEntry,
        ],
      });
    }
  });
};

export const deleteRecurringEntry = async (
  type: "income" | "expense",
  name: string,
  value: number
) => {
  const budgetRef = doc(firestore, "familyBudget", "budget");

  const entry = { name, value };

  if (type === "income") {
    await updateDoc(budgetRef, {
      incomes: arrayRemove(entry),
    });
  } else {
    await updateDoc(budgetRef, {
      expenses: arrayRemove(entry),
    });
  }
};

export const addNonRecurringExpense = async (entry: NonRecurringEntry) => {
  const nonRecurringRef = doc(
    firestore,
    "familyBudget",
    "nonRecurringExpenses"
  );
  const nonRecurringSnap = await getDoc(nonRecurringRef);

  if (nonRecurringSnap.exists()) {
    await updateDoc(nonRecurringRef, {
      expenses: arrayUnion(entry), // Directly add entry without adjustment
    });
  } else {
    await setDoc(nonRecurringRef, {
      expenses: [entry],
    });
  }
};

export const fetchNonRecurringExpenses = async () => {
  const nonRecurringRef = doc(
    firestore,
    "familyBudget",
    "nonRecurringExpenses"
  );
  const nonRecurringSnap = await getDoc(nonRecurringRef);
  const expenses = nonRecurringSnap.data()?.expenses || [];

  return expenses.map((expense: NonRecurringEntry) => {
    // Since the date is already in the string format, there's no need for additional conversion
    return {
      ...expense,
      date: expense.date, // This should be a string now
    };
  });
};

export const deleteNonRecurringExpense = async (entry: NonRecurringEntry) => {
  const nonRecurringRef = doc(
    firestore,
    "familyBudget",
    "nonRecurringExpenses"
  );
  await updateDoc(nonRecurringRef, {
    expenses: arrayRemove(entry),
  });
};

export const fetchCurrentGoal = async (): Promise<number | null> => {
  const goalRef = doc(firestore, "familyBudget", "currentGoal");
  const goalSnap = await getDoc(goalRef);

  if (goalSnap.exists() && typeof goalSnap.data()?.amount === "number") {
    return goalSnap.data()?.amount;
  } else {
    return null;
  }
};

export const updateMonthlyGoal = async (newGoal: number): Promise<void> => {
  const goalRef = doc(firestore, "familyBudget", "currentGoal");
  const goalSnap = await getDoc(goalRef);

  if (goalSnap.exists()) {
    await updateDoc(goalRef, {
      amount: newGoal,
    });
  } else {
    await setDoc(goalRef, {
      amount: newGoal,
    });
  }
};

export const fetchTotalIncomeAndExpenses = async (): Promise<{
  totalIncome: number;
  totalExpenses: number;
}> => {
  const data = await fetchRecurringEntries();
  let totalIncome = 0;
  let totalExpenses = 0;

  if (data?.incomes) {
    totalIncome = data.incomes.reduce(
      (acc: number, entry: RecurringEntry) => acc + entry.value,
      0
    );
  }

  if (data?.expenses) {
    totalExpenses = data.expenses.reduce(
      (acc: number, entry: RecurringEntry) => acc + entry.value,
      0
    );
  }

  return {
    totalIncome,
    totalExpenses,
  };
};

export const updateTotalIncome = async (newIncome: number): Promise<void> => {
  const budgetRef = doc(firestore, "familyBudget", "budget");
  const currentData = await getDoc(budgetRef);

  if (currentData.exists()) {
    const incomes = currentData.data()?.incomes || [];
    incomes.push({ name: `Income ${incomes.length + 1}`, value: newIncome });
    await updateDoc(budgetRef, { incomes });
  } else {
    await setDoc(budgetRef, {
      incomes: [{ name: "Income 1", value: newIncome }],
      expenses: [],
    });
  }
};

export const updateTotalExpenses = async (
  newExpense: number
): Promise<void> => {
  const budgetRef = doc(firestore, "familyBudget", "budget");
  const currentData = await getDoc(budgetRef);

  if (currentData.exists()) {
    const expenses = currentData.data()?.expenses || [];
    expenses.push({
      name: `Expense ${expenses.length + 1}`,
      value: newExpense,
    });
    await updateDoc(budgetRef, { expenses });
  } else {
    await setDoc(budgetRef, {
      incomes: [],
      expenses: [{ name: "Expense 1", value: newExpense }],
    });
  }
};

export const fetchCategories = async (): Promise<string[]> => {
  const categoriesRef = doc(firestore, "familyBudget", "categories");
  const categoriesSnap = await getDoc(categoriesRef);
  return categoriesSnap.data()?.list || [];
};

export const addCategory = async (category: string): Promise<void> => {
  const categoriesRef = doc(firestore, "familyBudget", "categories");
  const categoriesSnap = await getDoc(categoriesRef);
  if (categoriesSnap.exists()) {
    await updateDoc(categoriesRef, {
      list: arrayUnion(category),
    });
  } else {
    await setDoc(categoriesRef, {
      list: [category],
    });
  }
};
