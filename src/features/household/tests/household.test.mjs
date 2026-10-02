import {
  prioritizeBills,
  countBillStatuses,
} from "../../bills/utils/status.ts";
import assert from "node:assert/strict";
import test from "node:test";
import { householdReducer } from "../model/household.ts";
import { isHousehold } from "../model/validation.ts";
import {
  calculateBalance,
  splitExpense,
  suggestSettlements,
} from "../../expenses/utils/calculations.ts";
import { billStatus } from "../../bills/utils/status.ts";

const initial = () => ({
  version: 1,
  name: "Test home",
  currentUser: "Noor",
  members: [
    { id: "1", name: "Noor" },
    { id: "2", name: "Sara" },
    { id: "3", name: "Reem" },
  ],
  expenses: [],
  bills: [
    {
      id: "power",
      title: "Electricity",
      amount: 240,
      dueDate: "2026-10-05",
      status: "pending",
    },
  ],
  chores: [],
  shoppingItems: [],
  settlements: [],
});
const expense = (amount = 240) => ({
  id: "expense",
  title: "Electricity",
  category: "Bills",
  amount,
  paidBy: "Noor",
  participants: ["Noor", "Sara", "Reem"],
  date: "2026-10-02",
});

test("240 SAR paid by Noor creates +160, -80, -80 balances", () => {
  const state = householdReducer(initial(), {
    type: "expense.save",
    expense: expense(),
  });
  assert.deepEqual(
    state.members.map((member) =>
      calculateBalance(state.expenses, member.name),
    ),
    [160, -80, -80],
  );
  assert.deepEqual(
    suggestSettlements(
      state.expenses,
      state.members.map((member) => member.name),
    ),
    [
      { from: "Sara", to: "Noor", amount: 80 },
      { from: "Reem", to: "Noor", amount: 80 },
    ],
  );
});
test("splitting 100 SAR among three members conserves every halala", () => {
  assert.deepEqual(
    splitExpense(expense(100)).map((part) => part.cents),
    [3334, 3333, 3333],
  );
  const entries = [expense(100)];
  assert.equal(
    Math.round(
      ["Noor", "Sara", "Reem"].reduce(
        (sum, name) => sum + calculateBalance(entries, name),
        0,
      ) * 100,
    ),
    0,
  );
});
test("payer can pay for other people without participating", () => {
  const entry = { ...expense(120), participants: ["Sara", "Reem"] };
  assert.equal(calculateBalance([entry], "Noor"), 120);
  assert.equal(calculateBalance([entry], "Sara"), -60);
});
test("paying a bill is atomic and cannot create duplicate expenses", () => {
  const action = { type: "bill.pay", id: "power", expense: expense(1) };
  const paid = householdReducer(initial(), action);
  assert.equal(paid.bills[0].status, "paid");
  assert.equal(paid.expenses[0].amount, 240);
  assert.equal(paid.expenses[0].id, "bill-power");
  assert.equal(householdReducer(paid, action).expenses.length, 1);
  assert.throws(() =>
    householdReducer(paid, { type: "expense.delete", id: "bill-power" }),
  );
});
test("repayment settles one debt without counting as household spending", () => {
  const state = householdReducer(initial(), {
    type: "expense.save",
    expense: expense(),
  });
  const paid = householdReducer(state, {
    type: "settlement.add",
    settlement: {
      id: "repay",
      from: "Sara",
      to: "Noor",
      amount: 80,
      date: "2026-10-02",
    },
  });
  assert.equal(calculateBalance(paid.expenses, "Sara", paid.settlements), 0);
  assert.equal(calculateBalance(paid.expenses, "Noor", paid.settlements), 80);
  assert.equal(paid.expenses.length, 1);
  assert.throws(() =>
    householdReducer(paid, {
      type: "settlement.add",
      settlement: {
        id: "again",
        from: "Sara",
        to: "Noor",
        amount: 80,
        date: "2026-10-02",
      },
    }),
  );
});
test("invalid money, participants, dates and duplicate members are rejected", () => {
  for (const entry of [
    { ...expense(), amount: -1 },
    { ...expense(), amount: 0.001 },
    { ...expense(), participants: [] },
    { ...expense(), participants: ["Unknown"] },
    { ...expense(), date: "2026-02-30" },
  ])
    assert.throws(() =>
      householdReducer(initial(), { type: "expense.save", expense: entry }),
    );
  assert.throws(() =>
    householdReducer(initial(), {
      type: "member.add",
      member: { id: "4", name: "noor" },
    }),
  );
  assert.equal(
    isHousehold({ ...initial(), expenses: [{ ...expense(), amount: "240" }] }),
    false,
  );
  assert.equal(isHousehold(initial()), true);
});
test("bill statuses are derived from local calendar day, including overdue", () => {
  const bill = initial().bills[0];
  assert.equal(billStatus(bill, "2026-10-01"), "pending");
  assert.equal(billStatus(bill, "2026-10-02"), "due-soon");
  assert.equal(billStatus(bill, "2026-10-06"), "overdue");
  assert.equal(billStatus({ ...bill, status: "paid" }, "2026-10-06"), "paid");
});

test("bill priority places overdue, due soon and unpaid before paid with accurate filter counts", () => {
  const bill = (id, dueDate, status = "pending") => ({
    id,
    title: id,
    amount: 80,
    dueDate,
    status,
  });
  const bills = [
    bill("paid", "2026-09-01", "paid"),
    bill("later", "2026-10-10"),
    bill("soon", "2026-10-05"),
    bill("late", "2026-10-01"),
    bill("oldest", "2026-09-28"),
  ];
  assert.deepEqual(
    prioritizeBills(bills, "2026-10-02").map((bill) => bill.id),
    ["oldest", "late", "soon", "later", "paid"],
  );
  assert.deepEqual(countBillStatuses(bills, "2026-10-02"), {
    all: 5,
    pending: 1,
    "due-soon": 1,
    overdue: 2,
    paid: 1,
  });
  assert.equal(bills[0].id, "paid");
  assert.deepEqual(prioritizeBills([], "2026-10-02"), []);
  assert.equal(countBillStatuses(bills, "2026-10-06").overdue, 3);
});
