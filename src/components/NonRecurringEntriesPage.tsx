import React, { useState } from "react";
import {
  addTag,
  convertToNonRecurringEntry,
  resetAndDeleteFields,
  generateFiscalYearsData,
  NonRecurringEntry,
  addNonRecurringEntriesToFirestore,
  addMonthlyAddedFundsToFirestore,
} from "../utils/FirebaseHelpers";
import { formatAsCurrency, handleNewEntry, todaysDate } from "../utils/Helpers";
import { FiscalCalendar } from "./FiscalCalendar";
import ExpenseRefundCard from "./ExpenseRefundCard";
import { useExpensesData } from "../utils/hooks/useExpensesData";
import { useCategoriesAndTags } from "../utils/hooks/useCategoriesAndTags";
import { useGoals } from "../utils/hooks/useGoals";
import { FiscalWeekComponent } from "./FiscalWeekComponent";
import { Spinner } from "react-bootstrap";
import { jsonString } from "../utils/jsonTest";

export function NonRecurringEntriesPage() {
  const { nonRecurringEntries, setnonRecurringEntries } = useExpensesData();
  const { categories, setCategories, tags, setTags } = useCategoriesAndTags();
  const {
    monthlyGoal,
    setMonthlyGoal,
    currentWeeklyGoal,
    setCurrentWeeklyGoal,
  } = useGoals();

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
      monthlyGoal,
      setMonthlyGoal,
      currentWeeklyGoal,
      setCurrentWeeklyGoal,
      setnonRecurringEntries,
      setCurrentCategory,
      setCurrentTags,
      setCurrentDate,
      setCurrentAmount,
      setCurrentNotes,
    );
  };

  const totalExpenses = nonRecurringEntries.reduce(
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

  const [isLoading, setIsLoading] = useState(false); // New state for loading indicator

  const handleDeleteFields = async () => {
    setIsLoading(true); // Start loading
    try {
      await resetAndDeleteFields();
    } catch (error) {
      console.error(error); // Handle or log the error
    }
    setIsLoading(false); // Stop loading
  };

  // // Main function to perform the conversion and log results
  const main = async () => {
    console.log(JSON.parse(convertStringToJsonArray(jsonString)));
    try {
      const convertedData = await convertToNonRecurringEntry(
        JSON.parse(convertStringToJsonArray(jsonString)),
      );
      console.log(convertedData); // Log the resolved value

      addNonRecurringEntriesToFirestore(convertedData.nonRecurringEntries)
        .then(() => console.log("Non-recurring entries added successfully"))
        .catch((error) =>
          console.error("Failed to add non-recurring entries:", error),
        );

      addMonthlyAddedFundsToFirestore(convertedData.monthlyAddedFunds)
        .then(() => console.log("Monthly added funds added successfully"))
        .catch((error) =>
          console.error("Failed to add monthly added funds:", error),
        );
    } catch (error) {
      console.error("Error processing data:", error);
    }
    // const uniqueTags = extractUniqueTags(convertedData);
    // console.log(uniqueTags);
  };

  function convertStringToJsonArray(str: string): string {
    if (typeof str !== "string") {
      console.error("Invalid input type:", typeof str);
      return "[]"; // Return an empty JSON array string as a fallback
    }
    const objects = str.split("\n").filter((obj) => obj.trim() !== "");
    return "[" + objects.join(",") + "]";
  }

  const extractUniqueTags = (data: NonRecurringEntry[]) => {
    const allTags = data
      .map((entry) => (entry.notes ? entry.notes.split(/\s+/) : []))
      .reduce((acc, tags) => acc.concat(tags), []);
    return Array.from(new Set(allTags)); // Convert Set to Array;
  };

  return (
    <div className="p-2">
      <h1>Non-Recurring Expenses</h1>
      <h2>Current Monthly Goal: {formatAsCurrency(monthlyGoal)}</h2>
      <h2>Current Weekly Goal: {formatAsCurrency(currentWeeklyGoal)}</h2>
      {/* <button onClick={() => generateFiscalYearsData(2021, 60)}>
        Generate Fiscal Data
      </button> */}
      <button onClick={() => main().catch(console.error)}>convert data</button>

      {/* TODO Progress bar?? */}
      <progress
        value={
          Number.isFinite(((monthlyGoal - totalExpenses) / monthlyGoal) * 100)
            ? ((monthlyGoal - totalExpenses) / monthlyGoal) * 100
            : 0
        }
        max="100"
      ></progress>
      <progress
        value={
          Number.isFinite(
            ((currentWeeklyGoal - totalExpenses) / currentWeeklyGoal) * 100,
          )
            ? ((currentWeeklyGoal - totalExpenses) / currentWeeklyGoal) * 100
            : 0
        }
        max="100"
      ></progress>
      <FiscalWeekComponent />

      <div>
        {isLoading ? (
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        ) : (
          <button onClick={handleDeleteFields}>RESET</button>
        )}
      </div>

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
}
