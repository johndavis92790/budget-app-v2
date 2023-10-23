import React from "react";
import MaskedInput from "react-text-mask";
import createNumberMask from "text-mask-addons/dist/createNumberMask";

interface MaskOptions {
  prefix?: string;
  suffix?: string;
  includeThousandsSeparator?: boolean;
  thousandsSeparatorSymbol?: string;
  allowDecimal?: boolean;
  decimalSymbol?: string;
  decimalLimit?: number;
  integerLimit?: number;
  requireDecimal?: boolean;
  allowNegative?: boolean;
  allowLeadingZeroes?: boolean;
}

interface CurrencyInputProps {
  inputMode?:
    | "search"
    | "text"
    | "none"
    | "tel"
    | "url"
    | "email"
    | "numeric"
    | "decimal";
  maskOptions?: MaskOptions;
  [key: string]: any; // This allows for any other props to be passed to MaskedInput
}

const defaultMaskOptions: MaskOptions = {
  prefix: "$",
  suffix: "",
  includeThousandsSeparator: true,
  thousandsSeparatorSymbol: ",",
  allowDecimal: true,
  decimalSymbol: ".",
  decimalLimit: 2,
  integerLimit: 7,
  allowNegative: false,
  allowLeadingZeroes: false,
};

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  maskOptions,
  ...inputProps
}) => {
  const currencyMask = createNumberMask({
    ...defaultMaskOptions,
    ...maskOptions,
  });

  return <MaskedInput mask={currencyMask} {...inputProps} />;
};

CurrencyInput.defaultProps = {
  inputMode: "decimal",
  maskOptions: {},
};

export default CurrencyInput;
