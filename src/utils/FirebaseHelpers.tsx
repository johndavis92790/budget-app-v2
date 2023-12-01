import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  runTransaction,
  collection,
  addDoc,
  getDocs,
  query,
  deleteDoc,
  where,
  DocumentReference,
  deleteField,
  writeBatch,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "./firebase";
import { RecurringEntry, NonRecurringEntry, ordinal } from "./Helpers";

export interface WeekData {
  weekNumber: number;
  start: string;
  startDate?: Date;
  end: string;
  endDate?: Date;
  title: string;
  allDay: boolean;
  docId?: string;
  year?: DocumentReference;
  yearString?: string;
  month?: DocumentReference;
  monthString?: string;
}

export interface MonthData {
  startDate: string;
  endDate: string;
  weeks?: DocumentReference[];
  weekStrings: string[];
  year?: DocumentReference;
  yearString: string;
  docId?: string;
}

export interface YearData {
  year: string;
  startDate: string;
  endDate?: string;
  months?: DocumentReference[];
  monthStrings: string[];
  weeks?: DocumentReference[];
  weekStrings: string[];
  docId?: string;
}

export const fetchFiscalWeekEvents = async (
  years: string[], // Now accepts an array of year strings
): Promise<WeekData[]> => {
  // Fetch the week events from Firestore that have a yearString within the provided array
  const eventsCollection = collection(firestore, "fiscalWeeks");

  // Ensure the array of years is not larger than 10, as that's the maximum the 'in' operator supports
  if (years.length > 10) {
    throw new Error(
      "The 'in' query operator supports up to 10 elements in the array.",
    );
  }

  const queryEvents = query(eventsCollection, where("yearString", "in", years));
  const querySnapshot = await getDocs(queryEvents);
  const fetchedEvents: WeekData[] = [];
  querySnapshot.forEach((doc) => {
    const eventData = doc.data() as WeekData;
    fetchedEvents.push(eventData);
  });
  return fetchedEvents;
};

export const addRecurringEntry = async (entry: {
  type: "income" | "expense";
  name: string;
  value: number;
}) => {
  const budgetRef = doc(firestore, "familyBudget", "budget");
  const budgetSnap = await getDoc(budgetRef);

  const newEntry = { name: entry.name, value: entry.value };

  if (budgetSnap.exists()) {
    if (entry.type === "income") {
      await updateDoc(budgetRef, {
        incomes: arrayUnion(newEntry),
      });
    } else {
      await updateDoc(budgetRef, {
        expenses: arrayUnion(newEntry),
      });
    }
  } else {
    if (entry.type === "income") {
      await setDoc(budgetRef, {
        incomes: [newEntry],
        expenses: [],
      });
    } else {
      await setDoc(budgetRef, {
        incomes: [],
        expenses: [newEntry],
      });
    }
  }
};

export const fetchRecurringEntries = async () => {
  const budgetRef = doc(firestore, "familyBudget", "budget");
  const budgetSnap = await getDoc(budgetRef);
  return budgetSnap.data();
};

export const updateRecurringEntry = async (
  type: "income" | "expense",
  oldName: string,
  oldValue: number,
  newName: string,
  newValue: number,
) => {
  const budgetRef = doc(firestore, "familyBudget", "budget");
  const newEntry = { name: newName, value: newValue };

  await runTransaction(firestore, async (transaction) => {
    const currentData = await transaction.get(budgetRef);
    if (!currentData.exists()) {
      throw new Error("Document does not exist!");
    }

    if (type === "income") {
      transaction.update(budgetRef, {
        incomes: [
          ...currentData
            .data()
            .incomes.filter(
              (entry: RecurringEntry) =>
                entry.name !== oldName && entry.value !== oldValue,
            ),
          newEntry,
        ],
      });
    } else {
      transaction.update(budgetRef, {
        expenses: [
          ...currentData
            .data()
            .expenses.filter(
              (entry: RecurringEntry) =>
                entry.name !== oldName && entry.value !== oldValue,
            ),
          newEntry,
        ],
      });
    }
  });
};

