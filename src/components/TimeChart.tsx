import { Chart } from "react-google-charts";
import { NonRecurringEntry, shortMonths } from "../utils/Helpers";

interface TimeChartProps {
  filteredExpenses: NonRecurringEntry[];
}

export function TimeChart(props: TimeChartProps) {
  const getChartData = () => {
    const monthlySums: { [key: string]: number } = {};

    props.filteredExpenses.forEach((expense) => {
      const date = new Date(expense.date);

      if (date) {
        const monthYearKey = `${
          shortMonths[date.getMonth()]
        } ${date.getFullYear()}`;
        if (!monthlySums[monthYearKey]) {
          monthlySums[monthYearKey] = 0;
        }
        monthlySums[monthYearKey] += expense.value;
      }
    });

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
    </div>
  );
}
