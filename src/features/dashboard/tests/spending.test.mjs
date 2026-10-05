import { selectAttentionChores } from "../utils/attentionChores.ts";
import assert from "node:assert/strict";
import test from "node:test";
import { calculateSpendingOverview } from "../utils/spending.ts";
import {
  calculateMonthlySpending,
  selectPersonalOpenChores,
  selectUnpaidBills,
} from "../utils/overview.ts";
import { selectRecentActivity } from "../utils/activity.ts";

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

test("empty data fills elapsed dates with zero and keeps future dates empty", () => {
  const overview = calculateSpendingOverview([], "month", fallback);

  assert.equal(overview.monthLabel, "October 2026");
  assert.equal(overview.dayCount, 31);
  assert.equal(overview.periodTotal, 0);
  assert.equal(overview.transactionCount, 0);
  assert.ok(
    overview.spendingData
      .slice(0, 2)
      .every((day) => day.amount === 0 && !day.future),
  );
  assert.ok(
    overview.spendingData
      .slice(2)
      .every((day) => day.amount === null && day.future),
  );
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

test("monthly household spending and personal share use recorded split amounts, excluding future dates and other months", () => {
  const overview = calculateMonthlySpending(
    [
      { ...expense("2026-10-01", 100), participants: ["Noor", "Sara", "Reem"] },
      {
        ...expense("2026-10-02", 50),
        paidBy: "Sara",
        participants: ["Sara", "Reem"],
      },
      expense("2026-09-30", 900),
      expense("2026-10-03", 600),
    ],
    "Noor",
    "2026-10-02",
  );
  assert.equal(overview.total, 150);
  assert.equal(overview.yourShare, 33.34);
  assert.deepEqual(overview.categories, [
    { name: "Household", amount: 150, percent: 100 },
  ]);
  assert.equal(calculateMonthlySpending([], "Noor", "2026-10-02").yourShare, 0);
});

test("personal task counts include future open tasks while excluding other members and completed tasks", () => {
  const chores = [
    {
      id: "future",
      assignedTo: "Noor",
      dueDate: "2026-10-03",
      status: "pending",
    },
    {
      id: "other",
      assignedTo: "Sara",
      dueDate: "2026-10-01",
      status: "pending",
    },
    {
      id: "done",
      assignedTo: "Noor",
      dueDate: "2026-10-01",
      status: "completed",
    },
    {
      id: "late",
      assignedTo: "Noor",
      dueDate: "2026-10-01",
      status: "in-progress",
    },
  ];
  assert.deepEqual(
    selectPersonalOpenChores(chores, "Noor").map((chore) => chore.id),
    ["late", "future"],
  );
  assert.equal(chores[0].id, "future");
});

test("monthly personal share honors exact and percentage splits independently of the payer", () => {
  const overview = calculateMonthlySpending(
    [
      {
        ...expense("2026-10-01", 100),
        amountCents: 10000,
        paidBy: "Sara",
        split: { mode: "amounts", sharesCents: { Noor: 7500, Sara: 2500 } },
      },
      {
        ...expense("2026-10-02", 80),
        split: { mode: "percentages", basisPoints: { Noor: 2500, Sara: 7500 } },
      },
    ],
    "Noor",
    "2026-10-02",
  );
  assert.equal(overview.total, 180);
  assert.equal(overview.yourShare, 95);
});

test("unpaid bill attention prioritizes overdue and due bills without dropping upcoming bills", () => {
  const bills = [
    { id: "upcoming", dueDate: "2026-10-08", status: "pending" },
    { id: "paid", dueDate: "2026-09-01", status: "paid" },
    { id: "today", dueDate: "2026-10-02", status: "pending" },
    { id: "late", dueDate: "2026-10-01", status: "pending" },
  ];
  assert.deepEqual(
    selectUnpaidBills(bills).map((bill) => bill.id),
    ["late", "today", "upcoming"],
  );
  assert.equal(bills[0].id, "upcoming");
});

test("activity preserves recorded completion history without duplicating the latest marker or inventing legacy completion dates", () => {
  const activities = selectRecentActivity(
    {
      expenses: [expense("2026-10-01", 20), expense("2026-10-03", 50)],
      settlements: [
        {
          id: "payment",
          from: "Sara",
          to: "Noor",
          amount: 10,
          date: "2026-10-02",
        },
      ],
      chores: [
        {
          id: "recurring",
          title: "Trash",
          status: "pending",
          completedBy: "Noor",
          completedOn: "2026-10-02",
          completionHistory: [
            { by: "Noor", date: "2026-10-02" },
            { by: "Sara", date: "2026-10-01" },
          ],
        },
        { id: "legacy", title: "Dishes", status: "completed" },
      ],
    },
    "2026-10-02",
  );
  assert.equal(activities.length, 4);
  assert.equal(activities.filter((entry) => entry.type === "chore").length, 2);
  assert.ok(activities.some((entry) => entry.title === "Noor completed Trash"));
  assert.ok(!activities.some((entry) => entry.title.includes("Dishes")));
  assert.equal(activities[0].date, "2026-10-02");
});
