import { test, expect } from "@playwright/test";

test("finishing personal chores shows a compact done state while retaining history and active household chores", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.clock.install({ time: new Date("2026-10-04T09:00:00Z") });
  const initial = {
    version: 1,
    name: "Chore test home",
    currentUser: "Noor",
    members: [
      { id: "noor", name: "Noor" },
      { id: "sara", name: "Sara" },
      { id: "reem", name: "Reem", archived: true },
    ],
    expenses: [],
    bills: [],
    shoppingItems: [],
    settlements: [],
    chores: [
      {
        id: "mine",
        title: "Clean kitchen",
        assignedTo: "Noor",
        dueDate: "2026-10-04",
        status: "pending",
      },
      {
        id: "other",
        title: "Take out bins",
        assignedTo: "Sara",
        dueDate: "2026-10-05",
        status: "pending",
      },
      {
        id: "old",
        title: "Old completed task",
        assignedTo: "Noor",
        dueDate: "2026-10-01",
        status: "completed",
        completedBy: "Noor",
        completedOn: "2026-10-01",
        completionHistory: [{ by: "Noor", date: "2026-10-01" }],
      },
    ],
  };
  await page.addInitScript((state) => {
    if (!localStorage.getItem("roomie.household.v1"))
      localStorage.setItem("roomie.household.v1", JSON.stringify(state));
  }, initial);
  await page.goto("/chores");
  const personal = page.getByRole("region", { name: "My chores", exact: true });
  const done = personal.getByRole("heading", {
    name: "All your tasks are done",
    exact: true,
  });
  await expect(done).toHaveCount(0);
  const filters = page.getByRole("group", { name: "Filter chores" });
  await filters
    .getByRole("button", { name: "Completed 1", exact: true })
    .click();
  await expect(done).toHaveCount(0);
  await filters.getByRole("button", { name: "All 3", exact: true }).click();
  await personal
    .getByRole("checkbox", { name: "Complete Clean kitchen", exact: true })
    .click();
  await expect(done).toBeVisible();
  await expect(personal.locator(".chore-list-columns")).toHaveCount(0);
  await expect(
    page.getByRole("list", { name: "Household chores", exact: true }),
  ).toContainText("Take out bins");
  await expect(personal.locator(".completed-chores")).toHaveJSProperty(
    "open",
    false,
  );
  await personal.locator(".completed-chores > summary").click();
  const history = personal.getByRole("list", {
    name: "Completed my chores",
    exact: true,
  });
  await expect(history.getByRole("listitem")).toHaveCount(2);
  await expect(history).toContainText("Completed by Noor on Oct 4, 2026");
  await history
    .getByRole("combobox", { name: "Status of Clean kitchen", exact: true })
    .selectOption("pending");
  await expect(done).toHaveCount(0);
  await expect(
    personal
      .getByRole("list", { name: "My chores", exact: true })
      .getByRole("listitem"),
  ).toHaveCount(1);
  await page.getByRole("button", { name: "Add chore", exact: true }).click();
  const form = page.getByRole("dialog", { name: "Add chore", exact: true });
  await expect(
    form
      .getByRole("combobox", { name: "Assigned to", exact: true })
      .getByRole("option", { name: "Reem", exact: true }),
  ).toHaveCount(0);
  await form
    .getByRole("combobox", { name: "Repeat", exact: true })
    .selectOption("weekly");
  await expect(
    form
      .getByRole("group", { name: "Rotate between", exact: true })
      .getByRole("checkbox", { name: "Reem", exact: true }),
  ).toHaveCount(0);
  await page.keyboard.press("Escape");
  const mine = personal.getByRole("list", { name: "My chores", exact: true });
  await mine.getByRole("button", { name: "Request swap", exact: true }).click();
  await expect(
    mine
      .getByRole("combobox", { name: "Swap Clean kitchen with", exact: true })
      .getByRole("option", { name: "Reem", exact: true }),
  ).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.reload();
  await expect(done).toHaveCount(0);
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("roomie.household.v1")),
  );
  expect(
    stored.chores.find((chore) => chore.id === "mine").completionHistory,
  ).toHaveLength(1);
  expect(stored.chores.find((chore) => chore.id === "old").status).toBe(
    "completed",
  );
  expect(errors).toEqual([]);
});

