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
