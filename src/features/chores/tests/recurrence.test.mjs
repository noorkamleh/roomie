import assert from "node:assert/strict";
import test from "node:test";
import { nextOccurrence, validateChoreExtras } from "../utils/recurrence.ts";

const names = ["Noor", "Sara", "Reem"];
const members = names.map((name, index) => ({ id: String(index + 1), name }));
const chore = (overrides = {}) => ({
  id: "clean-original",
  seriesId: "clean-series",
  title: "Clean kitchen",
  assignedTo: "Noor",
  dueDate: "2026-10-04",
  status: "completed",
  recurrence: { frequency: "weekly", rotation: [...names] },
  ...overrides,
});

test("weekly occurrences advance by seven calendar days and rotate in order", () => {
  const original = chore({ dueDate: "2026-12-28" });
  const snapshot = structuredClone(original);
  const next = nextOccurrence(original, members);
  assert.equal(next.dueDate, "2027-01-04");
  assert.equal(next.assignedTo, "Sara");
  assert.equal(next.status, "pending");
  assert.equal(next.id, "clean-series-2027-01-04");
  assert.equal(next.seriesId, "clean-series");
  const third = nextOccurrence({ ...next, status: "completed" }, members);
  assert.equal(third.assignedTo, "Reem");
  assert.equal(third.dueDate, "2027-01-11");
  const fourth = nextOccurrence({ ...third, status: "completed" }, members);
  assert.equal(fourth.assignedTo, "Noor");
  assert.deepEqual(original, snapshot);
  assert.notEqual(next.recurrence.rotation, original.recurrence.rotation);
});

test("monthly occurrences retain their original anchor through short months", () => {
  for (const [year, february] of [
    [2026, "2026-02-28"],
    [2028, "2028-02-29"],
  ]) {
    const january = chore({
      dueDate: `${year}-01-31`,
      recurrence: { frequency: "monthly", rotation: [...names] },
    });
    const next = nextOccurrence(january, members);
    assert.equal(next.dueDate, february);
    assert.equal(next.recurrence.anchorDay, 31);
    const march = nextOccurrence({ ...next, status: "completed" }, members);
    assert.equal(march.dueDate, `${year}-03-31`);
    assert.equal(march.assignedTo, "Reem");
  }
  const december = nextOccurrence(
    chore({
      dueDate: "2026-12-30",
      recurrence: { frequency: "monthly", rotation: ["Noor"], anchorDay: 30 },
    }),
    members,
  );
  assert.equal(december.dueDate, "2027-01-30");
  assert.equal(december.assignedTo, "Noor");
});

test("a temporary swap preserves the original rotation slot and occurrence history", () => {
  const original = chore({
    assignedTo: "Reem",
    completedBy: "Reem",
    completedOn: "2026-10-04",
    completionHistory: [{ by: "Reem", date: "2026-10-04" }],
    swapHistory: [
      { from: "Noor", to: "Sara", requestedBy: "Noor", date: "2026-10-03" },
      { from: "Sara", to: "Reem", requestedBy: "Sara", date: "2026-10-04" },
    ],
  });
  const snapshot = structuredClone(original);
  const next = nextOccurrence(original, members);
  assert.equal(next.assignedTo, "Sara");
  assert.equal(next.completedBy, undefined);
  assert.equal(next.completedOn, undefined);
  assert.equal(next.completionHistory, undefined);
  assert.equal(next.swapRequest, undefined);
  assert.equal(next.swapHistory, undefined);
  assert.deepEqual(original, snapshot);
});

test("occurrence generation requires a completed recurring task and active rotation", () => {
  assert.equal(nextOccurrence(chore({ recurrence: undefined }), members), null);
  assert.equal(nextOccurrence(chore({ status: "pending" }), members), null);
  assert.equal(nextOccurrence(chore(), []), null);
  const next = nextOccurrence(chore({ seriesId: undefined }), members);
  assert.equal(next.seriesId, "clean-original");
  assert.equal(next.id, "clean-original-2026-10-11");
  assert.equal(nextOccurrence(chore({ dueDate: "2026-02-30" }), members), null);
});

