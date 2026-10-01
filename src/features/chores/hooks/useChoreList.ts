import { useState } from "react";
import type { Chore } from "../../../shared/types";
import { useAddDialog } from "../../../shared/hooks/useAddDialog";
import { useAction } from "../../../shared/hooks/useAction";
import { useToday } from "../../../shared/hooks/useToday";
import { useHousehold } from "../../household/hooks/HouseholdContext";

export type ChoreFilter = "all" | Chore["status"];

export function useChoreList() {
  const { state, commit } = useHousehold();
  const today = useToday();
  const { isOpen: adding, open: openAdd, close: closeAdd } = useAddDialog();
  const [filter, setFilter] = useState<ChoreFilter>("all");
  const { error, perform } = useAction();
  const entries = [...state.chores]
    .sort(
      (a, b) =>
        Number(a.status === "completed") - Number(b.status === "completed") ||
        a.dueDate.localeCompare(b.dueDate),
    )
    .filter((chore) => filter === "all" || chore.status === filter);

  function changeStatus(chore: Chore, status: Chore["status"]) {
    perform(() => commit({ type: "chore.status", id: chore.id, status }));
  }

  return {
    entries,
    today,
    filter,
    setFilter,
    error,
    adding,
    openAdd,
    closeAdd,
    changeStatus,
  };
}
