import { test, expect } from "@playwright/test";

const runtimeErrors = new WeakMap();
test.beforeEach(async ({ page }) => {
  const errors = [];
  runtimeErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
});
test.afterEach(async ({ page }) => {
  expect(runtimeErrors.get(page)).toEqual([]);
});

async function savedExpense(page, title) {
  return page.evaluate((expenseTitle) => {
    const saved = JSON.parse(localStorage.getItem("roomie.household.v1"));
    return saved?.expenses.find((expense) => expense.title === expenseTitle);
  }, title);
}

async function openExpense(page, title, amount) {
  await page.goto("/expenses?add=1");
  const form = page.getByRole("dialog", { name: "Add expense", exact: true });
  await form.getByLabel("Title", { exact: true }).fill(title);
  await form.getByLabel("Amount (SAR)").fill(amount);
  return form;
}

test("exact amounts allow zero shares and preserve custom values through reload and editing", async ({
  page,
}) => {
  const title = "Exact dinner";
  const form = await openExpense(page, title, "100");
  await form.getByLabel("Split method").selectOption("amounts");
  await form.getByLabel("Share for Noor (SAR)").fill("25");
  await form.getByLabel("Share for Sara (SAR)").fill("75");
  await form.getByLabel("Share for Reem (SAR)").fill("0");
  await expect(form.getByText("SAR 25.00", { exact: true })).toBeVisible();
  await expect(form.getByText("SAR 75.00", { exact: true })).toBeVisible();
  await expect(form.getByText("SAR 0.00", { exact: true })).toBeVisible();
  await form.getByRole("button", { name: "Add expense", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  const original = await savedExpense(page, title);
  expect(original.amountCents).toBe(10000);
  expect(original.split).toEqual({
    mode: "amounts",
    sharesCents: { Noor: 2500, Sara: 7500, Reem: 0 },
  });
  await page.getByRole("button", { name: `View split for ${title}` }).click();
  const details = page.getByRole("dialog", { name: `Split for ${title}` });
  await expect(details).toContainText(
    "Split by exact amounts between 3 people",
  );
  await expect(
    details.locator(".expense-share").filter({ hasText: "Reem" }),
  ).toContainText("SAR 0.00");
  await page.keyboard.press("Escape");

  await page.reload();
  await page
    .getByRole("button", { name: `Edit ${title}`, exact: true })
    .click();
  const editing = page.getByRole("dialog", {
    name: "Edit expense",
    exact: true,
  });
  await expect(editing.getByLabel("Split method")).toHaveValue("amounts");
  await expect(editing.getByLabel("Share for Noor (SAR)")).toHaveValue("25");
  await expect(editing.getByLabel("Share for Sara (SAR)")).toHaveValue("75");
  await expect(editing.getByLabel("Share for Reem (SAR)")).toHaveValue("0");
  await editing.getByLabel("Amount (SAR)").fill("110");
  await editing.getByLabel("Share for Sara (SAR)").fill("85");
  await editing.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const changed = await savedExpense(page, title);
  expect(changed.id).toBe(original.id);
  expect(changed.amountCents).toBe(11000);
  expect(changed.split.sharesCents).toEqual({
    Noor: 2500,
    Sara: 8500,
    Reem: 0,
  });
});

test("percentage splits round halalas deterministically and retain percentages when edited", async ({
  page,
}) => {
  const title = "Tiny percentage purchase";
  const form = await openExpense(page, title, "0.03");
  await form.getByLabel("Split method").selectOption("percentages");
  await form.getByLabel("Share for Noor (%)").fill("50");
  await form.getByLabel("Share for Sara (%)").fill("50");
  await form.getByLabel("Share for Reem (%)").fill("0");
  await expect(form.getByText("SAR 0.02", { exact: true })).toBeVisible();
  await expect(form.getByText("SAR 0.01", { exact: true })).toBeVisible();
  await form.getByRole("button", { name: "Add expense", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect((await savedExpense(page, title)).split).toEqual({
    mode: "percentages",
    basisPoints: { Noor: 5000, Sara: 5000, Reem: 0 },
  });

  await page.reload();
  await page.getByRole("button", { name: `View split for ${title}` }).click();
  const details = page.getByRole("dialog", { name: `Split for ${title}` });
  await expect(details).toContainText("Split by percentages between 3 people");
  await expect(
    details.locator(".expense-share").filter({ hasText: "Noor" }),
  ).toContainText("SAR 0.02");
  await expect(
    details.locator(".expense-share").filter({ hasText: "Sara" }),
  ).toContainText("SAR 0.01");
  await expect(
    details.locator(".expense-share").filter({ hasText: "Reem" }),
  ).toContainText("SAR 0.00");
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: `Edit ${title}`, exact: true })
    .click();
  const editing = page.getByRole("dialog", {
    name: "Edit expense",
    exact: true,
  });
  await expect(editing.getByLabel("Split method")).toHaveValue("percentages");
  await expect(editing.getByLabel("Share for Noor (%)")).toHaveValue("50");
  await expect(editing.getByLabel("Share for Sara (%)")).toHaveValue("50");
  await editing.getByLabel("Share for Noor (%)").fill("40");
  await editing.getByLabel("Share for Sara (%)").fill("60");
  await editing.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect((await savedExpense(page, title)).split.basisPoints).toEqual({
    Noor: 4000,
    Sara: 6000,
    Reem: 0,
  });
});

test("invalid custom totals show actionable errors and do not save any records", async ({
  page,
}) => {
  const form = await openExpense(page, "Invalid custom split", "100");
  const before = await page.evaluate(() =>
    localStorage.getItem("roomie.household.v1"),
  );
  await form.getByLabel("Split method").selectOption("amounts");
  for (const member of ["Noor", "Sara", "Reem"])
    await form.getByLabel(`Share for ${member} (SAR)`).fill("30");
  await expect(form.getByRole("status")).toHaveText(
    "Exact shares must add up to the expense amount.",
  );
  await form.getByRole("button", { name: "Add expense", exact: true }).click();
  await expect(form.getByRole("alert")).toHaveText(
    "Exact shares must add up to the expense amount.",
  );
  expect(
    await page.evaluate(() => localStorage.getItem("roomie.household.v1")),
  ).toBe(before);

  await form.getByLabel("Split method").selectOption("percentages");
  for (const member of ["Noor", "Sara", "Reem"])
    await form.getByLabel(`Share for ${member} (%)`).fill("30");
  await expect(form.getByRole("status")).toHaveText(
    "Percentages must add up to 100%.",
  );
  await form.getByRole("button", { name: "Add expense", exact: true }).click();
  await expect(form.getByRole("alert")).toHaveText(
    "Percentages must add up to 100%.",
  );
  expect(
    await page.evaluate(() => localStorage.getItem("roomie.household.v1")),
  ).toBe(before);
  await expect(
    page.getByRole("heading", { name: "Invalid custom split", exact: true }),
  ).toHaveCount(0);
});

test("custom share drafts preserve decimal typing and reject hidden fractional halalas", async ({
  page,
}) => {
  const title = "Precise typed shares";
  const form = await openExpense(page, title, "100");
  await form.getByLabel("Split method").selectOption("amounts");
  const noor = form.getByLabel("Share for Noor (SAR)");
  await noor.fill("10.001");
  await expect(noor).toHaveValue("10.001");
  await expect(form.getByRole("status")).toHaveText(
    "Enter nonnegative shares with at most two decimal places in SAR.",
  );
  await noor.fill("10");
  await noor.press("End");
  await noor.pressSequentially(".25");
  await expect(noor).toHaveValue("10.25");
  await form.getByLabel("Share for Sara (SAR)").fill("89.75");
  await form.getByLabel("Share for Reem (SAR)").fill("0");
  await form.getByRole("button", { name: "Add expense", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect((await savedExpense(page, title)).split.sharesCents).toEqual({
    Noor: 1025,
    Sara: 8975,
    Reem: 0,
  });
});

test("changing participants removes old custom shares and initializes new shares to zero", async ({
  page,
}) => {
  const title = "Selected exact shares";
  const form = await openExpense(page, title, "100");
  await form.getByLabel("Split method").selectOption("amounts");
  await form.getByLabel("Share for Noor (SAR)").fill("25");
  await form.getByLabel("Share for Sara (SAR)").fill("50");
  await form.getByLabel("Share for Reem (SAR)").fill("25");
  await form.getByRole("checkbox", { name: "Reem", exact: true }).uncheck();
  await expect(form.getByLabel("Share for Reem (SAR)")).toHaveCount(0);
  await expect(form.getByRole("status")).toHaveText(
    "Exact shares must add up to the expense amount.",
  );
  await form.getByRole("checkbox", { name: "Reem", exact: true }).check();
  await expect(form.getByLabel("Share for Reem (SAR)")).toHaveValue("0");
  await form.getByRole("checkbox", { name: "Reem", exact: true }).uncheck();
  await form.getByLabel("Share for Sara (SAR)").fill("75");
  await form.getByRole("button", { name: "Add expense", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const entry = await savedExpense(page, title);
  expect(entry.participants).toEqual(["Noor", "Sara"]);
  expect(entry.split.sharesCents).toEqual({ Noor: 2500, Sara: 7500 });

  await page.goto(
    `/expenses?expense=${encodeURIComponent(entry.id)}&source=test`,
  );
  const details = page.getByRole("dialog", {
    name: "Expense details",
    exact: true,
  });
  await expect(details).toContainText(title);
  await expect(details).toContainText(
    "Split by exact amounts between 2 people",
  );
  await expect(
    details.getByRole("button", { name: "Save changes" }),
  ).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page).toHaveURL(/\/expenses\?source=test$/);
});
