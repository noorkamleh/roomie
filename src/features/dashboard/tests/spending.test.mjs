import assert from "node:assert/strict";
import test from "node:test";
import { calculateSpendingOverview } from "../utils/spending.ts";

const fallback = new Date("2026-10-02T09:00:00Z");
const expense = (date, amount) => ({
  id: `${date}-${amount}`,
  title: "Test expense",
  date,
  amount,
  paidBy: "Noor",
  participants: ["Noor", "Sara"],
  category: "Household",
});

test("monthly totals exclude other months and combine transactions on the same day", () => {
  const overview = calculateSpendingOverview(
    [
      expense("2026-08-31", 900),
      expense("2026-09-28", 120),
      expense("2026-09-28", 30),
      expense("2026-09-24", 80),
    ],
    "month",
    new Date("2026-09-28T00:00:00Z"),
  );

  assert.equal(overview.dayCount, 30);
  assert.equal(overview.periodTotal, 230);
  assert.equal(overview.transactionCount, 3);
  assert.equal(overview.highestDay.amount, 150);
  assert.equal(overview.highestDay.transactions, 2);
});

test("last seven days include both endpoints when the period crosses a year", () => {
  const overview = calculateSpendingOverview(
    [
      expense("2026-12-26", 900),
      expense("2026-12-27", 50),
      expense("2027-01-02", 75),
    ],
    "week",
    new Date("2027-01-02T00:00:00Z"),
  );

  assert.equal(overview.spendingData.length, 7);
  assert.equal(overview.spendingData[0].date, "Dec 27, 2026");
  assert.equal(overview.spendingData[6].date, "Jan 2, 2027");
  assert.equal(overview.periodTotal, 125);
  assert.equal(overview.transactionCount, 2);
});

test("empty data produces a zero-filled calendar for the fallback month", () => {
  const overview = calculateSpendingOverview([], "month", fallback);

  assert.equal(overview.monthLabel, "October 2026");
  assert.equal(overview.dayCount, 31);
  assert.equal(overview.periodTotal, 0);
  assert.equal(overview.transactionCount, 0);
  assert.ok(overview.spendingData.every((day) => day.amount === 0));
});

test("February includes leap day", () => {
  const overview = calculateSpendingOverview(
    [expense("2028-02-29", 100)],
    "month",
    new Date("2028-02-29T00:00:00Z"),
  );

  assert.equal(overview.dayCount, 29);
  assert.equal(overview.spendingData[28].amount, 100);
});
