import { respondToConfirmation } from "./helpers/confirmation.js";
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
const addMember = async (page, name) => {
  await page.getByLabel("New member name").fill(name);
  await page.getByRole("button", { name: "Add member", exact: true }).click();
  await expect(memberCard(page, name)).toBeVisible();
};

test("member deletion can be cancelled and confirmed on mobile, persists, and updates member choices", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/members?tab=household");
  await addMember(page, "Lina");
  const before = await saved(page);
  await memberCard(page, "Lina")
    .getByRole("button", { name: "Member options for Lina" })
    .click();
  const deleteButton = memberCard(page, "Lina").getByRole("button", {
    name: "Delete member Lina",
    exact: true,
  });
  await expect(deleteButton).toBeVisible();
  await deleteButton.click();
  await expect(
    page.getByRole("dialog", { name: "Delete member", exact: true }),
  ).toContainText("Delete Lina from the household?");
  await respondToConfirmation(page, false);
  await expect(memberCard(page, "Lina")).toBeVisible();
  expect(await saved(page)).toEqual(before);

  await deleteButton.click();
  await respondToConfirmation(page);
  await expect(memberCard(page, "Lina")).toHaveCount(0);
  await expect(page.locator(".member-card")).toHaveCount(3);
  await expect(page.getByLabel("View as")).toHaveValue("Noor");
  await expect(
    page
      .getByLabel("View as")
      .getByRole("option", { name: "Lina", exact: true }),
  ).toHaveCount(0);
  expect(await saved(page)).toEqual({
    ...before,
    members: before.members.filter((member) => member.name !== "Lina"),
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.reload();
  await expect(memberCard(page, "Lina")).toHaveCount(0);
  await expect(page.locator(".member-card")).toHaveCount(3);

  await page.goto("/expenses");
  await page.getByRole("button", { name: "Add expense", exact: true }).click();
  const expenseForm = page.getByRole("dialog");
  await expect(
    expenseForm
      .getByLabel("Paid by")
      .getByRole("option", { name: "Lina", exact: true }),
  ).toHaveCount(0);
  await expect(
    expenseForm.getByRole("checkbox", { name: "Lina", exact: true }),
  ).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.goto("/chores");
  await page.getByRole("button", { name: "Add chore", exact: true }).click();
  await expect(
    page
      .getByRole("dialog")
      .getByLabel("Assigned to")
      .getByRole("option", { name: "Lina", exact: true }),
  ).toHaveCount(0);
});

test("deleting members synchronizes stale settings drafts and the active member across tabs", async ({
  page,
  context,
}) => {
  await page.goto("/members?tab=household");
  await addMember(page, "Lina");
  await addMember(page, "Maya");
  const otherTab = await context.newPage();
  const otherTabErrors = [];
  otherTab.on("pageerror", (error) => otherTabErrors.push(error.message));
  await otherTab.goto("/members?tab=household");

  await page.getByLabel("Household name").fill("Our draft home");
  await page.getByLabel("View as").selectOption("Lina");
  await memberCard(otherTab, "Lina")
    .getByRole("button", { name: "Member options for Lina" })
    .click();
  await otherTab
    .getByRole("button", { name: "Delete member Lina", exact: true })
    .click();
  await respondToConfirmation(otherTab);
  await expect(memberCard(page, "Lina")).toHaveCount(0);
  await expect(page.getByLabel("View as")).toHaveValue("Noor");
  await expect(page.getByLabel("Household name")).toHaveValue("Our draft home");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByRole("form", { name: "Household settings" }).getByRole("status"),
  ).toHaveText("Settings saved.");
  await expect(otherTab.getByLabel("Household name")).toHaveValue(
    "Our draft home",
  );
  expect((await saved(page)).currentUser).toBe("Noor");

  await page.getByLabel("View as").selectOption("Maya");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(memberCard(page, "Maya")).toContainText("Current view");
  await expect(otherTab.getByLabel("View as")).toHaveValue("Maya");
  await memberCard(page, "Maya")
    .getByRole("button", { name: "Member options for Maya" })
    .click();
  await page
    .getByRole("button", { name: "Delete member Maya", exact: true })
    .click();
  await respondToConfirmation(page);
  for (const tab of [page, otherTab]) {
    await expect(memberCard(tab, "Maya")).toHaveCount(0);
    await expect(memberCard(tab, "Noor")).toContainText("Current view");
    await expect(tab.getByLabel("View as")).toHaveValue("Noor");
    await expect(
      tab
        .getByLabel("View as")
        .getByRole("option", { name: "Maya", exact: true }),
    ).toHaveCount(0);
  }
  await otherTab.reload();
  await expect(otherTab.getByLabel("View as")).toHaveValue("Noor");
  await expect(otherTab.locator(".member-card")).toHaveCount(3);
  expect((await saved(page)).currentUser).toBe("Noor");
  expect(otherTabErrors).toEqual([]);
  await otherTab.close();
});

