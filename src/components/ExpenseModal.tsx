import React from "react";
import { Form, Modal, Button } from "react-bootstrap";
import Select from "react-select";
import { NonRecurringEntry, formatAsCurrency } from "../utils/Helpers";
import CurrencyInput from "./CurrencyInput";

type ExpenseModalProps = {
  showModal: boolean;
  handleCloseModal: () => void;
  editExpense: NonRecurringEntry | null;
  setEditExpense: React.Dispatch<
    React.SetStateAction<NonRecurringEntry | null>
  >;
  handleSaveChanges: () => void;
  categoryOptions: { value: string; label: string }[];
  options: { value: string; label: string }[];
  handleCurrencyChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedExpense: NonRecurringEntry | null;
};

const ExpenseModal: React.FC<ExpenseModalProps> = ({
  showModal,
  handleCloseModal,
  editExpense,
  setEditExpense,
  handleSaveChanges,
  categoryOptions,
  options,
  handleCurrencyChange,
  selectedExpense,
}) => {
  return (
    <Modal show={showModal} onHide={handleCloseModal}>
      <Modal.Header closeButton>
        <Modal.Title>
          {selectedExpense?.type === "expense"
            ? "Expense Details"
            : "Refund Details"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Category:</Form.Label>
          <Select
            options={categoryOptions}
            value={{
              value: editExpense?.category || "",
              label: editExpense?.category || "",
            }}
            onChange={(selected) =>
              setEditExpense((prev) => ({
                ...prev!,
                category: selected?.value || "",
              }))
            }
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Tags:</Form.Label>
          <Select
            isMulti
            options={options}
            value={editExpense?.tags.map((tag) => ({
              value: tag,
              label: tag,
            }))}
            onChange={(selected) =>
              setEditExpense((prev) => ({
                ...prev!,
                tags: selected.map((item) => item.value),
              }))
            }
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Date:</Form.Label>
          <Form.Control
            type="date"
            value={editExpense?.date || ""}
            onChange={(e) =>
              setEditExpense((prev) => ({ ...prev!, date: e.target.value }))
            }
          />
        </Form.Group>

        <Form.Group>
          <div className="d-flex justify-content-end align-items-center mb-3">
            <label htmlFor="expense-num-input" style={{ marginRight: "12px" }}>
              Amount
            </label>
            <CurrencyInput
              autoComplete="off"
              placeholder={formatAsCurrency(editExpense?.value ?? 0)}
              size="4"
              type="text"
              id="expense-num-input"
              name="expense-num"
              className="num-input form-control"
              onChange={handleCurrencyChange}
              style={{ maxWidth: "100px", textAlign: "right" }}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) =>
                e.target.setSelectionRange(
                  e.target.value.length,
                  e.target.value.length,
                )
              }
            />
          </div>
        </Form.Group>

        <Form.Group>
          <Form.Label>Notes:</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={editExpense?.notes || ""}
            onChange={(e) =>
              setEditExpense((prev) => ({ ...prev!, notes: e.target.value }))
            }
          />
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseModal}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSaveChanges}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ExpenseModal;
