import { test, expect } from "@playwright/test";

const routes = [
  "/dashboard",
  "/expenses",
  "/bills",
  "/chores",
  "/shopping",
  "/members",
  "/members?tab=household",
];

for (const language of ["en", "ar"]) {
  test(`all pages fit a 320px viewport in ${language}`, async ({ page }) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.clock.install({ time: new Date("2026-10-04T09:00:00Z") });
    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto("/members?tab=household");
    page.once("dialog", (dialog) => dialog.accept());
    await page
      .getByRole("button", { name: "Load demo data", exact: true })
      .click();
    await page
      .getByRole("combobox", { name: "Language", exact: true })
      .selectOption(language);

    for (const route of routes) {
      await page.goto(route);
      await expect(
        page.getByRole("heading", { level: 1 }).first(),
      ).toBeVisible();
      await expect(page.locator("html")).toHaveAttribute(
        "dir",
        language === "ar" ? "rtl" : "ltr",
      );
      const dimensions = await page.locator("main").evaluate((element) => ({
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: innerWidth,
        mainWidth: element.clientWidth,
        mainContentWidth: element.scrollWidth,
      }));
      expect(
        dimensions.documentWidth,
        `${route}: document overflow`,
      ).toBeLessThanOrEqual(dimensions.viewportWidth);
      expect(
        dimensions.mainContentWidth,
        `${route}: clipped main content`,
      ).toBeLessThanOrEqual(dimensions.mainWidth);
      const clippedControls = await page
        .locator(
          "main button:visible, main input:visible, main select:visible, main a:visible",
        )
        .evaluateAll((elements) =>
          elements.flatMap((element) => {
            const rect = element.getBoundingClientRect();
            return rect.left < -1 || rect.right > innerWidth + 1
              ? [
                  {
                    label:
                      element.getAttribute("aria-label") || element.textContent,
                    left: rect.left,
                    right: rect.right,
                  },
                ]
              : [];
          }),
        );
      expect(clippedControls, `${route}: controls outside viewport`).toEqual(
        [],
      );
    }
    expect(errors).toEqual([]);
  });

  test(`a failed lazy page keeps navigation and offers a working reload in ${language}`, async ({
    page,
  }) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/dashboard");
    await page
      .getByRole("combobox", { name: "Language", exact: true })
      .selectOption(language);
    const navigationName =
      language === "ar" ? "التنقل الرئيسي" : "Main navigation";
    const expenseName = language === "ar" ? "المصروفات" : "Expenses";
    const billName = language === "ar" ? "الفواتير" : "Bills";
    const failureTitle =
      language === "ar"
        ? "تعذّر تحميل هذه الصفحة."
        : "Couldn't load this page.";
    const reloadName = language === "ar" ? "إعادة تحميل الصفحة" : "Reload page";
    const navigation = page.getByRole("navigation", {
      name: navigationName,
      exact: true,
    });
    const expenseModule = (url) =>
      url.pathname === "/src/features/expenses/pages/Expenses.tsx" ||
      /\/assets\/Expenses-[^/]+\.js$/.test(url.pathname);
    let abortedModules = 0;
    await page.route(expenseModule, async (route) => {
      abortedModules += 1;
      await route.abort("failed");
    });
    await navigation
      .getByRole("link", { name: expenseName, exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: failureTitle, exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("alert")).toContainText(
      language === "ar"
        ? "تحقق من اتصالك بالإنترنت، ثم أعد تحميل الصفحة."
        : "Check your connection, then reload the page.",
    );
    await expect(navigation).toBeVisible();
    expect(abortedModules).toBeGreaterThan(0);

    // A different route remains usable without a reload after the chunk fails.
    await navigation.getByRole("link", { name: billName, exact: true }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: billName, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: failureTitle, exact: true }),
    ).toHaveCount(0);
    await navigation
      .getByRole("link", { name: expenseName, exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: failureTitle, exact: true }),
    ).toBeVisible();
    await page.unroute(expenseModule);
    await page.getByRole("button", { name: reloadName, exact: true }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: expenseName, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: failureTitle, exact: true }),
    ).toHaveCount(0);
    await expect(page.locator("html")).toHaveAttribute("lang", language);
    expect(errors).toEqual([]);
  });
}