test("personal chores synchronize with the household and completed chores can be reopened", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/chores");
  const mine = page.getByRole("list", { name: "My chores", exact: true });
  const household = page.getByRole("list", {
    name: "Household chores",
    exact: true,
  });
  const homeRegion = page.getByRole("region", {
    name: "Household chores",
    exact: true,
  });
  await expect(mine.getByRole("listitem")).toHaveCount(2);
  await expect(household.getByRole("listitem")).toHaveCount(4);
  await expect(
    page.getByRole("heading", { name: "Wash Dishes", exact: true }),
  ).not.toBeVisible();
  await mine
    .getByRole("checkbox", { name: "Complete Clean Bathroom", exact: true })
    .click();
  await expect(mine.getByRole("listitem")).toHaveCount(1);
  await expect(household.getByRole("listitem")).toHaveCount(3);
  await homeRegion.locator(".completed-chores > summary").click();
  const completed = page.getByRole("list", {
    name: "Completed household chores",
    exact: true,
  });
  await expect(completed.getByLabel("Status of Clean Bathroom")).toHaveValue(
    "completed",
  );
  await completed
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
  await page.getByRole("tab", { name: "Household", exact: true }).click();
  await page.getByLabel("View as").selectOption("Sara");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.goto("/chores");
  const myRegion = page.getByRole("region", { name: "My chores", exact: true });
  await expect(myRegion).toContainText("Sara");
  await expect(mine.getByRole("listitem")).toHaveCount(1);
  await expect(mine).toContainText("Clean Kitchen");
  await expect(mine).not.toContainText("Take Out Trash");
  await myRegion.locator(".completed-chores > summary").click();
  await expect(
    page.getByRole("list", { name: "Completed my chores", exact: true }),
  ).toContainText("Wash Dishes");
  await page.reload();
  await expect(mine).toContainText("Clean Kitchen");
  await page.goto("/members");
  await page.getByRole("tab", { name: "Household", exact: true }).click();
  await page.getByLabel("New member name").fill("Lina");
  await page.getByRole("button", { name: "Add member" }).click();
  await page.getByLabel("View as").selectOption("Lina");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.goto("/chores");
  await expect(mine.getByRole("listitem")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "All your tasks are done", exact: true }),
  ).toBeVisible();
  await expect(household.getByRole("listitem")).toHaveCount(4);
  expect(errors).toEqual([]);
});

test("compact chore lists preserve filters, priority, completion and persistence on mobile", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.clock.install({ time: new Date("2026-10-02T09:00:00Z") });
  await page.goto("/chores");
  const household = page.getByRole("list", {
    name: "Household chores",
    exact: true,
  });
  const region = page.getByRole("region", {
    name: "Household chores",
    exact: true,
  });
  const rows = household.getByRole("listitem");
  const filters = page.getByRole("group", { name: "Filter chores" });
  for (const [status, count] of [
    ["Pending", 3],
    ["In progress", 1],
    ["Completed", 1],
    ["All", 5],
  ]) {
    const button = filters.getByRole("button", {
      name: `${status} ${count}`,
      exact: true,
    });
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    if (status === "Completed") {
      const completed = page.getByRole("list", {
        name: "Completed household chores",
        exact: true,
      });
      await expect(completed.getByRole("listitem")).toHaveCount(1);
      await expect(completed).toContainText("Task completed");
      await expect(completed).not.toContainText("overdue");
    } else await expect(rows).toHaveCount(status === "All" ? 4 : count);
  }
  await expect(rows.first()).toContainText("Clean Kitchen");
  await household
    .getByRole("checkbox", { name: "Complete Clean Kitchen", exact: true })
    .click();
  await expect(rows).toHaveCount(3);
  await expect(
    filters.getByRole("button", { name: "Completed 2", exact: true }),
  ).toBeVisible();
  await region.locator(".completed-chores > summary").click();
  const completed = page.getByRole("list", {
    name: "Completed household chores",
    exact: true,
  });
  await completed
    .getByRole("checkbox", { name: "Complete Clean Kitchen", exact: true })
    .click();
  await expect(rows.first()).toContainText("Clean Kitchen");
  await region.locator(".completed-chores > summary").click();
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "test-results/chores-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/chores-mobile.png",
    fullPage: true,
  });
  await filters.getByRole("button", { name: "Pending 3", exact: true }).click();
  await household
    .getByLabel("Status of Clean Kitchen")
    .selectOption("in-progress");
  await expect(
    page.getByRole("heading", { name: "Clean Kitchen", exact: true }),
  ).toHaveCount(0);
  await filters
    .getByRole("button", { name: "In progress 2", exact: true })
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
  const title =
    "Clean the kitchen and organize the household storage cupboards";
  await page.getByLabel("Task", { exact: true }).fill(title);
  await page.getByLabel("Assigned to").selectOption("Reem");
  await page.getByLabel("Due date").fill("2026-10-03");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Add chore", exact: true })
    .click();
  await filters.getByRole("button", { name: "Pending 3", exact: true }).click();
  const added = rows.filter({
    has: page.getByRole("heading", { name: title, exact: true }),
  });
  await expect(added).toContainText("Reem");
  await expect(added).toContainText("Due tomorrow");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
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
  expect(errors).toEqual([]);
});
