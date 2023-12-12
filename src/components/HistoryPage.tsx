import React, { useState, useEffect } from "react";
import {
  NonRecurringEntry,
  addnonRecurringEntry,
  updatenonRecurringEntry,
} from "../utils/FirebaseHelpers";
import { TimeChart } from "./TimeChart";
import TablePagination from "./TablePagination";
import ExpensesTable from "./ExpensesTable";
import FiltersComponent from "./FiltersComponent";
import ExpenseModal from "./ExpenseModal";
import { useExpensesData } from "../utils/hooks/useExpensesData";
import { useCategoriesAndTags } from "../utils/hooks/useCategoriesAndTags";
import { CategoryBarChart } from "./CategoryBarChart";
import CategoryPieChart from "./CategoryPieChart";
import { useGoalHistoryData } from "../utils/hooks/useGoalHistoryData";

const HistoryPage: React.FC = () => {
  const { nonRecurringEntries, minExpense, maxExpense } = useExpensesData();
  const { monthlyAddedFunds, weeklyGoalHistory } = useGoalHistoryData();
  const { categories, tags } = useCategoriesAndTags();

  // Date-related states
  const currentDate = new Date();
  const lastYearDate = new Date(
    currentDate.getFullYear() - 1,
    currentDate.getMonth(),
    currentDate.getDate(),
  );
  const [dateStart, setDateStart] = useState<string>(
    lastYearDate.toISOString().split("T")[0],
  );
  const [dateEnd, setDateEnd] = useState<string>(
    currentDate.toISOString().split("T")[0],
  );

  // Filter-related states
  const [filteredExpenses, setFilteredExpenses] = useState<NonRecurringEntry[]>(
    [],
  );
  const [currentCategories, setCurrentCategories] = useState<string[]>([]);
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [amountRange, setAmountRange] = useState<[number, number]>([
    minExpense,
    maxExpense,
  ]);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedExpense, setSelectedExpense] =
    useState<NonRecurringEntry | null>(null);
  const [editExpense, setEditExpense] = useState<NonRecurringEntry | null>(
    null,
  );

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 100;
  const displayedExpenses = filteredExpenses.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );
  const totalPages = Math.ceil(filteredExpenses.length / rowsPerPage);

  // Other constants
  const totalExpenses = filteredExpenses.reduce(
    (acc, expense) =>
      expense.type === "expense" ? acc + expense.value : acc - expense.value,
    0,
  );
  const options = tags.map((tag: string) => ({ value: tag, label: tag }));
  const categoryOptions = categories.map((category: string) => ({
    value: category,
    label: category,
  }));

  // Effects
  useEffect(() => {
    const results = nonRecurringEntries.filter((expense) => {
      const matchesTags =
        !currentTags.length ||
        expense.tags.some((tag) => currentTags.includes(tag));

      const matchesCategories =
        !currentCategories.length ||
        currentCategories.includes(expense.category);

      if (!expense.date) return false;

      const isValidStartDate =
        !dateStart || new Date(expense.date) >= new Date(dateStart);
      const isValidEndDate =
        !dateEnd || new Date(expense.date) <= new Date(dateEnd);

      const validAmount =
        expense.value >= amountRange[0] && expense.value <= amountRange[1];

      return (
        isValidStartDate &&
        isValidEndDate &&
        validAmount &&
        matchesTags &&
        matchesCategories
      );
    });

    setFilteredExpenses(results);
    setCurrentPage(1);
  }, [
    dateStart,
    dateEnd,
    amountRange,
    nonRecurringEntries,
    currentTags,
    currentCategories,
  ]);

  const handleSaveChanges = async () => {
    try {
      if (editExpense) {
        if (editExpense.docId) {
          await updatenonRecurringEntry(editExpense.docId, editExpense);
        } else {
          await addnonRecurringEntry(editExpense);
        }
        handleCloseModal();
      } else {
        console.error("No expense selected for editing");
      }
    } catch (error) {
      console.error("Failed to save changes:", error);
    }
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d.]/g, "");
    setEditExpense((prev) => ({
      ...prev!,
      value: Number(value),
    }));
  };

  const handleShowModal = (expense: NonRecurringEntry) => {
    setSelectedExpense(expense);
    setEditExpense({ ...expense });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedExpense(null);
    setEditExpense(null);
    setShowModal(false);
  };

  return (
    <div className="p-2">
      <ExpenseModal
        showModal={showModal}
        handleCloseModal={handleCloseModal}
        editExpense={editExpense}
        setEditExpense={setEditExpense}
        handleSaveChanges={handleSaveChanges}
        categoryOptions={categoryOptions}
        options={options}
        handleCurrencyChange={handleCurrencyChange}
        selectedExpense={selectedExpense}
      />

      <h1>Expense History</h1>

      <FiltersComponent
        tags={tags}
        categories={categories}
        currentTags={currentTags}
        currentCategories={currentCategories}
        setCurrentTags={setCurrentTags}
        setCurrentCategories={setCurrentCategories}
        dateStart={dateStart}
        dateEnd={dateEnd}
        setDateStart={setDateStart}
        setDateEnd={setDateEnd}
        minExpense={minExpense}
        maxExpense={maxExpense}
        amountRange={amountRange}
        setAmountRange={setAmountRange}
        lastYearDate={lastYearDate}
        currentDate={currentDate}
      />

      <TimeChart filteredExpenses={filteredExpenses}></TimeChart>
      <CategoryBarChart filteredExpenses={filteredExpenses}></CategoryBarChart>
      <CategoryPieChart filteredExpenses={filteredExpenses}></CategoryPieChart>

      <div className="total-expenses">Total: ${totalExpenses.toFixed(2)}</div>

      <ExpensesTable
        displayedExpenses={displayedExpenses}
        monthlyAddedFunds={monthlyAddedFunds}
        weeklyGoalHistory={weeklyGoalHistory}
        handleShowModal={handleShowModal}
      />

      <div className="pagination-container">
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default HistoryPage;
