import { respondToConfirmation } from "./helpers/confirmation.js";
import { test, expect } from "@playwright/test";

const runtimeErrors = new WeakMap();
test.beforeEach(async ({ page }) => {
  const errors = [];
  runtimeErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
});
test.afterEach(async ({ page }) => {
  expect(runtimeErrors.get(page)).toEqual([]);
});

async function saved(page) {
  return page.evaluate(() =>
    JSON.parse(localStorage.getItem("roomie.household.v1")),
  );
}
test("expense sharing, editing, deletion, and persistence", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await page.getByRole("link", { name: "Add expense", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByLabel("Title", { exact: true }).fill("Browser groceries");
  await page.getByLabel("Amount (SAR)").fill("120");
  await expect(page.getByRole("dialog").getByText("SAR 40.00")).toHaveCount(3);
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Add expense", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const entry = (await saved(page)).expenses.find(
    (expense) => expense.title === "Browser groceries",
  );
  expect(entry.participants).toEqual(["Noor", "Sara", "Reem"]);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Browser groceries" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Edit Browser groceries" }).click();
  await page.getByLabel("Amount (SAR)").fill("150");
  await page.getByRole("button", { name: "Save changes" }).click();
  expect(
    (await saved(page)).expenses.find((expense) => expense.id === entry.id)
      .amount,
  ).toBe(150);
  await page.getByRole("button", { name: "Delete Browser groceries" }).click();
  await respondToConfirmation(page);
  expect(
    (await saved(page)).expenses.some((expense) => expense.id === entry.id),
  ).toBe(false);
});
test("bill payment creates exactly one expense and updates status", async ({
  page,
}) => {
  await page.goto("/bills");
  const card = page.locator("article").filter({
    has: page.getByRole("heading", { name: "Electricity", exact: true }),
  });
  await card.getByRole("button", { name: "Mark as paid" }).click();
  await page.getByRole("button", { name: "Confirm payment" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(card.getByText("paid", { exact: true })).toBeVisible();
  expect(
    (await saved(page)).expenses.filter((expense) => expense.id === "bill-1"),
  ).toHaveLength(1);
  await page.reload();
  await expect(card.getByRole("button", { name: "Mark as paid" })).toHaveCount(
    0,
  );
});
test("chores and shopping persist completed states", async ({ page }) => {
  await page.goto("/chores?add=1");
  await page.getByLabel("Task", { exact: true }).fill("Browser chore");
  await page.getByLabel("Assigned to").selectOption("Reem");
  await page
    .getByRole("button", { name: "Add chore", exact: true })
    .last()
    .click();
  await page.getByLabel("Status of Browser chore").selectOption("completed");
  expect(
    (await saved(page)).chores.find((chore) => chore.title === "Browser chore")
      .status,
  ).toBe("completed");
  await page.goto("/shopping");
  await page.getByLabel("Shopping item", { exact: true }).fill("Browser milk");
  await page.getByLabel("Quantity").fill("2");
  await page.getByRole("button", { name: "Add item" }).click();
  await page.getByRole("checkbox", { name: /Browser milk/ }).check();
  await page.reload();
  await expect(
    page.getByRole("checkbox", { name: /Browser milk/ }),
  ).toBeChecked();
  expect(
    (await saved(page)).shoppingItems.find(
      (item) => item.name === "Browser milk",
    ).quantity,
  ).toBe(2);
});
test("members, household settings, and repayments update all views", async ({
  page,
}) => {
  await page.goto("/members?tab=household");
  await page.getByLabel("Household name").fill("Our test home");
  await page.getByLabel("View as").selectOption("Sara");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.getByLabel("New member name").fill("Lina");
  await page.getByRole("button", { name: "Add member" }).click();
  await expect(
    page.getByRole("heading", { name: "Lina", exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Balances", exact: true }).click();
  await page.getByRole("button", { name: "Record repayment" }).first().click();
  await respondToConfirmation(page);
  expect((await saved(page)).settlements).toHaveLength(1);
  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { level: 1, name: /Sara/ }),
  ).toContainText("Sara");
  await expect(
    page.getByText("Here's what's happening at Our test home today."),
  ).toBeVisible();
});
test("mobile layout, keyboard modal close, and malformed storage", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dashboard");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("link", { name: "Add expense", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.evaluate(() =>
    localStorage.setItem("roomie.household.v1", "{bad data"),
  );
  await page.reload();
  await expect(page.getByRole("alert")).toContainText(
    "Saved data could not be read",
  );
  expect(
    await page.evaluate(() => localStorage.getItem("roomie.household.v1")),
  ).toBe("{bad data");
});

test("local clock changes the greeting at noon and the dashboard shows today's month", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install({ time: new Date("2026-10-02T08:59:00Z") });
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Good morning",
  );
  const header = page.locator(".dashboard-header");
  await expect(header.getByText("Friday", { exact: true })).toBeVisible();
  await expect(header.getByText("11:59 AM", { exact: true })).toBeVisible();
  await expect(header).toContainText("October 2026");
  await expect(
    page.locator("section[aria-labelledby=spending-heading]"),
  ).toContainText("October 2026");
  await page.clock.fastForward(61000);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Good afternoon",
  );
  await expect(header.getByText("12:00 PM", { exact: true })).toBeVisible();
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: "test-results/dashboard-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "test-results/dashboard-mobile.png",
    fullPage: true,
  });
});

test("changes synchronize across two tabs of the same browser", async ({
  page,
  context,
}) => {
  await page.goto("/shopping");
  const second = await context.newPage();
  await second.goto("/shopping");
  await page.getByLabel("Shopping item", { exact: true }).fill("Two-tab milk");
  await page.getByRole("button", { name: "Add item" }).click();
  await expect(second.getByText("Two-tab milk", { exact: true })).toBeVisible();
  await second.getByRole("checkbox", { name: /Two-tab milk/ }).check();
  await expect(
    page.getByRole("checkbox", { name: /Two-tab milk/ }),
  ).toBeChecked();
  await second.close();
});
