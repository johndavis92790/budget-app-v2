import React from "react";
import { Range, getTrackBackground } from "react-range";
import { shortMonths } from "../utils/Helpers";

interface DateRangeSliderProps {
  startDate: string;
  endDate: string;
  dateRange: [number, number];
  onDateRangeChange: (range: [number, number]) => void;
}

const numberToDate = (num: number) => {
  const year = Math.floor(num / 12);
  const month = num % 12;
  return `${shortMonths[month]} ${year + 2000}`; // assuming starting from the year 2000
};

const DateRangeSlider: React.FC<DateRangeSliderProps> = ({
  startDate,
  endDate,
  dateRange,
  onDateRangeChange,
}) => {
  // Convert start and end dates to numbers (months since year 2000, for example)
  const startNum =
    (parseInt(startDate.substr(0, 4)) - 2000) * 12 +
    parseInt(startDate.substr(5, 2)) -
    1;
  const endNum =
    (parseInt(endDate.substr(0, 4)) - 2000) * 12 +
    parseInt(endDate.substr(5, 2)) -
    1;

  return (
    <Range
      step={1}
      min={startNum}
      max={endNum}
      values={dateRange}
      onChange={(values) => onDateRangeChange(values as [number, number])}
      renderTrack={({ props, children }) => (
        <div
          onMouseDown={props.onMouseDown}
          onTouchStart={props.onTouchStart}
          style={{
            ...props.style,
            height: "36px",
            display: "flex",
            width: "80%",
            marginLeft: "10%",
            marginTop: "36px",
            marginBottom: "24px",
          }}
        >
          <div
            ref={props.ref}
            style={{
              height: "5px",
              width: "100%",
              borderRadius: "4px",
              background: getTrackBackground({
                values: dateRange,
                colors: ["#ccc", "#548BF4", "#ccc"],
                min: startNum,
                max: endNum,
              }),
              alignSelf: "center",
            }}
          >
            {children}
          </div>
        </div>
      )}
      renderThumb={({ props, index }) => (
        <div
          {...props}
          style={{
            ...props.style,
            height: "20px",
            width: "20px",
            borderRadius: "4px",
            backgroundColor: "#FFF",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0px 2px 6px #AAA",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-28px",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "14px",
              fontFamily: "Arial,Helvetica Neue,Helvetica,sans-serif",
              padding: "4px",
              borderRadius: "4px",
              backgroundColor: "#548BF4",
            }}
          >
            {numberToDate(dateRange[index])}
          </div>
        </div>
      )}
    />
  );
};

export default DateRangeSlider;
