import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import { useAddDialog } from "../../../shared/hooks/useAddDialog";
import { useAction } from "../../../shared/hooks/useAction";
import type { Expense } from "../../../shared/types";
import { calculateTotalExpenses } from "../utils/calculations";
import { filterExpenses, expenseMonthLabel } from "../utils/filterExpenses";
import { useToday } from "../../../shared/hooks/useToday";
import { usePreferences } from "../../../shared/preferences/PreferencesContext";
import { useConfirmation } from "../../../shared/confirmation/ConfirmationContext";

export function useExpenseList() {
  const { t, locale } = usePreferences();
  const confirm = useConfirmation();
  const { state, commit } = useHousehold();
  const addDialog = useAddDialog();
  const [params, setParams] = useSearchParams();
  const detailExpense = state.expenses.find(
    (expense) => expense.id === params.get("expense"),
  );
  const [editing, setEditing] = useState<Expense | null | undefined>(undefined);
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState("");
  const [category, setCategory] = useState("");
  const [payer, setPayer] = useState("");
  const [view, setView] = useState<"cards" | "list">("cards");
  const today = useToday();
  const { error, perform } = useAction();
  const entries = filterExpenses(
    state.expenses,
    { query, month, category, payer },
    t,
  );

  function closeDialog() {
    setEditing(undefined);
    addDialog.close();
  }
  async function removeExpense(expense: Expense) {
    if (
      await confirm({
        title: "Delete expense",
        message: "Delete {title}? Balances will be recalculated.",
        params: { title: expense.title },
        confirmLabel: "Delete",
        intent: "danger",
      })
    )
      perform(() => commit({ type: "expense.delete", id: expense.id }));
  }
  function isBillExpense(expense: Expense) {
    return state.bills.some((bill) => expense.id === `bill-${bill.id}`);
  }

  return {
    currentUser: state.currentUser,
    members: state.members,
    entries,
    total: calculateTotalExpenses(entries),
    periodLabel: month ? expenseMonthLabel(month, locale) : t("All time"),
    includesFuture: entries.some((expense) => expense.date > today),
    filtered: Boolean(query.trim() || month || category || payer),
    month,
    setMonth,
    category,
    setCategory,
    payer,
    setPayer,
    view,
    setView,
    months: [
      ...new Set([
        today.slice(0, 7),
        ...state.expenses.map((expense) => expense.date.slice(0, 7)),
      ]),
    ]
      .sort()
      .reverse(),
    categories: [
      ...new Set(state.expenses.map((expense) => expense.category)),
    ].sort(),
    payers: [
      ...new Set(state.expenses.map((expense) => expense.paidBy)),
    ].sort(),
    query,
    setQuery,
    error,
    editing,
    detailExpense,
    closeDetails: () =>
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          next.delete("expense");
          return next;
        },
        { replace: true },
      ),
    isDialogOpen: !detailExpense && (editing !== undefined || addDialog.isOpen),
    openNew: () => setEditing(null),
    openEdit: (expense: Expense) => setEditing(expense),
    closeDialog,
    removeExpense,
    isBillExpense,
  };
}
