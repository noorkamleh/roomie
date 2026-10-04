import { createContext, useContext } from "react";
import type { HouseholdState } from "../../../shared/types";
import type { HouseholdAction } from "../model/household";

export interface HouseholdContextValue {
  state: HouseholdState;
  commit: (action: HouseholdAction) => void;
  undo: () => void;
  lastAction: string | null;
  storageError: string | null;
}
export const HouseholdContext = createContext<HouseholdContextValue | null>(
  null,
);
export function useHousehold() {
  const context = useContext(HouseholdContext);
  if (!context) throw new Error("HouseholdProvider is missing.");
  return context;
}
