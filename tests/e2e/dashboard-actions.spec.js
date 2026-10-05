import { respondToConfirmation } from "./helpers/confirmation.js";
import { test, expect } from "@playwright/test";

const state = () => ({
  version: 1,
  name: "Action home",
  currentUser: "Noor",
  members: [
    { id: "noor", name: "Noor" },
    { id: "sara", name: "Sara" },
    { id: "reem", name: "Reem" },
  ],
  expenses: [
    {
      id: "shared",
      title: "Shared groceries",
      amount: 120,
      paidBy: "Noor",
      participants: ["Noor", "Sara", "Reem"],
      category: "Groceries",
      date: "2026-10-01",
    },
    {
      id: "others",
      title: "Others' supplies",
      amount: 60,
      paidBy: "Sara",
      participants: ["Sara", "Reem"],
      category: "Household",
      date: "2026-10-02",
    },
    {
      id: "previous",
      title: "Previous month",
      amount: 90,
      paidBy: "Noor",
      participants: ["Noor", "Sara", "Reem"],
      category: "Household",
      date: "2026-09-30",
    },
    {
      id: "future",
      title: "Future expense",
      amount: 150,
      paidBy: "Sara",
      participants: ["Noor", "Sara"],
      category: "Food",
      date: "2026-10-03",
    },
  ],
  bills: [
    {
      id: "late",
      title: "Late electricity",
      amount: 100,
      dueDate: "2026-10-01",
      status: "pending",
    },
    {
      id: "today",
      title: "Internet due today",
      amount: 80,
      dueDate: "2026-10-02",
      status: "pending",
    },
    {
      id: "soon",
      title: "Upcoming water",
      amount: 30,
      dueDate: "2026-10-07",
      status: "pending",
    },
    {
      id: "paid",
      title: "Paid old bill",
      amount: 40,
      dueDate: "2026-09-28",
      status: "paid",
    },
  ],
  chores: [
    {
      id: "late",
      title: "My overdue task",
      assignedTo: "Noor",
      dueDate: "2026-10-01",
      status: "pending",
    },
    {
      id: "today",
      title: "My task today",
      assignedTo: "Noor",
      dueDate: "2026-10-02",
      status: "pending",
    },
    {
      id: "future",
      title: "My future task",
      assignedTo: "Noor",
      dueDate: "2026-10-08",
      status: "in-progress",
    },
    {
      id: "other",
      title: "Sara's overdue task",
      assignedTo: "Sara",
      dueDate: "2026-09-28",
      status: "pending",
    },
    {
      id: "done",
      title: "My finished task",
      assignedTo: "Noor",
      dueDate: "2026-10-01",
      status: "completed",
    },
  ],
  shoppingItems: [
    { id: "needed", name: "Needed milk", quantity: 2, completed: false },
    { id: "bought", name: "Bought bread", quantity: 1, completed: true },
  ],
  settlements: [
    {
      id: "old-payment",
      from: "Reem",
      to: "Noor",
      amount: 10,
      date: "2026-10-02",
    },
  ],
});

const card = (page, title) =>
  page
    .locator(".summary-card")
    .filter({ has: page.getByText(title, { exact: true }) });

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-02T09:00:00Z") });
  await page.goto("/dashboard");
  await page.evaluate(
    (fixture) =>
      localStorage.setItem("roomie.household.v1", JSON.stringify(fixture)),
    state(),
  );
  await page.reload();
});

test("dashboard separates household spend, your share and personal tasks, with useful attention links", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await expect(page.locator(".dashboard-header")).toContainText("Action home");
  await expect(page.locator(".dashboard-header")).toContainText("October 2026");
  await expect(card(page, "Total Expenses")).toContainText("SAR 180.00");
  await expect(card(page, "Total Expenses")).toContainText(
    "Your share: SAR 40.00",
  );
  await expect(card(page, "You are owed")).toContainText("SAR 55.00");
  await expect(card(page, "Pending Tasks").getByRole("heading")).toHaveText(
    "3",
  );
  await expect(card(page, "Pending Tasks")).toContainText("assigned to Noor");
  const attention = page.getByRole("region", {
    name: "Needs your attention",
    exact: true,
  });
  await expect(attention).toContainText("My overdue task");
  await expect(attention).not.toContainText("Sara's overdue task");
  await expect(attention).not.toContainText("My future task");
  await expect(attention).toContainText("Late electricity");
  await expect(attention).toContainText("Internet due today");
  await expect(attention).toContainText("Upcoming water");
  await expect(attention).not.toContainText("Paid old bill");
  await expect(
    attention.getByRole("link", {
      name: "Review bill Late electricity",
      exact: true,
    }),
  ).toHaveAttribute("href", "/bills");
  await expect(
    attention.getByRole("link", { name: "Review repayment", exact: true }),
  ).toHaveAttribute("href", "/members");
  await expect(attention).toContainText("Reem owes you SAR 55.00");
  const today = page.getByRole("region", {
    name: "Your tasks today",
    exact: true,
  });
  await expect(today).toContainText("My task today");
  await expect(today).not.toContainText("My overdue task");
  const shopping = page.getByRole("region", {
    name: "Shopping needed",
    exact: true,
  });
  await expect(shopping).toContainText("Needed milk");
  await expect(shopping).not.toContainText("Bought bread");
  await expect(
    shopping.getByRole("link", { name: "Open shopping list" }),
  ).toHaveAttribute("href", "/shopping");
  const categories = page.getByRole("region", {
    name: "Spending by category",
    exact: true,
  });
  await expect(categories).toContainText("Groceries");
  await expect(categories).toContainText("SAR 120.00");
  await expect(categories).not.toContainText("Food");
  await expect(
    page.getByRole("navigation", { name: "Quick actions" }).getByRole("link"),
  ).toHaveCount(4);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("task completion updates your count and recording repayment changes balance without changing your monthly share", async ({
  page,
}) => {
  const today = page.getByRole("region", {
    name: "Your tasks today",
    exact: true,
  });
  await today
    .getByRole("button", { name: "Mark My task today as completed" })
    .click();
  await expect(today).toContainText("No open tasks due today.");
  await expect(card(page, "Pending Tasks").getByRole("heading")).toHaveText(
    "2",
  );
  await expect(
    page.getByRole("region", { name: "Recent activity", exact: true }),
  ).toContainText("Noor completed My task today");
  await page
    .getByRole("region", { name: "Needs your attention", exact: true })
    .getByRole("link", { name: "Review repayment", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Record repayment", exact: true })
    .first()
    .click();
  await respondToConfirmation(page);
  await page.goto("/dashboard");
  await expect(card(page, "You are owed")).toContainText("SAR 0.00");
  await expect(card(page, "Total Expenses")).toContainText("SAR 180.00");
  await expect(card(page, "Total Expenses")).toContainText(
    "Your share: SAR 40.00",
  );
  await expect(
    page.getByRole("region", { name: "Recent activity", exact: true }),
  ).toContainText("Reem repaid Noor");
  await page.reload();
  await expect(card(page, "Pending Tasks").getByRole("heading")).toHaveText(
    "2",
  );
});
