import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {
  CollectionReference,
  DocumentReference,
  QueryDocumentSnapshot,
  Timestamp,
} from "firebase-admin/firestore";

type MonthlyAddedFunds = {
  docId?: string;
  type: string;
  oldFunds: number;
  newFunds: number;
  addedFunds: number;
  fiscalMonth: DocumentReference,
  date: Timestamp;
  notes: string;
}

admin.initializeApp();

exports.updateMonthlyGoal = functions.pubsub
  .schedule("every 28 days at 3:00")
  // .schedule("every 1 minutes")
  .timeZone("America/Denver")
  .onRun(async () => {
    const db = admin.firestore();
    const autoFundsRef = db.collection("familyBudget").doc("autoFunds");
    const fiscalMonthsCollection = db.collection("fiscalMonths");

    try {
      const autoFundsDoc = await autoFundsRef.get();
      if (!autoFundsDoc.exists) {
        throw new Error("No autoFunds document found");
      }

      const autoFundsData = autoFundsDoc.data();
      if (!autoFundsData) {
        throw new Error("autoFunds document has no data");
      }

      const monthlyFunds = autoFundsData.monthlyFunds || 0;

      // Updating the currentGoals document as before
      const currentGoalsRef = db.collection("familyBudget").doc("currentGoals");
      const currentGoalsDoc = await currentGoalsRef.get();
      if (!currentGoalsDoc.exists) {
        throw new Error("No currentGoals document found");
      }

      const currentGoalsData = currentGoalsDoc.data();
      if (!currentGoalsData) {
        throw new Error("currentGoals document has no data");
      }

      const monthlyGoal = currentGoalsData.monthlyGoal || 0;
      await currentGoalsRef.update({
        monthlyGoal: monthlyGoal + monthlyFunds,
      });

      // New functionality: Update fiscalMonths document
      const currentDate = new Date();
      const fiscalMonthsDocs = await fiscalMonthsCollection.get();
      const fiscalMonthDoc = fiscalMonthsDocs.docs.find(
        (doc: QueryDocumentSnapshot) => {
          const [startDate, endDate] = doc.id
            .split("_")
            .map((dateStr: string) => new Date(dateStr));
          return currentDate >= startDate && currentDate <= endDate;
        }
      );

      if (!fiscalMonthDoc) {
        throw new Error(
          "No matching fiscalMonths document found for the current date"
        );
      }

      await fiscalMonthDoc.ref.update({
        autoFunds: monthlyFunds,
      });

      console.log(
        "Monthly goal and fiscalMonths document updated successfully"
      );

      const monthlyAddedFundsCollection = db.collection(
        "monthlyAddedFunds"
      ) as CollectionReference<MonthlyAddedFunds>;

      await monthlyAddedFundsCollection.add({
        type: "auto added funds",
        oldFunds: Number(monthlyGoal),
        newFunds: Number(monthlyGoal + monthlyFunds),
        addedFunds: Number(monthlyFunds),
        fiscalMonth: fiscalMonthDoc.ref,
        date: Timestamp.now(),
        notes: ""
      });

      console.log(
        "monthlyAddedFunds document added successfully"
      );
    } catch (error) {
      console.error("Error: ", error);
    }
  });
