import React, { useState, useEffect } from "react";
import { useUserContext } from "../utils/UserContext";
import {
  addRecurringEntry,
  fetchRecurringEntries,
  updateRecurringEntry,
  deleteRecurringEntry,
} from "../utils/FirebaseHelpers";
import { Table, Form, Button, Modal } from "react-bootstrap";
import { Entry, formatAsCurrency } from "../utils/Helpers";

const RecurringExpensesPage: React.FC = () => {
  const contextValue = useUserContext();
  const user = contextValue?.user || null;

  const [incomes, setIncomes] = useState<Entry[]>([]);
  const [expenses, setExpenses] = useState<Entry[]>([]);
  const sortedIncomes = [...incomes].sort((a, b) => b.value - a.value);
  const sortedExpenses = [...expenses].sort((a, b) => b.value - a.value);

  const [entryName, setEntryName] = useState<string | null>(null);
  const [entryValue, setEntryValue] = useState<number | null>(null);
  const [entryType, setEntryType] = useState<"income" | "expense">("income");

  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Entry | null>(null);
  const [currentType, setCurrentType] = useState<"income" | "expense" | null>(
    null,
  );

  const [showModal, setShowModal] = useState<boolean>(false);
  const handleOpenModal = () => {
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setEntryName(null);
    setEntryValue(null);
    setShowModal(false);
  };

  useEffect(() => {
    if (user) {
      fetchRecurringEntries().then((data) => {
        if (data) {
          setIncomes(data.incomes || []);
          setExpenses(data.expenses || []);
        }
      });
    }
  }, [user]);

  const handleAddNew = (type: "income" | "expense") => {
    setIsEditMode(false);
    setEntryType(type);
    handleOpenModal();
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();

    if (user && entryValue && entryName) {
      const newEntry = { name: entryName, value: entryValue };
      addRecurringEntry({ type: entryType, ...newEntry });

      if (entryType === "income") setIncomes((prev) => [...prev, newEntry]);
      else setExpenses((prev) => [...prev, newEntry]);

      handleCloseModal();
    }
  };

  const handleEdit = (type: "income" | "expense", entry: Entry) => {
    setCurrentEntry(entry);
    setCurrentType(type);
    setEntryName(entry.name);
    setEntryValue(entry.value);
    setIsEditMode(true);
    handleOpenModal();
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentType && currentEntry && entryName && entryValue) {
      updateRecurringEntry(
        currentType,
        currentEntry.name,
        currentEntry.value,
        entryName,
        entryValue,
      );
      const updatedEntry = { name: entryName, value: entryValue };

      if (currentType === "income") {
        setIncomes(
          incomes.map((e) =>
            e.name === currentEntry.name && e.value === currentEntry.value
              ? updatedEntry
              : e,
          ),
        );
      } else {
        setExpenses(
          expenses.map((e) =>
            e.name === currentEntry.name && e.value === currentEntry.value
              ? updatedEntry
              : e,
          ),
        );
      }
    }

    setIsEditMode(false);
    setCurrentEntry(null);
    setCurrentType(null);
    handleCloseModal();
  };

  const handleDelete = (type: "income" | "expense", entry: Entry) => {
    deleteRecurringEntry(type, entry.name, entry.value);

    if (type === "income") {
      setIncomes((prev) =>
        prev.filter((e) => !(e.name === entry.name && e.value === entry.value)),
      );
    } else {
      setExpenses((prev) =>
        prev.filter((e) => !(e.name === entry.name && e.value === entry.value)),
      );
    }
  };

  const totalIncome = incomes.reduce((acc, curr) => acc + curr.value, 0);
  const tithing: Entry = {
    name: "Tithing",
    value: totalIncome * 0.1,
  };
  const totalExpense =
    expenses.reduce((acc, curr) => acc + curr.value, 0) + tithing.value;

  const monthlyIncome = totalIncome;
  const yearlyIncome = monthlyIncome * 12;

  const monthlyExpenses = totalExpense;
  const yearlyExpenses = monthlyExpenses * 12;

  const availableMonthly = monthlyIncome - monthlyExpenses;
  const availableFiscalMonthly = ((yearlyIncome - yearlyExpenses) / 52) * 4;
  const availableWeekly = (yearlyIncome - yearlyExpenses) / 52;

  const handleEntryDelete = () => {
    if (currentType && currentEntry) {
      handleDelete(currentType, currentEntry);
      handleCloseModal();
    }
  };

  const modalBodyContent = (
    <>
      <Form.Group controlId="formName">
        <Form.Label>Name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Entry Name"
          value={entryName || ""}
          onChange={(e) => setEntryName(e.target.value)}
        />
      </Form.Group>
      <Form.Group controlId="formAmount">
        <Form.Label>Amount</Form.Label>
        <Form.Control
          type="number"
          placeholder="Enter amount"
          value={entryValue || ""}
          onChange={(e) => setEntryValue(Number(e.target.value))}
        />
      </Form.Group>
      <Form.Group controlId="formType">
        <Form.Label>Type</Form.Label>
        <Form.Control
          as="select"
          value={entryType}
          onChange={(e) => setEntryType(e.target.value as "income" | "expense")}
          disabled={true}
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </Form.Control>
      </Form.Group>
    </>
  );

  return (
    <div>
      <h1>Recurring Expenses and Incomes</h1>

      <h2>Incomes</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Amount</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {sortedIncomes.map((income, index) => (
            <tr key={index}>
              <td>{income.name}</td>
              <td className="money-column-right-align">
                {formatAsCurrency(income.value)}
              </td>
              <td>
                <Button onClick={() => handleEdit("income", income)}>
                  Edit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>Total</td>
            <td className="money-column-right-align">
              {formatAsCurrency(totalIncome)}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </Table>
      <Button onClick={() => handleAddNew("income")}>Add New Income</Button>

      <h2>Expenses</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Amount</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{tithing.name}</td>
            <td className="money-column-right-align">
              {formatAsCurrency(tithing.value)}
            </td>
            <td></td>
          </tr>
          {sortedExpenses.map((expense, index) => (
            <tr key={index + 1}>
              <td>{expense.name}</td>
              <td className="money-column-right-align">
                {formatAsCurrency(expense.value)}
              </td>
              <td>
                <Button onClick={() => handleEdit("expense", expense)}>
                  Edit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>Total</td>
            <td className="money-column-right-align">
              {formatAsCurrency(totalExpense)}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </Table>
      <Button onClick={() => handleAddNew("expense")}>Add New Expense</Button>

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

      <Modal show={showModal} onHide={handleCloseModal}>
        <Form onSubmit={isEditMode ? handleSaveChanges : handleAdd}>
          <Modal.Header closeButton>
            <Modal.Title>
              {isEditMode ? "Edit Entry" : "Add New Entry"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>{modalBodyContent}</Modal.Body>
          <Modal.Footer>
            {isEditMode && (
              <Button variant="danger" onClick={handleEntryDelete}>
                Delete
              </Button>
            )}
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
            <Button type="submit">
              {isEditMode ? "Save Changes" : "Add Entry"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default RecurringExpensesPage;