export const deleteRecurringEntry = async (
  type: "income" | "expense",
  name: string,
  value: number,
) => {
  const budgetRef = doc(firestore, "familyBudget", "budget");

  const entry = { name, value };

  if (type === "income") {
    await updateDoc(budgetRef, {
      incomes: arrayRemove(entry),
    });
  } else {
    await updateDoc(budgetRef, {
      expenses: arrayRemove(entry),
    });
  }
};

export const addNonRecurringExpense = async (
  entry: NonRecurringEntry,
): Promise<DocumentReference> => {
  const nonRecurringCollection = collection(firestore, "nonRecurringExpenses");
  return await addDoc(nonRecurringCollection, {
    ...entry,
    type: "expense",
  });
};

export const addNonRecurringRefund = async (
  entry: NonRecurringEntry,
): Promise<DocumentReference> => {
  const nonRecurringCollection = collection(firestore, "nonRecurringExpenses");
  return await addDoc(nonRecurringCollection, {
    ...entry,
    type: "refund",
  });
};

export const fetchNonRecurringExpenses = async (): Promise<
  NonRecurringEntry[]
> => {
  const nonRecurringCollection = collection(firestore, "nonRecurringExpenses");
  const nonRecurringSnap = await getDocs(query(nonRecurringCollection));

  return nonRecurringSnap.docs.map(
    (doc) => ({ docId: doc.id, ...doc.data() }) as NonRecurringEntry,
  );
};

export const deleteNonRecurringExpense = async (docId: string) => {
  const nonRecurringRef = doc(firestore, "nonRecurringExpenses", docId);
  await deleteDoc(nonRecurringRef);
};

export const updateNonRecurringExpense = async (
  docId: string,
  entry: NonRecurringEntry,
) => {
  const nonRecurringRef = doc(firestore, "nonRecurringExpenses", docId);

  // Exclude the docId from the entry since it's not needed in the database record.
  const { docId: _, ...entryData } = entry;

  await updateDoc(nonRecurringRef, entryData);
};

export const fetchCurrentGoal = async (): Promise<number | null> => {
  const goalRef = doc(firestore, "familyBudget", "currentGoal");
  const goalSnap = await getDoc(goalRef);

  if (goalSnap.exists() && typeof goalSnap.data()?.amount === "number") {
    return goalSnap.data()?.amount;
  } else {
    return null;
  }
};

export const updateMonthlyGoal = async (newGoal: number): Promise<void> => {
  const goalRef = doc(firestore, "familyBudget", "currentGoal");
  const goalSnap = await getDoc(goalRef);

  if (goalSnap.exists()) {
    await updateDoc(goalRef, {
      amount: newGoal,
    });
  } else {
    await setDoc(goalRef, {
      amount: newGoal,
    });
  }
};

export const fetchTotalIncomeAndExpenses = async (): Promise<{
  totalIncome: number;
  totalExpenses: number;
}> => {
  const data = await fetchRecurringEntries();
  let totalIncome = 0;
  let totalExpenses = 0;

  if (data?.incomes) {
    totalIncome = data.incomes.reduce(
      (acc: number, entry: RecurringEntry) => acc + entry.value,
      0,
    );
  }

  if (data?.expenses) {
    totalExpenses = data.expenses.reduce(
      (acc: number, entry: RecurringEntry) => acc + entry.value,
      0,
    );
  }

  return {
    totalIncome,
    totalExpenses,
  };
};

export const updateTotalIncome = async (newIncome: number): Promise<void> => {
  const budgetRef = doc(firestore, "familyBudget", "budget");
  const currentData = await getDoc(budgetRef);

  if (currentData.exists()) {
    const incomes = currentData.data()?.incomes || [];
    incomes.push({ name: `Income ${incomes.length + 1}`, value: newIncome });
    await updateDoc(budgetRef, { incomes });
  } else {
    await setDoc(budgetRef, {
      incomes: [{ name: "Income 1", value: newIncome }],
      expenses: [],
    });
  }
};

export const updateTotalExpenses = async (
  newExpense: number,
): Promise<void> => {
  const budgetRef = doc(firestore, "familyBudget", "budget");
  const currentData = await getDoc(budgetRef);

  if (currentData.exists()) {
    const expenses = currentData.data()?.expenses || [];
    expenses.push({
      name: `Expense ${expenses.length + 1}`,
      value: newExpense,
    });
    await updateDoc(budgetRef, { expenses });
  } else {
    await setDoc(budgetRef, {
      incomes: [],
      expenses: [{ name: "Expense 1", value: newExpense }],
    });
  }
};

