import React, { useEffect } from "react";
import { Table } from "react-bootstrap";
import { formatAsCurrency } from "../utils/Helpers";
import { updateMonthlyAutoFunds } from "../utils/FirebaseHelpers";

interface AveragesAndTotalsProps {
  monthlyIncome: number;
  yearlyIncome: number;
  monthlyExpenses: number;
  yearlyExpenses: number;
  availableMonthly: number;
  availableFiscalMonthly: number;
  availableWeekly: number;
}

const AveragesAndTotalsTable: React.FC<AveragesAndTotalsProps> = ({
  monthlyIncome,
  yearlyIncome,
  monthlyExpenses,
  yearlyExpenses,
  availableMonthly,
  availableFiscalMonthly,
  availableWeekly,
}) => {
  useEffect(() => {
    const formattedAvailableFiscalMonthly = Number(
      availableFiscalMonthly.toFixed(2),
    );

    updateMonthlyAutoFunds(formattedAvailableFiscalMonthly);
  }, [availableFiscalMonthly]);

  return (
    <div>
      <h2>Averages and Totals</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Metrics</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Total Monthly Income</td>
            <td className="money-column-right-align">
              {formatAsCurrency(monthlyIncome)}
            </td>
          </tr>
          <tr>
            <td>Yearly Total Income</td>
            <td className="money-column-right-align">
              {formatAsCurrency(yearlyIncome)}
            </td>
          </tr>
          <tr>
            <td>Total Monthly Expenses</td>
            <td className="money-column-right-align">
              {formatAsCurrency(monthlyExpenses)}
            </td>
          </tr>
          <tr>
            <td>Yearly Total Expenses</td>
            <td className="money-column-right-align">
              {formatAsCurrency(yearlyExpenses)}
            </td>
          </tr>
          <tr>
            <td>Available After Expenses Monthly</td>
            <td className="money-column-right-align">
              {formatAsCurrency(availableMonthly)}
            </td>
          </tr>
          <tr>
            <td>Available After Expenses Fiscal Monthly</td>
            <td className="money-column-right-align">
              {formatAsCurrency(availableFiscalMonthly)}
            </td>
          </tr>
          <tr>
            <td>Available After Expenses Weekly</td>
            <td className="money-column-right-align">
              {formatAsCurrency(availableWeekly)}
            </td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
};

export default AveragesAndTotalsTable;
