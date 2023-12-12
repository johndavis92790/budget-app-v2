import { useState, useEffect } from "react";
import {
  MonthlyAddedFunds,
  WeeklyGoalHistory,
  fetchMonthlyAddedFunds,
  fetchWeeklyGoalHistory,
} from "../FirebaseHelpers";

export const useGoalHistoryData = () => {
  const [monthlyAddedFunds, setMonthlyAddedFunds] = useState<
    MonthlyAddedFunds[]
  >([]);
  const [weeklyGoalHistory, setWeeklyGoalHistory] = useState<
    WeeklyGoalHistory[]
  >([]);

  useEffect(() => {
    fetchMonthlyAddedFunds().then((monthlyAddedFunds) => {
      setMonthlyAddedFunds(monthlyAddedFunds);
    });
    fetchWeeklyGoalHistory().then((weeklyGoalHistory) => {
      setWeeklyGoalHistory(weeklyGoalHistory);
    });
  }, []);

  return {
    monthlyAddedFunds,
    setMonthlyAddedFunds,
    weeklyGoalHistory,
    setWeeklyGoalHistory,
  };
};
