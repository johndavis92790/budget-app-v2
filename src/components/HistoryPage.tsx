import React, { useState, useEffect } from "react";
import {
  fetchTags,
  fetchNonRecurringExpenses,
  fetchCategories,
} from "../utils/FirebaseHelpers";
import {
  NonRecurringEntry,
  formatAsCurrency,
  formatDate,
} from "../utils/Helpers";
import { Table, Form } from "react-bootstrap";
import { TimeChart } from "./TimeChart";
import TablePagination from "./TablePagination";
import Select from "react-select";
import AmountRangeSlider from "./AmountRangeSlider";
import DateRangeSlider from "./DateRangeSlider";

const HistoryPage: React.FC = () => {
  const [nonRecurringExpenses, setNonRecurringExpenses] = useState<
    NonRecurringEntry[]
  >([]);
  const currentDate = new Date();
  const lastYearDate = new Date(currentDate);
  lastYearDate.setFullYear(currentDate.getFullYear() - 1);
  const [dateStart, setDateStart] = useState<string>(
    lastYearDate.toISOString().split("T")[0]
  );
  const [dateEnd, setDateEnd] = useState<string>(
    currentDate.toISOString().split("T")[0]
  );
  const [filteredExpenses, setFilteredExpenses] = useState<NonRecurringEntry[]>(
    []
  );
  const [categories, setCategories] = useState<string[]>([]);
  const [currentCategories, setCurrentCategories] = useState<string[]>([]);
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 100;
  const displayedExpenses = filteredExpenses.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const totalPages = Math.ceil(filteredExpenses.length / rowsPerPage);

  const totalExpenses = filteredExpenses.reduce(
    (acc, expense) => acc + expense.value,
    0
  );

  const [minExpense, setMinExpense] = useState<number>(0);
  const [maxExpense, setMaxExpense] = useState<number>(100);

  const [amountRange, setAmountRange] = useState<[number, number]>([0, 100]);

  useEffect(() => {
    fetchNonRecurringExpenses().then((expenses) => {
      setNonRecurringExpenses(expenses);
      setFilteredExpenses(expenses);
      fetchCategories().then(setCategories);
      fetchTags().then(setTags);

      if (expenses.length > 0) {
        const minExpenseValue = Math.floor(
          Math.min(...(expenses as { value: number }[]).map((exp) => exp.value))
        );
        const maxExpenseValue = Math.ceil(
          Math.max(...(expenses as { value: number }[]).map((exp) => exp.value))
        );

        setMinExpense(minExpenseValue);
        setMaxExpense(maxExpenseValue);
        setAmountRange([minExpenseValue, maxExpenseValue]);
      }
    });
  }, []);

  useEffect(() => {
    const results = nonRecurringExpenses.filter((expense) => {
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
    nonRecurringExpenses,
    currentTags,
    currentCategories,
  ]);

  const options = tags.map((tag) => ({ value: tag, label: tag }));
  const categoryOptions = categories.map((category) => ({
    value: category,
    label: category,
  }));

  return (
    <div>
      <h1>Expense History</h1>

      {/* Search and Filters */}
      <Form className="mb-3 form-inline">
        <Select
          isMulti
          options={categoryOptions}
          value={currentCategories.map((category) => ({
            value: category,
            label: category,
          }))}
          onChange={(selected) => {
            setCurrentCategories(selected.map((item) => item.value));
          }}
          placeholder="Choose categories..."
        />

        <Select
          isMulti
          options={options}
          value={currentTags.map((tag) => ({ value: tag, label: tag }))}
          onChange={(selected) => {
            setCurrentTags(selected.map((item) => item.value));
          }}
          placeholder="Choose tags..."
        />

        <DateRangeSlider
          startDate={lastYearDate.toISOString().split("T")[0]} // or some other start boundary
          endDate={currentDate.toISOString().split("T")[0]} // or some other end boundary
          dateRange={[
            (parseInt(dateStart.substr(0, 4)) - 2000) * 12 +
              parseInt(dateStart.substr(5, 2)) -
              1,
            (parseInt(dateEnd.substr(0, 4)) - 2000) * 12 +
              parseInt(dateEnd.substr(5, 2)) -
              1,
          ]}
          onDateRangeChange={(range) => {
            const startYear = Math.floor(range[0] / 12) + 2000;
            const startMonth = (range[0] % 12) + 1;
            setDateStart(
              `${startYear}-${String(startMonth).padStart(2, "0")}-01`
            );

            const endYear = Math.floor(range[1] / 12) + 2000;
            const endMonth = (range[1] % 12) + 1;
            const lastDay = new Date(endYear, endMonth, 0).getDate();
            setDateEnd(
              `${endYear}-${String(endMonth).padStart(2, "0")}-${lastDay}`
            );
          }}
        />

        <AmountRangeSlider
          minExpense={minExpense}
          maxExpense={maxExpense}
          amountRange={amountRange}
          onAmountRangeChange={(range) => setAmountRange(range)}
        />
      </Form>

      <TimeChart filteredExpenses={filteredExpenses}></TimeChart>

      <div className="total-expenses">Total: ${totalExpenses.toFixed(2)}</div>

      {/* Table */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Category</th>
            <th>Tags</th>
            <th>Date</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {displayedExpenses.map((expense, idx) => (
            <tr key={idx}>
              <td>{expense.category}</td>
              <td>
                {expense.tags.length > 0
                  ? expense.tags.map((tag, idx) => (
                      <span key={idx} className="tag">
                        {tag}
                      </span>
                    ))
                  : "N/A"}
              </td>
              <td className="date-column">
                {expense.date ? formatDate(expense.date) : "N/A"}
              </td>
              <td className="money-column-right-align">
                {formatAsCurrency(expense.value)}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};

export default HistoryPage;
