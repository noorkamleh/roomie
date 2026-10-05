import { respondToConfirmation } from "./helpers/confirmation.js";
import { test, expect } from "@playwright/test";

const household = {
  version: 1,
  name: "Organization home",
  currentUser: "Noor",
  members: [
    { id: "noor", name: "Noor" },
    { id: "sara", name: "Sara" },
    { id: "reem", name: "Reem" },
  ],
  expenses: [
    {
      id: "dinner",
      title: "Shared dinner",
      amount: 90,
      amountCents: 9000,
      paidBy: "Noor",
      participants: ["Noor", "Sara", "Reem"],
      category: "Food",
      date: "2026-10-02",
    },
  ],
  bills: [],
  chores: [
    {
      id: "kitchen",
      title: "Kitchen cleanup",
      assignedTo: "Noor",
      dueDate: "2026-10-04",
      status: "pending",
      seriesId: "kitchen",
      recurrence: {
        frequency: "weekly",
        rotation: ["Noor", "Sara", "Reem"],
        anchorDay: 4,
      },
    },
  ],
  shoppingItems: [
    { id: "milk", name: "Milk", quantity: 2, unit: "L", completed: false },
  ],
  settlements: [],
  simplifyDebts: true,
};
const saved = (page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("roomie.household.v1")));
const card = (page, name) =>
  page
    .locator(".member-card")
    .filter({ has: page.getByRole("heading", { name, exact: true }) });

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-04T09:00:00Z") });
  await page.addInitScript((state) => {
    if (!localStorage.getItem("roomie.household.v1"))
      localStorage.setItem("roomie.household.v1", JSON.stringify(state));
  }, household);
});

test("member tabs, stable colors, archived history and undo work together", async ({
  page,
}) => {
  await page.goto("/members");
  await expect(page.getByRole("tab", { name: "Balances" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(
    page.getByRole("button", { name: "Settle up", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Household name")).toHaveCount(0);
  const noorAvatar = card(page, "Noor").locator("[data-member-tone]");
  await expect(noorAvatar).toHaveAttribute("data-member-tone", "purple");
  const noorRoute = page
    .locator(".members-transfer-person")
    .filter({ hasText: "Noor" })
    .first();
  await expect(noorRoute.locator("[data-member-tone]")).toHaveAttribute(
    "data-member-tone",
    "purple",
  );
  await page.getByRole("tab", { name: "Balances" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Household" })).toBeFocused();
  await expect(page.getByLabel("Household name")).toBeVisible();
  await card(page, "Noor")
    .getByRole("button", { name: "Member options for Noor" })
    .click();
  await card(page, "Noor")
    .getByRole("button", { name: "Archive member", exact: true })
    .click();
  await respondToConfirmation(page);
  await expect(card(page, "Noor")).toContainText("Archived member");
  const archived = await saved(page);
  expect(
    archived.members.find((member) => member.name === "Noor").archived,
  ).toBe(true);
  expect(archived.expenses).toEqual(household.expenses);
  expect(archived.currentUser).toBe("Sara");
  expect(archived.chores[0].assignedTo).toBe("Sara");
  await expect(
    page
      .getByLabel("View as")
      .getByRole("option", { name: "Noor", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("link", { name: "Expenses", exact: true }).click();
  await page.getByRole("button", { name: "Add expense", exact: true }).click();
  await expect(
    page
      .getByRole("dialog")
      .getByLabel("Paid by")
      .getByRole("option", { name: "Noor", exact: true }),
  ).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  expect(await saved(page)).toEqual(household);
  await page.goto("/members");
  await card(page, "Noor")
    .getByRole("button", { name: "Settle up with Noor" })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Record a repayment" }),
  ).toBeVisible();
});

test("shopping units retain Latin quantities and delete can be undone", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/shopping");
  await expect(page.getByRole("listitem")).toContainText("2 L");
  await page.getByLabel("Shopping item", { exact: true }).fill("Eggs");
  await page.getByLabel("Quantity", { exact: true }).fill("١٢");
  await page
    .getByRole("combobox", { name: "Unit", exact: true })
    .selectOption("pc");
  await page.getByRole("button", { name: "Add item", exact: true }).click();
  const eggs = page
    .getByRole("list", { name: "Shopping list", exact: true })
    .getByRole("listitem")
    .filter({ hasText: "Eggs" });
  await expect(eggs).toContainText("12 pcs");
  await eggs.getByRole("button", { name: "Delete Eggs", exact: true }).click();
  await respondToConfirmation(page);
  await expect(eggs).toHaveCount(0);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(eggs).toContainText("12 pcs");
  await page.reload();
  await expect(eggs).toContainText("12 pcs");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/shopping-compact-mobile.png",
    fullPage: true,
  });
});

test("demo data is optional, varied and reversible", async ({ page }) => {
  await page.goto("/members?tab=household");
  await page.getByRole("button", { name: "Load demo data" }).click();
  await respondToConfirmation(page, false);
  expect(await saved(page)).toEqual(household);
  await page.getByRole("button", { name: "Load demo data" }).click();
  await respondToConfirmation(page);
  const demo = await saved(page);
  expect(demo.name).toBe("The Garden House");
  expect(
    new Set(demo.expenses.map((expense) => expense.category)).size,
  ).toBeGreaterThan(2);
  expect(demo.bills.some((bill) => bill.recurrence)).toBe(true);
  expect(demo.budgets[0].month).toBe("2026-10");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  expect(await saved(page)).toEqual(household);
});

test("external tab changes clear stale undo", async ({ page, context }) => {
  await page.goto("/shopping");
  const other = await context.newPage();
  await other.goto("/shopping");
  await page.getByLabel("Shopping item", { exact: true }).fill("Apples");
  await page.getByRole("button", { name: "Add item", exact: true }).click();
  await expect(other.getByText("Apples", { exact: true })).toBeVisible();
  await other
    .getByRole("checkbox", { name: "Mark Milk as bought", exact: true })
    .click();
  await expect(
    page.getByRole("checkbox", { name: "Mark Milk as bought", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("button", { name: "Undo", exact: true }),
  ).toHaveCount(0);
  await other.close();
});

test("an undo storage failure leaves the saved action intact and can be retried", async ({
  page,
}) => {
  await page.goto("/shopping");
  await page.getByRole("button", { name: "Delete Milk", exact: true }).click();
  await respondToConfirmation(page);
  await expect(page.getByText("Milk", { exact: true })).toHaveCount(0);
  const deleted = await saved(page);
  await page.evaluate(() => {
    window.restoreStorageWrites = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new DOMException("Storage full", "QuotaExceededError");
    };
  });
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.getByRole("complementary", { name: "Last action" }).getByRole("alert"),
  ).toContainText(/save|storage/i);
  await expect(page.getByText("Milk", { exact: true })).toHaveCount(0);
  expect(await saved(page)).toEqual(deleted);
  await page.evaluate(() => {
    Storage.prototype.setItem = window.restoreStorageWrites;
  });
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.getByText("Milk", { exact: true })).toBeVisible();
  expect(await saved(page)).toEqual(household);
});
