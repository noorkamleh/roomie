import { createHouseholdHistory } from "./history.ts";
import type { HouseholdAction } from "./household.ts";
import { readHouseholdSnapshot, STORAGE_KEY } from "./storage.ts";
import type { HouseholdSnapshot, HouseholdStorage } from "./storage.ts";
import type { HouseholdState } from "../../../shared/types";

export const HOUSEHOLD_CHANGED_MESSAGE =
  "Your household changed in another tab. Review the latest data and try again.";
const SAVE_ERROR_MESSAGE =
  "Could not save changes. Your browser storage may be full or disabled.";

/**
 * Reject stale snapshots before saving or undoing. The raw comparison and
 * localStorage write are separate operations, so this is not an atomic
 * transaction between tabs that write at precisely the same time. A shared
 * backend or asynchronous transactional storage is still needed for that.
 */
export function createHouseholdSession(
  initial: HouseholdSnapshot,
  storage?: HouseholdStorage,
) {
  let snapshot = initial;
  let writeError: string | null = null;
  const history = createHouseholdHistory(initial.state, persist);

  function accept(latest: HouseholdSnapshot) {
    if (latest.raw === snapshot.raw && latest.error === snapshot.error) {
      writeError = null;
      return;
    }
    snapshot = {
      ...latest,
      state: latest.error ? history.state : latest.state,
    };
    history.synchronize(snapshot.state);
    writeError = null;
  }

  function assertCurrent() {
    const latest = readHouseholdSnapshot(storage);
    if (latest.error || latest.raw !== snapshot.raw || snapshot.error) {
      accept(latest);
      throw new Error(latest.error ?? HOUSEHOLD_CHANGED_MESSAGE);
    }
  }

  function persist(next: HouseholdState) {
    // Check again immediately before the write, including writes from Undo.
    assertCurrent();
    try {
      const raw = JSON.stringify(next);
      (storage ?? localStorage).setItem(STORAGE_KEY, raw);
      snapshot = { state: next, raw, error: null };
      writeError = null;
    } catch {
      writeError = SAVE_ERROR_MESSAGE;
      throw new Error(SAVE_ERROR_MESSAGE);
    }
  }

  function change(operation: () => HouseholdState) {
    assertCurrent();
    const next = operation();
    writeError = null;
    return next;
  }

  return {
    get state() {
      return history.state;
    },
    get lastAction() {
      return history.lastAction;
    },
    get error() {
      return snapshot.error ?? writeError;
    },
    commit(action: HouseholdAction) {
      return change(() => history.commit(action));
    },
    undo() {
      return change(() => history.undo());
    },
    synchronize() {
      // Storage events may be queued. Read the current value, not event.newValue.
      accept(readHouseholdSnapshot(storage));
      return history.state;
    },
  };
}
