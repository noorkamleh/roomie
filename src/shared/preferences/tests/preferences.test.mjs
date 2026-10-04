import assert from "node:assert/strict";
import test from "node:test";
import {
  currencyText,
  defaultPreferences,
  getPreferences,
  parsePreferences,
  preferenceLocale,
  PREFERENCES_KEY,
  readPreferences,
  setCurrentPreferences,
  toBaseAmount,
  toDisplayAmount,
} from "../model.ts";
import { formatCurrency } from "../../utils/formatCurrency.ts";
import { formatDate } from "../../utils/dates.ts";
import { createTranslator } from "../i18n.ts";

test("currency conversion keeps SAR amounts and converts signed dollar values at 3.75", () => {
  assert.equal(toDisplayAmount(375, "SAR"), 375);
  assert.equal(toBaseAmount(12.34, "SAR"), 12.34);
  assert.equal(toDisplayAmount(375, "USD"), 100);
  assert.equal(toBaseAmount(100, "USD"), 375);
  assert.equal(toDisplayAmount(-375, "USD"), -100);
  assert.equal(toBaseAmount(-100, "USD"), -375);
});

test("money conversions round both signs consistently and handle tiny amounts", () => {
  assert.equal(toBaseAmount(0.02, "USD"), 0.08);
  assert.equal(toBaseAmount(-0.02, "USD"), -0.08);
  assert.equal(toDisplayAmount(0.02, "USD"), 0.01);
  assert.equal(toDisplayAmount(-0.02, "USD"), -0.01);
  assert.equal(toDisplayAmount(0.01, "USD"), 0);
  assert.equal(toDisplayAmount(-0.01, "USD"), 0);
  assert.equal(toBaseAmount(25.4, "USD"), 95.25);
});

test("dollar half-cent conversions use exact cents and round ties away from zero", () => {
  for (const [dollars, riyals] of [
    [0.58, 2.18],
    [1.14, 4.28],
    [1.26, 4.73],
    [1.42, 5.33],
    [2.34, 8.78],
    [4.1, 15.38],
  ]) {
    assert.equal(toBaseAmount(dollars, "USD"), riyals);
    assert.equal(toBaseAmount(-dollars, "USD"), -riyals);
  }
  assert.equal(toBaseAmount(1.005, "SAR"), 1.01);
  assert.equal(toBaseAmount(-1.005, "SAR"), -1.01);
});

test("currency conversion preserves exact rounding near the supported amount limit", () => {
  assert.equal(toBaseAmount(26666666.66, "USD"), 99999999.98);
  assert.equal(toBaseAmount(-26666666.66, "USD"), -99999999.98);
  assert.equal(toBaseAmount(26666666.67, "USD"), 100000000.01);
  assert.equal(toDisplayAmount(100000000, "USD"), 26666666.67);
  assert.equal(toDisplayAmount(-100000000, "USD"), -26666666.67);
  assert.equal(toDisplayAmount(99999999.98, "USD"), 26666666.66);
});

test("both conversion directions match exact rational cent rounding across cent values", () => {
  for (let cents = 0; cents <= 20000; cents++) {
    const dollarExpected =
      Number((BigInt(cents) * 375n * 2n + 100n) / 200n) / 100;
    const riyalExpected =
      Number((BigInt(cents) * 100n * 2n + 375n) / 750n) / 100;
    for (const sign of [1, -1]) {
      const expectedBase = dollarExpected === 0 ? 0 : sign * dollarExpected;
      const expectedDisplay = riyalExpected === 0 ? 0 : sign * riyalExpected;
      assert.equal(
        toBaseAmount((sign * cents) / 100, "USD"),
        expectedBase,
        `USD cents ${sign * cents}`,
      );
      assert.equal(
        toDisplayAmount((sign * cents) / 100, "USD"),
        expectedDisplay,
        `SAR cents ${sign * cents}`,
      );
    }
  }
});

