import React, { useState, useEffect } from "react";
import {
  fetchRecurringEntries,
  addNonRecurringExpense,
  fetchNonRecurringExpenses,
} from "../utils/FirebaseHelpers";
import { formatAsCurrency } from "../utils/Helpers";
import { Entry } from "./RecurringExpensesPage";
import { FiscalCalendar } from "./FiscalCalendar";

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
  }, []);

  useEffect(() => {
    fetchRecurringEntries().then((data) => {
      if (data) {
        const totalIncome = (data.incomes || []).reduce(
          (acc: number, curr: Entry) => acc + curr.value,
          0,
        );
        const tithingValue = totalIncome * 0.1;
        const totalExpense =
          (data.expenses || []).reduce(
            (acc: number, curr: Entry) => acc + curr.value,
            0,
          ) + tithingValue;
        const yearlyIncome = totalIncome * 12;
        const yearlyExpenses = totalExpense * 12;
        const availableFiscalMonthly =
          ((yearlyIncome - yearlyExpenses) / 52) * 4;

        setMonthlyGoal(availableFiscalMonthly);
      }
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
        setMonthlyGoal((prev) => prev - currentAmount);
      });

      setCurrentExpense("");
      setCurrentCategory("");
      setCurrentDate("");
      setCurrentAmount(null);
    }
  };

  const totalExpenses = nonRecurringExpenses.reduce(
    (acc, curr) => acc + curr.value,
    0,
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
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Date</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {nonRecurringExpenses.map((expense, idx) => (
            <tr key={idx}>
              <td>{expense.name}</td>
              <td>{expense.category || "N/A"}</td>
              <td>
                {expense.date
                  ? (expense.date as Date).toLocaleDateString()
                  : "N/A"}
              </td>

              <td>{formatAsCurrency(expense.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>

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
