import { test, expect } from "@playwright/test";

const runtimeErrors = new WeakMap();
test.beforeEach(async ({ page }) => {
  const errors = [];
  runtimeErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
});
test.afterEach(async ({ page }) => expect(runtimeErrors.get(page)).toEqual([]));
const memberCard = (page, name) =>
  page
    .locator(".member-card")
    .filter({ has: page.getByRole("heading", { name, exact: true }) });
const saved = (page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("roomie.household.v1")));

test("member settings stay in sync with changes saved in another tab", async ({
  page,
  context,
}) => {
  await page.goto("/members");
  const otherTab = await context.newPage();
  await otherTab.goto("/members");
  await page.getByLabel("Household name").fill("Unsaved old name");
  await otherTab.getByLabel("Household name").fill("Synced home");
  await otherTab.getByLabel("View as").selectOption("Reem");
  await otherTab.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByLabel("Household name")).toHaveValue("Synced home");
  await expect(page.getByLabel("View as")).toHaveValue("Reem");
  await expect(memberCard(page, "Reem")).toContainText("Current view");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Settings saved.");
  const state = await saved(page);
  expect(state.name).toBe("Synced home");
  expect(state.currentUser).toBe("Reem");
  await otherTab.close();
});

test("members layout preserves settings, duplicate validation and adding on desktop and mobile", async ({
  page,
}) => {
  await page.goto("/members");
  await expect(
    page.getByRole("heading", { name: "Household members", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".member-card")).toHaveCount(3);
  await expect(memberCard(page, "Noor")).toContainText("Current view");
  await expect(memberCard(page, "Noor")).toContainText("To receive");
  await expect(memberCard(page, "Noor")).toContainText("SAR 44.99");
  await expect(memberCard(page, "Reem")).toContainText("To pay");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "test-results/members-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/members-mobile.png",
    fullPage: true,
  });
  await page.getByLabel("New member name").fill(" noor ");
  await page.getByRole("button", { name: "Add member", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveText(
    "A member with this name already exists.",
  );
  await expect(page.locator(".member-card")).toHaveCount(3);
  const longName = "Alexandra".repeat(10);
  await page.getByLabel("New member name").fill(longName);
  await page.getByRole("button", { name: "Add member", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(page.getByLabel("New member name")).toHaveValue("");
  await expect(memberCard(page, longName)).toContainText("All settled");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByLabel("Household name").fill("Our test home");
  await page.getByLabel("View as").selectOption("Sara");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Settings saved.");
  await expect(memberCard(page, "Sara")).toContainText("Current view");
  await expect(memberCard(page, "Noor")).not.toContainText("Current view");
  await expect(page.locator(".members-household-label")).toContainText(
    "Our test home",
  );
  await page.reload();
  await expect(page.getByLabel("Household name")).toHaveValue("Our test home");
  await expect(page.getByLabel("View as")).toHaveValue("Sara");
  await expect(page.locator(".member-card")).toHaveCount(4);
  expect((await saved(page)).members.at(-1).name).toBe(longName);
});

test("repayments can be cancelled and recorded without changing expenses, and history persists", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-10-02T09:00:00Z") });
  await page.goto("/members");
  const transfers = page.getByRole("list", {
    name: "Suggested repayments",
    exact: true,
  });
  await expect(transfers.getByRole("listitem")).toHaveCount(2);
  const initialStorage = await page.evaluate(() =>
    localStorage.getItem("roomie.household.v1"),
  );
  page.once("dialog", (dialog) => dialog.dismiss());
  await transfers
    .getByRole("button", { name: "Record repayment", exact: true })
    .first()
    .click();
  await expect(transfers.getByRole("listitem")).toHaveCount(2);
  expect(
    await page.evaluate(() => localStorage.getItem("roomie.household.v1")),
  ).toBe(initialStorage);
  page.once("dialog", (dialog) => dialog.accept());
  await transfers
    .getByRole("button", { name: "Record repayment", exact: true })
    .first()
    .click();
  await expect(memberCard(page, "Noor")).toContainText("All settled");
  await expect(transfers.getByRole("listitem")).toHaveCount(1);
  const history = page.getByRole("list", {
    name: "Repayment history",
    exact: true,
  });
  await expect(history.getByRole("listitem")).toHaveCount(1);
  let state = await saved(page);
  expect(state.settlements).toHaveLength(1);
  expect(state.expenses).toHaveLength(5);
  expect(
    state.expenses.reduce((total, expense) => total + expense.amount, 0),
  ).toBe(455);
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "test-results/members-repayments-desktop.png",
    fullPage: true,
  });
  page.once("dialog", (dialog) => dialog.accept());
  await transfers
    .getByRole("button", { name: "Record repayment", exact: true })
    .click();
  await expect(
    page.getByText("All balances are settled.", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".member-card--settled")).toHaveCount(3);
  await expect(history.getByRole("listitem")).toHaveCount(2);
  state = await saved(page);
  expect(state.settlements).toHaveLength(2);
  expect(state.expenses).toHaveLength(5);
  await page.reload();
  await expect(history.getByRole("listitem")).toHaveCount(2);
  await expect(page.locator(".member-card--settled")).toHaveCount(3);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
