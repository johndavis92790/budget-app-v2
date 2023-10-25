import { Chart } from "react-google-charts";
import { NonRecurringEntry, shortMonths } from "../utils/Helpers";

interface TimeChartProps {
  filteredExpenses: NonRecurringEntry[];
}

export function TimeChart(props: TimeChartProps) {
  const getMonthlySums = (): { [key: string]: number } => {
    const monthlySums: { [key: string]: number } = {};

    props.filteredExpenses.forEach((expense) => {
      const date = new Date(expense.date);
      const monthYearKey = `${
        shortMonths[date.getUTCMonth()]
      } ${date.getUTCFullYear()}`;
      if (!monthlySums[monthYearKey]) {
        monthlySums[monthYearKey] = 0;
      }
      // If the type is "expense", add the value. If "refund", subtract the value.
      monthlySums[monthYearKey] +=
        expense.type === "expense" ? expense.value : -expense.value;
    });

    return monthlySums;
  };

  const getMonthlyAverage = (): number => {
    const monthlySums = getMonthlySums();
    const totalMonths = Object.keys(monthlySums).length;
    const totalAmount = Object.values(monthlySums).reduce(
      (sum, value) => sum + value,
      0,
    );

    return totalAmount / totalMonths;
  };

  const getChartData = () => {
    const monthlySums = getMonthlySums();

    const sortedEntries = Object.entries(monthlySums).sort((a, b) => {
      const monthA = shortMonths.indexOf(a[0].split(" ")[0]);
      const yearA = parseInt(a[0].split(" ")[1]);
      const monthB = shortMonths.indexOf(b[0].split(" ")[0]);
      const yearB = parseInt(b[0].split(" ")[1]);
      return yearA - yearB || monthA - monthB;
    });

    return [
      ["Month/Year", "Money Spent"],
      ...sortedEntries.map(([monthYear, value]) => [monthYear, value]),
    ];
  };

  const chartOptions = {
    vAxis: {
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
        chartType="LineChart"
        loader={<div>Loading Chart...</div>}
        data={getChartData()}
        options={chartOptions}
      />
      <div className="monthly-average">
        Monthly Average: ${getMonthlyAverage().toFixed(2)}
      </div>
    </div>
  );
}
