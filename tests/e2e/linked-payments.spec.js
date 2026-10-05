import { test, expect } from "@playwright/test";

const runtimeErrors = new WeakMap();
test.beforeEach(async ({ page }) => {
  const errors = [];
  runtimeErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
});
test.afterEach(async ({ page }) => expect(runtimeErrors.get(page)).toEqual([]));

const household = (overrides = {}) => ({
  version: 1,
  name: "Payment test home",
  currentUser: "Noor",
  members: [
    { id: "noor", name: "Noor" },
    { id: "sara", name: "Sara" },
    { id: "reem", name: "Reem" },
  ],
  expenses: [],
  bills: [],
  chores: [],
  shoppingItems: [],
  settlements: [],
  ...overrides,
});
const expense = (id, amount, paidBy, participants) => ({
  id,
  title: `Shared purchase ${id}`,
  amount,
  amountCents: Math.round(amount * 100),
  paidBy,
  participants,
  category: "Groceries",
  date: "2026-10-01",
});
const seed = async (page, state) => {
  await page.addInitScript((initial) => {
    const key = "roomie.household.v1";
    if (localStorage.getItem(key) === null)
      localStorage.setItem(key, JSON.stringify(initial));
  }, state);
};
const saved = (page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("roomie.household.v1")));
const memberCard = (page, name) =>
  page
    .locator(".member-card")
    .filter({ has: page.getByRole("heading", { name, exact: true }) });

