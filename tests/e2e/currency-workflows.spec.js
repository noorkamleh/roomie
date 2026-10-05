import { test, expect } from "@playwright/test";

const householdKey = "roomie.household.v1";
const initialHousehold = {
  version: 1,
  name: "Currency test home",
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
  budgets: [],
};

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-04T09:00:00Z") });
  await page.addInitScript(
    ({ key, state }) => {
      if (!localStorage.getItem(key))
        localStorage.setItem(key, JSON.stringify(state));
      if (!localStorage.getItem("roomie.preferences.v1"))
        localStorage.setItem(
          "roomie.preferences.v1",
          JSON.stringify({
            version: 1,
            language: "en",
            currency: "USD",
            theme: "light",
          }),
        );
    },
    { key: householdKey, state: initialHousehold },
  );
});

const savedHousehold = (page) =>
  page.evaluate((key) => JSON.parse(localStorage.getItem(key)), householdKey);

async function fillDollarShares(form) {
  await form
    .getByLabel("Split method", { exact: true })
    .selectOption("amounts");
  for (const [name, value] of [
    ["Noor", "0.33"],
    ["Sara", "0.33"],
    ["Reem", "0.34"],
  ])
    await form.getByLabel(`Share for ${name} ($)`, { exact: true }).fill(value);
}

test("a dollar amount at a half-halalah boundary stores the correctly rounded total", async ({
  page,
}) => {
  await page.goto("/expenses?add=1");
  const form = page.getByRole("dialog", { name: "Add expense", exact: true });
  await form.getByLabel("Title", { exact: true }).fill("Half-halalah purchase");
  await form.getByLabel("Amount ($)", { exact: true }).fill("0.58");
  await form.getByRole("button", { name: "Add expense", exact: true }).click();
  await expect(form).toHaveCount(0);
  expect((await savedHousehold(page)).expenses[0]).toMatchObject({
    amount: 2.18,
    amountCents: 218,
  });
  await page.reload();
  expect((await savedHousehold(page)).expenses[0].amountCents).toBe(218);
});

test("invalid dollar shares show the selected currency before and after submission", async ({
  page,
}) => {
  await page.goto("/expenses?add=1");
  const form = page.getByRole("dialog", { name: "Add expense", exact: true });
  await form.getByLabel("Title", { exact: true }).fill("Invalid dollar shares");
  await form.getByLabel("Amount ($)", { exact: true }).fill("1");
  await form
    .getByLabel("Split method", { exact: true })
    .selectOption("amounts");
  await form.getByLabel("Share for Noor ($)", { exact: true }).fill("0.001");
  const message =
    "Enter nonnegative shares with at most two decimal places in USD.";
  await expect(form.getByRole("status")).toHaveText(message);
  await form.getByRole("button", { name: "Add expense", exact: true }).click();
  await expect(form.getByRole("alert")).toHaveText(message);
  expect((await savedHousehold(page)).expenses).toEqual([]);
});

test("valid dollar exact shares save one SAR total and survive editing and currency changes", async ({
  page,
}) => {
  await page.goto("/expenses?add=1");
  const form = page.getByRole("dialog", { name: "Add expense", exact: true });
  await form.getByLabel("Title", { exact: true }).fill("Dollar exact split");
  await form.getByLabel("Amount ($)", { exact: true }).fill("1");
  await fillDollarShares(form);
  await expect(form.locator(".expense-split-error")).toHaveCount(0);
  await form.getByRole("button", { name: "Add expense", exact: true }).click();
  await expect(form).toHaveCount(0);
  const original = (await savedHousehold(page)).expenses[0];
  expect(original.amountCents).toBe(375);
  expect(original.split.sharesCents).toEqual({
    Noor: 124,
    Sara: 124,
    Reem: 127,
  });

  await page
    .getByRole("button", { name: "Edit Dollar exact split", exact: true })
    .click();
  const editing = page.getByRole("dialog", {
    name: "Edit expense",
    exact: true,
  });
  await expect(
    editing.getByLabel("Share for Reem ($)", { exact: true }),
  ).toHaveValue("0.34");
  await editing
    .getByRole("button", { name: "Save changes", exact: true })
    .click();
  await expect(editing).toHaveCount(0);
  expect((await savedHousehold(page)).expenses[0]).toEqual(original);
  await page
    .getByRole("combobox", { name: "Currency", exact: true })
    .selectOption("SAR");
  await page.reload();
  expect((await savedHousehold(page)).expenses[0]).toEqual(original);
});

