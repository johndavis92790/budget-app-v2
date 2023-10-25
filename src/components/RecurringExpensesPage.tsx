import React, { useState } from "react";
import { RecurringEntry, calculateTotals } from "../utils/Helpers";
import { useIncomesAndExpenses } from "../utils/hooks/useIncomesAndExpenses";
import EntryModal from "./EntryModal";
import { RecurringExpensesTable } from "./RecurringExpensesTable";
import { useRecurringEntries } from "../utils/hooks/useRecurringEntries";
import AveragesAndTotalsTable from "./AveragesAndTotalsTable";

const RecurringExpensesPage: React.FC = () => {
  const { incomes, sortedIncomes, sortedExpenses } = useIncomesAndExpenses();

  const { addEntry, updateEntry, deleteEntry } = useRecurringEntries();

  const [entryName, setEntryName] = useState<string | null>(null);
  const [entryValue, setEntryValue] = useState<number | null>(null);
  const [entryType, setEntryType] = useState<"income" | "expense">("income");

  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<RecurringEntry | null>(null);
  const [currentType, setCurrentType] = useState<"income" | "expense" | null>(
    null,
  );

  const [showModal, setShowModal] = useState<boolean>(false);
  const handleOpenModal = () => {
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setEntryName(null);
    setEntryValue(null);
    setShowModal(false);
  };

  const handleAddNew = (type: "income" | "expense") => {
    setIsEditMode(false);
    setEntryType(type);
    handleOpenModal();
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();

    if (entryValue && entryName) {
      const newEntry = { name: entryName, value: entryValue };
      addEntry(entryType, newEntry);
      handleCloseModal();
    }
  };

  const handleEdit = (type: "income" | "expense", entry: RecurringEntry) => {
    setCurrentEntry(entry);
    setCurrentType(type);
    setEntryName(entry.name);
    setEntryValue(entry.value);
    setIsEditMode(true);
    handleOpenModal();
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentType && currentEntry && entryName && entryValue) {
      const updatedEntry = { name: entryName, value: entryValue };
      updateEntry(currentType, currentEntry, updatedEntry);
      setIsEditMode(false);
      setCurrentEntry(null);
      setCurrentType(null);
      handleCloseModal();
    }
  };

  const handleDelete = (type: "income" | "expense", entry: RecurringEntry) => {
    deleteEntry(type, entry);
  };

  const handleEntryDelete = () => {
    if (currentType && currentEntry) {
      handleDelete(currentType, currentEntry);
      handleCloseModal();
    }
  };

  const {
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
  } = calculateTotals(incomes, sortedExpenses);

  return (
    <div>
      <h1>Recurring Expenses and Incomes</h1>

      <RecurringExpensesTable
        title="Incomes"
        entries={sortedIncomes}
        handleEdit={handleEdit}
        total={totalIncome}
        handleAddNew={handleAddNew}
      />

      <RecurringExpensesTable
        title="Expenses"
        entries={[tithing, ...sortedExpenses]}
        handleEdit={handleEdit}
        total={totalExpense}
        handleAddNew={handleAddNew}
      />

      <AveragesAndTotalsTable
        monthlyIncome={monthlyIncome}
        yearlyIncome={yearlyIncome}
        monthlyExpenses={monthlyExpenses}
        yearlyExpenses={yearlyExpenses}
        availableMonthly={availableMonthly}
        availableFiscalMonthly={availableFiscalMonthly}
        availableWeekly={availableWeekly}
      />

      <EntryModal
        showModal={showModal}
        handleCloseModal={handleCloseModal}
        isEditMode={isEditMode}
        handleAdd={handleAdd}
        handleSaveChanges={handleSaveChanges}
        handleEntryDelete={handleEntryDelete}
        entryName={entryName}
        setEntryName={setEntryName}
        entryValue={entryValue}
        setEntryValue={setEntryValue}
        entryType={entryType}
        setEntryType={setEntryType}
      />
    </div>
  );
};

export default RecurringExpensesPage;
