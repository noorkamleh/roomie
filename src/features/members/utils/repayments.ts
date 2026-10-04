import type {
  Expense,
  HouseholdState,
  Settlement,
} from "../../../shared/types";
import { getAmountCents } from "../../../shared/utils/money.ts";
import {
  calculateBalance,
  splitExpense,
  suggestSettlements,
} from "../../expenses/utils/calculations.ts";

export function originalDebts(
  expenses: Expense[],
  settlements: Settlement[] = [],
) {
  const debts = new Map<string, Map<string, number>>();
  function add(from: string, to: string, cents: number) {
    if (from === to || cents === 0) return;
    const outgoing = debts.get(from) ?? new Map<string, number>();
    outgoing.set(to, (outgoing.get(to) ?? 0) + cents);
    debts.set(from, outgoing);
  }
  for (const expense of expenses) {
    for (const share of splitExpense(expense))
      add(share.member, expense.paidBy, share.cents);
  }
  for (const payment of settlements)
    add(payment.from, payment.to, -getAmountCents(payment));
  const names = [
    ...new Set([
      ...debts.keys(),
      ...[...debts.values()].flatMap((row) => [...row.keys()]),
    ]),
  ].sort();
  const outstanding = new Map<string, Map<string, number>>();
  for (let fromIndex = 0; fromIndex < names.length; fromIndex++) {
    for (let toIndex = fromIndex + 1; toIndex < names.length; toIndex++) {
      const from = names[fromIndex];
      const to = names[toIndex];
      const cents =
        (debts.get(from)?.get(to) ?? 0) - (debts.get(to)?.get(from) ?? 0);
      if (cents === 0) continue;
      const debtor = cents > 0 ? from : to;
      const creditor = cents > 0 ? to : from;
      const outgoing = outstanding.get(debtor) ?? new Map<string, number>();
      outgoing.set(creditor, Math.abs(cents));
      outstanding.set(debtor, outgoing);
    }
  }

  function findCycle(): string[] | undefined {
    const visited = new Map<string, "visiting" | "finished">();
    const path: string[] = [];
    const positions = new Map<string, number>();
    function visit(name: string): string[] | undefined {
      visited.set(name, "visiting");
      positions.set(name, path.length);
      path.push(name);
      for (const to of names) {
        if ((outstanding.get(name)?.get(to) ?? 0) <= 0) continue;
        if (visited.get(to) === "visiting")
          return [...path.slice(positions.get(to)), to];
        if (visited.get(to) !== "finished") {
          const cycle = visit(to);
          if (cycle) return cycle;
        }
      }
      path.pop();
      positions.delete(name);
      visited.set(name, "finished");
      return undefined;
    }
    for (const name of names) {
      if (visited.has(name)) continue;
      const cycle = visit(name);
      if (cycle) return cycle;
    }
    return undefined;
  }

  let cycle = findCycle();
  while (cycle) {
    const edges = cycle.slice(0, -1).map((from, index) => ({
      from,
      to: cycle![index + 1],
    }));
    const canceled = Math.min(
      ...edges.map(({ from, to }) => outstanding.get(from)!.get(to)!),
    );
    for (const { from, to } of edges) {
      const outgoing = outstanding.get(from)!;
      const remaining = outgoing.get(to)! - canceled;
      if (remaining === 0) outgoing.delete(to);
      else outgoing.set(to, remaining);
    }
    cycle = findCycle();
  }

  const transfers: Omit<Settlement, "id" | "date">[] = [];
  for (const from of names) {
    for (const to of names) {
      const cents = outstanding.get(from)?.get(to) ?? 0;
      if (cents > 0) transfers.push({ from, to, amount: cents / 100 });
    }
  }
  return transfers;
}

export function suggestedRepayments(state: HouseholdState) {
  return state.simplifyDebts === false
    ? originalDebts(state.expenses, state.settlements)
    : suggestSettlements(
        state.expenses,
        state.members.map((member) => member.name),
        state.settlements,
      );
}

export function repaymentLimit(
  state: HouseholdState,
  from: string,
  to: string,
) {
  if (from === to) return 0;
  if (state.simplifyDebts === false) {
    return (
      originalDebts(state.expenses, state.settlements).find(
        (transfer) => transfer.from === from && transfer.to === to,
      )?.amount ?? 0
    );
  }
  const owed = -calculateBalance(state.expenses, from, state.settlements);
  const receivable = calculateBalance(state.expenses, to, state.settlements);
  return Math.max(0, Math.min(owed, receivable));
}
