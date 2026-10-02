import { test, expect } from "@playwright/test";

test("expense design preserves search and fits desktop and mobile screens", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/expenses");
  await expect(
    page.getByRole("heading", { name: "Expenses", exact: true }),
  ).toBeVisible();
  await expect(page.locator("article")).toHaveCount(5);
  const groceries = page.locator("article").filter({ has: page.getByRole("heading", { name: "Groceries", exact: true }) });
  await expect(groceries).toContainText("Your share");
  await expect(groceries).toContainText("SAR 40.00");
  await expect(groceries.getByText("Sara's share")).toHaveCount(0);
  await groceries.getByRole("button", { name: "View split for Groceries" }).click();
  const split = page.getByRole("dialog", { name: "Split for Groceries" });
  await expect(split.getByText("SAR 40.00", { exact: true })).toHaveCount(3);
  await page.keyboard.press("Escape");
  await expect(groceries.getByRole("button", { name: "View split for Groceries" })).toBeFocused();
  const search = page.getByRole("searchbox", { name: "Search expenses" });
  await search.fill("groceries");
  await expect(page.locator("article")).toHaveCount(1);
  await search.fill("no matching expense");
  await expect(page.locator("article")).toHaveCount(0);
  await expect(
    page.getByText("No expenses match. Add an expense to get started."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear expense search" }).click();
  await expect(page.locator("article")).toHaveCount(5);
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: "test-results/expenses-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/expenses-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Add expense", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("expense shares follow the active member and exclude nonparticipants", async ({ page }) => {
  await page.goto("/members");
  await page.getByLabel("View as").selectOption("Reem");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.goto("/expenses");
  const internet = page.locator("article").filter({ has: page.getByRole("heading", { name: "Internet", exact: true }) });
  await expect(internet).toContainText("You're not in this split");
  await expect(internet).toContainText("SAR 0.00");
  await internet.getByRole("button", { name: "View split for Internet" }).click();
  await expect(page.getByRole("dialog").getByText("SAR 40.00", { exact: true })).toHaveCount(2);
});
