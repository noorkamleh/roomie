import type { Expense, HouseholdState } from "../../../shared/types";
import { splitExpense } from "../../expenses/utils/calculations.ts";
import { validateChoreExtras } from "../../chores/utils/recurrence.ts";
import { MAX_MONEY_CENTS, toCents } from "../../../shared/utils/money.ts";
import { validateBillRecurrence } from "../../bills/utils/recurrence.ts";

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
export function isBudget(value: unknown) {
  const validCents = (cents: unknown) =>
    Number.isSafeInteger(cents) &&
    Number(cents) >= 0 &&
    Number(cents) <= MAX_MONEY_CENTS;
  return (
    isRecord(value) &&
    typeof value.month === "string" &&
    /^\d{4}-(0[1-9]|1[0-2])$/.test(value.month) &&
    validCents(value.totalCents) &&
    isRecord(value.categories) &&
    Object.entries(value.categories).every(
      ([category, cents]) => isText(category) && validCents(cents),
    )
  );
}
export function isHousehold(value: unknown): value is HouseholdState {
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    !isText(value.name) ||
    !Array.isArray(value.members) ||
    value.members.length === 0 ||
    (value.simplifyDebts !== undefined &&
      typeof value.simplifyDebts !== "boolean")
  )
    return false;
  const members = value.members;
  if (
    !members.every(
      (member) =>
        isRecord(member) &&
        isText(member.id) &&
        isText(member.name) &&
        (member.archived === undefined || typeof member.archived === "boolean"),
    )
  )
    return false;
  const names = members.map((member) => member.name);
  const activeNames = members
    .filter((member) => member.archived !== true)
    .map((member) => member.name);
  if (
    new Set(names.map((name) => String(name).toLowerCase())).size !==
      names.length ||
    new Set(members.map((member) => member.id)).size !== members.length ||
    activeNames.length === 0 ||
    !activeNames.includes(value.currentUser) ||
    (value.budgets !== undefined &&
      (!Array.isArray(value.budgets) ||
        !value.budgets.every(isBudget) ||
        new Set(value.budgets.map((budget) => budget.month)).size !==
          value.budgets.length))
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
  const validUtilityKind = (kind: unknown) =>
    kind === undefined ||
    ["electricity", "internet", "water"].includes(String(kind));
  const validAmount = (item: Record<string, unknown>) =>
    isMoney(item.amount) &&
    (item.amountCents === undefined ||
      (Number.isSafeInteger(item.amountCents) &&
        item.amountCents === toCents(item.amount)));
  const validSplit = (item: Record<string, unknown>) => {
    try {
      splitExpense(item as unknown as Expense);
      return true;
    } catch {
      return false;
    }
  };
  const validPurchaseSnapshot = (list: unknown) =>
    list === undefined ||
    (Array.isArray(list) &&
      list.length > 0 &&
      new Set(list.map((item) => (isRecord(item) ? item.id : undefined)))
        .size === list.length &&
      list.every(
        (item) =>
          isRecord(item) &&
          isText(item.id) &&
          isText(item.name) &&
          Number.isSafeInteger(item.quantity) &&
          Number(item.quantity) > 0 &&
          (item.unit === undefined || isText(item.unit)),
      ));
  const validBillPayment = (bill: Record<string, unknown>) => {
    if (!Array.isArray(value.expenses)) return false;
    const payment = value.expenses.find(
      (expense) => isRecord(expense) && expense.id === `bill-${bill.id}`,
    );
    // Historical paid bills can predate linked expense records.
    return (
      payment === undefined ||
      (isRecord(payment) &&
        bill.status === "paid" &&
        payment.category === "Bills" &&
        payment.amount === bill.amount)
    );
  };
  return (
    validList(
      value.expenses,
      (item) =>
        isText(item.title) &&
        isText(item.category) &&
        validUtilityKind(item.utilityKind) &&
        validAmount(item) &&
        isDate(item.date) &&
        names.includes(item.paidBy) &&
        validParticipants(item.participants) &&
        validSplit(item) &&
        validPurchaseSnapshot(item.shoppingItems),
    ) &&
    validList(
      value.bills,
      (item) =>
        isText(item.title) &&
        validUtilityKind(item.utilityKind) &&
        validAmount(item) &&
        isDate(item.dueDate) &&
        ["paid", "pending"].includes(String(item.status)) &&
        validateBillRecurrence(item) &&
        validBillPayment(item),
    ) &&
    validList(
      value.chores,
      (item) =>
        isText(item.title) &&
        names.includes(item.assignedTo) &&
        isDate(item.dueDate) &&
        ["pending", "in-progress", "completed"].includes(String(item.status)) &&
        validateChoreExtras(item, names) &&
        (item.status === "completed" ||
          (activeNames.includes(item.assignedTo) &&
            (item.recurrence === undefined ||
              (isRecord(item.recurrence) &&
                Array.isArray(item.recurrence.rotation) &&
                item.recurrence.rotation.every((name) =>
                  activeNames.includes(name),
                ))) &&
            (item.swapRequest === undefined ||
              (isRecord(item.swapRequest) &&
                activeNames.includes(item.swapRequest.requestedBy) &&
                activeNames.includes(item.swapRequest.requestedTo))))),
    ) &&
    validList(
      value.shoppingItems,
      (item) =>
        isText(item.name) &&
        Number.isInteger(item.quantity) &&
        Number(item.quantity) > 0 &&
        (item.unit === undefined || isText(item.unit)) &&
        typeof item.completed === "boolean" &&
        (item.expenseId === undefined ||
          (isText(item.expenseId) &&
            Array.isArray(value.expenses) &&
            value.expenses.some(
              (expense) =>
                isRecord(expense) &&
                expense.id === item.expenseId &&
                Array.isArray(expense.shoppingItems) &&
                expense.shoppingItems.some(
                  (purchaseItem) =>
                    isRecord(purchaseItem) && purchaseItem.id === item.id,
                ),
            ))),
    ) &&
    validList(
      value.settlements,
      (item) =>
        names.includes(item.from) &&
        names.includes(item.to) &&
        item.from !== item.to &&
        validAmount(item) &&
        isDate(item.date),
    )
  );
}
