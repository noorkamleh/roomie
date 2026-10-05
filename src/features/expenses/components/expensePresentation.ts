export { formatDate as formatExpenseDate } from "../../../shared/utils/dates";
import {
  getPreferences,
  preferenceLocale,
  toDisplayAmount,
} from "../../../shared/preferences/model";

export function formatExpenseAmount(amount: number) {
  const { language, currency } = getPreferences();
  return new Intl.NumberFormat(preferenceLocale(language), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(toDisplayAmount(amount, currency));
}
