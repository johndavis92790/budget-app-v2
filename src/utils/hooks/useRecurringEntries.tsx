import {
  addRecurringEntry,
  updateRecurringEntry,
  deleteRecurringEntry,
  RecurringEntry,
} from "../FirebaseHelpers";
import { useIncomesAndExpenses } from "./useIncomesAndExpenses";

export const useRecurringEntries = () => {
  const { setIncomes, setExpenses } = useIncomesAndExpenses();

  const addEntry = (type: "income" | "expense", entry: RecurringEntry) => {
    addRecurringEntry({ type, ...entry });

    if (type === "income") setIncomes((prev) => [...prev, entry]);
    else setExpenses((prev) => [...prev, entry]);
  };

  const updateEntry = (
    type: "income" | "expense",
    oldEntry: RecurringEntry,
    newEntry: RecurringEntry,
  ) => {
    updateRecurringEntry(
      type,
      oldEntry.name,
      oldEntry.value,
      newEntry.name,
      newEntry.value,
    );

    const setter = type === "income" ? setIncomes : setExpenses;
    setter((prev) =>
      prev.map((e) =>
        e.name === oldEntry.name && e.value === oldEntry.value ? newEntry : e,
      ),
    );
  };

  const deleteEntry = (type: "income" | "expense", entry: RecurringEntry) => {
    deleteRecurringEntry(type, entry.name, entry.value);
    const setter = type === "income" ? setIncomes : setExpenses;
    setter((prev) =>
      prev.filter((e) => !(e.name === entry.name && e.value === entry.value)),
    );
  };

  return {
    addEntry,
    updateEntry,
    deleteEntry,
  };
};
