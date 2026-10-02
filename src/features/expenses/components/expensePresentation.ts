const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});
export function formatExpenseDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`));
}

const amountFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
export function formatExpenseAmount(amount: number) {
  return amountFormatter.format(amount);
}