export const fetchTags = async (): Promise<string[]> => {
  const tagsRef = doc(firestore, "listItems", "tags");
  const tagsSnap = await getDoc(tagsRef);
  return tagsSnap.data()?.list || [];
};

export const addTag = async (tag: string): Promise<void> => {
  const tagsRef = doc(firestore, "listItems", "tags");
  const tagsSnap = await getDoc(tagsRef);
  if (tagsSnap.exists()) {
    await updateDoc(tagsRef, {
      list: arrayUnion(tag),
    });
  } else {
    await setDoc(tagsRef, {
      list: [tag],
    });
  }
};

export const fetchCategories = async (): Promise<string[]> => {
  const categoriesRef = doc(firestore, "listItems", "categories");
  const categoriesSnap = await getDoc(categoriesRef);
  return categoriesSnap.data()?.list || [];
};

export const addCategory = async (category: string): Promise<void> => {
  const categoriesRef = doc(firestore, "listItems", "categories");
  const categoriesSnap = await getDoc(categoriesRef);
  if (categoriesSnap.exists()) {
    await updateDoc(categoriesRef, {
      list: arrayUnion(category),
    });
  } else {
    await setDoc(categoriesRef, {
      list: [category],
    });
  }
};

// temp script
export async function generateFiscalYearsData(
  startYear: number,
  numberOfYears: number,
) {
  const fiscalYears: YearData[] = [];
  const fiscalMonths: MonthData[] = [];
  const fiscalWeeks: WeekData[] = [];
  let fiscalYearStartDate = new Date(Date.UTC(startYear, 0, 10)); // Starting from January 10th of the start year

  for (let i = 0; i < numberOfYears; i++) {
    const yearStartDateString = fiscalYearStartDate.toISOString().split("T")[0];
    const currentYear = (startYear + i).toString();
    const year: YearData = {
      year: currentYear,
      startDate: yearStartDateString,
      endDate: "", // Will be set after calculating the end date
      months: [],
      monthStrings: [],
      weeks: [],
      weekStrings: [],
      docId: "",
    };

    let tempMonthEndStrings: string[] = [];
    for (let j = 0; j < 13; j++) {
      // 13 months in a fiscal year
      const monthStartDate = new Date(
        fiscalYearStartDate.getTime() + j * 28 * 24 * 60 * 60 * 1000,
      );
      const monthEndDate = new Date(
        monthStartDate.getTime() + 27 * 24 * 60 * 60 * 1000,
      )
        .toISOString()
        .split("T")[0];
      const month: MonthData = {
        startDate: monthStartDate.toISOString().split("T")[0],
        weeks: [],
        weekStrings: [],
        endDate: monthEndDate,
        yearString: currentYear,
        docId: "",
      };

      month.docId = `${month.startDate}_${month.endDate}`;

      for (let k = 0; k < 4; k++) {
        // 4 weeks in a month
        const weekStart = new Date(
          monthStartDate.getTime() + k * 7 * 24 * 60 * 60 * 1000,
        );
        const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);

        const weekDocId = `${weekStart.toISOString().split("T")[0]}_${
          weekEnd.toISOString().split("T")[0]
        }`;
        const week: WeekData = {
          weekNumber: k + 1,
          start: weekStart.toISOString().split("T")[0],
          end: weekEnd.toISOString().split("T")[0],
          title: `${ordinal(k + 1)} Week`,
          allDay: true,
          docId: weekDocId,
          yearString: currentYear,
          monthString: month.docId,
        };
        fiscalWeeks.push(week);
        month.weekStrings?.push(weekDocId);
        year.weekStrings.push(weekDocId);
      }

      if (month.endDate) tempMonthEndStrings.push(month.endDate);
      year.monthStrings.push(month.docId);
      fiscalMonths.push(month);
    }

    // Set the end date of the fiscal year to the end date of the last month
    year.endDate = tempMonthEndStrings[tempMonthEndStrings.length - 1];
    year.docId = `${yearStartDateString}_${year.endDate}`;

    fiscalYears.push(year);
    // Set the start date for the next fiscal year by adding 364 days to the current fiscal year's start date
    fiscalYearStartDate = new Date(
      fiscalYearStartDate.getTime() + 364 * 24 * 60 * 60 * 1000,
    );
  }

  console.log("fiscalYears: ", fiscalYears);
  console.log("fiscalMonths: ", fiscalMonths);
  console.log("fiscalWeeks: ", fiscalWeeks);

  const batch1 = writeBatch(firestore); // Create a batch operation

  fiscalYears.forEach((year, index) => {
    // Reference the document to be written
    const docRef = year.docId && doc(firestore, "fiscalYears", year.docId);
    // Add the set operation to the batch
    docRef && batch1.set(docRef, year);
    console.log(
      `Prepared year ${year.year} with index: ${index} for batch1 save`,
    );
  });

  fiscalMonths.forEach((month, index) => {
    // Reference the document to be written
    const docRef = month.docId && doc(firestore, "fiscalMonths", month.docId);
    // Add the set operation to the batch
    docRef && batch1.set(docRef, month);
    console.log(
      `Prepared month ${month.docId} with index: ${index} for batch1 save`,
    );
  });

  fiscalWeeks.forEach((week, index) => {
    // Reference the document to be written
    const docRef = week.docId && doc(firestore, "fiscalWeeks", week.docId);
    // Add the set operation to the batch
    docRef && batch1.set(docRef, week);
    console.log(
      `Prepared week ${week.docId} with index: ${index} for batch1 save`,
    );
  });

  // Commit the batch
  try {
    await batch1.commit();
    console.log("All documents written to Firestore from batch1");
  } catch (e) {
    console.error("Error writing documents to Firestore on batch1: ", e);
  }

  const batch2 = writeBatch(firestore); // Create a batch operation

  fiscalYears.forEach((year, index) => {
    // Reference the document to be written
    const docRef = year.docId && doc(firestore, "fiscalYears", year.docId);
    let weekReferences: DocumentReference[] = year.weekStrings.map(
      (weekString) => {
        return doc(firestore, "fiscalWeeks", weekString);
      },
    );
    let monthReferences: DocumentReference[] = year.monthStrings.map(
      (monthString) => {
        return doc(firestore, "fiscalMonths", monthString);
      },
    );

    // Add the set operation to the batch
    docRef &&
      batch2.update(docRef, {
        weeks: weekReferences,
        months: monthReferences,
        yearString: deleteField(),
        weekStrings: deleteField(),
        monthStrings: deleteField(),
        docId: deleteField(),
      });
    console.log(
      `Prepared year ${year.docId} with index: ${index} for batch2 update`,
    );
  });

  const fiscalMonthsPromises = fiscalMonths.map(async (month, index) => {
    const docRef = month.docId
      ? doc(firestore, "fiscalMonths", month.docId)
      : undefined;

    // We assume that the month.yearString always has a corresponding document.
    const yearReference = await findYearDocRef(month.yearString);

    let weekReferences: DocumentReference[] = month.weekStrings.map(
      (weekString) => doc(firestore, "fiscalWeeks", weekString),
    );

    // Check if we found the yearReference
    if (yearReference && docRef) {
      batch2.update(docRef, {
        year: yearReference,
        weeks: weekReferences,
        weekStrings: deleteField(),
        docId: deleteField(),
      });
      console.log(
        `Prepared month ${month.docId} with index: ${index} for batch2 update`,
      );
    } else {
      console.error(
        `Could not find year document for yearString: ${month.yearString}`,
      );
    }
  });

  const fiscalWeeksPromises = fiscalWeeks.map(async (week, index) => {
    // Find the document references
    const yearReference = week.yearString
      ? await findYearDocRef(week.yearString)
      : undefined;
    const monthReference = week.monthString
      ? doc(firestore, "fiscalMonths", week.monthString)
      : undefined;

    // Reference the document to be written
    const docRef = week.docId
      ? doc(firestore, "fiscalWeeks", week.docId)
      : undefined;

    // If we have a docRef, add the update operation to the batch
    if (docRef) {
      batch2.update(docRef, {
        year: yearReference,
        month: monthReference,
        monthString: deleteField(),
        docId: deleteField(),
      });
    }

    console.log(
      `Prepared week ${week.docId} with index: ${index} for batch2 update`,
    );
  });

  // Once all the updates are prepared, commit the batch
  Promise.all(fiscalWeeksPromises)
    .then(() => Promise.all(fiscalMonthsPromises))
    .then(() => batch2.commit())
    .then(() => console.log("All updates committed to Firestore."))
    .catch((error) => console.error("Error during batch update:", error));
}

