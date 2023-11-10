import React from "react";
import { Range, getTrackBackground } from "react-range";
import Spinner from "./Spinner";

interface AmountRangeSliderProps {
  minExpense: number;
  maxExpense: number;
  amountRange: [number, number];
  onAmountRangeChange: (range: [number, number]) => void;
}

const AmountRangeSlider: React.FC<AmountRangeSliderProps> = ({
  minExpense,
  maxExpense,
  amountRange,
  onAmountRangeChange,
}) => {
  if (amountRange[0] < minExpense || amountRange[1] > maxExpense) {
    return <Spinner />;
  }
  return (
    <Range
      step={1}
      min={minExpense}
      max={maxExpense}
      values={amountRange}
      onChange={(values) => onAmountRangeChange(values as [number, number])}
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
                values: amountRange,
                colors: ["#ccc", "#548BF4", "#ccc"],
                min: minExpense,
                max: maxExpense,
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
            {amountRange[index].toFixed(2)}
          </div>
        </div>
      )}
    />
  );
};

export default AmountRangeSlider;
