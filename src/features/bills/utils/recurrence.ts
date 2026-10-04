import type { Bill } from "../../../shared/types";

export function validateBillRecurrence(bill: Record<string, unknown>) {
  if (
    bill.seriesId !== undefined &&
    (typeof bill.seriesId !== "string" ||
      !bill.seriesId.trim() ||
      bill.seriesId.length > 200)
  )
    return false;
  if (bill.recurrence === undefined) return true;
  const recurrence = bill.recurrence;
  return (
    typeof recurrence === "object" &&
    recurrence !== null &&
    !Array.isArray(recurrence) &&
    "frequency" in recurrence &&
    recurrence.frequency === "monthly" &&
    (!("anchorDay" in recurrence) ||
      recurrence.anchorDay === undefined ||
      (Number.isInteger(recurrence.anchorDay) &&
        Number(recurrence.anchorDay) >= 1 &&
        Number(recurrence.anchorDay) <= 31))
  );
}

export function nextBillOccurrence(bill: Bill): Bill | undefined {
  if (
    !bill.recurrence ||
    bill.status !== "paid" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(bill.dueDate)
  )
    return undefined;
  const date = new Date(`${bill.dueDate}T00:00:00Z`);
  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== bill.dueDate
  )
    return undefined;
  const anchorDay = bill.recurrence.anchorDay ?? date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + 1);
  const monthEnd = new Date(date.getTime());
  monthEnd.setUTCMonth(monthEnd.getUTCMonth() + 1);
  monthEnd.setUTCDate(0);
  date.setUTCDate(Math.min(anchorDay, monthEnd.getUTCDate()));
  const dueDate = date.toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return undefined;
  const seriesId = bill.seriesId ?? bill.id;
  return {
    ...bill,
    id: `${seriesId}-${dueDate}`,
    seriesId,
    dueDate,
    status: "pending",
    recurrence: { frequency: "monthly", anchorDay },
  };
}
