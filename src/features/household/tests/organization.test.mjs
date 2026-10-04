import assert from "node:assert/strict";
import test from "node:test";
import { householdReducer } from "../model/household.ts";
import { isHousehold } from "../model/validation.ts";
import { createHouseholdHistory } from "../model/history.ts";

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
const expense = (
  id = "dinner",
  paidBy = "Noor",
  participants = ["Sara"],
  amount = 80,
) => ({
  id,
  title: id,
  category: "Food",
  amount,
  paidBy,
  participants,
  date: "2026-10-04",
});
const chore = (id, assignedTo, extra = {}) => ({
  id,
  title: id,
  assignedTo,
  dueDate: "2026-10-04",
  status: "pending",
  ...extra,
});
const rejected = (state, action, message) => {
  const before = structuredClone(state);
  assert.throws(
    () => householdReducer(state, action),
    message ? { message } : undefined,
  );
  assert.deepEqual(state, before);
};

test("archiving preserves financial and completed history while updating open assignments and swaps", () => {
  const history = [{ by: "Noor", date: "2026-10-04" }];
  const state = {
    ...home(),
    expenses: [expense()],
    settlements: [
      { id: "paid", from: "Sara", to: "Noor", amount: 30, date: "2026-10-04" },
    ],
    chores: [
      chore("open", "Noor", {
        recurrence: { frequency: "weekly", rotation: ["Noor"] },
        swapRequest: {
          requestedBy: "Noor",
          requestedTo: "Reem",
          requestedOn: "2026-10-04",
        },
      }),
      chore("completed", "Noor", {
        status: "completed",
        completedBy: "Noor",
        completedOn: "2026-10-04",
        completionHistory: history,
        recurrence: { frequency: "weekly", rotation: ["Noor", "Sara"] },
      }),
      chore("target", "Reem", {
        swapRequest: {
          requestedBy: "Reem",
          requestedTo: "Noor",
          requestedOn: "2026-10-04",
        },
      }),
      chore("unrelated", "Reem", {
        swapRequest: {
          requestedBy: "Reem",
          requestedTo: "Sara",
          requestedOn: "2026-10-04",
        },
      }),
    ],
  };
  const before = structuredClone(state);
  const archived = householdReducer(state, {
    type: "member.archive",
    id: "Noor",
  });
  assert.equal(archived.currentUser, "Sara");
  assert.equal(archived.members[0].archived, true);
  assert.equal(archived.expenses, state.expenses);
  assert.equal(archived.settlements, state.settlements);
  assert.equal(archived.chores[1], state.chores[1]);
  assert.equal(archived.chores[0].assignedTo, "Sara");
  assert.deepEqual(archived.chores[0].recurrence.rotation, ["Sara"]);
  assert.equal(archived.chores[0].swapRequest, undefined);
  assert.equal(archived.chores[2].swapRequest, undefined);
  assert.equal(archived.chores[3].swapRequest, state.chores[3].swapRequest);
  assert.deepEqual(state, before);
  assert.equal(isHousehold(archived), true);
  const restored = householdReducer(archived, {
    type: "member.restore",
    id: "Noor",
  });
  assert.equal(restored.members[0].archived, false);
  assert.equal(restored.currentUser, "Sara");
  assert.equal(restored.chores, archived.chores);
  assert.equal(restored.expenses, state.expenses);
});

test("archived members remain available to historical edits and repayments but cannot enter new activity", () => {
  const state = householdReducer(
    {
      ...home(),
      expenses: [expense(), expense("other", "Reem", ["Sara"], 10)],
      bills: [
        {
          id: "bill",
          title: "Power",
          amount: 20,
          dueDate: "2026-10-05",
          status: "pending",
        },
      ],
      shoppingItems: [
        { id: "milk", name: "Milk", quantity: 1, completed: false },
      ],
    },
    { type: "member.archive", id: "Noor" },
  );
  const edited = householdReducer(state, {
    type: "expense.save",
    expense: { ...state.expenses[0], amount: 90 },
  });
  assert.equal(edited.expenses[0].paidBy, "Noor");
  const paid = householdReducer(state, {
    type: "settlement.add",
    settlement: {
      id: "partial",
      from: "Sara",
      to: "Noor",
      amount: 20,
      date: "2026-10-04",
    },
  });
  assert.equal(paid.settlements[0].to, "Noor");
  for (const action of [
    { type: "expense.save", expense: expense("new") },
    {
      type: "expense.save",
      expense: { ...state.expenses[1], participants: ["Sara", "Noor"] },
    },
    { type: "bill.pay", id: "bill", expense: expense("bill-payment") },
    {
      type: "shopping.purchase",
      itemIds: ["milk"],
      expense: expense("purchase"),
    },
    { type: "chore.add", chore: chore("new", "Noor") },
    {
      type: "chore.add",
      chore: chore("rotation", "Sara", {
        recurrence: { frequency: "weekly", rotation: ["Sara", "Noor"] },
      }),
    },
    { type: "household.settings", name: state.name, currentUser: "Noor" },
  ])
    rejected(state, action);
});