test("a dollar bill payment accepts exact shares without creating an extra SAR cent", async ({
  page,
}) => {
  await page.goto("/bills?add=1");
  const adding = page.getByRole("dialog", { name: "Add bill", exact: true });
  await adding.getByLabel("Bill title", { exact: true }).fill("Dollar bill");
  await adding.getByLabel("Amount ($)", { exact: true }).fill("1");
  await adding.getByRole("button", { name: "Add bill", exact: true }).click();
  await expect(adding).toHaveCount(0);
  await page.getByRole("button", { name: "Mark as paid", exact: true }).click();
  const paying = page.getByRole("dialog", {
    name: "Pay Dollar bill",
    exact: true,
  });
  await fillDollarShares(paying);
  await paying
    .getByRole("button", { name: "Confirm payment", exact: true })
    .click();
  await expect(paying).toHaveCount(0);
  const saved = await savedHousehold(page);
  expect(saved.bills[0]).toMatchObject({ amount: 3.75, status: "paid" });
  expect(saved.expenses[0]).toMatchObject({
    amount: 3.75,
    split: {
      mode: "amounts",
      sharesCents: { Noor: 124, Sara: 124, Reem: 127 },
    },
  });
});

test("unsaved dollar budgets convert on currency switching and save their original base amounts", async ({
  page,
}) => {
  await page.goto("/expenses");
  await page.locator(".expense-budget-manager summary").click();
  await page
    .getByLabel("Monthly household budget ($)", { exact: true })
    .fill("10");
  await page.getByLabel("Groceries budget", { exact: true }).fill("4.43");
  await page
    .getByRole("combobox", { name: "Currency", exact: true })
    .selectOption("SAR");
  await expect(
    page.getByLabel("Monthly household budget (SAR)", { exact: true }),
  ).toHaveValue("37.5");
  await expect(
    page.getByLabel("Groceries budget", { exact: true }),
  ).toHaveValue("16.61");
  await page.getByRole("button", { name: "Save budgets", exact: true }).click();
  await expect(page.getByText("Budgets saved.", { exact: true })).toBeVisible();
  expect((await savedHousehold(page)).budgets[0]).toMatchObject({
    month: "2026-10",
    totalCents: 3750,
    categories: { Groceries: 1661 },
  });
});

test("editing an existing tiny budget in dollars preserves its SAR cent limits", async ({
  page,
}) => {
  await page.goto("/expenses");
  await page.evaluate((key) => {
    const saved = JSON.parse(localStorage.getItem(key));
    saved.budgets = [
      { month: "2026-10", totalCents: 1, categories: { Food: 1 } },
    ];
    localStorage.setItem(key, JSON.stringify(saved));
  }, householdKey);
  await page.reload();
  await page.locator(".expense-budget-manager summary").click();
  await expect(
    page.getByLabel("Monthly household budget ($)", { exact: true }),
  ).toHaveValue("0");
  await expect(page.getByLabel("Food budget", { exact: true })).toHaveValue(
    "0",
  );
  await page.getByRole("button", { name: "Save budgets", exact: true }).click();
  await expect(page.getByText("Budgets saved.", { exact: true })).toBeVisible();
  expect((await savedHousehold(page)).budgets[0]).toEqual({
    month: "2026-10",
    totalCents: 1,
    categories: { Food: 1 },
  });
});
