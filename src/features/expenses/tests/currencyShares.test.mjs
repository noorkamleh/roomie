import assert from "node:assert/strict";
import test from "node:test";
import { convertExactShares } from "../utils/currencyShares.ts";
import { maxDisplayInputAmount } from "../utils/currencyAmounts.ts";
import { toBaseAmount } from "../../../shared/preferences/model.ts";

test("dollar shares allocate rounding differences while retaining the exact SAR total", () => {
  const shares = convertExactShares(
    { Noor: 33, Sara: 33, Reem: 34 },
    375,
    "USD",
  );
  assert.deepEqual(shares, { Noor: 124, Sara: 124, Reem: 127 });
  assert.equal(
    Object.values(shares).reduce((sum, cents) => sum + cents, 0),
    375,
  );
});

test("zero shares stay zero and equal fractional remainders use participant order", () => {
  assert.deepEqual(convertExactShares({ Noor: 100, Sara: 0 }, 375, "USD"), {
    Noor: 375,
    Sara: 0,
  });
  assert.deepEqual(
    convertExactShares({ Noor: 1, Sara: 1, Reem: 1 }, 11, "USD"),
    { Noor: 4, Sara: 4, Reem: 3 },
  );
  assert.deepEqual(convertExactShares({ Noor: 0, Sara: 0 }, 1, "USD"), {
    Noor: 1,
    Sara: 0,
  });
});

test("SAR shares retain their entered cents without exchange rounding", () => {
  assert.deepEqual(
    convertExactShares({ Noor: 123, Sara: 0, Reem: 1 }, 124, "SAR"),
    { Noor: 123, Sara: 0, Reem: 1 },
  );
});

test("under and over totals are rejected instead of automatically reconciled", () => {
  for (const shares of [
    { Noor: 33, Sara: 33, Reem: 33 },
    { Noor: 34, Sara: 34, Reem: 34 },
  ]) {
    assert.throws(
      () => convertExactShares(shares, 375, "USD"),
      /Exact shares must add up/,
    );
  }
  assert.throws(
    () => convertExactShares({ Noor: 99 }, 100, "SAR"),
    /Exact shares must add up/,
  );
});

test("malformed and fractional input cents are rejected", () => {
  for (const shares of [
    { Noor: -1 },
    { Noor: Number.NaN },
    { Noor: 1.25 },
    {},
  ]) {
    assert.throws(
      () => convertExactShares(shares, 375, "USD"),
      /Enter nonnegative shares/,
    );
  }
});

test("unchanged displayed dollar shares preserve authoritative SAR cents", () => {
  const pristine = { Noor: 125, Sara: 125, Reem: 125 };
  const shares = convertExactShares(
    { Noor: 33, Sara: 33, Reem: 33 },
    375,
    "USD",
    pristine,
  );
  assert.deepEqual(shares, pristine);
  assert.notEqual(shares, pristine);
  assert.deepEqual(pristine, { Noor: 125, Sara: 125, Reem: 125 });
  assert.deepEqual(
    convertExactShares({ Noor: 0, Sara: 0 }, 1, "USD", { Noor: 0, Sara: 1 }),
    { Noor: 0, Sara: 1 },
  );
});

test("a visible edit reallocates cents and cannot use stale pristine shares to bypass validation", () => {
  const pristine = { Noor: 125, Sara: 125, Reem: 125 };
  assert.deepEqual(
    convertExactShares({ Noor: 33, Sara: 33, Reem: 34 }, 375, "USD", pristine),
    { Noor: 124, Sara: 124, Reem: 127 },
  );
  assert.throws(
    () =>
      convertExactShares(
        { Noor: 33, Sara: 33, Reem: 35 },
        375,
        "USD",
        pristine,
      ),
    /Exact shares must add up/,
  );
});

test("new USD input limits round down while pristine maximum SAR amounts stay editable", () => {
  assert.equal(maxDisplayInputAmount("SAR"), 100000000);
  assert.equal(maxDisplayInputAmount("USD"), 26666666.66);
  assert.ok(toBaseAmount(maxDisplayInputAmount("USD"), "USD") <= 100000000);
  assert.equal(maxDisplayInputAmount("USD", 100000000), 26666666.67);
});
