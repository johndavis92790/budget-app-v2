import { useState, useEffect } from "react";
import { fetchNonRecurringExpenses } from "../FirebaseHelpers";
import { NonRecurringEntry } from "../Helpers";

export const useExpensesData = () => {
  const [nonRecurringExpenses, setNonRecurringExpenses] = useState<
    NonRecurringEntry[]
  >([]);
  const [minExpense, setMinExpense] = useState<number>(0);
  const [maxExpense, setMaxExpense] = useState<number>(100);

  useEffect(() => {
    fetchNonRecurringExpenses().then((expenses) => {
      setNonRecurringExpenses(expenses);
      if (expenses.length > 0) {
        const values = expenses.map((exp) => exp.value);
        setMinExpense(Math.floor(Math.min(...values)));
        setMaxExpense(Math.ceil(Math.max(...values)));
      }
    });
  }, []);

  return {
    nonRecurringExpenses,
    setNonRecurringExpenses,
    minExpense,
    maxExpense,
  };
};
