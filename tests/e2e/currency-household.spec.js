import { test, expect } from "@playwright/test";

const householdKey = "roomie.household.v1";
const household = {
  version: 1,
  name: "Currency test home",
  currentUser: "Noor",
  members: [
    { id: "noor", name: "Noor" },
    { id: "sara", name: "Sara" },
  ],
  expenses: [],
  bills: [],
  chores: [],
  shoppingItems: [],
  settlements: [],
};
const runtimeErrors = new WeakMap();

test.beforeEach(async ({ page }) => {
  const errors = [];
  runtimeErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
  await page.clock.install({ time: new Date("2026-10-04T09:00:00Z") });
});
test.afterEach(async ({ page }) => expect(runtimeErrors.get(page)).toEqual([]));

async function seed(page, changes = {}) {
  await page.addInitScript(
    ({ key, state }) => {
      if (!localStorage.getItem(key))
        localStorage.setItem(key, JSON.stringify(state));
    },
    { key: householdKey, state: { ...household, ...changes } },
  );
}
const saved = (page) =>
  page.evaluate((key) => JSON.parse(localStorage.getItem(key)), householdKey);
const currency = (page) =>
  page.getByRole("combobox", { name: "Currency", exact: true });

function debt(amount) {
  return {
    id: "shared-debt",
    title: "Outstanding shared purchase",
    amount,
    amountCents: Math.round(amount * 100),
    paidBy: "Noor",
    participants: ["Sara"],
    date: "2026-10-04",
    category: "Household",
  };
}
async function openRepayment(page) {
  await page.goto("/members");
  await currency(page).selectOption("USD");
  await page
    .getByRole("button", { name: "Partial payment", exact: true })
    .click();
  return page.getByRole("dialog", { name: "Record a repayment", exact: true });
}

test("a new USD bill and its payment store the same converted SAR cents", async ({
  page,
}) => {
  await seed(page);
  await page.goto("/bills");
  await currency(page).selectOption("USD");
  await page.getByRole("button", { name: "Add bill", exact: true }).click();
  const form = page.getByRole("dialog", { name: "Add bill", exact: true });
  await form
    .getByLabel("Bill title", { exact: true })
    .fill("Dollar internet bill");
  await form.getByLabel("Amount ($)", { exact: true }).fill("25.40");
  await form.getByLabel("Due date", { exact: true }).fill("2026-10-05");
  await form.getByRole("button", { name: "Add bill", exact: true }).click();
  await expect(form).toHaveCount(0);
  const card = page.locator("article").filter({
    has: page.getByRole("heading", {
      name: "Dollar internet bill",
      exact: true,
    }),
  });
  await expect(card).toContainText("$25.40");
  let state = await saved(page);
  const bill = state.bills.find(
    (item) => item.title === "Dollar internet bill",
  );
  expect(bill).toMatchObject({
    amount: 95.25,
    amountCents: 9525,
    status: "pending",
  });
  await card.getByRole("button", { name: "Mark as paid", exact: true }).click();
  const payment = page.getByRole("dialog", {
    name: "Pay Dollar internet bill",
    exact: true,
  });
  await payment.getByLabel("Paid by", { exact: true }).selectOption("Sara");
  await payment
    .getByRole("button", { name: "Confirm payment", exact: true })
    .click();
  await expect(payment).toHaveCount(0);
  state = await saved(page);
  expect(state.bills.find((item) => item.id === bill.id).status).toBe("paid");
  expect(
    state.expenses.find((item) => item.id === `bill-${bill.id}`),
  ).toMatchObject({
    title: "Dollar internet bill",
    amount: 95.25,
    amountCents: 9525,
    paidBy: "Sara",
    participants: ["Noor", "Sara"],
  });
  await currency(page).selectOption("SAR");
  await expect(card).toContainText("SAR 95.25");
  await page.reload();
  expect(await saved(page)).toEqual(state);
});

