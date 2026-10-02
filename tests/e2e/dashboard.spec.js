import { test, expect } from "@playwright/test";

test("dashboard includes overdue chores and month-to-date spending across all ranges", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-02T09:00:00Z") });
  await page.goto("/expenses?add=1");
  await page.getByLabel("Title", { exact: true }).fill("Electricity payment");
  await page.getByLabel("Amount (SAR)").fill("240");
  await page.getByLabel("Date", { exact: true }).fill("2026-10-01");
  await page.getByLabel("Category").selectOption("Bills");
  await page.getByRole("dialog").getByRole("button", { name: "Add expense", exact: true }).click();
  await page.goto("/dashboard");
  const spending = page.locator("section[aria-labelledby=spending-heading]");
  await expect(spending).toContainText("1 transaction");
  await expect(spending.getByText("SAR 120.00", { exact: true })).toBeVisible();
  const attention = page.getByRole("region", { name: "Needs your attention" });
  await expect(attention).toContainText("Clean Kitchen");
  await expect(attention).toContainText("Sara");
  await expect(attention.getByText("Overdue", { exact: true })).toHaveCount(3);
  await attention.getByRole("button", { name: "Mark Clean Kitchen as completed" }).click();
  await expect(attention.getByText("Clean Kitchen", { exact: true })).toHaveCount(0);
  await expect(attention).toContainText("Clean Bathroom");
  await spending.getByRole("button", { name: "Last 30 days" }).click();
  await expect(spending).toContainText("5 transactions");
  await spending.getByRole("button", { name: "Last 7 days" }).click();
  await expect(spending).toContainText("4 transactions");
  await spending.getByRole("button", { name: "Monthly" }).click();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "test-results/dashboard-spending-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

