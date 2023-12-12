import { Table, Button } from "react-bootstrap";
import { formatAsCurrency } from "../utils/Helpers";
import { RecurringEntry } from "../utils/FirebaseHelpers";

export const RecurringExpensesTable: React.FC<{
  title: string;
  entries: RecurringEntry[];
  handleEdit: (type: "income" | "expense", entry: RecurringEntry) => void;
  total: number;
  handleAddNew: (type: "income" | "expense") => void;
}> = ({ title, entries, handleEdit, total, handleAddNew }) => (
  <>
    <h2>{title}</h2>
    <Table striped bordered hover size="sm">
      <thead>
        <tr>
          <th>Name</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry, index) => (
          <tr
            key={index}
            onClick={() =>
              handleEdit(title.toLowerCase() as "income" | "expense", entry)
            }
          >
            <td>{entry.name}</td>
            <td className="money-column-right-align">
              {formatAsCurrency(entry.value)}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td>Total</td>
          <td className="money-column-right-align">
            {formatAsCurrency(total)}
          </td>
        </tr>
      </tfoot>
    </Table>
    <Button
      className="mb-3"
      onClick={() => handleAddNew(title.toLowerCase() as "income" | "expense")}
    >
      Add New {title.slice(0, -1)}
    </Button>
  </>
);
