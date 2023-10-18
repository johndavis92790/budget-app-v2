import React, { useState, useEffect } from "react";
import {
  addNonRecurringExpense,
  fetchNonRecurringExpenses,
  updateMonthlyGoal,
  fetchCurrentGoal,
} from "../utils/FirebaseHelpers";
import { Entry, formatAsCurrency, getLast28DaysStartDate } from "../utils/Helpers";
import { FiscalCalendar } from "./FiscalCalendar";
import { Table } from "react-bootstrap";

const NonRecurringExpensesPage: React.FC = () => {
  const [monthlyGoal, setMonthlyGoal] = useState<number>(0);
  const [nonRecurringExpenses, setNonRecurringExpenses] = useState<Entry[]>([]);
  const [currentExpense, setCurrentExpense] = useState<string>("");
  const [currentCategory, setCurrentCategory] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [currentAmount, setCurrentAmount] = useState<number | null>(null);

  useEffect(() => {
    fetchNonRecurringExpenses().then((expenses) => {
      setNonRecurringExpenses(expenses);
    });

    fetchCurrentGoal().then((goal) => {
      setMonthlyGoal(goal || 0);
    });
  }, []);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentExpense && currentCategory && currentDate && currentAmount) {
      const newExpense = {
        name: currentExpense,
        category: currentCategory,
        date: new Date(currentDate),
        value: currentAmount,
      };

      addNonRecurringExpense(newExpense).then(() => {
        setNonRecurringExpenses((prev) => [...prev, newExpense]);
        const updatedGoal = monthlyGoal - currentAmount;
        setMonthlyGoal(updatedGoal);
        updateMonthlyGoal(updatedGoal);
      });

      setCurrentExpense("");
      setCurrentCategory("");
      setCurrentDate("");
      setCurrentAmount(null);
    }
  };

  const totalExpenses = nonRecurringExpenses.reduce(
    (acc, curr) => acc + curr.value,
    0
  );

  return (
    <div>
      <h1>Non-Recurring Expenses</h1>
      <h2>Current Monthly Goal: {formatAsCurrency(monthlyGoal)}</h2>

      <FiscalCalendar />

      <form onSubmit={handleAddExpense}>
        <input
          type="text"
          placeholder="Expense Name"
          value={currentExpense}
          onChange={(e) => setCurrentExpense(e.target.value)}
        />
        <input
          type="text"
          placeholder="Category"
          value={currentCategory}
          onChange={(e) => setCurrentCategory(e.target.value)}
        />
        <input
          type="date"
          value={currentDate}
          onChange={(e) => setCurrentDate(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          value={currentAmount || ""}
          onChange={(e) => setCurrentAmount(Number(e.target.value))}
        />
        <button type="submit">Add Expense</button>
      </form>

      {/* Display list of non-recurring expenses */}
      <h2>Non-Recurring Expenses</h2>
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
          {nonRecurringExpenses
            .filter((expense) => {
              // Ensure the date exists
              if (!expense.date) {
                return false;
              }

              // Convert Firestore Timestamp to JavaScript Date
              const expenseDate =
                expense.date instanceof Date
                  ? expense.date
                  : expense.date.toDate();

              return expenseDate >= getLast28DaysStartDate();
            })
            .map((expense, idx) => (
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

      {/* Stretch Goal: Visual representation */}
      {/* Calculate progress as: (monthlyGoal - totalExpenses) / monthlyGoal * 100 */}
      <progress
        value={
          Number.isFinite(((monthlyGoal - totalExpenses) / monthlyGoal) * 100)
            ? ((monthlyGoal - totalExpenses) / monthlyGoal) * 100
            : 0
        }
        max="100"
      ></progress>
    </div>
  );
};

export default NonRecurringExpensesPage;
