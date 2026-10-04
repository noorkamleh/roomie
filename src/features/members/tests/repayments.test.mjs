import assert from "node:assert/strict";
import test from "node:test";
import { originalDebts, suggestedRepayments } from "../utils/repayments.ts";
import { calculateBalanceCents } from "../../expenses/utils/calculations.ts";

const expense = (paidBy, participants, amount) => ({
  paidBy,
  participants,
  amount,
});
const chain = [expense("Noor", ["Sara"], 50), expense("Reem", ["Noor"], 50)];

function assertConserved(expenses, payments, transfers, members) {
  for (const member of members) {
    const netReceivable = transfers.reduce(
      (sum, transfer) =>
        sum +
        (transfer.to === member ? Math.round(transfer.amount * 100) : 0) -
        (transfer.from === member ? Math.round(transfer.amount * 100) : 0),
      0,
    );
    assert.equal(
      netReceivable,
      calculateBalanceCents(expenses, member, payments),
      `${member}'s remaining balance is preserved`,
    );
  }
  assert.ok(transfers.every((transfer) => transfer.amount > 0));
}

test("switching to original routes after a full simplified payment stays settled", () => {
  const payments = [{ from: "Sara", to: "Reem", amount: 50 }];
  const state = {
    expenses: chain,
    settlements: payments,
    members: ["Noor", "Sara", "Reem"].map((name) => ({ name })),
  };
  assert.deepEqual(suggestedRepayments({ ...state, simplifyDebts: true }), []);
  assert.deepEqual(suggestedRepayments({ ...state, simplifyDebts: false }), []);
  assertConserved(chain, payments, [], ["Noor", "Sara", "Reem"]);
});

test("partial cross-route payments leave the remaining original chain amounts", () => {
  const payments = [{ from: "Sara", to: "Reem", amount: 30 }];
  const beforeExpenses = structuredClone(chain);
  const beforePayments = structuredClone(payments);
  const transfers = originalDebts(chain, payments);
  assert.deepEqual(transfers, [
    { from: "Noor", to: "Reem", amount: 20 },
    { from: "Sara", to: "Noor", amount: 20 },
  ]);
  assert.deepEqual(chain, beforeExpenses);
  assert.deepEqual(payments, beforePayments);
  assertConserved(chain, payments, transfers, ["Noor", "Sara", "Reem"]);
});

test("cycle cancellation offsets unequal circular debts without changing balances", () => {
  const expenses = [
    expense("Noor", ["Sara"], 80),
    expense("Reem", ["Noor"], 50),
    expense("Sara", ["Reem"], 30),
  ];
  const transfers = originalDebts(expenses);
  assert.deepEqual(transfers, [
    { from: "Noor", to: "Reem", amount: 20 },
    { from: "Sara", to: "Noor", amount: 50 },
  ]);
  assertConserved(expenses, [], transfers, ["Noor", "Sara", "Reem"]);
});

test("overlapping cycles cancel deterministically regardless of record order", () => {
  const expenses = [
    expense("B", ["A"], 9),
    expense("C", ["B"], 7),
    expense("A", ["C"], 4),
    expense("D", ["B"], 5),
    expense("A", ["D"], 3),
  ];
  const transfers = originalDebts(expenses);
  assert.deepEqual(transfers, [
    { from: "A", to: "B", amount: 2 },
    { from: "B", to: "C", amount: 3 },
    { from: "B", to: "D", amount: 2 },
  ]);
  assert.deepEqual(originalDebts([...expenses].reverse()), transfers);
  assertConserved(expenses, [], transfers, ["A", "B", "C", "D"]);
});

test("disconnected repayments and arbitrary historical routes preserve all net balances", () => {
  const expenses = [...chain, expense("Lina", ["Dana"], 0.29)];
  const payments = [
    { from: "Sara", to: "Reem", amount: 30 },
    { from: "Dana", to: "Lina", amount: 0.1 },
    { from: "Omar", to: "Maha", amount: 0.07 },
  ];
  const transfers = originalDebts(expenses, payments);
  assert.deepEqual(transfers, [
    { from: "Dana", to: "Lina", amount: 0.19 },
    { from: "Maha", to: "Omar", amount: 0.07 },
    { from: "Noor", to: "Reem", amount: 20 },
    { from: "Sara", to: "Noor", amount: 20 },
  ]);
  assertConserved(expenses, payments, transfers, [
    "Noor",
    "Sara",
    "Reem",
    "Lina",
    "Dana",
    "Omar",
    "Maha",
  ]);
});

test("canonical integer payments and fractional custom shares conserve halalas during cancellation", () => {
  const expenses = [
    {
      amount: 1.01,
      paidBy: "Noor",
      participants: ["Noor", "Sara", "Reem"],
      split: {
        mode: "percentages",
        basisPoints: { Noor: 3333, Sara: 3333, Reem: 3334 },
      },
    },
    expense("Reem", ["Noor"], 0.6),
  ];
  const payments = [{ from: "Sara", to: "Reem", amount: 999, amountCents: 15 }];
  const transfers = originalDebts(expenses, payments);
  assertConserved(expenses, payments, transfers, ["Noor", "Sara", "Reem"]);
  assert.deepEqual(transfers, [
    { from: "Noor", to: "Reem", amount: 0.11 },
    { from: "Sara", to: "Noor", amount: 0.18 },
  ]);
});