test("last active member cannot be archived or deleted and unknown archive operations are no-ops", () => {
  let state = householdReducer(home(), { type: "member.archive", id: "Sara" });
  state = householdReducer(state, { type: "member.archive", id: "Reem" });
  rejected(
    state,
    { type: "member.archive", id: "Noor" },
    "Keep at least one active household member.",
  );
  rejected(
    state,
    { type: "member.delete", id: "Noor" },
    "Add another member before deleting the last household member.",
  );
  assert.equal(
    householdReducer(state, { type: "member.archive", id: "Sara" }),
    state,
  );
  assert.equal(
    householdReducer(state, { type: "member.archive", id: "missing" }),
    state,
  );
  assert.equal(
    householdReducer(state, { type: "member.restore", id: "missing" }),
    state,
  );
  assert.equal(isHousehold({ ...state, currentUser: "Sara" }), false);
  assert.equal(
    isHousehold({
      ...home(),
      members: home().members.map((member) => ({ ...member, archived: true })),
    }),
    false,
  );
});

test("reopening archived completed chores preserves history and creates active future rotations", () => {
  const state = householdReducer(
    {
      ...home(),
      chores: [
        chore("weekly", "Noor", {
          status: "completed",
          recurrence: { frequency: "weekly", rotation: ["Noor"] },
          completedBy: "Noor",
          completedOn: "2026-10-04",
          completionHistory: [{ by: "Noor", date: "2026-10-04" }],
        }),
      ],
    },
    { type: "member.archive", id: "Noor" },
  );
  const reopened = householdReducer(state, {
    type: "chore.status",
    id: "weekly",
    status: "pending",
  });
  assert.equal(reopened.chores[0].assignedTo, "Sara");
  assert.deepEqual(
    reopened.chores[0].completionHistory,
    state.chores[0].completionHistory,
  );
  const completed = householdReducer(reopened, {
    type: "chore.status",
    id: "weekly",
    status: "completed",
    completedBy: "Sara",
    date: "2026-10-05",
  });
  assert.equal(completed.chores[0].assignedTo, "Sara");
  assert.deepEqual(completed.chores[0].recurrence.rotation, ["Sara"]);
  assert.equal(isHousehold(completed), true);
});

test("monthly recurring bills preserve month-end anchors and payment is atomic and idempotent", () => {
  let state = householdReducer(home(), {
    type: "bill.add",
    bill: {
      id: "power",
      title: "Power",
      amount: 240,
      dueDate: "2027-01-31",
      status: "pending",
      recurrence: { frequency: "monthly" },
    },
  });
  assert.equal(state.bills[0].recurrence.anchorDay, 31);
  const action = {
    type: "bill.pay",
    id: "power",
    expense: expense("payment", "Noor", ["Noor", "Sara", "Reem"], 1),
  };
  rejected(state, {
    ...action,
    expense: { ...action.expense, participants: [] },
  });
  const paid = householdReducer(state, action);
  assert.equal(paid.bills[0].id, "power-2027-02-28");
  assert.equal(paid.bills[0].status, "pending");
  assert.equal(paid.bills[1].status, "paid");
  assert.equal(paid.expenses[0].amountCents, 24000);
  assert.equal(householdReducer(paid, action), paid);
  state = householdReducer(paid, { ...action, id: "power-2027-02-28" });
  assert.equal(state.bills[0].id, "power-2027-03-31");
  assert.equal(state.expenses.length, 2);
  const leap = householdReducer(home(), {
    type: "bill.add",
    bill: {
      id: "leap",
      title: "Leap",
      amount: 1,
      dueDate: "2028-01-31",
      status: "pending",
      recurrence: { frequency: "monthly" },
    },
  });
  assert.equal(
    householdReducer(leap, { ...action, id: "leap" }).bills[0].dueDate,
    "2028-02-29",
  );
});