// Define an async function to find the DocumentReference based on yearString
async function findYearDocRef(
  yearString: string,
): Promise<DocumentReference | undefined> {
  const q = query(
    collection(firestore, "fiscalYears"),
    where("year", "==", yearString),
  );
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].ref;
  }
  return undefined;
}

export const fetchEntriesAfterDate = async (
  date: Timestamp,
): Promise<NonRecurringEntry[]> => {
  try {
    const entriesRef = collection(firestore, "nonRecurringExpenses");
    const q = query(entriesRef, where("dateTime", ">", date));
    const querySnapshot = await getDocs(q);
    console.log(
      "querySnapshot",
      querySnapshot.docs.map(
        (doc) => ({ docId: doc.id, ...doc.data() }) as NonRecurringEntry,
      ),
    );
    return querySnapshot.docs.map(
      (doc) => ({ docId: doc.id, ...doc.data() }) as NonRecurringEntry,
    );
  } catch (error) {
    console.error("Error fetching entries after date:", error);
    throw error;
  }
};

export async function fetchMostRecentEntryBeforeDate(
  date: Timestamp,
): Promise<NonRecurringEntry | null> {
  const entriesRef = collection(firestore, "nonRecurringExpenses");
  const q = query(
    entriesRef,
    where("dateTime", "<", date),
    orderBy("dateTime", "desc"),
    limit(1),
  );
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { docId: doc.id, ...doc.data() } as NonRecurringEntry;
  } else {
    return null;
  }
}

