import React, { useState } from "react";
import { addTag, generateFiscalYearsData } from "../utils/FirebaseHelpers";
import { formatAsCurrency, handleNewEntry, todaysDate } from "../utils/Helpers";
import { FiscalCalendar } from "./FiscalCalendar";
import ExpenseRefundCard from "./ExpenseRefundCard";
import { useExpensesData } from "../utils/hooks/useExpensesData";
import { useCategoriesAndTags } from "../utils/hooks/useCategoriesAndTags";
import { useGoals } from "../utils/hooks/useGoals";

const NonRecurringExpensesPage: React.FC = () => {
  const { nonRecurringExpenses, setNonRecurringExpenses } = useExpensesData();
  const { categories, setCategories, tags, setTags } = useCategoriesAndTags();
  const { monthlyGoal, setMonthlyGoal } = useGoals();

  const [currentCategory, setCurrentCategory] = useState<string>("");
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [currentDate, setCurrentDate] = useState<string>(todaysDate);
  const [currentAmount, setCurrentAmount] = useState<number | null>(null);
  const [currentNotes, setCurrentNotes] = useState<string>("");

  const handleAddEntry = async (type: "expense" | "refund") => {
    handleNewEntry(
      type,
      currentTags,
      tags,
      setTags,
      currentCategory,
      categories,
      setCategories,
      currentDate,
      currentAmount,
      currentNotes,
      setMonthlyGoal,
      setNonRecurringExpenses,
      monthlyGoal,
      setCurrentCategory,
      setCurrentTags,
      setCurrentDate,
      setCurrentAmount,
      setCurrentNotes,
    );
  };

  const totalExpenses = nonRecurringExpenses.reduce(
    (acc, curr) => acc + curr.value,
    0,
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
    setter: (value: string[] | ((prev: string[]) => string[])) => void,
  ) => {
    if (!existingItems.includes(newItem)) {
      addFunction(newItem).then(() => {
        setter((prevItems) => [...prevItems, newItem]);
      });
    }
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip out all non-numeric characters except for the decimal point
    const value = e.target.value.replace(/[^\d.]/g, "");
    setCurrentAmount(Number(value));
  };

  return (
    <div className="p-2">
      <h1>Non-Recurring Expenses</h1>
      <h2>Current Monthly Goal: {formatAsCurrency(monthlyGoal)}</h2>
      {/* <button onClick={() => generateFiscalYearsData(2021, 60)}>
        Generate Fiscal Data
      </button> */}

      {/* TODO Progress bar?? */}
      <progress
        value={
          Number.isFinite(((monthlyGoal - totalExpenses) / monthlyGoal) * 100)
            ? ((monthlyGoal - totalExpenses) / monthlyGoal) * 100
            : 0
        }
        max="100"
      ></progress>

      <FiscalCalendar />

      <ExpenseRefundCard
        categories={categories}
        tags={tags}
        handleAddEntry={handleAddEntry}
        handleOptionChange={handleOptionChange}
        handleMultiOptionChange={handleMultiOptionChange}
        handleCreateItem={handleCreateItem}
        handleCurrencyChange={handleCurrencyChange}
        currentCategory={currentCategory}
        currentTags={currentTags}
        currentDate={currentDate}
        currentAmount={currentAmount}
        setCurrentCategory={setCurrentCategory}
        setCurrentTags={setCurrentTags}
        addTag={addTag}
        setTags={setTags}
        todaysDate={todaysDate}
        setCurrentDate={setCurrentDate}
        setCurrentNotes={setCurrentNotes}
      />
    </div>
  );
};

export default NonRecurringExpensesPage;
