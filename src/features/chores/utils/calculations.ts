import type { Chore } from "../../../shared/types";

export function calculatePendingChores(chores: Chore[]) {
  return chores.filter((chore) => chore.status !== "completed").length;
}
