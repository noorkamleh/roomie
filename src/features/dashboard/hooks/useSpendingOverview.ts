import { useToday } from "../../../shared/hooks/useToday";
import { useMemo, useState } from "react";
import type { Expense } from "../../../shared/types";
import { calculateSpendingOverview } from "../utils/spending";
import type { SpendingPeriod } from "../utils/spending";
import { usePreferences } from "../../../shared/preferences/PreferencesContext";

export function useSpendingOverview(expenses: Expense[]) {
  const { locale } = usePreferences();
  const [spendingPeriod, setSpendingPeriod] = useState<SpendingPeriod>("month");
  const today = useToday();
  const overview = useMemo(
    () =>
      calculateSpendingOverview(
        expenses,
        spendingPeriod,
        new Date(`${today}T00:00:00Z`),
        locale,
      ),
    [expenses, spendingPeriod, today, locale],
  );

  return { spendingPeriod, setSpendingPeriod, ...overview };
}
