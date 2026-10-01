import type { HouseholdState } from "../../../shared/types";
import {
  members,
  expenses,
  bills,
  chores,
  shoppingItems,
} from "../../../shared/data/mockData";
import { isHousehold } from "./validation";

export const STORAGE_KEY = "roomie.household.v1";
export function initialHousehold(): HouseholdState {
  return {
    version: 1,
    name: "Our shared home",
    currentUser: members[0].name,
    members,
    expenses,
    bills,
    chores,
    shoppingItems,
    settlements: [],
  };
}
export function loadHousehold(): {
  state: HouseholdState;
  error: string | null;
} {
  let saved: string | null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch {
    return {
      state: initialHousehold(),
      error:
        "Browser storage is unavailable. Changes cannot be saved on this device.",
    };
  }
  if (!saved) return { state: initialHousehold(), error: null };
  try {
    const parsed: unknown = JSON.parse(saved);
    if (!isHousehold(parsed)) throw new Error("Invalid saved data");
    return { state: parsed, error: null };
  } catch {
    return {
      state: initialHousehold(),
      error:
        "Saved data could not be read. Your original data has been kept; changes will not overwrite it.",
    };
  }
}
