import { useState, useEffect } from "react";
import {
  NonRecurringEntry,
  fetchnonRecurringEntries,
} from "../FirebaseHelpers";

export const useExpensesData = () => {
  const [nonRecurringEntries, setnonRecurringEntries] = useState<
    NonRecurringEntry[]
  >([]);
  const [minExpense, setMinExpense] = useState<number>(0);
  const [maxExpense, setMaxExpense] = useState<number>(100);
  const [amountRange, setAmountRange] = useState<[number, number]>([0, 100]);

  useEffect(() => {
    fetchnonRecurringEntries().then((expenses) => {
      setnonRecurringEntries(expenses);
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
    nonRecurringEntries,
    setnonRecurringEntries,
    minExpense,
    maxExpense,
    amountRange,
    setAmountRange,
  };
};
