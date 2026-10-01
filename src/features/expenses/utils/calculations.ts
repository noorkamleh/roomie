import type { Expense, Settlement } from "../../../shared/types";

export function splitExpense(
  expense: Pick<Expense, "amount" | "participants">,
) {
  const total = Math.round(expense.amount * 100);
  const count = expense.participants.length;
  if (
    !Number.isSafeInteger(total) ||
    total < 0 ||
    count === 0 ||
    new Set(expense.participants).size !== count
  ) {
    throw new Error("An expense needs a valid amount and unique participants.");
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
    expenses.reduce(
      (total, expense) => total + Math.round(expense.amount * 100),
      0,
    ) / 100
  );
}

export function calculateBalance(
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
      (expense.paidBy === currentUser ? Math.round(expense.amount * 100) : 0) -
      share
    );
  }, 0);
  return (
    settlements.reduce(
      (balance, payment) =>
        balance +
        (payment.from === currentUser ? Math.round(payment.amount * 100) : 0) -
        (payment.to === currentUser ? Math.round(payment.amount * 100) : 0),
      expenseBalance,
    ) / 100
  );
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
    cents: Math.round(calculateBalance(expenses, name, settlements) * 100),
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
