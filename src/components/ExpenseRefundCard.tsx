import React from "react";
import CreatableSelect from "react-select/creatable";
import { Card, Button } from "react-bootstrap";
import CurrencyInput from "./CurrencyInput";
import { todaysDate } from "../utils/Helpers";

interface ExpenseRefundCardProps {
  categories: string[];
  tags: string[];
  handleAddEntry: (type: "expense" | "refund") => void;
  handleOptionChange: (
    setter: (value: any) => void,
  ) => (selectedOption: any) => void;
  handleMultiOptionChange: (
    setter: (value: string[]) => void,
  ) => (selectedOptions: any) => void;
  handleCreateItem: (
    newItem: string,
    existingItems: string[],
    addFunction: (item: string) => Promise<void>,
    setter: (value: string[] | ((prev: string[]) => string[])) => void,
  ) => void;
  handleCurrencyChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentCategory: string;
  currentTags: string[];
  currentDate: string | null;
  currentAmount: number | null;
  setCurrentCategory: React.Dispatch<React.SetStateAction<string>>;
  setCurrentTags: React.Dispatch<React.SetStateAction<string[]>>;
  addTag: (tag: string) => Promise<void>;
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
  todaysDate: string;
  setCurrentDate: (value: React.SetStateAction<string>) => void;
  setCurrentNotes: (value: React.SetStateAction<string>) => void;
}

const ExpenseRefundCard: React.FC<ExpenseRefundCardProps> = (props) => {
  const categoryOptions = props.categories.map((cat) => ({
    label: cat,
    value: cat,
  }));
  const tagOptions = props.tags.map((tag) => ({ label: tag, value: tag }));

  const handleCreateAndSelectTag = async (newTag: string) => {
    // Create the new tag
    await props.handleCreateItem(
      newTag,
      props.tags,
      props.addTag,
      props.setTags,
    );

    // Update the current tags to include the new tag
    props.setCurrentTags((prevTags) => [...prevTags, newTag]);
  };

  return (
    <Card className="mb-3 mt-3">
      <Card.Body>
        <CreatableSelect
          onChange={props.handleOptionChange(props.setCurrentCategory)}
          options={categoryOptions}
          value={
            props.currentCategory
              ? { label: props.currentCategory, value: props.currentCategory }
              : null
          }
          placeholder="Select or create a category..."
          className="mb-3"
        />
        <CreatableSelect
          isMulti
          isClearable
          onChange={props.handleMultiOptionChange(props.setCurrentTags)}
          onCreateOption={handleCreateAndSelectTag}
          options={tagOptions}
          value={props.currentTags.map((tag) => ({ label: tag, value: tag }))}
          placeholder="Select or create tags..."
          className="mb-3"
        />
        <input
          type="date"
          value={props.currentDate || props.todaysDate}
          onChange={(e) => props.setCurrentDate(e.target.value)}
          required
          className="form-control mb-3"
          max={todaysDate}
        />
        <input
          type="text"
          placeholder="Optional Notes"
          onChange={(e) => props.setCurrentNotes(e.target.value)}
          className="form-control mb-3"
        />
        <div className="d-flex justify-content-end align-items-center mb-3">
          <label htmlFor="expense-num-input" style={{ marginRight: "12px" }}>
            Amount
          </label>
          <CurrencyInput
            autoComplete="off"
            placeholder="$0.00"
            size="4"
            type="text"
            id="expense-num-input"
            name="expense-num"
            className="num-input form-control"
            onChange={props.handleCurrencyChange}
            style={{ maxWidth: "100px", textAlign: "right" }}
            onFocus={(e: React.FocusEvent<HTMLInputElement>) =>
              e.target.setSelectionRange(
                e.target.value.length,
                e.target.value.length,
              )
            }
          />
        </div>
        <div className="d-flex justify-content-end">
          <Button
            variant="success"
            onClick={() => props.handleAddEntry("refund")}
            className="me-2"
          >
            Refund
          </Button>
          <Button
            variant="danger"
            type="submit"
            onClick={() => props.handleAddEntry("expense")}
          >
            Expense
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ExpenseRefundCard;
