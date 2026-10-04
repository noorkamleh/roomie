import type { Expense, MonthlyBudget } from "../../../shared/types";
import {
  getAmountCents,
  MAX_MONEY_CENTS,
} from "../../../shared/utils/money.ts";

export function budgetAmountCents(value: string) {
  if (!value.trim()) return 0;
  if (!/^(?:\d+(?:\.\d{1,2})?|\.\d{1,2})$/.test(value.trim()))
    throw new Error(
      "Enter budget amounts in SAR with at most two decimal places.",
    );
  const cents = Math.round(Number(value) * 100);
  if (!Number.isSafeInteger(cents) || cents < 0 || cents > MAX_MONEY_CENTS)
    throw new Error(
      "Budget amounts must be between SAR 0 and SAR 100,000,000.",
    );
  return cents;
}

export function calculateBudgetUsage(
  expenses: Expense[],
  budget: MonthlyBudget,
  today: string,
) {
  const entries = expenses.filter(
    (expense) => expense.date.startsWith(budget.month) && expense.date <= today,
  );
  const spentCents = entries.reduce(
    (sum, expense) => sum + getAmountCents(expense),
    0,
  );
  const usage = (limitCents: number, spent: number) => ({
    limitCents,
    spentCents: spent,
    remainingCents: limitCents - spent,
    overCents: Math.max(spent - limitCents, 0),
  });
  return {
    total: budget.totalCents > 0 ? usage(budget.totalCents, spentCents) : null,
    categories: Object.entries(budget.categories)
      .map(([name, limitCents]) => ({
        name,
        ...usage(
          limitCents,
          entries
            .filter((expense) => expense.category === name)
            .reduce((sum, expense) => sum + getAmountCents(expense), 0),
        ),
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}
