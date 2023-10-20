import React, { useState, useEffect } from "react";
import {
  addNonRecurringExpense,
  fetchNonRecurringExpenses,
  updateMonthlyGoal,
  fetchCurrentGoal,
  fetchTags,
  addTag,
} from "../utils/FirebaseHelpers";
import {
  NonRecurringEntry,
  formatAsCurrency,
  todaysDate,
} from "../utils/Helpers";
import { FiscalCalendar } from "./FiscalCalendar";
import CreatableSelect from "react-select/creatable";

const NonRecurringExpensesPage: React.FC = () => {
  const [monthlyGoal, setMonthlyGoal] = useState<number>(0);
  const [nonRecurringExpenses, setNonRecurringExpenses] = useState<
    NonRecurringEntry[]
  >([]);
  const [currentExpense, setCurrentExpense] = useState<string>("");
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [currentDate, setCurrentDate] = useState<string>(todaysDate);
  const [currentAmount, setCurrentAmount] = useState<number | null>(null);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    fetchNonRecurringExpenses().then((expenses) => {
      setNonRecurringExpenses(expenses);
    });

    fetchCurrentGoal().then((goal) => {
      setMonthlyGoal(goal || 0);
    });

    fetchTags().then(setTags);
  }, []);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentTags.length === 0) {
      alert("Please choose or enter a tag.");
      return;
    }

    const newTags = currentTags.filter((tag) => !tags.includes(tag));
    if (newTags.length > 0) {
      for (const tag of newTags) {
        await addTag(tag);
        setTags((prev) => [...prev, tag]);
      }
    }

    if (
      currentExpense &&
      currentTags.length > 0 &&
      currentDate &&
      currentAmount !== null
    ) {
      const newExpense = {
        name: currentExpense,
        tags: currentTags,
        date: currentDate,
        value: currentAmount,
      };

      addNonRecurringExpense(newExpense).then(() => {
        setNonRecurringExpenses((prev) => [...prev, newExpense]);
        const updatedGoal = monthlyGoal - currentAmount;
        setMonthlyGoal(updatedGoal);
        updateMonthlyGoal(updatedGoal);
      });

      setCurrentExpense("");
      setCurrentTags([]);
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

  const handleTagsChange = (values: any) => {
    const newTags = values.map((val: any) => val.value);
    setCurrentTags(newTags);
  };

  const selectOptions = tags.map((cat) => ({ value: cat, label: cat }));

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

        <CreatableSelect
          isMulti
          isClearable
          onChange={handleTagsChange}
          options={selectOptions}
          value={currentTags.map((tag) => ({ label: tag, value: tag }))}
          placeholder="Select or create tags..."
        />

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
