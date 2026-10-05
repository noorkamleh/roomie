import { test, expect } from "@playwright/test";

const storageKey = "roomie.household.v1";
const saved = (page) =>
  page.evaluate((key) => localStorage.getItem(key), storageKey);
const nativeDialogs = new WeakMap();

test.beforeEach(async ({ page }) => {
  const messages = [];
  nativeDialogs.set(page, messages);
  page.on("dialog", async (dialog) => {
    messages.push(dialog.message());
    await dialog.dismiss();
  });
});
test.afterEach(async ({ page }) => expect(nativeDialogs.get(page)).toEqual([]));

for (const language of ["en", "ar"]) {
  test(`in-site confirmation supports safe keyboard dismissal, explicit deletion and mobile layout in ${language}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 740 });
    await page.addInitScript((language) => {
      localStorage.setItem(
        "roomie.preferences.v1",
        JSON.stringify({
          version: 1,
          language,
          theme: "dark",
          currency: "USD",
        }),
      );
    }, language);
    await page.goto("/shopping");
    const before = await saved(page);
    const trigger = page.getByRole("button", {
      name: language === "ar" ? "حذف Milk" : "Delete Milk",
      exact: true,
    });
    const dialog = page.getByRole("dialog", {
      name: language === "ar" ? "حذف عنصر التسوق" : "Delete shopping item",
      exact: true,
    });
    const cancel = dialog.getByRole("button", {
      name: language === "ar" ? "إلغاء" : "Cancel",
      exact: true,
    });
    await expect(trigger).toBeVisible();
    const initialItemCount = await page.getByRole("listitem").count();
    await trigger.click();
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAccessibleDescription(
      language === "ar"
        ? "هل تريد حذف Milk من القائمة؟"
        : "Remove Milk from the list?",
    );
    await expect(cancel).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    expect(await saved(page)).toBe(before);

    await trigger.click();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    expect(await saved(page)).toBe(before);

    await trigger.click();
    await dialog
      .getByRole("button", {
        name: language === "ar" ? "إغلاق النافذة" : "Close dialog",
        exact: true,
      })
      .click();
    await expect(dialog).toHaveCount(0);
    expect(await saved(page)).toBe(before);

    await trigger.click();
    await page.mouse.click(2, 2);
    await expect(dialog).toHaveCount(0);
    expect(await saved(page)).toBe(before);

    await trigger.click();
    expect(
      await dialog.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        return (
          bounds.left >= 0 &&
          bounds.right <= innerWidth &&
          element.scrollWidth <= element.clientWidth
        );
      }),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/confirmation-${language}-dark-mobile.png`,
    });
    await dialog
      .getByRole("button", {
        name: language === "ar" ? "حذف" : "Delete",
        exact: true,
      })
      .click();
    await expect(trigger).toHaveCount(0);
    const after = JSON.parse(await saved(page));
    expect(after.shoppingItems.some((item) => item.name === "Milk")).toBe(
      false,
    );
    expect(after.shoppingItems).toHaveLength(initialItemCount - 1);
    await page.reload();
    await expect(trigger).toHaveCount(0);
  });
}

test("browser navigation cancels an unanswered confirmation without applying its action", async ({
  page,
}) => {
  await page.goto("/expenses");
  await page.getByRole("link", { name: "Shopping", exact: true }).click();
  const before = await saved(page);
  await page.getByRole("button", { name: "Delete Milk", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/expenses$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(await saved(page)).toBe(before);
  await page.goForward();
  await expect(
    page.getByRole("button", { name: "Delete Milk", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("repayment confirmation shows the selected currency and cancellation preserves the ledger", async ({
  page,
}) => {
  await page.goto("/members");
  await page
    .getByRole("combobox", { name: "Currency", exact: true })
    .selectOption("USD");
  const before = await saved(page);
  await page
    .getByRole("list", { name: "Suggested repayments", exact: true })
    .getByRole("button", { name: "Record repayment", exact: true })
    .first()
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Record repayment",
    exact: true,
  });
  await expect(dialog).toContainText("$");
  await expect(dialog).not.toContainText("SAR");
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  expect(await saved(page)).toBe(before);
});
