import { test, expect } from "@playwright/test";

test("monthly bill payments preserve history and month-end dates without duplicates across tabs", async ({
  page,
  context,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.clock.install({ time: new Date("2026-01-31T09:00:00Z") });
  const initial = {
    version: 1,
    name: "Monthly bill home",
    currentUser: "Noor",
    members: [
      { id: "noor", name: "Noor" },
      { id: "sara", name: "Sara" },
      { id: "reem", name: "Reem", archived: true },
    ],
    expenses: [],
    bills: [],
    chores: [],
    shoppingItems: [],
    settlements: [],
  };
  await page.addInitScript((state) => {
    if (!localStorage.getItem("roomie.household.v1"))
      localStorage.setItem("roomie.household.v1", JSON.stringify(state));
  }, initial);
  const saved = () =>
    page.evaluate(() =>
      JSON.parse(localStorage.getItem("roomie.household.v1")),
    );
  const card = (tab, dueDate) =>
    tab.locator(".bill-card").filter({
      has: tab.locator(`.bill-card-due time[datetime="${dueDate}"]`),
    });
  await page.goto("/bills");
  await page.getByRole("button", { name: "Add bill", exact: true }).click();
  const form = page.getByRole("dialog", { name: "Add bill", exact: true });
  await form.getByLabel("Bill title").fill("Monthly internet");
  await form.getByLabel("Amount (SAR)").fill("80");
  await form.getByLabel("Due date").fill("2026-01-31");
  await form
    .getByRole("checkbox", { name: "Repeat monthly", exact: true })
    .check();
  await form.getByRole("button", { name: "Add bill", exact: true }).click();
  await expect(card(page, "2026-01-31")).toContainText("Monthly");
  const sourceId = (await saved()).bills[0].id;
  const otherTab = await context.newPage();
  otherTab.on("pageerror", (error) => errors.push(error.message));
  await otherTab.clock.install({ time: new Date("2026-01-31T09:00:00Z") });
  await otherTab.goto("/bills");
  await card(otherTab, "2026-01-31")
    .getByRole("button", { name: "Mark as paid", exact: true })
    .click();
  const stalePayment = otherTab.getByRole("dialog", {
    name: "Pay Monthly internet",
    exact: true,
  });
  await stalePayment.getByLabel("Payment date").fill("2026-01-31");
  await card(page, "2026-01-31")
    .getByRole("button", { name: "Mark as paid", exact: true })
    .click();
  const payment = page.getByRole("dialog", {
    name: "Pay Monthly internet",
    exact: true,
  });
  await expect(
    payment
      .getByRole("combobox", { name: "Paid by", exact: true })
      .getByRole("option", { name: "Reem", exact: true }),
  ).toHaveCount(0);
  await expect(
    payment.getByRole("checkbox", { name: "Reem", exact: true }),
  ).toHaveCount(0);
  await payment.getByLabel("Payment date").fill("2026-01-31");
  await payment
    .getByRole("button", { name: "Confirm payment", exact: true })
    .click();
  await expect(card(page, "2026-02-28")).toBeVisible();
  await expect(card(otherTab, "2026-02-28")).toHaveCount(1);
  await stalePayment
    .getByRole("button", { name: "Confirm payment", exact: true })
    .click();
  await expect(stalePayment).toHaveCount(0);
  let state = await saved();
  expect(state.bills).toHaveLength(2);
  expect(state.expenses).toHaveLength(1);
  expect(
    state.bills.find((bill) => bill.dueDate === "2026-02-28"),
  ).toMatchObject({
    id: `${sourceId}-2026-02-28`,
    seriesId: sourceId,
    status: "pending",
    recurrence: { frequency: "monthly", anchorDay: 31 },
  });
  await expect(card(page, "2026-01-31")).toContainText(
    "Paid by Noor on Jan 31, 2026",
  );
  await expect(
    card(page, "2026-01-31").getByRole("button", {
      name: "Mark as paid",
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(
    card(page, "2026-01-31").getByRole("link", {
      name: "View linked expense",
      exact: true,
    }),
  ).toHaveAttribute(
    "href",
    `/expenses?expense=${encodeURIComponent(`bill-${sourceId}`)}`,
  );
  await page.reload();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(card(page, "2026-01-31")).toContainText("Paid by Noor");
  await card(page, "2026-02-28")
    .getByRole("button", { name: "Mark as paid", exact: true })
    .click();
  await payment
    .getByRole("combobox", { name: "Paid by", exact: true })
    .selectOption("Sara");
  await payment.getByLabel("Payment date").fill("2026-02-28");
  await payment
    .getByRole("button", { name: "Confirm payment", exact: true })
    .click();
  await expect(card(page, "2026-03-31")).toBeVisible();
  await expect(card(page, "2026-02-28")).toContainText(
    "Paid by Sara on Feb 28, 2026",
  );
  state = await saved();
  expect(state.bills).toHaveLength(3);
  expect(state.expenses).toHaveLength(2);
  expect(state.expenses.map((expense) => expense.id)).toEqual(
    expect.arrayContaining([`bill-${sourceId}`, `bill-${sourceId}-2026-02-28`]),
  );
  expect(
    state.expenses.reduce((total, expense) => total + expense.amount, 0),
  ).toBe(160);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.reload();
  await expect(card(page, "2026-03-31")).toBeVisible();
  expect((await saved()).expenses).toHaveLength(2);
  await otherTab.close();
  expect(errors).toEqual([]);
});
