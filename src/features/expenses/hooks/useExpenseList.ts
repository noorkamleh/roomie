import { useState } from "react";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import { useAddDialog } from "../../../shared/hooks/useAddDialog";
import { useAction } from "../../../shared/hooks/useAction";
import type { Expense } from "../../../shared/types";
import { calculateTotalExpenses } from "../utils/calculations";

export function useExpenseList() {
  const { state, commit } = useHousehold();
  const addDialog = useAddDialog();
  const [editing, setEditing] = useState<Expense | null | undefined>(undefined);
  const [query, setQuery] = useState("");
  const { error, perform } = useAction();
  const entries = [...state.expenses]
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter((expense) =>
      `${expense.title} ${expense.paidBy} ${expense.category}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );

  function closeDialog() {
    setEditing(undefined);
    addDialog.close();
  }
  function removeExpense(expense: Expense) {
    if (
      window.confirm(`Delete ${expense.title}? Balances will be recalculated.`)
    )
      perform(() => commit({ type: "expense.delete", id: expense.id }));
  }
  function isBillExpense(expense: Expense) {
    return state.bills.some((bill) => expense.id === `bill-${bill.id}`);
  }

  return {
    entries,
    total: calculateTotalExpenses(state.expenses),
    query,
    setQuery,
    error,
    editing,
    isDialogOpen: editing !== undefined || addDialog.isOpen,
    openNew: () => setEditing(null),
    openEdit: (expense: Expense) => setEditing(expense),
    closeDialog,
    removeExpense,
    isBillExpense,
  };
}
