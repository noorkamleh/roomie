import assert from "node:assert/strict";
import test from "node:test";
import { isHousehold } from "../model/validation.ts";
import { initialHousehold } from "../model/storage.ts";

function paidHousehold() {
  return {
    version: 1,
    name: "Payment validation home",
    currentUser: "Noor",
    members: [
      { id: "noor", name: "Noor" },
      { id: "sara", name: "Sara" },
    ],
    expenses: [
      {
        id: "bill-power",
        title: "Power",
        amount: 240,
        amountCents: 24000,
        category: "Bills",
        paidBy: "Noor",
        participants: ["Noor", "Sara"],
        date: "2026-10-05",
      },
    ],
    bills: [
      {
        id: "power",
        title: "Power",
        amount: 240,
        dueDate: "2026-10-05",
        status: "paid",
      },
    ],
    chores: [],
    shoppingItems: [],
    settlements: [],
  };
}

test("valid linked bill payments and historical paid bills remain readable", () => {
  const state = paidHousehold();
  assert.equal(isHousehold(state), true);
  assert.equal(isHousehold({ ...state, expenses: [] }), true);
  assert.equal(isHousehold(initialHousehold()), true);
});

test("an unpaid bill cannot already have a recorded payment", () => {
  const state = paidHousehold();
  state.bills[0].status = "pending";
  assert.equal(isHousehold(state), false);
  assert.equal(isHousehold({ ...state, expenses: [] }), true);
});

test("linked bill payments must agree with the bill amount and category", () => {
  const state = paidHousehold();
  assert.equal(
    isHousehold({
      ...state,
      expenses: [{ ...state.expenses[0], amount: 241, amountCents: 24100 }],
    }),
    false,
  );
  assert.equal(
    isHousehold({
      ...state,
      expenses: [{ ...state.expenses[0], category: "Other" }],
    }),
    false,
  );
});
