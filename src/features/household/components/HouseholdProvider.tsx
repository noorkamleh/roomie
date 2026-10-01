import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { HouseholdContext } from "../hooks/HouseholdContext";
import { householdReducer } from "../model/household";
import type { HouseholdAction } from "../model/household";
import { loadHousehold, STORAGE_KEY } from "../model/storage";
import { isHousehold } from "../model/validation";

function HouseholdProvider({ children }: { children: ReactNode }) {
  const [loaded] = useState(loadHousehold);
  const [state, setState] = useState(loaded.state);
  const [storageError, setStorageError] = useState(loaded.error);
  const current = useRef(state);
  const commit = useCallback(
    (action: HouseholdAction) => {
      if (loaded.error) throw new Error(loaded.error);
      const next = householdReducer(current.current, action);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        const message =
          "Could not save changes. Your browser storage may be full or disabled.";
        setStorageError(message);
        throw new Error(message);
      }
      current.current = next;
      setStorageError(null);
      setState(next);
    },
    [loaded.error],
  );

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        const parsed: unknown = JSON.parse(event.newValue);
        if (!isHousehold(parsed)) throw new Error("Invalid data");
        current.current = parsed;
        setState(parsed);
      } catch {
        setStorageError("Changes from another tab could not be read.");
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  return (
    <HouseholdContext.Provider value={{ state, commit, storageError }}>
      {children}
    </HouseholdContext.Provider>
  );
}
export default HouseholdProvider;
