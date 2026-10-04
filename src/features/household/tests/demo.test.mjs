import assert from "node:assert/strict";
import test from "node:test";
import { demoHousehold } from "../utils/demo.ts";
import { isHousehold } from "../model/validation.ts";

test("optional demo is valid at month boundaries and never invents future spending", () => {
  for (const now of [
    new Date(2026, 9, 4),
    new Date(2026, 0, 31),
    new Date(2026, 1, 28),
    new Date(2028, 1, 29),
  ]) {
    const demo = demoHousehold(now);
    assert.equal(isHousehold(demo), true);
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    assert.ok(demo.expenses.every((expense) => expense.date <= today));
    assert.ok(
      new Set(demo.expenses.map((expense) => expense.category)).size > 2,
    );
    assert.equal(demo.budgets[0].month, today.slice(0, 7));
    for (const bill of demo.bills.filter((bill) => bill.status === "paid"))
      assert.ok(
        demo.expenses.some((expense) => expense.id === `bill-${bill.id}`),
      );
  }
});
