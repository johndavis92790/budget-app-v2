import { useState, useEffect } from "react";
import { fetchNonRecurringExpenses } from "../FirebaseHelpers";
import { NonRecurringEntry } from "../Helpers";

export const useExpensesData = () => {
  const [nonRecurringExpenses, setNonRecurringExpenses] = useState<
    NonRecurringEntry[]
  >([]);
  const [minExpense, setMinExpense] = useState<number>(0);
  const [maxExpense, setMaxExpense] = useState<number>(100);
  const [amountRange, setAmountRange] = useState<[number, number]>([0, 100]);

  useEffect(() => {
    fetchNonRecurringExpenses().then((expenses) => {
      setNonRecurringExpenses(expenses);
      if (expenses.length > 0) {
        const values = expenses.map((exp) => exp.value);
        const min = Math.floor(Math.min(...values));
        const max = Math.ceil(Math.max(...values));
        setMinExpense(min);
        setMaxExpense(max);
        // Ensure amountRange is within the new min and max
        if (amountRange[0] < min || amountRange[1] > max) {
          setAmountRange([min, max]);
        }
      }
    });
  }, [amountRange]);

  return {
    nonRecurringExpenses,
    setNonRecurringExpenses,
    minExpense,
    maxExpense,
    amountRange,
    setAmountRange,
  };
};
