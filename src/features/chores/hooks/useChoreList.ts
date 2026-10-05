import { useState } from "react";
import type { Chore } from "../../../shared/types";
import { useAddDialog } from "../../../shared/hooks/useAddDialog";
import { useAction } from "../../../shared/hooks/useAction";
import { useToday } from "../../../shared/hooks/useToday";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import { localDate } from "../../../shared/utils/dates";

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
  const personalEntries = entries.filter(
    (chore) => chore.assignedTo === state.currentUser,
  );

  function changeStatus(chore: Chore, status: Chore["status"]) {
    perform(() =>
      commit({
        type: "chore.status",
        id: chore.id,
        status,
        ...(status === "completed"
          ? { completedBy: state.currentUser, date: localDate() }
          : {}),
      }),
    );
  }

  function requestSwap(chore: Chore, to: string) {
    return perform(() =>
      commit({
        type: "chore.swap.request",
        id: chore.id,
        to,
        requestedBy: state.currentUser,
        date: localDate(),
      }),
    );
  }

  function respondToSwap(chore: Chore, accepted: boolean) {
    perform(() =>
      commit({
        type: "chore.swap.respond",
        id: chore.id,
        accepted,
        respondedBy: state.currentUser,
        date: localDate(),
      }),
    );
  }

  return {
    counts: {
      all: state.chores.length,
      pending: state.chores.filter((chore) => chore.status === "pending")
        .length,
      "in-progress": state.chores.filter(
        (chore) => chore.status === "in-progress",
      ).length,
      completed: state.chores.filter((chore) => chore.status === "completed")
        .length,
    },
    entries,
    personalEntries,
    personalOpenCount: state.chores.filter(
      (chore) =>
        chore.assignedTo === state.currentUser && chore.status !== "completed",
    ).length,
    currentUser: state.currentUser,
    members: state.members,
    today,
    filter,
    setFilter,
    error,
    adding,
    openAdd,
    closeAdd,
    changeStatus,
    requestSwap,
    respondToSwap,
  };
}
