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

export type NonRecurringEntry = {
  category: string;
  tags: string[];
  date: string;
  value: number;
  type: string;
};

export type RecurringEntry = {
  name: string;
  value: number;
};

export const todaysDate = new Date().toISOString().split("T")[0];

export function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split("-").map((s) => parseInt(s, 10));
  const dateObj = new Date(year, month - 1, day); // months are 0-indexed in JS
  return dateObj.toLocaleDateString();
}
