import { expect } from "@playwright/test";

export async function respondToConfirmation(page, confirmed = true) {
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog
    .getByRole("button", {
      name: confirmed
        ? /^(Delete|Archive member|Record repayment|Load demo data)$/
        : "Cancel",
      exact: true,
    })
    .click();
  await expect(dialog).toHaveCount(0);
}
