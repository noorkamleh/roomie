import type { HouseholdState } from "../../../shared/types";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
export function isDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}
export function isMoney(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0 &&
    value <= 100000000 &&
    Math.abs(value * 100 - Math.round(value * 100)) < 0.00001
  );
}
export function isText(value: unknown): value is string {
  return (
    typeof value === "string" && value.trim().length > 0 && value.length <= 200
  );
}
export function isHousehold(value: unknown): value is HouseholdState {
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    !isText(value.name) ||
    !Array.isArray(value.members) ||
    value.members.length === 0
  )
    return false;
  const members = value.members;
  if (
    !members.every(
      (member) => isRecord(member) && isText(member.id) && isText(member.name),
    )
  )
    return false;
  const names = members.map((member) => member.name);
  if (
    new Set(names.map((name) => String(name).toLowerCase())).size !==
      names.length ||
    !names.includes(value.currentUser)
  )
    return false;
  const validList = (
    list: unknown,
    check: (item: Record<string, unknown>) => boolean,
  ) =>
    Array.isArray(list) &&
    list.every((item) => isRecord(item) && isText(item.id) && check(item)) &&
    new Set(list.map((item) => item.id)).size === list.length;
  const validParticipants = (list: unknown) =>
    Array.isArray(list) &&
    list.length > 0 &&
    new Set(list).size === list.length &&
    list.every((name) => names.includes(name));
  return (
    validList(
      value.expenses,
      (item) =>
        isText(item.title) &&
        isText(item.category) &&
        isMoney(item.amount) &&
        isDate(item.date) &&
        names.includes(item.paidBy) &&
        validParticipants(item.participants),
    ) &&
    validList(
      value.bills,
      (item) =>
        isText(item.title) &&
        isMoney(item.amount) &&
        isDate(item.dueDate) &&
        ["paid", "pending"].includes(String(item.status)),
    ) &&
    validList(
      value.chores,
      (item) =>
        isText(item.title) &&
        names.includes(item.assignedTo) &&
        isDate(item.dueDate) &&
        ["pending", "in-progress", "completed"].includes(String(item.status)),
    ) &&
    validList(
      value.shoppingItems,
      (item) =>
        isText(item.name) &&
        Number.isInteger(item.quantity) &&
        Number(item.quantity) > 0 &&
        typeof item.completed === "boolean",
    ) &&
    validList(
      value.settlements,
      (item) =>
        names.includes(item.from) &&
        names.includes(item.to) &&
        item.from !== item.to &&
        isMoney(item.amount) &&
        isDate(item.date),
    )
  );
}
