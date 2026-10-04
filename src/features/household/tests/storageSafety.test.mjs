import assert from "node:assert/strict";
import test from "node:test";
import {
  createHouseholdSession,
  HOUSEHOLD_CHANGED_MESSAGE,
} from "../model/persistence.ts";
import {
  initialHousehold,
  readHouseholdSnapshot,
  STORAGE_KEY,
} from "../model/storage.ts";

const initial = () => ({
  version: 1,
  name: "Storage safety home",
  currentUser: "Noor",
  members: [
    { id: "noor", name: "Noor" },
    { id: "sara", name: "Sara" },
  ],
  expenses: [],
  bills: [],
  chores: [],
  shoppingItems: [],
  settlements: [],
});
const add = (id) => ({
  type: "shopping.add",
  item: { id, name: id, quantity: 1, completed: false },
});

function memoryStorage(raw = JSON.stringify(initial())) {
  return {
    raw,
    failReads: false,
    failWrites: false,
    onRead: null,
    getItem(key) {
      assert.equal(key, STORAGE_KEY);
      this.onRead?.();
      if (this.failReads) throw new Error("Storage unavailable");
      return this.raw;
    },
    setItem(key, value) {
      assert.equal(key, STORAGE_KEY);
      if (this.failWrites) throw new Error("Storage quota exceeded");
      this.raw = value;
    },
  };
}
const sessionFor = (storage) =>
  createHouseholdSession(readHouseholdSnapshot(storage), storage);
const names = (session) => session.state.shoppingItems.map((item) => item.name);

test("a stale tab resynchronizes and rejects its write without losing another tab's change", () => {
  const storage = memoryStorage();
  const first = sessionFor(storage);
  const stale = sessionFor(storage);
  first.commit(add("first"));
  const latestRaw = storage.raw;

  assert.throws(() => stale.commit(add("second")), {
    message: HOUSEHOLD_CHANGED_MESSAGE,
  });
  assert.equal(storage.raw, latestRaw);
  assert.deepEqual(names(stale), ["first"]);
  assert.equal(stale.lastAction, null);
  assert.equal(stale.error, null);

  stale.commit(add("second"));
  assert.deepEqual(new Set(names(stale)), new Set(["first", "second"]));
  assert.deepEqual(
    JSON.parse(storage.raw).shoppingItems,
    stale.state.shoppingItems,
  );
});

test("undo rejects a stale snapshot and preserves the current saved household", () => {
  const storage = memoryStorage();
  const first = sessionFor(storage);
  first.commit(add("first"));
  const other = sessionFor(storage);
  other.commit(add("other"));
  const latestRaw = storage.raw;

  assert.throws(() => first.undo(), { message: HOUSEHOLD_CHANGED_MESSAGE });
  assert.equal(storage.raw, latestRaw);
  assert.deepEqual(new Set(names(first)), new Set(["first", "other"]));
  assert.equal(first.lastAction, null);
});

test("a second comparison prevents changes appearing between action reduction and persistence", () => {
  const storage = memoryStorage();
  const session = sessionFor(storage);
  const external = { ...initial(), name: "Newer external home" };
  const latestRaw = JSON.stringify(external);
  let reads = 0;
  storage.onRead = () => {
    reads += 1;
    if (reads === 2) storage.raw = latestRaw;
  };

  assert.throws(() => session.commit(add("stale")), {
    message: HOUSEHOLD_CHANGED_MESSAGE,
  });
  assert.equal(storage.raw, latestRaw);
  assert.equal(session.state.name, external.name);
  assert.deepEqual(names(session), []);
  assert.equal(session.lastAction, null);
});

test("a corrupt initial snapshot is kept and valid external recovery enables future writes", () => {
  const storage = memoryStorage("{broken original data");
  const session = sessionFor(storage);
  assert.match(session.error, /original data has been kept/);
  assert.throws(
    () => session.commit(add("blocked")),
    /original data has been kept/,
  );
  assert.equal(storage.raw, "{broken original data");

  storage.raw = JSON.stringify(initial());
  session.synchronize();
  assert.equal(session.error, null);
  assert.equal(session.state.name, "Storage safety home");
  session.commit(add("recovered"));
  assert.deepEqual(names(session), ["recovered"]);
  assert.equal(JSON.parse(storage.raw).name, "Storage safety home");
});

test("recovery detected before a storage event resynchronizes safely before accepting a retry", () => {
  const storage = memoryStorage("invalid");
  const session = sessionFor(storage);
  const validRaw = JSON.stringify(initial());
  storage.raw = validRaw;

  assert.throws(() => session.commit(add("recovered")), {
    message: HOUSEHOLD_CHANGED_MESSAGE,
  });
  assert.equal(session.error, null);
  assert.equal(storage.raw, validRaw);
  session.commit(add("recovered"));
  assert.deepEqual(names(session), ["recovered"]);
});

