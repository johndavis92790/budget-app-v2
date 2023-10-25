import { useState, useEffect } from "react";
import { fetchRecurringEntries } from "../FirebaseHelpers";
import { RecurringEntry } from "../Helpers";

export const useIncomesAndExpenses = () => {
  const [incomes, setIncomes] = useState<RecurringEntry[]>([]);
  const [expenses, setExpenses] = useState<RecurringEntry[]>([]);
  const sortedIncomes = [...incomes].sort((a, b) => b.value - a.value);
  const sortedExpenses = [...expenses].sort((a, b) => b.value - a.value);
  useEffect(() => {
    fetchRecurringEntries().then((data) => {
      if (data) {
        setIncomes(data.incomes || []);
        setExpenses(data.expenses || []);
      }
    });
  }, []);

  return {
    incomes,
    setIncomes,
    expenses,
    setExpenses,
    sortedIncomes,
    sortedExpenses,
  };
};
