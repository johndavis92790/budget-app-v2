import React, { useState } from "react";
import { Table } from "react-bootstrap";
import { formatAsCurrency, formatFirestoreTimestamp } from "../utils/Helpers";
import {
  MonthlyAddedFunds,
  NonRecurringEntry,
  WeeklyGoalHistory,
} from "../utils/FirebaseHelpers";

interface Props {
  displayedExpenses: NonRecurringEntry[];
  weeklyGoalHistory: WeeklyGoalHistory[];
  monthlyAddedFunds: MonthlyAddedFunds[];
  handleShowModal: (expense: NonRecurringEntry) => void;
}

const ExpensesTable: React.FC<Props> = ({
  displayedExpenses,
  weeklyGoalHistory,
  monthlyAddedFunds,
  handleShowModal,
}) => {
  // State to toggle visibility of weekly and monthly goals
  const [showGoals, setShowGoals] = useState(false);

  // Function to combine and filter data
  const getCombinedData = () => {
    let combinedData = [...displayedExpenses];

    if (showGoals) {
      combinedData = combinedData.concat(
        transformWeeklyGoalHistory(weeklyGoalHistory),
        transformMonthlyAddedFunds(monthlyAddedFunds),
      );
    }

    // Sorting logic
    combinedData.sort((a, b) => {
      const dateA = a.dateTime.toDate();
      const dateB = b.dateTime.toDate();
      return dateB.getTime() - dateA.getTime();
    });

    return combinedData;
  };

  // Toggle for showing/hiding goals
  const handleToggleGoals = () => {
    setShowGoals(!showGoals);
  };

  // Transform function for WeeklyGoalHistory
  const transformWeeklyGoalHistory = (
    weeklyHistory: WeeklyGoalHistory[],
  ): NonRecurringEntry[] => {
    return weeklyHistory.map((week) => {
      return {
        docId: week.docId,
        category: "Weekly Goal",
        tags: [],
        date: week.date.toDate().toISOString(),
        dateTime: week.date, // Keep the original Timestamp
        value: week.newGoal, // Use the newGoal as the value
        type: "Goal Adjustment",
        notes: `Weekly goal adjustment to ${formatAsCurrency(week.newGoal)}`,
      };
    });
  };

  // Transform function for MonthlyAddedFunds
  const transformMonthlyAddedFunds = (
    monthlyHistory: MonthlyAddedFunds[],
  ): NonRecurringEntry[] => {
    return monthlyHistory.map((month) => {
      return {
        docId: month.docId,
        category:
          month.type === "Auto Funds"
            ? "Monthly Auto Added Funds"
            : "Misc Added Funds",
        tags: [],
        date: month.date.toDate().toISOString(),
        dateTime: month.date, // Keep the original Timestamp
        value: month.addedFunds, // Use the addedFunds as the value
        type: "Goal Adjustment",
        notes: `${formatAsCurrency(month.oldFunds)} + ${formatAsCurrency(
          month.addedFunds,
        )} = ${formatAsCurrency(month.newFunds)} \n${month.notes}`,
      };
    });
  };

  return (
    <>
      {" "}
      <div>
        <label>
          <input
            type="checkbox"
            checked={showGoals}
            onChange={handleToggleGoals}
          />
          Show Weekly/Monthly Goals
        </label>
      </div>
      <Table striped hover size="sm" className="table-history">
        <thead>
          <tr>
            <th className="text-left">History</th>
            <th className="text-left"></th>
          </tr>
        </thead>
        <tbody>
          {getCombinedData().map((entry, idx) => (
            <tr key={idx} onClick={() => handleShowModal(entry)}>
              <td className="first-column">
                <div>
                  <span className="large-font">{entry.category}</span>
                  <br />

                  {entry.type === "Goal Adjustment" ? (
                    <div className="small-font">{entry.notes}</div>
                  ) : (
                    <>
                      <div className="small-font">
                        <span>
                          {entry.type === "expense" ? "Expense" : "Refund"}
                        </span>
                      </div>
                      <div className="small-font">
                        {entry.tags.length > 0 ? (
                          entry.tags.map((tag, tagIdx) => (
                            <span
                              key={tagIdx}
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
                    </>
                  )}
                </div>
              </td>
              <td className="second-column">
                <div>
                  <div>
                    <span
                      className="large-font"
                      style={{
                        color: entry.type === "expense" ? "red" : "green",
                      }}
                    >
                      {entry.type === "expense"
                        ? "-" + formatAsCurrency(entry.value)
                        : "+" + formatAsCurrency(entry.value)}
                    </span>
                  </div>
                  <div>
                    <span className="small-font">
                      {entry.monthlyGoalTo
                        ? formatAsCurrency(entry.monthlyGoalTo)
                        : ""}
                    </span>
                  </div>
                  <div className="small-font">
                    <span>
                      {entry.dateTime
                        ? formatFirestoreTimestamp(entry.dateTime)
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default ExpensesTable;
