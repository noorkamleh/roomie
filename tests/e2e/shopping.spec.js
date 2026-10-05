import { respondToConfirmation } from "./helpers/confirmation.js";
import { test, expect } from "@playwright/test";

test.use({ locale: "ar-SA" });

test("shopping filters, purchase toggles, quantity limits and deletion persist", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/shopping");
  const list = page.getByRole("list", { name: "Shopping list" });
  const rows = list.getByRole("listitem");
  const filters = page.getByRole("group", { name: "Filter shopping items" });
  await expect(
    page.getByRole("heading", { name: "Shopping", exact: true }),
  ).toBeVisible();
  for (const [status, count] of [
    ["needed", 3],
    ["bought", 2],
    ["all", 5],
  ]) {
    const button = filters.getByRole("button", {
      name: new RegExp(`^${status}\\b`, "i"),
    });
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(rows).toHaveCount(count);
  }
  await expect(rows.first()).toContainText("Milk");
  await expect(rows.last()).toContainText("Coffee");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "test-results/shopping-desktop.png",
    fullPage: true,
  });
  const milk = list.getByRole("checkbox", {
    name: "Mark Milk as bought",
    exact: true,
  });
  await milk.focus();
  await page.keyboard.press("Space");
  await expect(milk).toBeChecked();
  await page.reload();
  await expect(milk).toBeChecked();
  await filters.getByRole("button", { name: /^Bought\b/ }).click();
  await expect(rows).toHaveCount(3);
  await milk.click();
  await expect(rows).toHaveCount(2);
  await filters.getByRole("button", { name: /^All\b/ }).click();
  const title =
    "Household cleaning supplies and reusable kitchen storage containers";
  await page.getByLabel("Shopping item", { exact: true }).fill(title);
  await page.getByLabel("Quantity", { exact: true }).fill("0");
  await page.getByRole("button", { name: "Add item", exact: true }).click();
  await expect(rows).toHaveCount(5);
  const quantity = page.getByLabel("Quantity", { exact: true });
  for (const invalidQuantity of ["10000", "1.5"]) {
    await quantity.fill(invalidQuantity);
    await page.getByRole("button", { name: "Add item", exact: true }).click();
    await expect(rows).toHaveCount(5);
  }
  for (const localizedQuantity of ["١٢", "۱۲"]) {
    await quantity.fill(localizedQuantity);
    await expect(quantity).toHaveValue("12");
  }
  await page.getByLabel("Quantity", { exact: true }).fill("9999");
  await page.getByRole("button", { name: "Add item", exact: true }).click();
  const added = rows.filter({ hasText: title });
  await expect(added).toContainText("9999");
  await expect(rows).toHaveCount(6);
  await expect(page.getByLabel("Shopping item", { exact: true })).toHaveValue(
    "",
  );
  await expect(page.getByLabel("Quantity", { exact: true })).toHaveValue("1");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "test-results/shopping-mobile.png",
    fullPage: true,
  });
  await added.getByRole("button", { name: `Delete ${title}` }).click();
  await respondToConfirmation(page, false);
  await expect(added).toBeVisible();
  await added.getByRole("button", { name: `Delete ${title}` }).click();
  await respondToConfirmation(page);
  await expect(added).toHaveCount(0);
  await page.reload();
  await expect(rows).toHaveCount(5);
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("roomie.household.v1")),
  );
  expect(saved.shoppingItems.some((item) => item.name === title)).toBe(false);
  expect(
    saved.shoppingItems.find((item) => item.name === "Milk").completed,
  ).toBe(false);
  expect(errors).toEqual([]);
});
