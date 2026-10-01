import { useToday } from "../../../shared/hooks/useToday";
import { useMemo, useState } from "react";
import type { Expense } from "../../../shared/types";
import { calculateSpendingOverview } from "../utils/spending";
import type { SpendingPeriod } from "../utils/spending";

export function useSpendingOverview(expenses: Expense[]) {
  const [spendingPeriod, setSpendingPeriod] = useState<SpendingPeriod>("month");
  const today = useToday();
  const overview = useMemo(
    () =>
      calculateSpendingOverview(
        expenses,
        spendingPeriod,
        new Date(`${today}T00:00:00Z`),
      ),
    [expenses, spendingPeriod, today],
  );

  return { spendingPeriod, setSpendingPeriod, ...overview };
}
