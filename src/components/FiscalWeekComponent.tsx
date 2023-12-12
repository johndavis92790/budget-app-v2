import { useState } from "react";
import { useGoals } from "../utils/hooks/useGoals";
import { todaysDate } from "../utils/Helpers";
import {
  updateWeeklyCurrentGoal,
  updateWeeklySetGoal,
} from "../utils/FirebaseHelpers";

export function FiscalWeekComponent() {
  const { currentWeeklyGoal, setWeeklyGoal } = useGoals();
  const [setGoal, setSetGoal] = useState(0);

  const handleSetGoalChange = (e: any) => {
    setSetGoal(e.target.value);
  };

  return (
    <div>
      <h2>Fiscal Week Goals</h2>
      <p>
        Set Goal:{" "}
        <input
          type="number"
          defaultValue={setWeeklyGoal}
          onChange={(e) => {
            handleSetGoalChange(e);
          }}
        />
      </p>
      <button
        onClick={() => {
          updateWeeklyCurrentGoal(todaysDate, setGoal);
          updateWeeklySetGoal(todaysDate, setGoal);
        }}
      >
        Update Set Goal
      </button>
      <p>Current Goal: {currentWeeklyGoal}</p>
    </div>
  );
}
