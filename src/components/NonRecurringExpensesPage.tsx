import React, { useState, useEffect } from "react";
import {
  addNonRecurringExpense,
  fetchNonRecurringExpenses,
  updateMonthlyGoal,
  fetchCurrentGoal,
  fetchCategories,
  addCategory,
} from "../utils/FirebaseHelpers";
import {
  NonRecurringEntry,
  formatAsCurrency,
  formatDate,
  getLast28DaysStartDate,
  todaysDate,
} from "../utils/Helpers";
import { FiscalCalendar } from "./FiscalCalendar";
import { Table } from "react-bootstrap";

const NonRecurringExpensesPage: React.FC = () => {
  const [monthlyGoal, setMonthlyGoal] = useState<number>(0);
  const [nonRecurringExpenses, setNonRecurringExpenses] = useState<
    NonRecurringEntry[]
  >([]);
  const [currentExpense, setCurrentExpense] = useState<string>("");
  const [currentCategory, setCurrentCategory] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>(todaysDate);
  const [currentAmount, setCurrentAmount] = useState<number | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState<string>("");

  useEffect(() => {
    fetchNonRecurringExpenses().then((expenses) => {
      setNonRecurringExpenses(expenses);
    });

    fetchCurrentGoal().then((goal) => {
      setMonthlyGoal(goal || 0);
    });

    fetchCategories().then(setCategories);
  }, []);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalCategory;
    if (currentCategory && newCategory) {
      alert(
        "Please choose either a category from the dropdown or enter a new one, not both."
      );
      return;
    } else if (newCategory) {
      await addCategory(newCategory);
      setCategories((prev) => [...prev, newCategory]);
      finalCategory = newCategory;
    } else if (currentCategory) {
      finalCategory = currentCategory;
    } else {
      alert("Please choose a category or enter a new one.");
      return;
    }

    if (
      currentExpense &&
      finalCategory &&
      currentDate &&
      currentAmount !== null
    ) {
      // No need to convert currentDate to a Date object; use it directly
      const newExpense = {
        name: currentExpense,
        category: finalCategory,
        date: currentDate, // Directly use the string representation
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
      setCurrentDate(todaysDate);
      setCurrentAmount(null);
    } else {
      alert("Please ensure all fields are filled in.");
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
          required
        />
        <select
          value={currentCategory}
          onChange={(e) => setCurrentCategory(e.target.value)}
        >
          <option key="Choose" value="Choose">
            Choose
          </option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <div>
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Enter new category"
          />
        </div>
        <input
          type="date"
          value={currentDate || todaysDate}
          onChange={(e) => setCurrentDate(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Amount"
          value={currentAmount || ""}
          onChange={(e) => setCurrentAmount(Number(e.target.value))}
          required
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
              if (!expense.date) {
                return false;
              }

              // Convert the string date to a JavaScript Date for comparison
              const expenseDate = new Date(expense.date);

              return expenseDate >= getLast28DaysStartDate();
            })
            .map((expense, idx) => (
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
