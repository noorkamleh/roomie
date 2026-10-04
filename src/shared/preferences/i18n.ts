import { getPreferences } from "./model.ts";
import type { Language } from "./model.ts";
import { commonTranslations } from "./translations/common.ts";
import { dashboardTranslations } from "./translations/dashboard.ts";
import { expensesTranslations } from "./translations/expenses.ts";
import { billsTranslations } from "./translations/bills.ts";
import { householdTranslations } from "./translations/household.ts";

export type TranslationParams = Record<string, string | number>;
export type Translator = (text: string, params?: TranslationParams) => string;
const arabic: Record<string, string> = {
  ...commonTranslations,
  ...dashboardTranslations,
  ...expensesTranslations,
  ...billsTranslations,
  ...householdTranslations,
};

export function createTranslator(language: Language): Translator {
  return (text, params = {}) => {
    const template =
      language === "ar" && Object.hasOwn(arabic, text) ? arabic[text] : text;
    return template.replace(/\{(\w+)\}/g, (placeholder, key: string) =>
      !Object.hasOwn(params, key) || params[key] === undefined
        ? placeholder
        : String(params[key]),
    );
  };
}
export const translate: Translator = (text, params) =>
  createTranslator(getPreferences().language)(text, params);
