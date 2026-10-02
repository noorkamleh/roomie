import { selectAttentionChores } from "../utils/attentionChores.ts";
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

test("month-to-date average uses elapsed days and excludes future expenses", () => {
  const overview = calculateSpendingOverview(
    [expense("2026-10-01", 240), expense("2026-10-03", 600)],
    "month",
    fallback,
  );
  assert.equal(overview.elapsedDays, 2);
  assert.equal(overview.periodTotal, 240);
  assert.equal(overview.dailyAverage, 120);
  assert.equal(overview.transactionCount, 1);
  assert.equal(overview.spendingData[0].average, 240);
  assert.equal(overview.spendingData[1].average, 120);
  assert.equal(overview.spendingData[2].average, null);
});

test("thirty-day range crosses months and includes zero-spend days in averages", () => {
  const overview = calculateSpendingOverview(
    [
      expense("2026-09-02", 900),
      expense("2026-09-03", 30),
      expense("2026-10-02", 270),
    ],
    "thirty-days",
    fallback,
  );
  assert.equal(overview.spendingData.length, 30);
  assert.equal(overview.periodTotal, 300);
  assert.equal(overview.dailyAverage, 10);
  assert.equal(overview.spendingData[1].average, 15);
  assert.equal(overview.spendingData[29].average, 270 / 7);
});

test("attention chores include overdue first, then today, excluding completed and future", () => {
  const chore = (id, dueDate, status = "pending") => ({
    id,
    dueDate,
    status,
    title: id,
    assignedTo: "Sara",
  });
  const chores = [
    chore("today", "2026-10-02"),
    chore("future", "2026-10-03"),
    chore("done", "2026-09-28", "completed"),
    chore("overdue", "2026-09-29", "in-progress"),
  ];
  assert.deepEqual(
    selectAttentionChores(chores, "2026-10-02").map((chore) => chore.id),
    ["overdue", "today"],
  );
  assert.equal(chores[0].id, "today");
});
