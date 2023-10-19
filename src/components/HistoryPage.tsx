import React, { useState, useEffect } from "react";
import {
  fetchCategories,
  fetchNonRecurringExpenses,
} from "../utils/FirebaseHelpers";
import {
  NonRecurringEntry,
  formatAsCurrency,
  formatDate,
} from "../utils/Helpers";
import {
  Table,
  Form,
  FormControl,
  Button,
  InputGroup,
  Pagination,
} from "react-bootstrap";
import { TimeChart } from "./TimeChart";

const HistoryPage: React.FC = () => {
  const [nonRecurringExpenses, setNonRecurringExpenses] = useState<
    NonRecurringEntry[]
  >([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const currentDate = new Date();
  const lastYearDate = new Date(currentDate);
  lastYearDate.setFullYear(currentDate.getFullYear() - 1);
  const [dateStart, setDateStart] = useState<string>(
    lastYearDate.toISOString().split("T")[0]
  );
  const [dateEnd, setDateEnd] = useState<string>(
    currentDate.toISOString().split("T")[0]
  );
  const [amountMin, setAmountMin] = useState<number>(0);
  const [amountMax, setAmountMax] = useState<number>(10000); // just a random high value for demo
  const [filteredExpenses, setFilteredExpenses] = useState<NonRecurringEntry[]>(
    []
  );
  const [currentCategory, setCurrentCategory] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 100; // You can make this a state variable if you want it to be dynamic.
  const displayedExpenses = filteredExpenses.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const totalPages = Math.ceil(filteredExpenses.length / rowsPerPage);
  const totalExpenses = filteredExpenses.reduce(
    (acc, expense) => acc + expense.value,
    0
  );

  useEffect(() => {
    fetchNonRecurringExpenses().then((expenses) => {
      setNonRecurringExpenses(expenses);
      setFilteredExpenses(expenses);
      fetchCategories().then(setCategories);
    });
  }, []);

  useEffect(() => {
    const results = nonRecurringExpenses.filter((expense) => {
      const matchesSearchTerm =
        expense.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (expense.category &&
          expense.category.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        !currentCategory ||
        currentCategory === "Choose" ||
        expense.category === currentCategory;

      if (!expense.date) return false;

      const expenseActualDate = new Date(expense.date);
      const expenseDateString = `${expenseActualDate.getUTCFullYear()}-${String(
        expenseActualDate.getUTCMonth() + 1
      ).padStart(2, "0")}-${String(expenseActualDate.getUTCDate()).padStart(
        2,
        "0"
      )}`;

      const isValidStartDate = !dateStart || expenseDateString >= dateStart;
      const isValidEndDate = !dateEnd || expenseDateString <= dateEnd;
      const validAmount =
        expense.value >= amountMin && expense.value <= amountMax;

      return (
        matchesSearchTerm &&
        isValidStartDate &&
        isValidEndDate &&
        validAmount &&
        matchesCategory
      );
    });

    setFilteredExpenses(results);
    setCurrentPage(1);
  }, [
    searchTerm,
    dateStart,
    dateEnd,
    amountMin,
    amountMax,
    nonRecurringExpenses,
    currentCategory,
  ]);

  return (
    <div>
      <h1>Expense History</h1>

      {/* Search and Filters */}
      <Form className="mb-3 form-inline">
        <FormControl
          type="text"
          placeholder="Search by Name"
          className="mr-sm-2 mb-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <Form.Select
          value={currentCategory}
          onChange={(e) => setCurrentCategory(e.target.value)}
        >
          <option>Choose</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Form.Select>

        <InputGroup className="mb-2 mr-sm-2">
          <div className="input-group-prepend">
            <span className="input-group-text">From</span>
          </div>

          <FormControl
            type="date"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
          />
        </InputGroup>

        <InputGroup className="mb-2 mr-sm-2">
          <div className="input-group-prepend">
            <span className="input-group-text">To</span>
          </div>

          <FormControl
            type="date"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
          />
        </InputGroup>

        <InputGroup className="mb-2 mr-sm-2">
          <div className="input-group-prepend">
            <span className="input-group-text">Min $</span>
          </div>

          <FormControl
            type="number"
            value={amountMin}
            onChange={(e) => setAmountMin(Number(e.target.value))}
          />
        </InputGroup>

        <InputGroup className="mb-2 mr-sm-2">
          <div className="input-group-prepend">
            <span className="input-group-text">Max $</span>
          </div>

          <FormControl
            type="number"
            value={amountMax}
            onChange={(e) => setAmountMax(Number(e.target.value))}
          />
        </InputGroup>

        <Button variant="outline-success" className="mb-2">
          Filter
        </Button>
      </Form>

      <TimeChart filteredExpenses={filteredExpenses}></TimeChart>

      <div className="total-expenses">Total: ${totalExpenses.toFixed(2)}</div>

      {/* Table */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Date</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {displayedExpenses.map((expense, idx) => (
            <tr key={idx}>
              <td>{expense.name}</td>
              <td>{expense.category || "N/A"}</td>
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
      <Pagination>
        <Pagination.First
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
        />
        <Pagination.Prev
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        />
        {[...Array(totalPages)].map((_, idx) => (
          <Pagination.Item
            key={idx}
            active={idx + 1 === currentPage}
            onClick={() => setCurrentPage(idx + 1)}
          >
            {idx + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        />
        <Pagination.Last
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
        />
      </Pagination>
    </div>
  );
};

export default HistoryPage;