test("synchronization reads the latest value when multiple storage events are queued", () => {
  const storage = memoryStorage();
  const session = sessionFor(storage);
  storage.raw = JSON.stringify({ ...initial(), name: "Intermediate home" });
  storage.raw = JSON.stringify({ ...initial(), name: "Newest home" });

  session.synchronize();
  assert.equal(session.state.name, "Newest home");
  session.synchronize();
  assert.equal(session.state.name, "Newest home");
});

test("an old queued event cannot remove undo for a newer local commit", () => {
  const storage = memoryStorage();
  const stale = sessionFor(storage);
  const other = sessionFor(storage);
  other.commit(add("other"));
  stale.synchronize();
  stale.commit(add("local"));
  const latestState = stale.state;
  const latestRaw = storage.raw;

  stale.synchronize();
  assert.equal(stale.state, latestState);
  assert.equal(storage.raw, latestRaw);
  assert.equal(stale.lastAction, "Shopping item added");
  stale.undo();
  assert.deepEqual(names(stale), ["other"]);
});

test("removing saved data resets the household and undo cannot resurrect deleted records", () => {
  const storage = memoryStorage();
  const session = sessionFor(storage);
  session.commit(add("deleted household marker"));
  storage.raw = null;

  session.synchronize();
  assert.deepEqual(session.state, initialHousehold());
  assert.equal(session.lastAction, null);
  session.undo();
  assert.equal(storage.raw, null);

  session.commit(add("new household marker"));
  const stored = JSON.parse(storage.raw);
  assert.equal(
    stored.shoppingItems.some(
      (item) => item.name === "deleted household marker",
    ),
    false,
  );
  assert.equal(
    stored.shoppingItems.some((item) => item.name === "new household marker"),
    true,
  );
});

test("a removed key is detected before delayed events and a stale write cannot restore it", () => {
  const storage = memoryStorage();
  const session = sessionFor(storage);
  session.commit(add("deleted household marker"));
  storage.raw = null;

  assert.throws(() => session.commit(add("stale item")), {
    message: HOUSEHOLD_CHANGED_MESSAGE,
  });
  assert.equal(storage.raw, null);
  assert.deepEqual(session.state, initialHousehold());
  assert.equal(session.lastAction, null);
});

test("external corruption preserves the last valid state and rejects both changes and undo", () => {
  const storage = memoryStorage();
  const session = sessionFor(storage);
  session.commit(add("valid marker"));
  const lastValid = session.state;
  storage.raw = "corrupt external data";

  session.synchronize();
  assert.equal(session.state, lastValid);
  assert.equal(session.lastAction, null);
  assert.match(session.error, /original data has been kept/);
  assert.throws(
    () => session.commit(add("blocked")),
    /original data has been kept/,
  );
  assert.throws(() => session.undo(), /original data has been kept/);
  assert.equal(storage.raw, "corrupt external data");

  storage.raw = JSON.stringify(lastValid);
  session.synchronize();
  assert.equal(session.error, null);
  session.commit(add("recovered"));
  assert.deepEqual(
    new Set(names(session)),
    new Set(["valid marker", "recovered"]),
  );
});

test("failed persistence preserves the saved state and previous undo action", () => {
  const storage = memoryStorage();
  const session = sessionFor(storage);
  session.commit(add("first"));
  const previousState = session.state;
  const previousRaw = storage.raw;
  storage.failWrites = true;

  assert.throws(() => session.commit(add("failed")), /Could not save changes/);
  assert.equal(session.state, previousState);
  assert.equal(storage.raw, previousRaw);
  assert.equal(session.lastAction, "Shopping item added");
  assert.match(session.error, /Could not save changes/);

  storage.failWrites = false;
  session.undo();
  assert.deepEqual(names(session), []);
  assert.equal(session.error, null);
  assert.equal(session.lastAction, null);
});

test("failed reads block writes without replacing the last valid state", () => {
  const storage = memoryStorage();
  const session = sessionFor(storage);
  session.commit(add("valid marker"));
  const previousState = session.state;
  const previousRaw = storage.raw;
  storage.failReads = true;

  assert.throws(() => session.commit(add("blocked")), /storage is unavailable/);
  assert.equal(session.state, previousState);
  assert.equal(storage.raw, previousRaw);
  assert.match(session.error, /storage is unavailable/);

  storage.failReads = false;
  session.synchronize();
  assert.equal(session.error, null);
  session.commit(add("recovered"));
  assert.deepEqual(
    new Set(names(session)),
    new Set(["valid marker", "recovered"]),
  );
});

test("an empty stored value is corrupt and cannot be overwritten as an absent key", () => {
  const storage = memoryStorage("");
  const snapshot = readHouseholdSnapshot(storage);
  assert.equal(snapshot.raw, "");
  assert.match(snapshot.error, /original data has been kept/);
  const session = createHouseholdSession(snapshot, storage);
  assert.throws(
    () => session.commit(add("blocked")),
    /original data has been kept/,
  );
  assert.equal(storage.raw, "");
});
