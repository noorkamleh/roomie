import type { Chore } from "../../../shared/types";

export function selectAttentionChores(chores: Chore[], today: string) {
  return chores
    .filter((chore) => chore.status !== "completed" && chore.dueDate <= today)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}