test("invalid saved preferences fall back safely without sharing the defaults object", () => {
  for (const raw of [
    null,
    "",
    "{",
    "null",
    "[]",
    "true",
    "42",
    '{"version":2,"language":"ar"}',
  ]) {
    const parsed = parsePreferences(raw);
    assert.deepEqual(parsed, defaultPreferences);
    assert.notEqual(parsed, defaultPreferences);
  }
  assert.deepEqual(
    parsePreferences(
      '{"version":1,"language":"fr","currency":"EUR","theme":"midnight"}',
    ),
    defaultPreferences,
  );
});

test("valid saved preferences restore independently and ignore unrelated fields", () => {
  assert.deepEqual(
    parsePreferences(
      '{"version":1,"language":"ar","currency":"USD","theme":"dark","extra":"ignored"}',
    ),
    { version: 1, language: "ar", currency: "USD", theme: "dark" },
  );
  assert.deepEqual(parsePreferences('{"version":1,"language":"ar"}'), {
    ...defaultPreferences,
    language: "ar",
  });
});

test("preference reads recover from unavailable or malformed browser storage", (context) => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  context.after(() => {
    if (original) Object.defineProperty(globalThis, "localStorage", original);
    else delete globalThis.localStorage;
  });
  let raw = '{"version":1,"language":"ar","currency":"USD","theme":"dark"}';
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem(key) {
        assert.equal(key, PREFERENCES_KEY);
        return raw;
      },
    },
  });
  assert.equal(readPreferences().currency, "USD");
  raw = "corrupt preferences";
  assert.deepEqual(readPreferences(), defaultPreferences);
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    get() {
      throw new Error("Storage unavailable");
    },
  });
  assert.deepEqual(readPreferences(), defaultPreferences);
});

test("Arabic dates retain the Gregorian calendar and readable Latin digits", () => {
  const locale = preferenceLocale("ar");
  const options = new Intl.DateTimeFormat(locale).resolvedOptions();
  assert.equal(options.calendar, "gregory");
  assert.equal(options.numberingSystem, "latn");
  const date = formatDate("2026-10-04", locale);
  assert.match(date, /أكتوبر/);
  assert.match(date, /2026/);
  assert.doesNotMatch(date, /[٠-٩]/);
  assert.match(currencyText(375, "USD", "ar"), /100\.00/);
  assert.match(currencyText(375, "USD", "ar"), /\$/);
});

test("shared formatters read changed preferences immediately", (context) => {
  const original = getPreferences();
  context.after(() => setCurrentPreferences(original));
  setCurrentPreferences({ ...defaultPreferences, currency: "USD" });
  assert.equal(formatCurrency(375), "$100.00");
  setCurrentPreferences({ ...defaultPreferences, language: "ar" });
  assert.match(formatDate("2026-10-04"), /أكتوبر/);
  assert.match(formatCurrency(375), /ر\.س/);
  setCurrentPreferences(defaultPreferences);
  assert.equal(formatDate("2026-10-04"), "Oct 4, 2026");
  assert.equal(formatCurrency(375), "SAR 375.00");
});

test("translation interpolates user text without translating or reprocessing it", () => {
  const ar = createTranslator("ar");
  assert.equal(
    ar("Your share: {amount}", { amount: "$100.00" }),
    "حصتك: $100.00",
  );
  assert.equal(
    ar("Assigned to {name}", { name: "Noor {title}" }),
    "مسندة إلى Noor {title}",
  );
  assert.equal(ar("A custom household name"), "A custom household name");
  assert.equal(
    createTranslator("en")("Assigned to {name}", { name: "نور" }),
    "Assigned to نور",
  );
});

test("unknown user text matching Object prototype keys falls back unchanged", () => {
  for (const language of ["en", "ar"]) {
    const translate = createTranslator(language);
    for (const text of [
      "constructor",
      "__proto__",
      "toString",
      "hasOwnProperty",
    ])
      assert.equal(translate(text), text);
    assert.equal(
      translate("Custom {constructor} {toString} {__proto__}"),
      "Custom {constructor} {toString} {__proto__}",
    );
    assert.equal(
      translate("Custom {constructor}", { constructor: "User text" }),
      "Custom User text",
    );
  }
});