export const updateEntries = async (
  entries: NonRecurringEntry[],
): Promise<void> => {
  await runTransaction(firestore, async (transaction) => {
    entries.forEach((entry) => {
      if (entry.docId) {
        const entryRef = doc(firestore, "nonRecurringExpenses", entry.docId);
        transaction.update(entryRef, entry);
      } else {
        // Throw an error if docId is undefined
        throw new Error("Entry missing docId cannot be updated.");
      }
    });
  });
};

export function calculateFiscalWeekRef(expenseDate: string): string {
  // Parse the expenseDate as a Date object
  const expenseDateObj = new Date(expenseDate);

  // Calculate the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayOfWeek = expenseDateObj.getUTCDay();

  // Calculate the number of days to subtract to get to the start of the fiscal week (Sunday)
  const daysToSubtract = dayOfWeek;

  // Calculate the start date of the fiscal week by subtracting daysToSubtract from expenseDateObj
  const fiscalWeekStartDate = new Date(expenseDateObj);
  fiscalWeekStartDate.setUTCDate(expenseDateObj.getUTCDate() - daysToSubtract);

  // Format the fiscalWeekStartDate as a string in 'yyyy-MM-dd' format, representing the beginning of the fiscal week
  const formattedStartDate = fiscalWeekStartDate.toISOString().split("T")[0];

  // Calculate the end date of the fiscal week by adding 6 days to the start date
  const fiscalWeekEndDate = new Date(fiscalWeekStartDate);
  fiscalWeekEndDate.setUTCDate(fiscalWeekStartDate.getUTCDate() + 6);

  // Format the fiscalWeekEndDate as a string in 'yyyy-MM-dd' format, representing the end of the fiscal week
  const formattedEndDate = fiscalWeekEndDate.toISOString().split("T")[0];

  // Concatenate formattedStartDate and formattedEndDate to form the fiscalWeekRefString
  const fiscalWeekRefString = formattedStartDate + "_" + formattedEndDate;

  // Return the fiscal week reference string
  return fiscalWeekRefString;
}
