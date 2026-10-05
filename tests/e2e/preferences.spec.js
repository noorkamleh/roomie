import { test, expect } from "@playwright/test";

const preferencesKey = "roomie.preferences.v1";
const householdKey = "roomie.household.v1";
const routes = [
  ["/dashboard", "لوحة التحكم"],
  ["/expenses", "المصروفات"],
  ["/bills", "الفواتير"],
  ["/chores", "المهام المنزلية"],
  ["/shopping", "التسوق"],
  ["/members", "الأعضاء"],
];
const initialHousehold = {
  version: 1,
  name: "Preference test home",
  currentUser: "Noor",
  members: [
    { id: "noor", name: "Noor" },
    { id: "sara", name: "Sara" },
  ],
  expenses: [
    {
      id: "tiny",
      title: "Original Coffee",
      amount: 0.01,
      amountCents: 1,
      paidBy: "Noor",
      participants: ["Noor", "Sara"],
      category: "Food",
      date: "2026-10-04",
    },
  ],
  bills: [
    {
      id: "internet",
      title: "Original Internet",
      amount: 80,
      dueDate: "2026-10-05",
      status: "pending",
    },
  ],
  chores: [
    {
      id: "task",
      title: "Original Task",
      assignedTo: "Noor",
      dueDate: "2026-10-04",
      status: "pending",
    },
  ],
  shoppingItems: [
    { id: "milk", name: "Original Milk", quantity: 2, completed: false },
  ],
  settlements: [],
};
const runtimeErrors = new WeakMap();
test.beforeEach(async ({ page }) => {
  const errors = [];
  runtimeErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
  await page.clock.install({ time: new Date("2026-10-04T09:00:00Z") });
  await page.addInitScript(
    ({ key, state }) => {
      if (!localStorage.getItem(key))
        localStorage.setItem(key, JSON.stringify(state));
    },
    { key: householdKey, state: initialHousehold },
  );
});
test.afterEach(async ({ page }) => expect(runtimeErrors.get(page)).toEqual([]));

const savedHousehold = (page) =>
  page.evaluate((key) => JSON.parse(localStorage.getItem(key)), householdKey);
const themeOf = (page) => page.locator("html");
const backgroundOf = (page) =>
  page
    .locator(".roomie-app")
    .evaluate((element) => getComputedStyle(element).backgroundColor);

test("Arabic switching updates direction and navigation on every page while preserving user text", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await page
    .getByRole("combobox", { name: "Language", exact: true })
    .selectOption("ar");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  const navigation = page.getByRole("navigation", {
    name: "التنقل الرئيسي",
    exact: true,
  });
  for (const [path, label] of routes) {
    await navigation.getByRole("link", { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.getByRole("heading", { level: 1 }).first()).toContainText(
      /[\u0600-\u06ff]/,
    );
    await expect(
      page.getByRole("combobox", { name: "اللغة", exact: true }),
    ).toHaveValue("ar");
  }
  await page.goto("/expenses");
  await expect(
    page.getByRole("heading", { name: "Original Coffee", exact: true }),
  ).toBeVisible();
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Noor");
  await expect(page.locator(".dashboard-household-label")).toContainText(
    "Preference test home",
  );
  await expect(page.locator(".dashboard-household-label")).toContainText(
    "أكتوبر",
  );
  await page
    .getByRole("combobox", { name: "اللغة", exact: true })
    .selectOption("en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(
    page.getByRole("link", { name: "Dashboard", exact: true }),
  ).toBeVisible();
});

test("theme, language and currency persist and synchronize across two tabs", async ({
  page,
  context,
}) => {
  await page.goto("/dashboard");
  const lightBackground = await backgroundOf(page);
  const otherTab = await context.newPage();
  const otherErrors = [];
  otherTab.on("pageerror", (error) => otherErrors.push(error.message));
  await otherTab.goto("/expenses");
  await page
    .getByRole("button", { name: "Switch to dark mode", exact: true })
    .click();
  await expect(themeOf(page)).toHaveAttribute("data-theme", "dark");
  await expect(themeOf(otherTab)).toHaveAttribute("data-theme", "dark");
  expect(await backgroundOf(page)).not.toBe(lightBackground);
  expect(
    await page
      .locator("html")
      .evaluate((element) => getComputedStyle(element).colorScheme),
  ).toBe("dark");
  await page
    .getByRole("combobox", { name: "Language", exact: true })
    .selectOption("ar");
  await expect(otherTab.locator("html")).toHaveAttribute("dir", "rtl");
  await otherTab
    .getByRole("combobox", { name: "العملة", exact: true })
    .selectOption("USD");
  await expect(
    page.getByRole("combobox", { name: "العملة", exact: true }),
  ).toHaveValue("USD");
  await page.reload();
  await expect(themeOf(page)).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(
    page.getByRole("combobox", { name: "العملة", exact: true }),
  ).toHaveValue("USD");
  await page.screenshot({
    path: "test-results/preferences-ar-dark-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "تفعيل الوضع الفاتح", exact: true })
    .click();
  await expect(themeOf(otherTab)).toHaveAttribute("data-theme", "light");
  expect(await backgroundOf(page)).toBe(lightBackground);
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)),
      preferencesKey,
    ),
  ).toEqual({
    version: 1,
    language: "ar",
    currency: "USD",
    theme: "light",
  });
  expect(otherErrors).toEqual([]);
  await otherTab.close();
});

