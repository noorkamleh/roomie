import type { Bill, Chore, Expense } from "../../../shared/types";
import { splitExpense } from "../../expenses/utils/calculations.ts";
import { getAmountCents } from "../../../shared/utils/money.ts";

export function calculateMonthlySpending(
  expenses: Expense[],
  currentUser: string,
  today: string,
) {
  const entries = expenses.filter(
    (expense) =>
      expense.date.startsWith(today.slice(0, 7)) && expense.date <= today,
  );
  const categories = new Map<string, number>();
  let totalCents = 0;
  let shareCents = 0;
  for (const expense of entries) {
    const cents = getAmountCents(expense);
    totalCents += cents;
    shareCents +=
      splitExpense(expense).find((share) => share.member === currentUser)
        ?.cents ?? 0;
    categories.set(
      expense.category,
      (categories.get(expense.category) ?? 0) + cents,
    );
  }
  return {
    total: totalCents / 100,
    yourShare: shareCents / 100,
    categories: [...categories]
      .map(([name, cents]) => ({
        name,
        amount: cents / 100,
        percent: totalCents > 0 ? (cents / totalCents) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount || a.name.localeCompare(b.name)),
  };
}

export function selectPersonalOpenChores(chores: Chore[], currentUser: string) {
  return chores
    .filter(
      (chore) =>
        chore.assignedTo === currentUser && chore.status !== "completed",
    )
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export function selectUnpaidBills(bills: Bill[]) {
  return bills
    .filter((bill) => bill.status === "pending")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}
