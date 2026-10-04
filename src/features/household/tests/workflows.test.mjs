import assert from "node:assert/strict";
import test from "node:test";
import { householdReducer } from "../model/household.ts";
import { isHousehold } from "../model/validation.ts";
import { loadHousehold, STORAGE_KEY } from "../model/storage.ts";
import {
  calculateBalance,
  calculateTotalExpenses,
} from "../../expenses/utils/calculations.ts";
import {
  originalDebts,
  suggestedRepayments,
} from "../../members/utils/repayments.ts";

const home = () => ({
  version: 1,
  name: "Test home",
  currentUser: "Noor",
  members: ["Noor", "Sara", "Reem"].map((name) => ({ id: name, name })),
  expenses: [],
  bills: [],
  chores: [],
  shoppingItems: [],
  settlements: [],
});
const expense = (id, paidBy, participants, amount) => ({
  id,
  title: id,
  category: "Other",
  amount,
  paidBy,
  participants,
  date: "2026-10-04",
});

test("partial repayments retain expenses and reduce 80 to 50 without increasing spending", () => {
  const state = {
    ...home(),
    expenses: [expense("dinner", "Noor", ["Sara"], 80)],
  };
  const paid = householdReducer(state, {
    type: "settlement.add",
    settlement: {
      id: "partial",
      from: "Sara",
      to: "Noor",
      amount: 30,
      date: "2026-10-04",
    },
  });
  assert.equal(paid.expenses, state.expenses);
  assert.equal(calculateTotalExpenses(paid.expenses), 80);
  assert.equal(calculateBalance(paid.expenses, "Sara", paid.settlements), -50);
  assert.deepEqual(suggestedRepayments(paid), [
    { from: "Sara", to: "Noor", amount: 50 },
  ]);
  assert.equal(paid.settlements[0].amountCents, 3000);
  assert.throws(() =>
    householdReducer(paid, {
      type: "settlement.add",
      settlement: {
        id: "overpay",
        from: "Sara",
        to: "Noor",
        amount: 50.01,
        date: "2026-10-04",
      },
    }),
  );
  const settled = householdReducer(paid, {
    type: "settlement.add",
    settlement: {
      id: "rest",
      from: "Sara",
      to: "Noor",
      amount: 50,
      date: "2026-10-04",
    },
  });
  assert.equal(settled.settlements.length, 2);
  assert.deepEqual(suggestedRepayments(settled), []);
});

test("optional simplification changes the payment routes while conserving each balance", () => {
  const state = {
    ...home(),
    expenses: [
      expense("first", "Noor", ["Sara"], 50),
      expense("second", "Reem", ["Noor"], 50),
    ],
  };
  const direct = householdReducer(state, {
    type: "household.debtMode",
    enabled: false,
  });
  assert.deepEqual(suggestedRepayments(direct), [
    { from: "Noor", to: "Reem", amount: 50 },
    { from: "Sara", to: "Noor", amount: 50 },
  ]);
  const simplified = householdReducer(direct, {
    type: "household.debtMode",
    enabled: true,
  });
  assert.equal(simplified.expenses, state.expenses);
  assert.deepEqual(suggestedRepayments(simplified), [
    { from: "Sara", to: "Reem", amount: 50 },
  ]);
  for (const mode of [direct, simplified]) {
    let result = mode;
    for (const [index, transfer] of suggestedRepayments(mode).entries())
      result = householdReducer(result, {
        type: "settlement.add",
        settlement: { ...transfer, id: String(index), date: "2026-10-04" },
      });
    assert.deepEqual(
      result.members.map((member) =>
        calculateBalance(result.expenses, member.name, result.settlements),
      ),
      [0, 0, 0],
    );
  }
});

test("original debt routes include repayments and reciprocal expense offsets", () => {
  const expenses = [
    expense("a", "Noor", ["Sara"], 80),
    expense("b", "Sara", ["Noor"], 20),
  ];
  assert.deepEqual(
    originalDebts(expenses, [
      { id: "p", from: "Sara", to: "Noor", amount: 30, date: "2026-10-04" },
    ]),
    [{ from: "Sara", to: "Noor", amount: 30 }],
  );
});

test("a shopping batch creates one linked expense and rejects duplicate or stale items atomically", () => {
  const state = {
    ...home(),
    shoppingItems: [
      { id: "milk", name: "Milk", quantity: 2, completed: false },
      { id: "bread", name: "Bread", quantity: 1, completed: true },
    ],
  };
  const action = {
    type: "shopping.purchase",
    itemIds: ["milk", "bread"],
    expense: expense("purchase", "Noor", ["Noor", "Sara"], 30),
  };
  const result = householdReducer(state, action);
  assert.equal(result.expenses.length, 1);
  assert.equal(result.expenses[0].amountCents, 3000);
  assert.deepEqual(
    result.expenses[0].shoppingItems,
    state.shoppingItems.map(({ id, name, quantity }) => ({
      id,
      name,
      quantity,
    })),
  );
  assert.equal(
    result.shoppingItems.every(
      (item) => item.completed && item.expenseId === "purchase",
    ),
    true,
  );
  assert.throws(() =>
    householdReducer(result, {
      ...action,
      expense: { ...action.expense, id: "duplicate" },
    }),
  );
  assert.throws(() =>
    householdReducer(state, { ...action, itemIds: ["milk", "missing"] }),
  );
  assert.throws(() =>
    householdReducer(state, { ...action, itemIds: ["milk", "milk"] }),
  );
  assert.equal(state.shoppingItems[0].completed, false);
  const deletedItem = householdReducer(result, {
    type: "shopping.delete",
    id: "milk",
  });
  assert.deepEqual(
    deletedItem.expenses[0].shoppingItems,
    result.expenses[0].shoppingItems,
  );
  const deletedExpense = householdReducer(result, {
    type: "expense.delete",
    id: "purchase",
  });
  assert.equal(
    deletedExpense.shoppingItems.every((item) => !item.expenseId),
    true,
  );
  assert.equal(isHousehold(deletedExpense), true);
});

