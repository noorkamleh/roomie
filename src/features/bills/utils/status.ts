import type { Bill } from "../../../shared/types";
import { daysUntil } from "../../../shared/utils/dates.ts";
export type BillStatus = "pending" | "due-soon" | "overdue" | "paid";

export function billStatus(bill: Bill, today: string): BillStatus {
  if (bill.status === "paid") return "paid";
  const days = daysUntil(bill.dueDate, today);
  return days < 0 ? "overdue" : days <= 3 ? "due-soon" : "pending";
}
