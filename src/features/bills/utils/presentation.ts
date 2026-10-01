const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function formatBillDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`));
}
