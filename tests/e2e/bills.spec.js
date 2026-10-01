import { test, expect } from "@playwright/test";

test("bill filters, adding, and persistence work on desktop and mobile", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.clock.install({ time: new Date("2026-10-02T09:00:00Z") });
  await page.goto("/bills");
  await expect(
    page.getByRole("heading", { name: "Bills", exact: true }),
  ).toBeVisible();
  const filters = page.getByRole("group", { name: "Filter bills" });
  for (const [status, count] of [
    ["pending", 2],
    ["due soon", 1],
    ["overdue", 0],
    ["paid", 1],
    ["all", 4],
  ]) {
    const button = filters.getByRole("button", { name: status, exact: true });
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("article")).toHaveCount(count);
    if (count === 0)
      await expect(page.getByText("No bills in this view.")).toBeVisible();
  }
  const paid = page
    .locator("article")
    .filter({
      has: page.getByRole("heading", {
        name: "Electricity - Previous",
        exact: true,
      }),
    });
  await expect(paid.getByRole("button", { name: "Mark as paid" })).toHaveCount(
    0,
  );
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: "test-results/bills-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/bills-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Add bill", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Add bill", exact: true }).click();
  await page.getByLabel("Bill title").fill("House rent");
  await page.getByLabel("Amount (SAR)").fill("3500");
  await page.getByLabel("Due date").fill("2026-10-01");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Add bill", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await filters.getByRole("button", { name: "overdue", exact: true }).click();
  await expect(page.locator("article")).toHaveCount(1);
  await expect(page.getByText("1 days overdue")).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "House rent", exact: true }),
  ).toBeVisible();
  await expect(page.locator("article")).toHaveCount(5);
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("roomie.household.v1")),
  );
  expect(
    stored.bills.find((bill) => bill.title === "House rent"),
  ).toMatchObject({ amount: 3500, dueDate: "2026-10-01", status: "pending" });
  expect(errors).toEqual([]);
});
