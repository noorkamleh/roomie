import type { Expense } from "../../../shared/types";

export interface ExpenseFilters {
  query: string;
  month: string;
  category: string;
  payer: string;
}

export function filterExpenses(
  expenses: Expense[],
  filters: ExpenseFilters,
  categoryLabel: (category: string) => string = (category) => category,
) {
  const query = filters.query.trim().toLowerCase();
  return expenses
    .filter(
      (expense) =>
        (!filters.month || expense.date.startsWith(filters.month)) &&
        (!filters.category || expense.category === filters.category) &&
        (!filters.payer || expense.paidBy === filters.payer) &&
        `${expense.title} ${expense.paidBy} ${expense.category} ${categoryLabel(expense.category)}`
          .toLowerCase()
          .includes(query),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function expenseMonthLabel(month: string, locale = "en-US") {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${month}-01T00:00:00Z`));
}
