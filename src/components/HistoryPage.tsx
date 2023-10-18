import React, { useState, useEffect } from "react";
import { fetchNonRecurringExpenses } from "../utils/FirebaseHelpers";
import { Entry, formatAsCurrency } from "../utils/Helpers";
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
  const [nonRecurringExpenses, setNonRecurringExpenses] = useState<Entry[]>([]);
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
  const [filteredExpenses, setFilteredExpenses] = useState<Entry[]>([]);
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
    });
  }, []);

  useEffect(() => {
    const results = nonRecurringExpenses.filter((expense) => {
      const validNameOrCategory =
        expense.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category?.toLowerCase().includes(searchTerm.toLowerCase());

      const validDate =
        (!dateStart || (expense.date && expense.date >= new Date(dateStart))) &&
        (!dateEnd || (expense.date && expense.date <= new Date(dateEnd)));

      const validAmount =
        expense.value >= amountMin && expense.value <= amountMax;

      return validNameOrCategory && validDate && validAmount;
    });

    setFilteredExpenses(results);

    // Reset the current page to 1 whenever the filtered results change
    setCurrentPage(1);
  }, [
    searchTerm,
    dateStart,
    dateEnd,
    amountMin,
    amountMax,
    nonRecurringExpenses,
  ]);

  return (
    <div>
      <h1>Expense History</h1>

      {/* Search and Filters */}
      <Form className="mb-3 form-inline">
        <FormControl
          type="text"
          placeholder="Search by Name/Category"
          className="mr-sm-2 mb-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

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
                {expense.date
                  ? (expense.date instanceof Date
                      ? expense.date
                      : expense.date.toDate()
                    ).toLocaleDateString()
                  : "N/A"}
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