test("a dollar expense stores converted SAR cents and switches display without changing data", async ({
  page,
}) => {
  await page.goto("/expenses");
  await page
    .getByRole("combobox", { name: "Currency", exact: true })
    .selectOption("USD");
  await page.getByRole("button", { name: "Add expense", exact: true }).click();
  const form = page.getByRole("dialog", { name: "Add expense", exact: true });
  await form.getByLabel("Title", { exact: true }).fill("Dollar purchase");
  await form.getByLabel("Amount ($)", { exact: true }).fill("25.40");
  await form.getByLabel("Date", { exact: true }).fill("2026-10-04");
  await form.getByRole("button", { name: "Add expense", exact: true }).click();
  await expect(form).toHaveCount(0);
  const card = page
    .locator(".expense-card")
    .filter({
      has: page.getByRole("heading", { name: "Dollar purchase", exact: true }),
    });
  await expect(card.locator(".expense-amount")).toContainText("25.40");
  await expect(card.locator(".expense-amount")).toContainText("$");
  const saved = await savedHousehold(page);
  expect(
    saved.expenses.find((expense) => expense.title === "Dollar purchase"),
  ).toMatchObject({ amount: 95.25, amountCents: 9525 });
  await page
    .getByRole("combobox", { name: "Currency", exact: true })
    .selectOption("SAR");
  await expect(card.locator(".expense-amount")).toContainText("95.25");
  await expect(card.locator(".expense-amount")).toContainText("SAR");
  await page.reload();
  expect(await savedHousehold(page)).toEqual(saved);
});

test("editing a tiny SAR expense in dollars keeps its original cent when the amount is untouched", async ({
  page,
}) => {
  await page.goto("/expenses");
  await page
    .getByRole("combobox", { name: "Currency", exact: true })
    .selectOption("USD");
  const card = page
    .locator(".expense-card")
    .filter({
      has: page.getByRole("heading", { name: "Original Coffee", exact: true }),
    });
  await card
    .getByRole("button", { name: "Edit Original Coffee", exact: true })
    .click();
  const form = page.getByRole("dialog", { name: "Edit expense", exact: true });
  await expect(form.getByLabel("Amount ($)", { exact: true })).toHaveValue("0");
  await form.getByLabel("Title", { exact: true }).fill("Renamed tiny expense");
  await form.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(form).toHaveCount(0);
  expect((await savedHousehold(page)).expenses[0]).toMatchObject({
    title: "Renamed tiny expense",
    amount: 0.01,
    amountCents: 1,
  });
  await page.reload();
  expect((await savedHousehold(page)).expenses[0].amountCents).toBe(1);
});

test("Arabic pages and forms fit a mobile viewport in dark dollar mode", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dashboard");
  await page
    .getByRole("combobox", { name: "Language", exact: true })
    .selectOption("ar");
  await page
    .getByRole("combobox", { name: "العملة", exact: true })
    .selectOption("USD");
  await page
    .getByRole("button", { name: "تفعيل الوضع الداكن", exact: true })
    .click();
  await page.screenshot({
    path: "test-results/preferences-ar-dark-mobile.png",
    fullPage: true,
  });
  for (const [path] of routes) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.goto("/expenses");
  await page.getByRole("button", { name: "إضافة مصروف", exact: true }).click();
  const form = page.getByRole("dialog");
  await expect(form).toBeVisible();
  expect(
    await form.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
  ).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/preferences-ar-dark-form.png",
    fullPage: true,
  });
});

test("malformed saved preferences recover to English, SAR and light mode", async ({
  page,
}) => {
  await page.addInitScript(
    (key) => localStorage.setItem(key, "{broken preferences"),
    preferencesKey,
  );
  await page.goto("/dashboard");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(
    page.getByRole("combobox", { name: "Currency", exact: true }),
  ).toHaveValue("SAR");
});

test("preference updates retain changes from a tab whose storage events have not arrived", async ({
  page,
  context,
}) => {
  await page.goto("/dashboard");
  const other = await context.newPage();
  await other.addInitScript(() => {
    window.addEventListener("storage", (event) =>
      event.stopImmediatePropagation(),
    );
  });
  await other.goto("/expenses");
  await page
    .getByRole("combobox", { name: "Language", exact: true })
    .selectOption("ar");
  await page
    .getByRole("button", { name: "تفعيل الوضع الداكن", exact: true })
    .click();
  await expect(other.locator("html")).toHaveAttribute("lang", "en");
  await other
    .getByRole("combobox", { name: "Currency", exact: true })
    .selectOption("USD");
  await expect(other.locator("html")).toHaveAttribute("lang", "ar");
  await expect(other.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(
    page.getByRole("combobox", { name: "العملة", exact: true }),
  ).toHaveValue("USD");

  await page.evaluate((key) => {
    window.dispatchEvent(
      new StorageEvent("storage", {
        key,
        storageArea: localStorage,
        newValue: JSON.stringify({
          version: 1,
          language: "en",
          currency: "SAR",
          theme: "light",
        }),
      }),
    );
  }, preferencesKey);
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(
    page.getByRole("combobox", { name: "العملة", exact: true }),
  ).toHaveValue("USD");
  await other.close();
});
