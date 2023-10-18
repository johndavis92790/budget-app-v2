import { Timestamp } from "firebase/firestore";

export function formatAsCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export const getLast28DaysStartDate = (): Date => {
  const date = new Date();
  date.setDate(date.getDate() - 28);
  return date;
};

export const shortMonths = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export type Entry = {
  name: string;
  value: number;
  category?: string;
  date?: Date | Timestamp;
};