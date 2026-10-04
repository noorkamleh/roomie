import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { HouseholdContext } from "../hooks/HouseholdContext";
import { createHouseholdSession } from "../model/persistence";
import type { HouseholdAction } from "../model/household";
import { readHouseholdSnapshot, STORAGE_KEY } from "../model/storage";

function HouseholdProvider({ children }: { children: ReactNode }) {
  const [session] = useState(() =>
    createHouseholdSession(readHouseholdSnapshot()),
  );
  const [state, setState] = useState(session.state);
  const [storageError, setStorageError] = useState(session.error);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const publish = useCallback(() => {
    setState(session.state);
    setStorageError(session.error);
    setLastAction(session.lastAction);
  }, [session]);
  const commit = useCallback(
    (action: HouseholdAction) => {
      try {
        session.commit(action);
      } finally {
        publish();
      }
    },
    [session, publish],
  );
  const undo = useCallback(() => {
    try {
      session.undo();
    } finally {
      publish();
    }
  }, [session, publish]);

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY && event.key !== null) return;
      if (event.storageArea !== localStorage) return;
      session.synchronize();
      publish();
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [session, publish]);

  return (
    <HouseholdContext.Provider
      value={{ state, commit, undo, lastAction, storageError }}
    >
      {children}
    </HouseholdContext.Provider>
  );
}
export default HouseholdProvider;
