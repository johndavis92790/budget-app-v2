import React from "react";
import { Modal, Form, Button } from "react-bootstrap";

interface EntryModalProps {
  showModal: boolean;
  handleCloseModal: () => void;
  isEditMode: boolean;
  handleAdd: (e: React.FormEvent) => void;
  handleSaveChanges: (e: React.FormEvent) => void;
  handleEntryDelete: () => void;
  entryName: string | null;
  setEntryName: (name: string | null) => void;
  entryValue: number | null;
  setEntryValue: (value: number | null) => void;
  entryType: "income" | "expense";
  setEntryType: (value: React.SetStateAction<"income" | "expense">) => void;
}

const EntryModal: React.FC<EntryModalProps> = ({
  showModal,
  handleCloseModal,
  isEditMode,
  handleAdd,
  handleSaveChanges,
  handleEntryDelete,
  entryName,
  setEntryName,
  entryValue,
  setEntryValue,
  entryType,
  setEntryType,
}) => {
  return (
    <Modal show={showModal} onHide={handleCloseModal}>
      <Form onSubmit={isEditMode ? handleSaveChanges : handleAdd}>
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditMode ? "Edit Entry" : "Add New Entry"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
              onChange={(e) =>
                setEntryType(e.target.value as "income" | "expense")
              }
              disabled={true}
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </Form.Control>
          </Form.Group>
        </Modal.Body>
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
  );
};

export default EntryModal;
