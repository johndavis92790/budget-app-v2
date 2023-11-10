import React, { useEffect } from "react";
import Select from "react-select";
import { Form } from "react-bootstrap";
import DateRangeSlider from "./DateRangeSlider";
import AmountRangeSlider from "./AmountRangeSlider";

interface FiltersProps {
  tags: string[];
  categories: string[];
  currentTags: string[];
  currentCategories: string[];
  setCurrentTags: (tags: string[]) => void;
  setCurrentCategories: (categories: string[]) => void;
  dateStart: string;
  dateEnd: string;
  setDateStart: (date: string) => void;
  setDateEnd: (date: string) => void;
  minExpense: number;
  maxExpense: number;
  amountRange: [number, number];
  setAmountRange: (range: [number, number]) => void;
  lastYearDate: Date;
  currentDate: Date;
}

const FiltersComponent: React.FC<FiltersProps> = (props) => {
  const { minExpense, maxExpense, amountRange, setAmountRange } = props;

  const options = props.tags.map((tag) => ({ value: tag, label: tag }));
  const categoryOptions = props.categories.map((category) => ({
    value: category,
    label: category,
  }));

  useEffect(() => {
    // Ensure amountRange is within the boundaries of minExpense and maxExpense
    if (amountRange[0] < minExpense || amountRange[1] > maxExpense) {
      setAmountRange([minExpense, maxExpense]);
    }
  }, [minExpense, maxExpense, amountRange, setAmountRange]);

  return (
    <Form className="mb-3 form-inline">
      <Select
        isMulti
        options={categoryOptions}
        value={props.currentCategories.map((category) => ({
          value: category,
          label: category,
        }))}
        onChange={(selected) => {
          props.setCurrentCategories(selected.map((item) => item.value));
        }}
        placeholder="Choose categories..."
        className="mb-2"
      />

      <Select
        isMulti
        options={options}
        value={props.currentTags.map((tag) => ({ value: tag, label: tag }))}
        onChange={(selected) => {
          props.setCurrentTags(selected.map((item) => item.value));
        }}
        placeholder="Choose tags..."
        className="mb-2"
      />

      <DateRangeSlider
        startDate={props.lastYearDate.toISOString().split("T")[0]} // or some other start boundary
        endDate={props.currentDate.toISOString().split("T")[0]} // or some other end boundary
        dateRange={[
          (parseInt(props.dateStart.substr(0, 4)) - 2000) * 12 +
            parseInt(props.dateStart.substr(5, 2)) -
            1,
          (parseInt(props.dateEnd.substr(0, 4)) - 2000) * 12 +
            parseInt(props.dateEnd.substr(5, 2)) -
            1,
        ]}
        onDateRangeChange={(range) => {
          const startYear = Math.floor(range[0] / 12) + 2000;
          const startMonth = (range[0] % 12) + 1;
          props.setDateStart(
            `${startYear}-${String(startMonth).padStart(2, "0")}-01`,
          );

          const endYear = Math.floor(range[1] / 12) + 2000;
          const endMonth = (range[1] % 12) + 1;
          const lastDay = new Date(endYear, endMonth, 0).getDate();
          props.setDateEnd(
            `${endYear}-${String(endMonth).padStart(2, "0")}-${lastDay}`,
          );
        }}
      />

      <AmountRangeSlider
        minExpense={props.minExpense}
        maxExpense={props.maxExpense}
        amountRange={props.amountRange}
        onAmountRangeChange={(range) => props.setAmountRange(range)}
      />
    </Form>
  );
};

export default FiltersComponent;
