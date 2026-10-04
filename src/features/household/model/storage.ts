import type { HouseholdState } from "../../../shared/types";
import {
  members,
  expenses,
  bills,
  chores,
  shoppingItems,
} from "../../../shared/data/mockData.ts";
import { isHousehold } from "./validation.ts";
import { classifyUtility } from "../../../shared/utils/classifyUtility.ts";
import { withAmountCents } from "../../../shared/utils/money.ts";

function withUtilityKinds(state: HouseholdState): HouseholdState {
  return {
    ...state,
    expenses: state.expenses.map((expense) => ({
      ...withAmountCents(expense),
      utilityKind:
        expense.category === "Bills"
          ? (expense.utilityKind ?? classifyUtility(expense.title))
          : undefined,
    })),
    bills: state.bills.map((bill) => ({
      ...withAmountCents(bill),
      utilityKind: bill.utilityKind ?? classifyUtility(bill.title),
    })),
    settlements: state.settlements.map(withAmountCents),
  };
}

export const STORAGE_KEY = "roomie.household.v1";
export interface HouseholdStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
}
export interface HouseholdSnapshot {
  state: HouseholdState;
  error: string | null;
  raw: string | null;
}
export function initialHousehold(): HouseholdState {
  return withUtilityKinds({
    version: 1,
    name: "Our shared home",
    currentUser: members[0].name,
    members,
    expenses,
    bills,
    chores,
    shoppingItems,
    settlements: [],
    simplifyDebts: true,
  });
}
export function readHouseholdSnapshot(
  storage?: HouseholdStorage,
): HouseholdSnapshot {
  let saved: string | null;
  try {
    saved = (storage ?? localStorage).getItem(STORAGE_KEY);
  } catch {
    return {
      state: initialHousehold(),
      error:
        "Browser storage is unavailable. Changes cannot be saved on this device.",
      raw: null,
    };
  }
  if (saved === null)
    return { state: initialHousehold(), error: null, raw: null };
  try {
    const parsed: unknown = JSON.parse(saved);
    if (!isHousehold(parsed)) throw new Error("Invalid saved data");
    return { state: withUtilityKinds(parsed), error: null, raw: saved };
  } catch {
    return {
      state: initialHousehold(),
      error:
        "Saved data could not be read. Your original data has been kept; changes will not overwrite it.",
      raw: saved,
    };
  }
}

export function loadHousehold(): {
  state: HouseholdState;
  error: string | null;
} {
  const { state, error } = readHouseholdSnapshot();
  return { state, error };
}
