import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateBalance,
  calculateTotalExpenses,
  calculateYouAreOwed,
  calculateYouOwe,
  calculateBalanceCents,
  splitExpense,
  suggestSettlements,
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

test("legacy equal splits and canonical integer amounts conserve every halala", () => {
  const participants = ["Noor", "Sara", "Reem"];
  assert.deepEqual(splitExpense({ amount: 100, participants }), [
    { member: "Noor", cents: 3334 },
    { member: "Sara", cents: 3333 },
    { member: "Reem", cents: 3333 },
  ]);
  assert.deepEqual(
    splitExpense({ amount: 999, amountCents: 2, participants }),
    [
      { member: "Noor", cents: 1 },
      { member: "Sara", cents: 1 },
      { member: "Reem", cents: 0 },
    ],
  );
  assert.equal(
    calculateTotalExpenses([{ amount: 999, amountCents: 29 }]),
    0.29,
  );
});

test("exact shares follow participant order and allow a selected zero share", () => {
  const entry = {
    amount: 120,
    participants: ["Noor", "Sara", "Reem"],
    split: {
      mode: "amounts",
      sharesCents: { Reem: 0, Sara: 10000, Noor: 2000 },
    },
  };
  const before = structuredClone(entry);
  assert.deepEqual(splitExpense(entry), [
    { member: "Noor", cents: 2000 },
    { member: "Sara", cents: 10000 },
    { member: "Reem", cents: 0 },
  ]);
  assert.deepEqual(entry, before);
});

test("percentage rounding assigns largest remainders and breaks ties by selection order", () => {
  assert.deepEqual(
    splitExpense({
      amount: 1.01,
      participants: ["Noor", "Sara", "Reem"],
      split: {
        mode: "percentages",
        basisPoints: { Noor: 3333, Sara: 3333, Reem: 3334 },
      },
    }),
    [
      { member: "Noor", cents: 34 },
      { member: "Sara", cents: 33 },
      { member: "Reem", cents: 34 },
    ],
  );
  assert.deepEqual(
    splitExpense({
      amount: 0.01,
      participants: ["Sara", "Noor", "Reem"],
      split: {
        mode: "percentages",
        basisPoints: { Noor: 5000, Sara: 5000, Reem: 0 },
      },
    }),
    [
      { member: "Sara", cents: 1 },
      { member: "Noor", cents: 0 },
      { member: "Reem", cents: 0 },
    ],
  );
});

test("percentage allocation remains exact for large safe integers", () => {
  assert.deepEqual(
    splitExpense({
      amount: 1,
      amountCents: Number.MAX_SAFE_INTEGER,
      participants: ["Noor", "Sara", "Reem"],
      split: {
        mode: "percentages",
        basisPoints: { Noor: 5000, Sara: 2500, Reem: 2500 },
      },
    }),
    [
      { member: "Noor", cents: 4503599627370495 },
      { member: "Sara", cents: 2251799813685248 },
      { member: "Reem", cents: 2251799813685248 },
    ],
  );
});

test("percentage shares conserve tiny totals and never allocate to zero percentages", () => {
  for (let total = 1; total <= 19; total += 1) {
    const shares = splitExpense({
      amount: total / 100,
      amountCents: total,
      participants: ["Noor", "Sara", "Reem", "Lina"],
      split: {
        mode: "percentages",
        basisPoints: { Noor: 1, Sara: 4999, Reem: 5000, Lina: 0 },
      },
    });
    assert.equal(
      shares.reduce((sum, share) => sum + share.cents, 0),
      total,
    );
    assert.equal(shares.find((share) => share.member === "Lina").cents, 0);
    assert.ok(shares.every((share) => Number.isSafeInteger(share.cents)));
  }
});

