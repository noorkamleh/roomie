import { test, expect } from "@playwright/test";

test("the richer demo keeps all six layouts usable on desktop and mobile", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.clock.install({ time: new Date("2026-10-04T09:00:00Z") });
  await page.goto("/members?tab=household");
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "Load demo data", exact: true })
    .click();
  await expect(page.locator(".members-household-label")).toContainText(
    "The Garden House",
  );
  for (const route of [
    "dashboard",
    "expenses",
    "bills",
    "chores",
    "shopping",
    "members",
  ]) {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`/${route}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.waitForLoadState("networkidle");
    await page.screenshot({
      path: `test-results/${route}-compact-desktop.png`,
      fullPage: true,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/${route}-compact-mobile.png`,
      fullPage: true,
    });
  }
  await page.goto("/members?tab=household");
  await expect(page.getByLabel("New member name")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
