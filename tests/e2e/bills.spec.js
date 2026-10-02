import { test, expect } from "@playwright/test";

test("bill payment records the selected payer, payment date and shares", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.clock.install({ time: new Date("2026-10-02T09:00:00Z") });
  await page.goto("/bills");
  const card = page
    .locator("article")
    .filter({
      has: page.getByRole("heading", { name: "Internet", exact: true }),
    });
  await card.getByRole("button", { name: "Mark as paid" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByLabel("Bill details")).toContainText("Internet");
  await expect(dialog.getByLabel("Bill details")).toContainText("SAR 80.00");
  for (const label of ["Title", "Amount (SAR)", "Category"]) {
    await expect(dialog.getByLabel(label, { exact: true })).toHaveCount(0);
  }
  await dialog.getByLabel("Paid by").selectOption("Reem");
  await dialog.getByLabel("Payment date").fill("2026-10-01");
  for (const member of ["Noor", "Sara", "Reem"]) {
    await dialog.getByRole("checkbox", { name: member, exact: true }).uncheck();
  }
  const confirm = dialog.getByRole("button", { name: "Confirm payment" });
  await expect(confirm).toBeDisabled();
  await expect(dialog.getByRole("alert")).toContainText(
    "Choose at least one member",
  );
  await dialog.getByRole("checkbox", { name: "Noor", exact: true }).check();
  await dialog.getByRole("checkbox", { name: "Sara", exact: true }).check();
  await expect(confirm).toBeEnabled();
  await expect(dialog.getByRole("alert")).toHaveCount(0);
  await expect(dialog.getByText("SAR 40.00", { exact: true })).toHaveCount(2);
  await page.screenshot({ path: "test-results/bill-payment-desktop.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await dialog.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "test-results/bill-payment-mobile.png" });
  await confirm.click();
  await expect(dialog).toHaveCount(0);
  await expect(card.getByText("paid", { exact: true })).toBeVisible();
  await page.reload();
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("roomie.household.v1")),
  );
  const payments = stored.expenses.filter((expense) => expense.id === "bill-2");
  expect(payments).toHaveLength(1);
  expect(payments[0]).toMatchObject({
    title: "Internet",
    amount: 80,
    category: "Bills",
    paidBy: "Reem",
    date: "2026-10-01",
    participants: ["Noor", "Sara"],
  });
  expect(stored.bills.find((bill) => bill.id === "2").status).toBe("paid");
  expect(errors).toEqual([]);
});

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
  await expect(page.locator("article").first()).toContainText("Electricity");
  await expect(page.locator("article").last()).toContainText("Electricity - Previous");
  const filters = page.getByRole("group", { name: "Filter bills" });
  for (const [status, count] of [
    ["pending", 2],
    ["due soon", 1],
    ["overdue", 0],
    ["paid", 1],
    ["all", 4],
  ]) {
    const button = filters.getByRole("button", { name: new RegExp(`^${status} ${count}$`, "i") });
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("article")).toHaveCount(count);
    if (count === 0)
      await expect(page.getByText("No bills in this view.")).toBeVisible();
  }
  const paid = page.locator("article").filter({
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
  await filters.getByRole("button", { name: /^Overdue 1$/i }).click();
  await expect(page.locator("article")).toHaveCount(1);
  await expect(page.getByText("1 day overdue")).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "House rent", exact: true }),
  ).toBeVisible();
  await expect(page.locator("article")).toHaveCount(5);
  await expect(page.locator("article").first()).toContainText("House rent");
  await expect(page.locator("article").last()).toContainText("Electricity - Previous");
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("roomie.household.v1")),
  );
  expect(
    stored.bills.find((bill) => bill.title === "House rent"),
  ).toMatchObject({ amount: 3500, dueDate: "2026-10-01", status: "pending" });
  expect(errors).toEqual([]);
});