test("deleting a member linked to household records reports an error and preserves their data", async ({
  page,
}) => {
  await page.goto("/members?tab=household");
  const before = await saved(page);
  await memberCard(page, "Noor")
    .getByRole("button", { name: "Member options for Noor" })
    .click();
  await page
    .getByRole("button", { name: "Delete member Noor", exact: true })
    .click();
  await respondToConfirmation(page);
  await expect(
    page.getByRole("region", { name: "Your housemates" }).getByRole("alert"),
  ).toContainText(/expense|chore|repayment|settlement|linked|associated/i);
  await expect(memberCard(page, "Noor")).toContainText("Current view");
  await expect(page.locator(".member-card")).toHaveCount(3);
  expect(await saved(page)).toEqual(before);
});

test("the final household member cannot be deleted", async ({ page }) => {
  const household = {
    version: 1,
    name: "Single member home",
    currentUser: "Lina",
    members: [{ id: "only-member", name: "Lina", avatar: "" }],
    expenses: [],
    bills: [],
    chores: [],
    shoppingItems: [],
    settlements: [],
  };
  await page.addInitScript((state) => {
    localStorage.setItem("roomie.household.v1", JSON.stringify(state));
  }, household);
  await page.goto("/members?tab=household");
  await expect(page.locator(".member-card")).toHaveCount(1);
  await memberCard(page, "Lina")
    .getByRole("button", { name: "Member options for Lina" })
    .click();
  await page
    .getByRole("button", { name: "Delete member Lina", exact: true })
    .click();
  await respondToConfirmation(page);
  await expect(
    page.getByRole("region", { name: "Your housemates" }).getByRole("alert"),
  ).toContainText(/last|at least one|only member/i);
  await expect(memberCard(page, "Lina")).toContainText("Current view");
  await expect(page.getByLabel("View as")).toHaveValue("Lina");
  expect(await saved(page)).toEqual(household);
});

test("member settings stay in sync with changes saved in another tab", async ({
  page,
  context,
}) => {
  await page.goto("/members?tab=household");
  const otherTab = await context.newPage();
  await otherTab.goto("/members?tab=household");
  await page.getByLabel("Household name").fill("Unsaved old name");
  await otherTab.getByLabel("Household name").fill("Synced home");
  await otherTab.getByLabel("View as").selectOption("Reem");
  await otherTab.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByLabel("Household name")).toHaveValue("Synced home");
  await expect(page.getByLabel("View as")).toHaveValue("Reem");
  await expect(memberCard(page, "Reem")).toContainText("Current view");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByRole("form", { name: "Household settings" }).getByRole("status"),
  ).toHaveText("Settings saved.");
  const state = await saved(page);
  expect(state.name).toBe("Synced home");
  expect(state.currentUser).toBe("Reem");
  await otherTab.close();
});

test("members layout preserves settings, duplicate validation and adding on desktop and mobile", async ({
  page,
}) => {
  await page.goto("/members?tab=household");
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
  await expect(
    page.getByRole("form", { name: "Household settings" }).getByRole("status"),
  ).toHaveText("Settings saved.");
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
  await transfers
    .getByRole("button", { name: "Record repayment", exact: true })
    .first()
    .click();
  await respondToConfirmation(page, false);
  await expect(transfers.getByRole("listitem")).toHaveCount(2);
  expect(
    await page.evaluate(() => localStorage.getItem("roomie.household.v1")),
  ).toBe(initialStorage);
  await transfers
    .getByRole("button", { name: "Record repayment", exact: true })
    .first()
    .click();
  await respondToConfirmation(page);
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
  await transfers
    .getByRole("button", { name: "Record repayment", exact: true })
    .click();
  await respondToConfirmation(page);
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
