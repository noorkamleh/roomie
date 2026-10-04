import { currencyText, getPreferences } from "../preferences/model.ts";
export function formatCurrency(amount: number) {
  const { currency, language } = getPreferences();
  return currencyText(amount, currency, language);
}
