import { useState, useEffect } from "react";
import {
  fetchCurrentMonthlyGoal,
  fetchCurrentWeeklyGoal,
  fetchSetWeeklyGoal,
} from "../FirebaseHelpers";
import { todaysDate } from "../Helpers";

export const useGoals = () => {
  const [monthlyGoal, setMonthlyGoal] = useState<number>(0);
  const [currentWeeklyGoal, setCurrentWeeklyGoal] = useState<number>(0);
  const [setWeeklyGoal, setSetWeeklyGoal] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      const monthlyGoal = await fetchCurrentMonthlyGoal();
      const currentWeeklyGoal = await fetchCurrentWeeklyGoal(todaysDate);
      const setWeeklyGoal = await fetchSetWeeklyGoal(todaysDate);
      setMonthlyGoal(monthlyGoal || 0);
      setCurrentWeeklyGoal(currentWeeklyGoal || 0);
      setSetWeeklyGoal(setWeeklyGoal || 0);
    };

    fetchData();
  }, []);

  return {
    monthlyGoal,
    setMonthlyGoal,
    currentWeeklyGoal,
    setCurrentWeeklyGoal,
    setWeeklyGoal,
    setSetWeeklyGoal,
  };
};