test("monthly budgets replace only their month and reject malformed amounts or duplicate months", () => {
  const first = {
    month: "2026-10",
    totalCents: 0,
    categories: { Groceries: 12000 },
  };
  let state = householdReducer(home(), { type: "budget.save", budget: first });
  const next = householdReducer(state, {
    type: "budget.save",
    budget: { month: "2026-11", totalCents: 50000, categories: {} },
  });
  state = householdReducer(next, {
    type: "budget.save",
    budget: { ...first, totalCents: 15000 },
  });
  assert.equal(state.budgets.length, 2);
  assert.equal(state.budgets[0].totalCents, 15000);
  assert.equal(state.budgets[1], next.budgets[1]);
  for (const budget of [
    { ...first, month: "2026-13" },
    { ...first, totalCents: -1 },
    { ...first, totalCents: 0.5 },
    { ...first, totalCents: 10000000001 },
    { ...first, categories: { Food: Infinity } },
  ])
    rejected(state, { type: "budget.save", budget });
  assert.equal(isHousehold({ ...home(), budgets: [first, first] }), false);
  assert.equal(isHousehold(home()), true);
});

test("shopping purchase snapshots retain units independently of later list deletion", () => {
  const state = {
    ...home(),
    shoppingItems: [
      { id: "milk", name: "Milk", quantity: 2, unit: "L", completed: false },
    ],
  };
  const purchased = householdReducer(state, {
    type: "shopping.purchase",
    itemIds: ["milk"],
    expense: expense("purchase"),
  });
  assert.equal(purchased.expenses[0].shoppingItems[0].unit, "L");
  const removed = householdReducer(purchased, {
    type: "shopping.delete",
    id: "milk",
  });
  assert.equal(removed.expenses[0].shoppingItems[0].unit, "L");
  assert.equal(
    isHousehold({
      ...state,
      shoppingItems: [{ ...state.shoppingItems[0], unit: " " }],
    }),
    false,
  );
  assert.equal(isHousehold(purchased), true);
});

test("undo persists before state changes, retries failed writes, and restores only the latest action", () => {
  const initial = home();
  const writes = [];
  let fail = false;
  const history = createHouseholdHistory(initial, (state) => {
    if (fail) throw new Error("Storage full");
    writes.push(structuredClone(state));
  });
  history.commit({ type: "member.add", member: { id: "Lina", name: "Lina" } });
  const added = history.state;
  history.commit({
    type: "household.settings",
    name: "Changed home",
    currentUser: "Noor",
  });
  const changed = history.state;
  fail = true;
  assert.throws(() => history.undo(), { message: "Storage full" });
  assert.equal(history.state, changed);
  assert.equal(history.lastAction, "Household settings saved");
  fail = false;
  assert.equal(history.undo(), added);
  assert.equal(history.lastAction, null);
  assert.equal(history.undo(), added);
  assert.equal(writes.length, 3);
  assert.deepEqual(writes[2], added);
  assert.equal(initial.members.length, 3);
});

test("failed actions and semantic no-ops preserve previous undo and external synchronization clears it", () => {
  const writes = [];
  const history = createHouseholdHistory(home(), (state) => writes.push(state));
  history.commit({
    type: "budget.save",
    budget: {
      month: "2026-10",
      totalCents: 10000,
      categories: { Food: 2000, Bills: 3000 },
    },
  });
  const saved = history.state;
  history.commit({
    type: "budget.save",
    budget: {
      month: "2026-10",
      totalCents: 10000,
      categories: { Bills: 3000, Food: 2000 },
    },
  });
  history.commit({
    type: "household.settings",
    name: saved.name,
    currentUser: saved.currentUser,
  });
  history.commit({ type: "household.debtMode", enabled: false });
  const debtMode = history.state;
  history.commit({ type: "household.debtMode", enabled: false });
  assert.equal(history.state, debtMode);
  assert.equal(writes.length, 2);
  assert.throws(() =>
    history.commit({
      type: "member.add",
      member: { id: "duplicate", name: "Noor" },
    }),
  );
  assert.equal(history.lastAction, "Debt simplification updated");
  history.synchronize({ ...home(), name: "External home" });
  assert.equal(history.lastAction, null);
  assert.equal(history.undo().name, "External home");
});

test("demo replacement validates the full household and undo restores prior records", () => {
  const initial = { ...home(), expenses: [expense()] };
  const history = createHouseholdHistory(initial, () => {});
  const demo = {
    ...home(),
    name: "Demo home",
    shoppingItems: [
      { id: "rice", name: "Rice", quantity: 5, unit: "kg", completed: false },
    ],
  };
  history.commit({ type: "household.demo", state: demo });
  assert.equal(history.state, demo);
  assert.equal(history.lastAction, "Demo household loaded");
  assert.throws(() =>
    history.commit({ type: "household.demo", state: { ...demo, members: [] } }),
  );
  assert.equal(history.state, demo);
  assert.equal(history.undo(), initial);
});
