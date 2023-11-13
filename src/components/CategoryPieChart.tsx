import { Chart } from "react-google-charts";
import { NonRecurringEntry } from "../utils/Helpers";

interface CategoryPieChartProps {
  filteredExpenses: NonRecurringEntry[];
}

export function CategoryPieChart(props: CategoryPieChartProps) {
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

    // Convert to array, sort, and then map to chart data format
    const sortedData = Object.entries(categorySums).sort((a, b) => b[1] - a[1]);
    return [
      ["Category", "Money Spent"],
      ...sortedData,
    ];
  };

  const chartOptions = {
    is3D: false,
    chartArea: {
      width: "100%",
      height: "80%",
    },
    legend: {
      position: "right",
      textStyle: { fontSize: 12 },
    },
  };

  return (
    <div className="chart-container">
      <Chart
        width={"100%"}
        height={"300px"}
        chartType="PieChart"
        loader={<div>Loading Chart...</div>}
        data={getChartData()}
        options={chartOptions}
      />
    </div>
  );
}

export default CategoryPieChart;
