import type { Bill } from "../../../shared/types";
import { daysUntil } from "../../../shared/utils/dates.ts";
export type BillStatus = "pending" | "due-soon" | "overdue" | "paid";

export function billStatus(bill: Bill, today: string): BillStatus {
  if (bill.status === "paid") return "paid";
  const days = daysUntil(bill.dueDate, today);
  return days < 0 ? "overdue" : days <= 3 ? "due-soon" : "pending";
}

const priority: Record<BillStatus, number> = {
  overdue: 0,
  "due-soon": 1,
  pending: 2,
  paid: 3,
};

export function prioritizeBills(bills: Bill[], today: string) {
  return [...bills].sort(
    (a, b) =>
      priority[billStatus(a, today)] - priority[billStatus(b, today)] ||
      (a.status === "paid"
        ? b.dueDate.localeCompare(a.dueDate)
        : a.dueDate.localeCompare(b.dueDate)),
  );
}

export function countBillStatuses(bills: Bill[], today: string) {
  const counts = {
    all: bills.length,
    pending: 0,
    "due-soon": 0,
    overdue: 0,
    paid: 0,
  };
  bills.forEach((bill) => counts[billStatus(bill, today)]++);
  return counts;
}
