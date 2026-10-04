import { getPreferences, preferenceLocale } from "../preferences/model.ts";
import { translate } from "../preferences/i18n.ts";

export function localDate(date: Date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDate(
  date: string,
  locale = preferenceLocale(getPreferences().language),
) {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function daysUntil(date: string, today: string) {
  return Math.round(
    (Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) /
      86400000,
  );
}

export function dueLabel(date: string, today: string) {
  const days = daysUntil(date, today);
  if (days < 0)
    return translate(
      days === -1 ? "{days} day overdue" : "{days} days overdue",
      { days: Math.abs(days) },
    );
  if (days === 0) return translate("Due today");
  if (days === 1) return translate("Due tomorrow");
  return translate("Due in {days} days", { days });
}
