import type { Expense, Settlement } from "../../../shared/types";
import { getAmountCents } from "../../../shared/utils/money.ts";

export function splitExpense(
  expense: Pick<Expense, "amount" | "amountCents" | "participants" | "split">,
) {
  const total = getAmountCents(expense);
  if (!Number.isSafeInteger(total) || total <= 0)
    throw new Error("Enter a positive expense amount in SAR.");
  if (!Array.isArray(expense.participants))
    throw new Error("Select at least one participant with a unique name.");
  const count = expense.participants.length;
  if (
    count === 0 ||
    expense.participants.some(
      (member) => typeof member !== "string" || member.trim().length === 0,
    ) ||
    new Set(expense.participants).size !== count
  )
    throw new Error("Select at least one participant with a unique name.");

  const split = expense.split;
  if (split !== undefined) {
    if (
      !split ||
      typeof split !== "object" ||
      !["amounts", "percentages"].includes(split.mode)
    )
      throw new Error("Choose an equal, exact amount or percentage split.");
    const values =
      split.mode === "amounts" ? split.sharesCents : split.basisPoints;
    if (
      !values ||
      typeof values !== "object" ||
      Array.isArray(values) ||
      Object.keys(values).length !== count ||
      !expense.participants.every((member) =>
        Object.prototype.hasOwnProperty.call(values, member),
      )
    )
      throw new Error(
        "Every selected participant must have exactly one share.",
      );
    if (
      !Object.values(values).every(
        (value) => Number.isSafeInteger(value) && value >= 0,
      )
    )
      throw new Error(
        split.mode === "amounts"
          ? "Enter nonnegative shares with at most two decimal places in SAR."
          : "Enter nonnegative percentages with at most two decimal places.",
      );
    const totalShares = Object.values(values).reduce(
      (sum, value) => sum + BigInt(value),
      0n,
    );
    if (split.mode === "amounts") {
      if (totalShares !== BigInt(total))
        throw new Error("Exact shares must add up to the expense amount.");
      return expense.participants.map((member) => ({
        member,
        cents: values[member],
      }));
    }
    if (totalShares !== 10000n)
      throw new Error("Percentages must add up to 100%.");
    const portions = expense.participants.map((member, index) => {
      const weighted = BigInt(total) * BigInt(values[member]);
      return {
        member,
        index,
        cents: Number(weighted / 10000n),
        remainder: Number(weighted % 10000n),
      };
    });
    const remaining =
      total - portions.reduce((sum, portion) => sum + portion.cents, 0);
    const priority = [...portions].sort(
      (first, second) =>
        second.remainder - first.remainder || first.index - second.index,
    );
    for (let index = 0; index < remaining; index += 1)
      priority[index].cents += 1;
    return portions.map(({ member, cents }) => ({ member, cents }));
  }
  const base = Math.floor(total / count);
  const remainder = total % count;
  return expense.participants.map((member, index) => ({
    member,
    cents: base + (index < remainder ? 1 : 0),
  }));
}

export function calculateTotalExpenses(expenses: Expense[]) {
  return (
    expenses.reduce((total, expense) => total + getAmountCents(expense), 0) /
    100
  );
}

export function calculateBalanceCents(
  expenses: Expense[],
  currentUser: string,
  settlements: Settlement[] = [],
) {
  const expenseBalance = expenses.reduce((balance, expense) => {
    const share =
      splitExpense(expense).find((part) => part.member === currentUser)
        ?.cents ?? 0;
    return (
      balance +
      (expense.paidBy === currentUser ? getAmountCents(expense) : 0) -
      share
    );
  }, 0);
  return settlements.reduce(
    (balance, payment) =>
      balance +
      (payment.from === currentUser ? getAmountCents(payment) : 0) -
      (payment.to === currentUser ? getAmountCents(payment) : 0),
    expenseBalance,
  );
}

export function calculateBalance(
  expenses: Expense[],
  currentUser: string,
  settlements: Settlement[] = [],
) {
  return calculateBalanceCents(expenses, currentUser, settlements) / 100;
}

export function calculateYouAreOwed(
  expenses: Expense[],
  currentUser: string,
  settlements: Settlement[] = [],
) {
  return Math.max(calculateBalance(expenses, currentUser, settlements), 0);
}

export function calculateYouOwe(
  expenses: Expense[],
  currentUser: string,
  settlements: Settlement[] = [],
) {
  return Math.max(-calculateBalance(expenses, currentUser, settlements), 0);
}

export function suggestSettlements(
  expenses: Expense[],
  members: string[],
  settlements: Settlement[] = [],
) {
  const balances = members.map((name) => ({
    name,
    cents: calculateBalanceCents(expenses, name, settlements),
  }));
  const creditors = balances.filter((member) => member.cents > 0);
  const debtors = balances.filter((member) => member.cents < 0);
  const transfers: Omit<Settlement, "id" | "date">[] = [];
  for (const debtor of debtors) {
    for (const creditor of creditors) {
      const cents = Math.min(-debtor.cents, creditor.cents);
      if (cents <= 0) continue;
      transfers.push({
        from: debtor.name,
        to: creditor.name,
        amount: cents / 100,
      });
      debtor.cents += cents;
      creditor.cents -= cents;
    }
  }
  return transfers;
}
