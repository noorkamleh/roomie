import type { Expense } from "../../../shared/types";

export type SpendingPeriod = "month" | "week";

export interface SpendingDay {
  day: string;
  date: string;
  amount: number;
  transactions: number;
}

export function calculateSpendingOverview(
  expenses: Expense[],
  period: SpendingPeriod,
  fallbackDate: Date,
) {
  const endDate = fallbackDate;
  const year = endDate.getUTCFullYear();
  const month = endDate.getUTCMonth();
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(endDate);
  const dayCount =
    period === "month"
      ? new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
      : 7;
  const startDate =
    period === "month"
      ? new Date(Date.UTC(year, month, 1))
      : new Date(Date.UTC(year, month, endDate.getUTCDate() - 6));
  const spendingData = Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(startDate);
    date.setUTCDate(date.getUTCDate() + index);
    const dateKey = date.toISOString().slice(0, 10);
    const dailyExpenses = expenses.filter(
      (expense) => expense.date === dateKey,
    );
    return {
      day:
        period === "month"
          ? String(date.getUTCDate())
          : date.toLocaleDateString("en-US", {
              weekday: "short",
              timeZone: "UTC",
            }),
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }),
      amount: dailyExpenses.reduce(
        (total, expense) => total + expense.amount,
        0,
      ),
      transactions: dailyExpenses.length,
    };
  });
  const periodTotal = spendingData.reduce(
    (total, day) => total + day.amount,
    0,
  );
  const transactionCount = spendingData.reduce(
    (total, day) => total + day.transactions,
    0,
  );
  const highestDay = spendingData.reduce(
    (highest, day) => (day.amount > highest.amount ? day : highest),
    spendingData[0],
  );
  return {
    spendingData,
    monthLabel,
    dayCount,
    periodTotal,
    transactionCount,
    highestDay,
  };
}
