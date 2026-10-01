const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "SAR",
});
export function formatCurrency(amount: number) {
  return currencyFormatter.format(amount);
}