test("recurring completion creates only the next independent occurrence and preserves history on reopening", () => {
  let state = householdReducer(home(), {
    type: "chore.add",
    chore: {
      id: "kitchen",
      title: "Kitchen",
      assignedTo: "Noor",
      dueDate: "2026-10-04",
      status: "pending",
      recurrence: { frequency: "weekly", rotation: ["Noor", "Sara", "Reem"] },
    },
  });
  state = householdReducer(state, {
    type: "chore.status",
    id: "kitchen",
    status: "completed",
    completedBy: "Noor",
    date: "2026-10-04",
  });
  const completed = state.chores.find((item) => item.id === "kitchen");
  const upcoming = state.chores.find(
    (item) => item.id === "kitchen-2026-10-11",
  );
  assert.equal(upcoming.assignedTo, "Sara");
  assert.equal(upcoming.status, "pending");
  assert.deepEqual(completed.completionHistory, [
    { by: "Noor", date: "2026-10-04" },
  ]);
  state = householdReducer(state, {
    type: "chore.status",
    id: "kitchen",
    status: "pending",
  });
  assert.equal(
    state.chores.find((item) => item.id === "kitchen").completionHistory.length,
    1,
  );
  state = householdReducer(state, {
    type: "chore.status",
    id: "kitchen",
    status: "completed",
    completedBy: "Noor",
    date: "2026-10-05",
  });
  assert.equal(state.chores.length, 2);
  assert.equal(
    state.chores.find((item) => item.id === upcoming.id).status,
    "pending",
  );
  assert.equal(
    state.chores.find((item) => item.id === "kitchen").completionHistory.length,
    2,
  );
});

test("swaps require the assigned requester and designated respondent and retain rotation", () => {
  let state = householdReducer(home(), {
    type: "chore.add",
    chore: {
      id: "kitchen",
      title: "Kitchen",
      assignedTo: "Noor",
      dueDate: "2026-10-04",
      status: "pending",
      recurrence: { frequency: "weekly", rotation: ["Noor", "Sara", "Reem"] },
    },
  });
  const request = {
    type: "chore.swap.request",
    id: "kitchen",
    to: "Reem",
    requestedBy: "Noor",
    date: "2026-10-04",
  };
  assert.throws(() =>
    householdReducer(state, { ...request, requestedBy: "Sara" }),
  );
  state = householdReducer(state, request);
  const response = {
    type: "chore.swap.respond",
    id: "kitchen",
    accepted: true,
    respondedBy: "Reem",
    date: "2026-10-04",
  };
  assert.throws(() => householdReducer(state, response));
  state = householdReducer(state, {
    type: "household.settings",
    name: state.name,
    currentUser: "Reem",
  });
  state = householdReducer(state, response);
  assert.equal(state.chores[0].assignedTo, "Reem");
  assert.deepEqual(state.chores[0].swapHistory, [
    { from: "Noor", to: "Reem", requestedBy: "Noor", date: "2026-10-04" },
  ]);
  state = householdReducer(state, {
    type: "chore.status",
    id: "kitchen",
    status: "completed",
    date: "2026-10-04",
  });
  assert.equal(
    state.chores.find((item) => item.id === "kitchen-2026-10-11").assignedTo,
    "Sara",
  );
  assert.throws(() =>
    householdReducer(state, { type: "member.delete", id: "Noor" }),
  );
});

test("legacy money loads as integer halalas without overwriting the stored records", (context) => {
  const legacy = {
    ...home(),
    expenses: [expense("old", "Noor", ["Sara"], 0.29)],
  };
  const saved = JSON.stringify(legacy);
  const previous = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key) => (key === STORAGE_KEY ? saved : null),
      setItem: () => assert.fail("Loading must not overwrite data"),
    },
  });
  context.after(() =>
    previous
      ? Object.defineProperty(globalThis, "localStorage", previous)
      : delete globalThis.localStorage,
  );
  const loaded = loadHousehold();
  assert.equal(loaded.error, null);
  assert.equal(loaded.state.expenses[0].amountCents, 29);
  assert.equal(legacy.expenses[0].amountCents, undefined);
  assert.equal(
    isHousehold({
      ...legacy,
      expenses: [{ ...legacy.expenses[0], amountCents: 28 }],
    }),
    false,
  );
});