test("a USD shopping purchase rounds to SAR cents and preserves linked items on reload", async ({
  page,
}) => {
  await seed(page, {
    shoppingItems: [
      { id: "milk", name: "Milk", quantity: 2, unit: "L", completed: false },
      { id: "rice", name: "Rice", quantity: 1, unit: "kg", completed: false },
    ],
  });
  await page.goto("/shopping");
  await currency(page).selectOption("USD");
  await page
    .getByRole("button", { name: "Record shopping cost", exact: true })
    .click();
  const form = page.getByRole("dialog", {
    name: "Record shopping cost",
    exact: true,
  });
  await form
    .getByRole("checkbox", { name: "Milk (Qty 2 L)", exact: true })
    .check();
  await form
    .getByRole("checkbox", { name: "Rice (Qty 1 kg)", exact: true })
    .check();
  await form
    .getByLabel("Purchase title", { exact: true })
    .fill("Dollar groceries");
  await form.getByLabel("Total cost (USD)", { exact: true }).fill("12.34");
  await form.getByLabel("Paid by", { exact: true }).selectOption("Sara");
  await form
    .getByRole("button", { name: "Record purchase", exact: true })
    .click();
  await expect(form).toHaveCount(0);
  const state = await saved(page);
  const purchase = state.expenses.find(
    (item) => item.title === "Dollar groceries",
  );
  expect(purchase).toMatchObject({
    amount: 46.28,
    amountCents: 4628,
    category: "Groceries",
    paidBy: "Sara",
    participants: ["Noor", "Sara"],
  });
  expect(purchase.shoppingItems.map((item) => item.id).sort()).toEqual([
    "milk",
    "rice",
  ]);
  expect(
    state.shoppingItems.every(
      (item) => item.completed && item.expenseId === purchase.id,
    ),
  ).toBe(true);
  await page
    .getByRole("link", { name: "View expense for Milk", exact: true })
    .click();
  const details = page.getByRole("dialog", {
    name: "Expense details",
    exact: true,
  });
  await expect(details).toContainText("Dollar groceries");
  await expect(details).toContainText("$12.34");
  await page.keyboard.press("Escape");
  await currency(page).selectOption("SAR");
  const card = page.locator(".expense-card").filter({
    has: page.getByRole("heading", { name: "Dollar groceries", exact: true }),
  });
  await expect(card.locator(".expense-amount")).toContainText("46.28");
  await page.reload();
  expect(await saved(page)).toEqual(state);
});

test("USD repayments enforce their displayed limit and preserve the draft across currency changes", async ({
  page,
  context,
}) => {
  await seed(page, { expenses: [debt(150)] });
  const form = await openRepayment(page);
  const amount = form.getByLabel("Payment amount (USD)", { exact: true });
  await expect(amount).toHaveValue("40");
  await expect(amount).toHaveAttribute("max", "40");
  await amount.fill("40.01");
  await form
    .getByRole("button", { name: "Record payment", exact: true })
    .click();
  await expect(form).toBeVisible();
  expect(await amount.evaluate((input) => input.validity.rangeOverflow)).toBe(
    true,
  );
  expect((await saved(page)).settlements).toHaveLength(0);
  await amount.fill("10");
  const otherTab = await context.newPage();
  const otherErrors = [];
  otherTab.on("pageerror", (error) => otherErrors.push(error.message));
  await otherTab.goto("/members");
  await currency(otherTab).selectOption("SAR");
  await expect(
    form.getByLabel("Payment amount (SAR)", { exact: true }),
  ).toHaveValue("37.5");
  await currency(otherTab).selectOption("USD");
  await expect(amount).toHaveValue("10");
  await form
    .getByRole("button", { name: "Record payment", exact: true })
    .click();
  await expect(form).toHaveCount(0);
  const state = await saved(page);
  expect(state.settlements).toHaveLength(1);
  expect(state.settlements[0]).toMatchObject({
    from: "Sara",
    to: "Noor",
    amount: 37.5,
    amountCents: 3750,
  });
  await expect(page.locator(".members-transfer-amount")).toContainText(
    "$30.00",
  );
  await page.reload();
  expect(await saved(page)).toEqual(state);
  expect(otherErrors).toEqual([]);
  await otherTab.close();
});

for (const [baseAmount, displayAmount] of [
  [0.01, "0"],
  [100000000, "26666666.67"],
]) {
  test(`an untouched USD repayment preserves its original SAR ${baseAmount} balance`, async ({
    page,
  }) => {
    await seed(page, { expenses: [debt(baseAmount)] });
    const form = await openRepayment(page);
    const amount = form.getByLabel("Payment amount (USD)", { exact: true });
    await expect(amount).toHaveValue(displayAmount);
    await expect(amount).toHaveAttribute("max", displayAmount);
    expect(await amount.evaluate((input) => input.checkValidity())).toBe(true);
    await form
      .getByRole("button", { name: "Record payment", exact: true })
      .click();
    await expect(form).toHaveCount(0);
    const state = await saved(page);
    expect(state.settlements).toHaveLength(1);
    expect(state.settlements[0]).toMatchObject({
      from: "Sara",
      to: "Noor",
      amount: baseAmount,
      amountCents: Math.round(baseAmount * 100),
    });
    await expect(
      page.getByText("All balances are settled.", { exact: true }),
    ).toBeVisible();
    await page.reload();
    expect(await saved(page)).toEqual(state);
  });
}
