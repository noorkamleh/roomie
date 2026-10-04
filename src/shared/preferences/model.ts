export type Language = "en" | "ar";
export type Currency = "SAR" | "USD";
export type Theme = "light" | "dark";
export interface Preferences {
  version: 1;
  language: Language;
  currency: Currency;
  theme: Theme;
}

export const PREFERENCES_KEY = "roomie.preferences.v1";
export const SAR_PER_USD = 3.75;
export const defaultPreferences: Preferences = {
  version: 1,
  language: "en",
  currency: "SAR",
  theme: "light",
};

export function parsePreferences(raw: string | null): Preferences {
  try {
    const value: unknown = JSON.parse(raw ?? "null");
    if (
      !value ||
      typeof value !== "object" ||
      !("version" in value) ||
      value.version !== 1
    )
      return { ...defaultPreferences };
    const saved = value as Partial<Preferences>;
    return {
      version: 1,
      language: saved.language === "ar" ? "ar" : "en",
      currency: saved.currency === "USD" ? "USD" : "SAR",
      theme: saved.theme === "dark" ? "dark" : "light",
    };
  } catch {
    return { ...defaultPreferences };
  }
}

export function readPreferences(): Preferences {
  try {
    return parsePreferences(localStorage.getItem(PREFERENCES_KEY));
  } catch {
    return { ...defaultPreferences };
  }
}

let currentPreferences = { ...defaultPreferences };
export function getPreferences() {
  return currentPreferences;
}
export function setCurrentPreferences(value: Preferences) {
  currentPreferences = value;
}
export function preferenceLocale(language: Language) {
  return language === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-US";
}

function magnitudeCents(value: number) {
  const magnitude = Math.abs(value);
  if (!Number.isFinite(magnitude)) return magnitude * 100;
  const [coefficient, exponent = "0"] = String(magnitude).split("e");
  return Math.round(Number(`${coefficient}e${Number(exponent) + 2}`));
}

function roundMoney(value: number) {
  const cents = magnitudeCents(value);
  return cents === 0 ? 0 : Math.sign(value) * (cents / 100);
}

function convertMoney(value: number, numerator: number, denominator: number) {
  const cents = magnitudeCents(value);
  if (!Number.isSafeInteger(cents))
    return roundMoney((value * numerator) / denominator);
  const weighted = BigInt(cents) * BigInt(numerator);
  const divisor = BigInt(denominator);
  // Round exact rational cents to the nearest cent, with ties away from zero.
  const converted = Number((weighted * 2n + divisor) / (divisor * 2n));
  return converted === 0 ? 0 : Math.sign(value) * (converted / 100);
}
export function toDisplayAmount(amountSAR: number, currency: Currency) {
  return currency === "USD"
    ? convertMoney(amountSAR, 100, SAR_PER_USD * 100)
    : roundMoney(amountSAR);
}
export function toBaseAmount(amount: number, currency: Currency) {
  return currency === "USD"
    ? convertMoney(amount, SAR_PER_USD * 100, 100)
    : roundMoney(amount);
}
export function currencyText(
  amountSAR: number,
  currency: Currency,
  language: Language,
) {
  return new Intl.NumberFormat(preferenceLocale(language), {
    style: "currency",
    currency,
    currencyDisplay: currency === "USD" ? "narrowSymbol" : "symbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(toDisplayAmount(amountSAR, currency));
}

export function applyDocumentPreferences(preferences: Preferences) {
  setCurrentPreferences(preferences);
  document.documentElement.lang = preferences.language;
  document.documentElement.dir = preferences.language === "ar" ? "rtl" : "ltr";
  document.documentElement.dataset.theme = preferences.theme;
  document.documentElement.style.colorScheme = preferences.theme;
  document.title =
    preferences.language === "ar"
      ? "Roomie | المنزل المشترك"
      : "Roomie | Shared home";
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute(
      "content",
      preferences.theme === "dark" ? "#141720" : "#f3f5ff",
    );
}
