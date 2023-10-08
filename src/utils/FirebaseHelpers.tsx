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
import { Entry } from "../components/RecurringExpensesPage";

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
  newValue: number,
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
              (entry: Entry) =>
                entry.name !== oldName && entry.value !== oldValue,
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
              (entry: Entry) =>
                entry.name !== oldName && entry.value !== oldValue,
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
  value: number,
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
