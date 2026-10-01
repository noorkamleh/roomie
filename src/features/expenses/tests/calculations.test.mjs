import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateBalance,
  calculateTotalExpenses,
  calculateYouAreOwed,
  calculateYouOwe,
} from "../utils/calculations.ts";

const expenses = [
  { amount: 120, paidBy: "Noor", participants: ["Noor", "Sara", "Reem"] },
  { amount: 80, paidBy: "Sara", participants: ["Noor", "Sara"] },
  { amount: 900, paidBy: "Reem", participants: ["Sara", "Reem"] },
];

test("balances use participant shares and exclude unrelated expenses", () => {
  assert.equal(calculateTotalExpenses(expenses), 1100);
  assert.equal(calculateBalance(expenses, "Noor"), 40);
  assert.equal(calculateYouAreOwed(expenses, "Noor"), 40);
  assert.equal(calculateYouOwe(expenses, "Noor"), 0);
});

test("money owed and money receivable remain nonnegative", () => {
  assert.equal(calculateYouOwe(expenses.slice(1), "Noor"), 40);
  assert.equal(calculateYouAreOwed(expenses.slice(1), "Noor"), 0);
  assert.equal(calculateBalance([], "Noor"), 0);
});
