import type { Expense } from "../../../shared/types";
import { getAmountCents } from "../../../shared/utils/money.ts";
import { formatDate } from "../../../shared/utils/dates.ts";

export type SpendingPeriod = "month" | "week" | "thirty-days";

export interface SpendingDay {
  day: string;
  date: string;
  amount: number | null;
  future: boolean;
  transactions: number;
  average: number | null;
}

export function calculateSpendingOverview(
  expenses: Expense[],
  period: SpendingPeriod,
  fallbackDate: Date,
  locale = "en-US",
) {
  const endDate = fallbackDate;
  const year = endDate.getUTCFullYear();
  const month = endDate.getUTCMonth();
  const monthLabel = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(endDate);
  const dayCount =
    period === "month"
      ? new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
      : period === "week"
        ? 7
        : 30;
  const elapsedDays = period === "month" ? endDate.getUTCDate() : dayCount;
  const startDate =
    period === "month"
      ? new Date(Date.UTC(year, month, 1))
      : new Date(Date.UTC(year, month, endDate.getUTCDate() - dayCount + 1));
  const spendingData = Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(startDate);
    date.setUTCDate(date.getUTCDate() + index);
    const dateKey = date.toISOString().slice(0, 10);
    const dailyExpenses = expenses.filter(
      (expense) => expense.date === dateKey && index < elapsedDays,
    );
    return {
      day: date.toLocaleDateString(locale, {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }),
      date: formatDate(dateKey, locale),
      future: index >= elapsedDays,
      amount:
        index >= elapsedDays
          ? null
          : dailyExpenses.reduce(
              (total, expense) => total + getAmountCents(expense),
              0,
            ) / 100,
      transactions: dailyExpenses.length,
      average: null as number | null,
    };
  });
  // The dashed trend is a real seven-day moving average, including zero-spend days.
  spendingData.forEach((day, index) => {
    if (index >= elapsedDays) return;
    const window = spendingData.slice(Math.max(0, index - 6), index + 1);
    day.average =
      window.reduce(
        (total, entry) => total + Math.round((entry.amount ?? 0) * 100),
        0,
      ) /
      100 /
      window.length;
  });
  const periodTotal =
    spendingData.reduce(
      (total, day) => total + Math.round((day.amount ?? 0) * 100),
      0,
    ) / 100;
  const transactionCount = spendingData.reduce(
    (total, day) => total + day.transactions,
    0,
  );
  const highestDay = spendingData.reduce(
    (highest, day) =>
      (day.amount ?? 0) > (highest.amount ?? 0) ? day : highest,
    spendingData[0],
  );
  return {
    spendingData,
    monthLabel,
    dayCount,
    elapsedDays,
    dailyAverage: periodTotal / elapsedDays,
    periodTotal,
    transactionCount,
    highestDay,
  };
}
