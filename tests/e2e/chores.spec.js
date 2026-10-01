import { test, expect } from "@playwright/test";

test("personal chores follow the current member and synchronize with household chores", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/chores");
  const mine = page.getByRole("list", { name: "My chores" });
  const household = page.getByRole("list", { name: "Household chores" });
  await expect(mine.getByRole("listitem")).toHaveCount(2);
  await expect(mine).toContainText("Take Out Trash");
  await expect(mine).toContainText("Clean Bathroom");
  await expect(mine).not.toContainText("Clean Kitchen");
  await expect(household.getByRole("listitem")).toHaveCount(5);
  await mine
    .getByRole("checkbox", { name: "Complete Clean Bathroom", exact: true })
    .check();
  await expect(household.getByLabel("Status of Clean Bathroom")).toHaveValue(
    "completed",
  );
  await household
    .getByLabel("Status of Clean Bathroom")
    .selectOption("in-progress");
  await expect(mine.getByLabel("Status of Clean Bathroom")).toHaveValue(
    "in-progress",
  );
  await expect(
    mine.getByRole("checkbox", {
      name: "Complete Clean Bathroom",
      exact: true,
    }),
  ).not.toBeChecked();
  await page.goto("/members");
  await page.getByLabel("View as").selectOption("Sara");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.goto("/chores");
  await expect(
    page.getByRole("region", { name: "My chores", exact: true }),
  ).toContainText("Sara");
  await expect(mine.getByRole("listitem")).toHaveCount(2);
  await expect(mine).toContainText("Clean Kitchen");
  await expect(mine).toContainText("Wash Dishes");
  await expect(mine).not.toContainText("Take Out Trash");
  await page.reload();
  await expect(mine).toContainText("Clean Kitchen");
  await page.goto("/members");
  await page.getByLabel("New member name").fill("Lina");
  await page.getByRole("button", { name: "Add member" }).click();
  await page.getByLabel("View as").selectOption("Lina");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.goto("/chores");
  await expect(mine.getByRole("listitem")).toHaveCount(0);
  await expect(
    page.getByText("No chores assigned to you in this view."),
  ).toBeVisible();
  await expect(household.getByRole("listitem")).toHaveCount(5);
  expect(errors).toEqual([]);
});

test("chore filters, status changes and assigned tasks persist across screen sizes", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.clock.install({ time: new Date("2026-10-02T09:00:00Z") });
  await page.goto("/chores");
  await expect(
    page.getByRole("heading", { name: "Chores", exact: true }),
  ).toBeVisible();
  const household = page.getByRole("list", { name: "Household chores" });
  const rows = household.getByRole("listitem");
  const filters = page.getByRole("group", { name: "Filter chores" });
  for (const [status, count] of [
    ["pending", 3],
    ["in progress", 1],
    ["completed", 1],
    ["all", 5],
  ]) {
    const button = filters.getByRole("button", { name: status, exact: true });
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(rows).toHaveCount(count);
  }
  const completed = rows.filter({
    has: page.getByRole("heading", { name: "Wash Dishes", exact: true }),
  });
  await expect(
    completed.getByText("Task completed", { exact: true }),
  ).toBeVisible();
  await expect(completed).not.toContainText("overdue");
  await expect(rows.last()).toContainText("Wash Dishes");
  await household
    .getByRole("checkbox", { name: "Complete Clean Kitchen", exact: true })
    .check();
  await expect(household.getByLabel("Status of Clean Kitchen")).toHaveValue(
    "completed",
  );
  await expect(rows.last()).toContainText("Clean Kitchen");
  await household
    .getByRole("checkbox", { name: "Complete Clean Kitchen", exact: true })
    .uncheck();
  await expect(household.getByLabel("Status of Clean Kitchen")).toHaveValue(
    "pending",
  );
  await expect(rows.first()).toContainText("Clean Kitchen");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "test-results/chores-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/chores-mobile.png",
    fullPage: true,
  });
  await filters.getByRole("button", { name: "pending", exact: true }).click();
  await household
    .getByLabel("Status of Clean Kitchen")
    .selectOption("in-progress");
  await expect(
    page.getByRole("heading", { name: "Clean Kitchen", exact: true }),
  ).toHaveCount(0);
  await filters
    .getByRole("button", { name: "in progress", exact: true })
    .click();
  await expect(rows).toHaveCount(2);
  await household
    .getByLabel("Status of Clean Kitchen")
    .selectOption("completed");
  await household
    .getByLabel("Status of Take Out Trash")
    .selectOption("completed");
  await expect(page.getByText("No chores in this view.")).toBeVisible();
  await page.getByRole("button", { name: "Add chore", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Add chore", exact: true }).click();
  const title =
    "Clean the kitchen and organize the household storage cupboards";
  await page.getByLabel("Task", { exact: true }).fill(title);
  await page.getByLabel("Assigned to").selectOption("Reem");
  await page.getByLabel("Due date").fill("2026-10-03");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Add chore", exact: true })
    .click();
  await filters.getByRole("button", { name: "pending", exact: true }).click();
  const added = rows.filter({
    has: page.getByRole("heading", { name: title, exact: true }),
  });
  await expect(added).toContainText("Reem");
  await expect(added).toContainText("Due tomorrow");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.reload();
  await expect(added).toBeVisible();
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("roomie.household.v1")),
  );
  expect(stored.chores.find((chore) => chore.title === title)).toMatchObject({
    assignedTo: "Reem",
    dueDate: "2026-10-03",
    status: "pending",
  });
  expect(
    stored.chores.find((chore) => chore.title === "Clean Kitchen").status,
  ).toBe("completed");
  expect(
    stored.chores.find((chore) => chore.title === "Take Out Trash").status,
  ).toBe("completed");
  expect(errors).toEqual([]);
});
