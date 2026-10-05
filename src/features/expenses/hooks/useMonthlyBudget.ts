import { useState } from "react";
import type { MonthlyBudget } from "../../../shared/types";
import { useToday } from "../../../shared/hooks/useToday";
import { useAction } from "../../../shared/hooks/useAction";
import { useHousehold } from "../../household/hooks/HouseholdContext";

export function useMonthlyBudget(reportMonth: string) {
  const { state, commit } = useHousehold();
  const today = useToday();
  const [choice, setChoice] = useState({
    source: reportMonth,
    month: reportMonth || today.slice(0, 7),
  });
  const [saved, setSaved] = useState(false);
  const { error, perform } = useAction();
  const month =
    choice.source === reportMonth
      ? choice.month
      : reportMonth || today.slice(0, 7);
  const budget = state.budgets?.find((entry) => entry.month === month);
  function save(value: MonthlyBudget) {
    const success = perform(() =>
      commit({ type: "budget.save", budget: value }),
    );
    setSaved(success);
    return success;
  }
  return {
    month,
    budget,
    today,
    expenses: state.expenses,
    categories: [
      ...new Set([
        "Groceries",
        "Bills",
        "Household",
        "Food",
        "Other",
        ...state.expenses.map((expense) => expense.category),
        ...Object.keys(budget?.categories ?? {}),
      ]),
    ].sort(),
    error,
    saved,
    save,
    clearSaved: () => setSaved(false),
    changeMonth: (value: string) => {
      if (/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) {
        setChoice({ source: reportMonth, month: value });
        setSaved(false);
      }
    },
  };
}