test("partial repayments retain expense spending, reduce the remaining balance, and persist their payment date", async ({
  page,
}) => {
  await seed(
    page,
    household({ expenses: [expense("shared", 80, "Noor", ["Sara"])] }),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/members");
  const before = await saved(page);
  const transfers = page.getByRole("list", {
    name: "Suggested repayments",
    exact: true,
  });
  await expect(transfers.getByRole("listitem")).toHaveCount(1);
  await expect(transfers).toContainText("SAR 80.00");
  await transfers
    .getByRole("button", { name: "Partial payment", exact: true })
    .click();
  const payment = page.getByRole("dialog", {
    name: "Record a repayment",
    exact: true,
  });
  await expect(payment.getByLabel("Who paid")).toHaveValue("Sara");
  await expect(payment.getByLabel("Paid to")).toHaveValue("Noor");
  await expect(payment.getByLabel("Payment amount (SAR)")).toHaveAttribute(
    "max",
    "80",
  );
  await payment.getByLabel("Payment amount (SAR)").fill("30");
  await payment.getByLabel("Payment date").fill("2026-10-03");
  await expect(payment).toContainText(
    "Remaining after this payment: SAR 50.00",
  );
  expect(
    await payment.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
  ).toBe(true);
  await payment
    .getByRole("button", { name: "Record payment", exact: true })
    .click();
  await expect(payment).toHaveCount(0);
  await expect(transfers).toContainText("SAR 50.00");
  await expect(memberCard(page, "Noor")).toContainText("SAR 50.00");
  await expect(memberCard(page, "Sara")).toContainText("SAR 50.00");
  const history = page.getByRole("list", {
    name: "Repayment history",
    exact: true,
  });
  await expect(history.getByRole("listitem")).toHaveCount(1);
  await expect(history).toContainText("SAR 30.00");
  await expect(history.locator("time")).toHaveAttribute(
    "datetime",
    "2026-10-03",
  );
  const state = await saved(page);
  expect(state.expenses).toEqual(before.expenses);
  expect(state.settlements).toHaveLength(1);
  expect(state.settlements[0]).toMatchObject({
    from: "Sara",
    to: "Noor",
    amount: 30,
    amountCents: 3000,
    date: "2026-10-03",
  });
  await page.reload();
  await expect(transfers).toContainText("SAR 50.00");
  await expect(history.locator("time")).toHaveAttribute(
    "datetime",
    "2026-10-03",
  );
  await page.goto("/expenses");
  await expect(
    page.getByRole("region", { name: "Total recorded expenses" }),
  ).toContainText("SAR 80.00");
  await expect(page.locator(".expense-card")).toHaveCount(1);
});

test("debt simplification switches payment routes without changing balances or original expenses", async ({
  page,
}) => {
  await seed(
    page,
    household({
      expenses: [
        expense("first", 50, "Noor", ["Sara"]),
        expense("second", 50, "Reem", ["Noor"]),
      ],
    }),
  );
  await page.goto("/members");
  const before = await saved(page);
  await expect(page.locator(".member-card-balance")).toHaveCount(
    before.members.length,
  );
  const balances = await page.locator(".member-card-balance").allTextContents();
  const simplify = page.getByRole("checkbox", {
    name: "Simplify debts",
    exact: true,
  });
  const transfers = page.getByRole("list", {
    name: "Suggested repayments",
    exact: true,
  });
  await expect(simplify).toBeChecked();
  await expect(transfers.getByRole("listitem")).toHaveCount(1);
  await expect(transfers.locator(".members-transfer-route")).toContainText(
    "Sara",
  );
  await expect(transfers.locator(".members-transfer-route")).toContainText(
    "Reem",
  );
  await expect(transfers.locator(".members-transfer-route")).not.toContainText(
    "Noor",
  );
  await simplify.uncheck();
  await expect(transfers.getByRole("listitem")).toHaveCount(2);
  const saraRoute = transfers.getByRole("listitem").filter({ hasText: "Sara" });
  const reemRoute = transfers.getByRole("listitem").filter({ hasText: "Reem" });
  await expect(saraRoute).toContainText("Noor");
  await expect(reemRoute).toContainText("Noor");
  expect(await page.locator(".member-card-balance").allTextContents()).toEqual(
    balances,
  );
  let state = await saved(page);
  expect(state.simplifyDebts).toBe(false);
  expect(state.expenses).toEqual(before.expenses);
  expect(state.settlements).toEqual([]);
  await page.reload();
  await expect(simplify).not.toBeChecked();
  await expect(transfers.getByRole("listitem")).toHaveCount(2);
  await simplify.check();
  await expect(transfers.getByRole("listitem")).toHaveCount(1);
  expect(await page.locator(".member-card-balance").allTextContents()).toEqual(
    balances,
  );
  state = await saved(page);
  expect(state.simplifyDebts).toBe(true);
  expect(state.expenses).toEqual(before.expenses);
  await page.reload();
  await expect(simplify).toBeChecked();
  await expect(transfers.getByRole("listitem")).toHaveCount(1);
  page.once("dialog", (dialog) => dialog.accept());
  await transfers
    .getByRole("button", { name: "Record repayment", exact: true })
    .click();
  await expect(transfers.getByRole("listitem")).toHaveCount(0);
  await expect(page.locator(".member-card--settled")).toHaveCount(3);
  await simplify.uncheck();
  await expect(transfers.getByRole("listitem")).toHaveCount(0);
  await page.reload();
  await expect(simplify).not.toBeChecked();
  await expect(transfers.getByRole("listitem")).toHaveCount(0);
  expect((await saved(page)).expenses).toEqual(before.expenses);
});

test("a paid bill shows its payer and date and opens the linked expense with exact split details", async ({
  page,
}) => {
  await seed(
    page,
    household({
      bills: [
        {
          id: "internet",
          title: "Shared internet",
          amount: 80,
          amountCents: 8000,
          dueDate: "2026-10-08",
          status: "pending",
          utilityKind: "internet",
        },
      ],
    }),
  );
  await page.goto("/bills");
  const card = page.locator(".bill-card").filter({
    has: page.getByRole("heading", { name: "Shared internet", exact: true }),
  });
  await card.getByRole("button", { name: "Mark as paid", exact: true }).click();
  const payment = page.getByRole("dialog", {
    name: "Pay Shared internet",
    exact: true,
  });
  await payment.getByLabel("Paid by").selectOption("Reem");
  await payment.getByLabel("Payment date").fill("2026-10-03");
  await payment.getByRole("checkbox", { name: "Reem", exact: true }).uncheck();
  await payment.getByLabel("Split method").selectOption("amounts");
  await payment.getByLabel("Share for Noor (SAR)", { exact: true }).fill("30");
  await payment.getByLabel("Share for Sara (SAR)", { exact: true }).fill("50");
  await payment
    .getByRole("button", { name: "Confirm payment", exact: true })
    .click();
  await expect(payment).toHaveCount(0);
  await expect(card).toContainText("Paid by Reem on Oct 3, 2026");
  await expect(
    card.getByRole("button", { name: "Mark as paid", exact: true }),
  ).toHaveCount(0);
  await expect(
    card.getByRole("link", { name: "View linked expense", exact: true }),
  ).toHaveAttribute("href", "/expenses?expense=bill-internet");
  const state = await saved(page);
  expect(state.expenses).toHaveLength(1);
  expect(state.expenses[0]).toMatchObject({
    id: "bill-internet",
    paidBy: "Reem",
    date: "2026-10-03",
    amount: 80,
    participants: ["Noor", "Sara"],
    split: { mode: "amounts", sharesCents: { Noor: 3000, Sara: 5000 } },
  });
  await card
    .getByRole("link", { name: "View linked expense", exact: true })
    .click();
  await expect(page).toHaveURL(/\/expenses\?expense=bill-internet$/);
  const details = page.getByRole("dialog", {
    name: "Expense details",
    exact: true,
  });
  await expect(
    details.getByRole("heading", { name: "Shared internet", exact: true }),
  ).toBeVisible();
  await expect(details).toContainText("paid by Reem");
  await expect(details).toContainText("Split by exact amounts");
  const split = details.getByRole("list", {
    name: "Expense split",
    exact: true,
  });
  await expect(
    split.getByRole("listitem").filter({ hasText: "Noor" }),
  ).toContainText("SAR 30.00");
  await expect(
    split.getByRole("listitem").filter({ hasText: "Sara" }),
  ).toContainText("SAR 50.00");
  await page.reload();
  await expect(details).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(details).toHaveCount(0);
  await expect(page).toHaveURL(/\/expenses$/);
  expect((await saved(page)).expenses).toHaveLength(1);
});

test("one shopping purchase links selected items to its expense and keeps their snapshot after list deletion", async ({
  page,
}) => {
  await seed(
    page,
    household({
      shoppingItems: [
        { id: "milk", name: "Milk", quantity: 2, completed: false },
        { id: "eggs", name: "Eggs", quantity: 3, completed: false },
        { id: "bread", name: "Bread", quantity: 1, completed: false },
      ],
    }),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/shopping");
  await page
    .getByRole("button", { name: "Record shopping cost", exact: true })
    .click();
  const purchase = page.getByRole("dialog", {
    name: "Record shopping cost",
    exact: true,
  });
  const items = purchase.getByRole("group", {
    name: "Purchased items",
    exact: true,
  });
  await items
    .getByRole("checkbox", { name: "Milk (Qty 2)", exact: true })
    .check();
  await items
    .getByRole("checkbox", { name: "Eggs (Qty 3)", exact: true })
    .check();
  await purchase.getByLabel("Purchase title").fill("Weekend groceries");
  await purchase.getByLabel("Total cost (SAR)").fill("100");
  await purchase.getByLabel("Paid by").selectOption("Sara");
  await purchase.getByLabel("Purchase date").fill("2026-10-03");
  expect(
    await purchase.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
  ).toBe(true);
  await purchase
    .getByRole("button", { name: "Record purchase", exact: true })
    .click();
  await expect(purchase).toHaveCount(0);
  const shopping = page.getByRole("list", {
    name: "Shopping list",
    exact: true,
  });
  await expect(
    shopping.getByRole("checkbox", {
      name: "Mark Milk as bought",
      exact: true,
    }),
  ).toBeChecked();
  await expect(
    shopping.getByRole("checkbox", {
      name: "Mark Eggs as bought",
      exact: true,
    }),
  ).toBeChecked();
  await expect(
    shopping.getByRole("checkbox", {
      name: "Mark Bread as bought",
      exact: true,
    }),
  ).not.toBeChecked();
  let state = await saved(page);
  expect(state.expenses).toHaveLength(1);
  const recorded = state.expenses[0];
  expect(recorded).toMatchObject({
    title: "Weekend groceries",
    amount: 100,
    amountCents: 10000,
    paidBy: "Sara",
    date: "2026-10-03",
    shoppingItems: [
      { id: "milk", name: "Milk", quantity: 2 },
      { id: "eggs", name: "Eggs", quantity: 3 },
    ],
  });
  expect(
    state.shoppingItems.filter((item) => item.expenseId === recorded.id),
  ).toHaveLength(2);
  expect(
    state.shoppingItems.find((item) => item.id === "bread").expenseId,
  ).toBeUndefined();
  await page
    .getByRole("button", { name: "Record shopping cost", exact: true })
    .click();
  await expect(items.getByRole("checkbox")).toHaveCount(1);
  await expect(
    items.getByRole("checkbox", { name: "Bread (Qty 1)", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  page.once("dialog", (dialog) => dialog.accept());
  await shopping
    .getByRole("button", { name: "Delete Milk", exact: true })
    .click();
  await expect(
    shopping.getByRole("checkbox", {
      name: "Mark Milk as bought",
      exact: true,
    }),
  ).toHaveCount(0);
  state = await saved(page);
  expect(state.expenses).toEqual([recorded]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const linkedExpense = shopping.getByRole("link", {
    name: "View expense for Eggs",
    exact: true,
  });
  await expect(linkedExpense).toHaveAttribute(
    "href",
    `/expenses?expense=${encodeURIComponent(recorded.id)}`,
  );
  await linkedExpense.click();
  const details = page.getByRole("dialog", {
    name: "Expense details",
    exact: true,
  });
  await expect(
    details.getByRole("heading", { name: "Weekend groceries", exact: true }),
  ).toBeVisible();
  const snapshot = details.getByRole("region", {
    name: "Purchased items",
    exact: true,
  });
  await expect(snapshot.getByRole("listitem")).toHaveCount(2);
  await expect(
    snapshot.getByRole("listitem").filter({ hasText: "Milk" }),
  ).toContainText("Quantity 2");
  await expect(
    snapshot.getByRole("listitem").filter({ hasText: "Eggs" }),
  ).toContainText("Quantity 3");
  await page.reload();
  await expect(snapshot).toContainText("Milk");
  expect((await saved(page)).expenses).toHaveLength(1);
});
