import React, { useState, useEffect } from "react";
import {
  addNonRecurringExpense,
  fetchNonRecurringExpenses,
  updateMonthlyGoal,
  fetchCurrentGoal,
  fetchTags,
  addTag,
  fetchCategories,
  addCategory,
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
  const [categories, setCategories] = useState<string[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string>("");
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
    fetchCategories().then(setCategories);
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
      currentCategory &&
      currentTags.length > 0 &&
      currentDate &&
      currentAmount !== null
    ) {
      const newExpense = {
        category: currentCategory,
        tags: currentTags,
        date: currentDate,
        value: currentAmount,
        type: "expense",
      };

      addNonRecurringExpense(newExpense).then(() => {
        setNonRecurringExpenses((prev) => [...prev, newExpense]);
        const updatedGoal = monthlyGoal - currentAmount;
        setMonthlyGoal(updatedGoal);
        updateMonthlyGoal(updatedGoal);
      });

      setCurrentCategory("");
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

  const handleOptionChange = (setter: (value: any) => void) => {
    return (selectedOption: any) => {
      const value = selectedOption ? selectedOption.value || "" : "";
      setter(value);
    };
  };

  const handleMultiOptionChange = (setter: (value: string[]) => void) => {
    return (selectedOptions: any) => {
      const values = selectedOptions
        ? selectedOptions.map((opt: any) => opt.value)
        : [];
      setter(values);
    };
  };

  const handleCreateItem = (
    newItem: string,
    existingItems: string[],
    addFunction: (item: string) => Promise<void>,
    setter: (value: string[] | ((prev: string[]) => string[])) => void
  ) => {
    if (!existingItems.includes(newItem)) {
      addFunction(newItem).then(() => {
        setter((prevItems) => [...prevItems, newItem]);
      });
    }
  };

  const categoryOptions = categories.map((cat) => ({ label: cat, value: cat }));
  const tagOptions = tags.map((tag) => ({ label: tag, value: tag }));

  return (
    <div>
      <h1>Non-Recurring Expenses</h1>
      <h2>Current Monthly Goal: {formatAsCurrency(monthlyGoal)}</h2>

      <FiscalCalendar />

      <form onSubmit={handleAddExpense}>
        <CreatableSelect
          onChange={handleOptionChange(setCurrentCategory)}
          onCreateOption={(value) =>
            handleCreateItem(value, categories, addCategory, setCategories)
          }
          options={categoryOptions}
          value={
            currentCategory
              ? { label: currentCategory, value: currentCategory }
              : null
          }
          placeholder="Select or create a category..."
        />

        <CreatableSelect
          isMulti
          isClearable
          onChange={handleMultiOptionChange(setCurrentTags)}
          onCreateOption={(value) =>
            handleCreateItem(value, tags, addTag, setTags)
          }
          options={tagOptions}
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

      {/**TODO Prgress bar?? */}
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
