import { Chart } from "react-google-charts";
import { NonRecurringEntry } from "../utils/FirebaseHelpers";

interface CategoryBarChartProps {
  filteredExpenses: NonRecurringEntry[];
}

export function CategoryBarChart(props: CategoryBarChartProps) {
  const getCategorySums = (): { [key: string]: number } => {
    const categorySums: { [key: string]: number } = {};

    props.filteredExpenses.forEach((expense) => {
      const category = expense.category;
      if (!categorySums[category]) {
        categorySums[category] = 0;
      }
      categorySums[category] +=
        expense.type === "expense" ? expense.value : -expense.value;
    });

    return categorySums;
  };

  const getChartData = () => {
    const categorySums = getCategorySums();

    const sortedEntries = Object.entries(categorySums).sort(
      (a, b) => b[1] - a[1],
    );

    return [
      ["Category", "Money Spent"],
      ...sortedEntries.map(([category, value]) => [category, value]),
    ];
  };

  const chartOptions = {
    hAxis: {
      format: "$#,###.00",
    },
    colors: ["#4BC0C0"],
    legend: "none",
    chartArea: {
      left: "15%",
      top: "10%",
      width: "80%",
      height: "70%",
    },
  };

  return (
    <div className="chart-container">
      <Chart
        width={"100%"}
        height={"300px"}
        chartType="BarChart"
        loader={<div>Loading Chart...</div>}
        data={getChartData()}
        options={chartOptions}
      />
    </div>
  );
}
