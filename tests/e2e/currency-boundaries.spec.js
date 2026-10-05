import { test, expect } from "@playwright/test";

const householdKey = "roomie.household.v1";
const initialHousehold = {
  version: 1,
  name: "Currency boundary home",
  currentUser: "Noor",
  members: [
    { id: "noor", name: "Noor" },
    { id: "sara", name: "Sara" },
  ],
  expenses: [],
  bills: [],
  chores: [],
  settlements: [],
  shoppingItems: [{ id: "milk", name: "Milk", quantity: 1, completed: true }],
};

test.beforeEach(async ({ page }) => {
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

async function openShoppingPurchase(page) {
  await page
    .getByRole("button", { name: "Record shopping cost", exact: true })
    .click();
  return page.getByRole("dialog", {
    name: "Record shopping cost",
    exact: true,
  });
}

test("a new dollar purchase cannot exceed the SAR storage limit through a rounded display maximum", async ({
  page,
}) => {
  await page.goto("/shopping");
  const form = await openShoppingPurchase(page);
  const amount = form.getByLabel("Total cost (USD)", { exact: true });
  await expect(amount).toHaveAttribute("max", "26666666.66");
  await amount.fill("26666666.67");
  expect(await amount.evaluate((input) => input.validity.rangeOverflow)).toBe(
    true,
  );
  await form
    .getByRole("button", { name: "Record purchase", exact: true })
    .click();
  await expect(form).toBeVisible();
  expect((await savedHousehold(page)).expenses).toEqual([]);
  await amount.fill("26666666.66");
  await form
    .getByRole("button", { name: "Record purchase", exact: true })
    .click();
  await expect(form).toHaveCount(0);
  expect((await savedHousehold(page)).expenses[0]).toMatchObject({
    amount: 99999999.98,
    amountCents: 9999999998,
  });
});

test("switching a maximum SAR purchase draft to dollars preserves its valid original base amount", async ({
  page,
  context,
}) => {
  await page.goto("/shopping");
  await page
    .getByRole("combobox", { name: "Currency", exact: true })
    .selectOption("SAR");
  const form = await openShoppingPurchase(page);
  await form.getByLabel("Total cost (SAR)", { exact: true }).fill("100000000");
  const otherTab = await context.newPage();
  await otherTab.goto("/shopping");
  await otherTab
    .getByRole("combobox", { name: "Currency", exact: true })
    .selectOption("USD");
  const converted = form.getByLabel("Total cost (USD)", { exact: true });
  await expect(converted).toHaveValue("26666666.67");
  await expect(converted).toHaveAttribute("max", "26666666.67");
  expect(await converted.evaluate((input) => input.validity.valid)).toBe(true);
  await form
    .getByRole("button", { name: "Record purchase", exact: true })
    .click();
  await expect(form).toHaveCount(0);
  expect((await savedHousehold(page)).expenses[0]).toMatchObject({
    amount: 100000000,
    amountCents: 10000000000,
  });
  await otherTab.close();
});