test("custom splits reject missing or extra participant keys without changing inputs", () => {
  for (const mode of ["amounts", "percentages"]) {
    for (const values of [
      { Noor: 10000 },
      { Noor: 5000, Sara: 5000, Reem: 0 },
      { Noor: 5000, Reem: 5000 },
      [5000, 5000],
    ]) {
      const entry = {
        amount: 100,
        participants: ["Noor", "Sara"],
        split:
          mode === "amounts"
            ? { mode, sharesCents: values }
            : { mode, basisPoints: values },
      };
      const before = structuredClone(entry);
      assert.throws(() => splitExpense(entry), {
        message: "Every selected participant must have exactly one share.",
      });
      assert.deepEqual(entry, before);
    }
  }
});

test("custom shares require nonnegative safe integer units and exact totals", () => {
  for (const mode of ["amounts", "percentages"]) {
    for (const invalid of [-1, 0.5, Number.NaN, Infinity, 2 ** 53, "5000"]) {
      const entry = {
        amount: 100,
        participants: ["Noor", "Sara"],
        split:
          mode === "amounts"
            ? { mode, sharesCents: { Noor: invalid, Sara: 5000 } }
            : { mode, basisPoints: { Noor: invalid, Sara: 5000 } },
      };
      const before = structuredClone(entry);
      assert.throws(() => splitExpense(entry), {
        message:
          mode === "amounts"
            ? "Enter nonnegative shares with at most two decimal places in SAR."
            : "Enter nonnegative percentages with at most two decimal places.",
      });
      assert.deepEqual(entry, before);
    }
    const entry = {
      amount: 100,
      participants: ["Noor", "Sara"],
      split:
        mode === "amounts"
          ? { mode, sharesCents: { Noor: 4000, Sara: 5000 } }
          : { mode, basisPoints: { Noor: 4000, Sara: 5000 } },
    };
    assert.throws(() => splitExpense(entry), {
      message:
        mode === "amounts"
          ? "Exact shares must add up to the expense amount."
          : "Percentages must add up to 100%.",
    });
  }
});

test("split expenses require a positive integer total and unique participants", () => {
  for (const total of [0, -1, 0.5, Number.NaN, Infinity, 2 ** 53])
    assert.throws(
      () =>
        splitExpense({ amount: 1, amountCents: total, participants: ["Noor"] }),
      { message: "Enter a positive expense amount in SAR." },
    );
  for (const participants of [[], ["Noor", "Noor"], [" "]])
    assert.throws(() => splitExpense({ amount: 1, participants }), {
      message: "Select at least one participant with a unique name.",
    });
  assert.throws(
    () =>
      splitExpense({
        amount: 1,
        participants: ["Noor"],
        split: { mode: "unknown" },
      }),
    { message: "Choose an equal, exact amount or percentage split." },
  );
});

test("balances and suggested repayments use actual custom shares and integer payments", () => {
  const custom = [
    {
      amount: 120,
      amountCents: 12000,
      paidBy: "Noor",
      participants: ["Noor", "Sara", "Reem"],
      split: {
        mode: "amounts",
        sharesCents: { Noor: 2000, Sara: 10000, Reem: 0 },
      },
    },
  ];
  const payments = [
    { from: "Sara", to: "Noor", amount: 999, amountCents: 2900 },
  ];
  assert.equal(calculateBalanceCents(custom, "Noor", payments), 7100);
  assert.equal(calculateBalance(custom, "Sara", payments), -71);
  assert.equal(calculateBalance(custom, "Reem", payments), 0);
  assert.deepEqual(
    suggestSettlements(custom, ["Noor", "Sara", "Reem"], payments),
    [{ from: "Sara", to: "Noor", amount: 71 }],
  );
  const percentages = [
    {
      amount: 1.01,
      paidBy: "Noor",
      participants: ["Noor", "Sara", "Reem"],
      split: {
        mode: "percentages",
        basisPoints: { Noor: 3333, Sara: 3333, Reem: 3334 },
      },
    },
  ];
  assert.deepEqual(
    ["Noor", "Sara", "Reem"].map((name) =>
      calculateBalanceCents(percentages, name),
    ),
    [67, -33, -34],
  );
});
