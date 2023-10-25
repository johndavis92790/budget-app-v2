import React from "react";
import { Table } from "react-bootstrap";
import {
  NonRecurringEntry,
  formatAsCurrency,
  formatDate,
} from "../utils/Helpers";

interface Props {
  displayedExpenses: NonRecurringEntry[];
  handleShowModal: (expense: NonRecurringEntry) => void;
}

const ExpensesTable: React.FC<Props> = ({
  displayedExpenses,
  handleShowModal,
}) => {
  return (
    <Table striped bordered hover size="sm" className="small-font-table">
      <thead>
        <tr>
          <th>Type</th>
          <th>Category</th>
          <th>Tags</th>
          <th>Date</th>
          <th className="money-column-right-align">Amount</th>
        </tr>
      </thead>
      <tbody>
        {displayedExpenses.map((expense, idx) => (
          <tr key={idx} onClick={() => handleShowModal(expense)}>
            <td>{expense.type === "expense" ? "Expense" : "Refund"}</td>
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
            <td
              className="money-column-right-align"
              style={{ color: expense.type === "expense" ? "red" : "green" }}
            >
              {expense.type === "expense"
                ? "-" + formatAsCurrency(expense.value)
                : "+" + formatAsCurrency(expense.value)}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default ExpensesTable;