test("future occurrences skip archived members while preserving the previous rotation history", () => {
  const previous = chore({ assignedTo: "Sara" });
  const next = nextOccurrence(
    previous,
    members.map((member) => ({
      ...member,
      archived: member.name === "Reem",
    })),
  );
  assert.equal(next.assignedTo, "Noor");
  assert.deepEqual(next.recurrence.rotation, ["Noor", "Sara"]);
  assert.deepEqual(previous.recurrence.rotation, names);
});

test("legacy chores and valid recurrence, completion, request and history extras are accepted", () => {
  assert.equal(
    validateChoreExtras({ assignedTo: "Noor", status: "pending" }, names),
    true,
  );
  assert.equal(validateChoreExtras(chore(), names), true);
  assert.equal(
    validateChoreExtras(
      chore({
        recurrence: { frequency: "monthly", rotation: ["Noor"], anchorDay: 31 },
        completedBy: "Reem",
        completedOn: "2026-10-04",
        completionHistory: [{ by: "Reem", date: "2026-10-04" }],
      }),
      names,
    ),
    true,
  );
  assert.equal(
    validateChoreExtras(
      chore({
        status: "pending",
        swapRequest: {
          requestedBy: "Noor",
          requestedTo: "Sara",
          requestedOn: "2026-10-04",
        },
      }),
      names,
    ),
    true,
  );
  assert.equal(
    validateChoreExtras(
      chore({
        assignedTo: "Sara",
        recurrence: { frequency: "weekly", rotation: ["Noor", "Reem"] },
        swapHistory: [
          { from: "Noor", to: "Sara", requestedBy: "Noor", date: "2026-10-04" },
        ],
      }),
      names,
    ),
    true,
  );
});

test("malformed extras cannot introduce invalid dates or dangling household members", () => {
  const invalid = [
    { recurrence: null },
    { recurrence: { frequency: "daily", rotation: names } },
    { recurrence: { frequency: ["weekly"], rotation: names } },
    { recurrence: { frequency: "weekly", rotation: [] } },
    { recurrence: { frequency: "weekly", rotation: ["Noor", "Noor"] } },
    { recurrence: { frequency: "monthly", rotation: ["Unknown"] } },
    { recurrence: { frequency: "monthly", rotation: names, anchorDay: 32 } },
    { recurrence: { frequency: "monthly", rotation: names, anchorDay: 0 } },
    { recurrence: { frequency: "monthly", rotation: names, anchorDay: 1.5 } },
    { seriesId: " " },
    { completedBy: "Noor" },
    { completedOn: "2026-10-04" },
    { completedBy: "Unknown", completedOn: "2026-10-04" },
    { completedBy: "Noor", completedOn: "2026-02-30" },
    { completionHistory: [{ by: "Unknown", date: "2026-10-04" }] },
    { completionHistory: [{ by: "Noor", date: "2026-02-30" }] },
    { completionHistory: "invalid" },
    {
      swapRequest: {
        requestedBy: "Noor",
        requestedTo: "Sara",
        requestedOn: "2026-10-04",
      },
    },
    {
      status: "pending",
      swapRequest: {
        requestedBy: "Sara",
        requestedTo: "Reem",
        requestedOn: "2026-10-04",
      },
    },
    {
      status: "pending",
      swapRequest: {
        requestedBy: "Noor",
        requestedTo: "Noor",
        requestedOn: "2026-10-04",
      },
    },
    {
      status: "pending",
      swapRequest: {
        requestedBy: "Noor",
        requestedTo: "Unknown",
        requestedOn: "2026-10-04",
      },
    },
    {
      status: "pending",
      swapRequest: {
        requestedBy: "Noor",
        requestedTo: "Sara",
        requestedOn: "2026-02-30",
      },
    },
    {
      swapHistory: [
        {
          from: "Noor",
          to: "Unknown",
          requestedBy: "Noor",
          date: "2026-10-04",
        },
      ],
    },
    {
      swapHistory: [
        { from: "Noor", to: "Sara", requestedBy: "Reem", date: "2026-10-04" },
      ],
    },
    {
      swapHistory: [
        { from: "Noor", to: "Noor", requestedBy: "Noor", date: "2026-10-04" },
      ],
    },
    {
      swapHistory: [
        { from: "Noor", to: "Sara", requestedBy: "Noor", date: "2026-02-30" },
      ],
    },
    { swapHistory: {} },
  ];
  for (const extras of invalid)
    assert.equal(
      validateChoreExtras(chore(extras), names),
      false,
      JSON.stringify(extras),
    );
});
