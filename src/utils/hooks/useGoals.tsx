import { useState, useEffect } from "react";
import { fetchCurrentGoal } from "../FirebaseHelpers";

export const useGoals = () => {
  const [monthlyGoal, setMonthlyGoal] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      const goal = await fetchCurrentGoal();
      setMonthlyGoal(goal || 0);
    };

    fetchData();
  }, []);

  return {
    monthlyGoal,
    setMonthlyGoal,
  };
};
