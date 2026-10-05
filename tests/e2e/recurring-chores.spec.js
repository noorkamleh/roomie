import { test, expect } from "@playwright/test";

const runtimeErrors = new WeakMap();
test.beforeEach(async ({ page }) => {
  const errors = [];
  runtimeErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
});
test.afterEach(async ({ page }) => expect(runtimeErrors.get(page)).toEqual([]));

const saved = (page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("roomie.household.v1")));
const row = (page, title, dueDate) =>
  page
    .locator(".chore-list--household .chore-row")
    .filter({ has: page.getByRole("heading", { name: title, exact: true }) })
    .filter({ has: page.locator(`time[datetime="${dueDate}"]`) });
const viewAs = async (page, name) => {
  await page.goto("/members");
  await page.getByRole("tab", { name: "Household", exact: true }).click();
  await page
    .getByRole("combobox", { name: "View as", exact: true })
    .selectOption(name);
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.goto("/chores");
};
const addRecurringChore = async (page, title, dueDate, frequency) => {
  await page.getByRole("button", { name: "Add chore", exact: true }).click();
  const form = page.getByRole("dialog", { name: "Add chore", exact: true });
  await form.getByLabel("Task", { exact: true }).fill(title);
  await form.getByLabel("Due date").fill(dueDate);
  await form
    .getByRole("combobox", { name: "Repeat", exact: true })
    .selectOption(frequency);
  return form;
};

test("monthly chores rotate selected members, retain completion history, and do not duplicate future occurrences", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-01-31T09:00:00Z") });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/chores");
  const title = "Monthly deep clean";
  const form = await addRecurringChore(page, title, "2026-01-31", "monthly");
  await form.getByRole("checkbox", { name: "Reem", exact: true }).uncheck();
  await form.getByRole("button", { name: "Add chore", exact: true }).click();
  const january = row(page, title, "2026-01-31");
  await expect(january).toContainText("Monthly");
  await expect(january).toContainText("Noor");
  await january
    .getByRole("checkbox", { name: `Complete ${title}`, exact: true })
    .click();
  const february = row(page, title, "2026-02-28");
  await expect(february).toBeVisible();
  await expect(february.locator(".chore-person")).toContainText("Sara");
  await page
    .locator(".chore-list--household .completed-chores > summary")
    .click();
  await expect(january).toContainText("Completed by Noor on Jan 31, 2026");
  await january.getByText("Completion history (1)", { exact: true }).click();
  await expect(january).toContainText(
    "Noor completed this chore on Jan 31, 2026.",
  );
  await january
    .getByRole("combobox", { name: `Status of ${title}`, exact: true })
    .selectOption("pending");
  await expect(january).toContainText("Completion history (1)");
  await january
    .getByRole("checkbox", { name: `Complete ${title}`, exact: true })
    .click();
  await expect(february).toHaveCount(1);
  let state = await saved(page);
  expect(state.chores.filter((chore) => chore.title === title)).toHaveLength(2);
  expect(
    state.chores.find(
      (chore) => chore.title === title && chore.dueDate === "2026-01-31",
    ).completionHistory,
  ).toHaveLength(2);
  await viewAs(page, "Sara");
  await february
    .getByRole("checkbox", { name: `Complete ${title}`, exact: true })
    .click();
  const march = row(page, title, "2026-03-31");
  await expect(march).toBeVisible();
  await expect(march.locator(".chore-person")).toContainText("Noor");
  state = await saved(page);
  expect(
    state.chores.find(
      (chore) => chore.title === title && chore.dueDate === "2026-02-28",
    ).completedBy,
  ).toBe("Sara");
  expect(
    state.chores.find(
      (chore) => chore.title === title && chore.dueDate === "2026-03-31",
    ).recurrence.anchorDay,
  ).toBe(31);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.reload();
  await expect(march).toBeVisible();
  expect(
    (await saved(page)).chores.filter((chore) => chore.title === title),
  ).toHaveLength(3);
});

test("swap recipients can decline or accept across tabs without changing the future rotation", async ({
  page,
  context,
}) => {
  await page.clock.install({ time: new Date("2026-10-04T09:00:00Z") });
  await page.goto("/chores");
  const title = "Weekly kitchen reset";
  const form = await addRecurringChore(page, title, "2026-10-04", "weekly");
  await form.getByRole("button", { name: "Add chore", exact: true }).click();
  const original = row(page, title, "2026-10-04");
  const otherTab = await context.newPage();
  const otherTabErrors = [];
  otherTab.on("pageerror", (error) => otherTabErrors.push(error.message));
  await otherTab.clock.install({ time: new Date("2026-10-04T09:00:00Z") });
  await otherTab.goto("/chores");
  const syncedOriginal = row(otherTab, title, "2026-10-04");

  await original
    .getByRole("button", { name: "Request swap", exact: true })
    .click();
  await original
    .getByRole("combobox", { name: `Swap ${title} with`, exact: true })
    .selectOption("Reem");
  await original
    .getByRole("button", { name: "Send request", exact: true })
    .click();
  await expect(syncedOriginal).toContainText(
    "Noor requested a swap with Reem.",
  );
  await viewAs(otherTab, "Sara");
  await expect(
    syncedOriginal.getByRole("button", { name: "Accept swap", exact: true }),
  ).toHaveCount(0);
  await expect(syncedOriginal).toContainText("Waiting for Reem.");
  await viewAs(otherTab, "Reem");
  await syncedOriginal
    .getByRole("button", { name: "Decline swap", exact: true })
    .click();
  await expect(original).not.toContainText("requested a swap");
  await expect(original.locator(".chore-person")).toContainText("Noor");
  let state = await saved(page);
  let stored = state.chores.find((chore) => chore.title === title);
  expect(stored.swapRequest).toBeUndefined();
  expect(stored.swapHistory ?? []).toHaveLength(0);

  await viewAs(page, "Noor");
  await original
    .getByRole("button", { name: "Request swap", exact: true })
    .click();
  await original
    .getByRole("combobox", { name: `Swap ${title} with`, exact: true })
    .selectOption("Reem");
  await original
    .getByRole("button", { name: "Send request", exact: true })
    .click();
  await viewAs(otherTab, "Reem");
  await syncedOriginal
    .getByRole("button", { name: "Accept swap", exact: true })
    .click();
  await expect(original.locator(".chore-person")).toContainText("Reem");
  await expect(original).toContainText("Swap history (1)");
  state = await saved(page);
  stored = state.chores.find((chore) => chore.title === title);
  expect(stored.swapRequest).toBeUndefined();
  expect(stored.swapHistory).toEqual([
    { from: "Noor", to: "Reem", requestedBy: "Noor", date: "2026-10-04" },
  ]);
  await original
    .getByRole("checkbox", { name: `Complete ${title}`, exact: true })
    .click();
  const next = row(page, title, "2026-10-11");
  await expect(next.locator(".chore-person")).toContainText("Sara");
  await expect(row(otherTab, title, "2026-10-11")).toBeVisible();
  state = await saved(page);
  stored = state.chores.find(
    (chore) => chore.title === title && chore.dueDate === "2026-10-04",
  );
  expect(stored.completedBy).toBe("Reem");
  expect(stored.completedOn).toBe("2026-10-04");
  expect(stored.swapHistory).toHaveLength(1);
  await page.reload();
  await expect(next).toBeVisible();
  expect(otherTabErrors).toEqual([]);
  await otherTab.close();
});
