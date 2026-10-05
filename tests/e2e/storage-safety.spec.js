import { test, expect } from "@playwright/test";

const householdKey = "roomie.household.v1";
const changedMessage =
  "Your household changed in another tab. Review the latest data and try again.";
const corruptMessage =
  "Saved data could not be read. Your original data has been kept; changes will not overwrite it.";
const household = {
  version: 1,
  name: "Storage safety home",
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
});
test.afterEach(async ({ page }) => expect(runtimeErrors.get(page)).toEqual([]));

async function seed(page, state = household) {
  await page.addInitScript(
    ({ key, value }) => {
      if (localStorage.getItem(key) === null) localStorage.setItem(key, value);
    },
    { key: householdKey, value: JSON.stringify(state) },
  );
}
async function addItem(page, name) {
  await page.getByLabel("Shopping item", { exact: true }).fill(name);
  await page.getByRole("button", { name: "Add item", exact: true }).click();
}
const saved = (page) =>
  page.evaluate((key) => JSON.parse(localStorage.getItem(key)), householdKey);

async function deferStorageEvents(page) {
  await page.addInitScript((key) => {
    window.__deferHouseholdStorage = false;
    window.__pendingHouseholdEvents = [];
    window.addEventListener(
      "storage",
      (event) => {
        if (
          window.__deferHouseholdStorage &&
          (event.key === key || event.key === null)
        ) {
          event.stopImmediatePropagation();
          window.__pendingHouseholdEvents.push({
            key: event.key,
            oldValue: event.oldValue,
            newValue: event.newValue,
            url: event.url,
          });
        }
      },
      true,
    );
  }, householdKey);
}

test("a delayed storage event cannot cause a stale tab to overwrite another tab or erase newer undo", async ({
  page,
  context,
}) => {
  await seed(page);
  await page.goto("/shopping");
  const stale = await context.newPage();
  const staleErrors = [];
  stale.on("pageerror", (error) => staleErrors.push(error.message));
  await deferStorageEvents(stale);
  await stale.goto("/shopping");
  await stale.evaluate(() => {
    window.__deferHouseholdStorage = true;
  });

  await addItem(page, "Other tab coffee");
  await expect(
    page.getByText("Other tab coffee", { exact: true }),
  ).toBeVisible();
  await expect
    .poll(() => stale.evaluate(() => window.__pendingHouseholdEvents.length))
    .toBeGreaterThan(0);
  await expect(
    stale.getByText("Other tab coffee", { exact: true }),
  ).toHaveCount(0);
  await addItem(stale, "Stale tab milk");
  await expect(stale.getByRole("alert")).toHaveText(changedMessage);
  await expect(
    stale.getByText("Other tab coffee", { exact: true }),
  ).toBeVisible();
  expect((await saved(stale)).shoppingItems.map((item) => item.name)).toEqual([
    "Other tab coffee",
  ]);
  await expect(stale.getByLabel("Shopping item", { exact: true })).toHaveValue(
    "Stale tab milk",
  );

  await stale.getByRole("button", { name: "Add item", exact: true }).click();
  await expect(
    stale.getByText("Stale tab milk", { exact: true }),
  ).toBeVisible();
  const latest = await saved(stale);
  expect(new Set(latest.shoppingItems.map((item) => item.name))).toEqual(
    new Set(["Other tab coffee", "Stale tab milk"]),
  );

  await stale.evaluate(() => {
    window.__deferHouseholdStorage = false;
    for (const event of window.__pendingHouseholdEvents.splice(0)) {
      window.dispatchEvent(
        new StorageEvent("storage", { ...event, storageArea: localStorage }),
      );
    }
  });
  await expect(
    stale.getByText("Stale tab milk", { exact: true }),
  ).toBeVisible();
  await expect(
    stale.getByRole("button", { name: "Undo", exact: true }),
  ).toBeVisible();
  expect(await saved(stale)).toEqual(latest);

  // A same-key sessionStorage event must not change household undo either.
  await stale.evaluate((key) => {
    window.dispatchEvent(
      new StorageEvent("storage", {
        key,
        storageArea: sessionStorage,
        newValue: "irrelevant session data",
      }),
    );
  }, householdKey);
  await stale.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(stale.getByText("Stale tab milk", { exact: true })).toHaveCount(
    0,
  );
  await expect(
    stale.getByText("Other tab coffee", { exact: true }),
  ).toBeVisible();
  expect((await saved(stale)).shoppingItems.map((item) => item.name)).toEqual([
    "Other tab coffee",
  ]);
  expect(staleErrors).toEqual([]);
  await stale.close();
});

for (const operation of ["removeItem", "clear"]) {
  test(`an actual cross-tab ${operation} event resets saved data without resurrecting removed records`, async ({
    page,
    context,
  }) => {
    await seed(page);
    await page.goto("/shopping");
    await addItem(page, "Deleted household marker");
    await expect(
      page.getByText("Deleted household marker", { exact: true }),
    ).toBeVisible();
    const other = await context.newPage();
    await other.goto("/shopping");
    await other.evaluate(
      ({ key, action }) => {
        if (action === "clear") localStorage.clear();
        else localStorage.removeItem(key);
      },
      { key: householdKey, action: operation },
    );

    await expect(
      page.getByText("Deleted household marker", { exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Undo", exact: true }),
    ).toHaveCount(0);
    expect(
      await page.evaluate((key) => localStorage.getItem(key), householdKey),
    ).toBe(null);
    await addItem(page, "New household marker");
    await expect(
      page.getByText("New household marker", { exact: true }),
    ).toBeVisible();
    const state = await saved(page);
    expect(
      state.shoppingItems.some(
        (item) => item.name === "Deleted household marker",
      ),
    ).toBe(false);
    expect(
      state.shoppingItems.some((item) => item.name === "New household marker"),
    ).toBe(true);
    await other.close();
  });
}

test("valid data restored by another tab unblocks a household initially loaded from corrupt storage", async ({
  page,
  context,
}) => {
  await page.addInitScript((key) => {
    if (localStorage.getItem(key) === null)
      localStorage.setItem(key, "{broken original household data");
  }, householdKey);
  await page.goto("/shopping");
  await expect(page.getByRole("alert")).toHaveText(corruptMessage);
  const originalRaw = await page.evaluate(
    (key) => localStorage.getItem(key),
    householdKey,
  );
  await addItem(page, "Blocked item");
  expect(
    await page.evaluate((key) => localStorage.getItem(key), householdKey),
  ).toBe(originalRaw);

  const other = await context.newPage();
  await other.goto("/shopping");
  await other.evaluate(
    ({ key, state }) => localStorage.setItem(key, JSON.stringify(state)),
    { key: householdKey, state: household },
  );
  await expect(page.locator('.roomie-main > p[role="alert"]')).toHaveCount(0);
  await page
    .getByLabel("Shopping item", { exact: true })
    .fill("Recovered item");
  await page.getByRole("button", { name: "Add item", exact: true }).click();
  await expect(page.getByText("Recovered item", { exact: true })).toBeVisible();
  await expect(page.getByRole("alert")).toHaveCount(0);
  const state = await saved(page);
  expect(state.name).toBe(household.name);
  expect(state.shoppingItems.map((item) => item.name)).toEqual([
    "Recovered item",
  ]);
  await other.close();
});
