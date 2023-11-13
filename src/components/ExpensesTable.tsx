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
  // Sort expenses by date in descending order
  const sortedExpenses = displayedExpenses.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <Table striped hover size="sm" className="table-history">
      <thead>
        <tr>
          <th className="text-left">History</th>
          <th className="text-left"></th>
        </tr>
      </thead>
      <tbody>
        {sortedExpenses.map((expense, idx) => (
          <tr key={idx} onClick={() => handleShowModal(expense)}>
            <td className="first-column">
              <div>
                <span className="large-font">{expense.category}</span>
                <br />

                <div className="small-font">
                  <span>
                    {expense.type === "expense" ? "Expense" : "Refund"}
                  </span>
                </div>
                <div className="small-font">
                  {expense.tags.length > 0 ? (
                    expense.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="tag"
                        style={{ marginRight: "5px" }}
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span></span>
                  )}
                </div>
              </div>
            </td>
            <td className="second-column">
              <div>
                <div>
                  <span
                    className="large-font"
                    style={{
                      color: expense.type === "expense" ? "red" : "green",
                    }}
                  >
                    {expense.type === "expense"
                      ? "-" + formatAsCurrency(expense.value)
                      : "+" + formatAsCurrency(expense.value)}
                  </span>
                </div>
                <div>
                  <span className="small-font">
                    {/* {formatAsCurrency(expense.balance)} */}
                    $1,000.00
                  </span>
                </div>
                <div className="small-font">
                  <span>{expense.date ? formatDate(expense.date) : "N/A"}</span>
                </div>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default ExpensesTable;
