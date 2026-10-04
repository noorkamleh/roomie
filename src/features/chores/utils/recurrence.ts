import type { Chore, Member } from "../../../shared/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

export function validateChoreExtras(
  chore: Record<string, unknown>,
  names: unknown[],
): boolean {
  if (
    chore.seriesId !== undefined &&
    (typeof chore.seriesId !== "string" ||
      !chore.seriesId.trim() ||
      chore.seriesId.length > 200)
  )
    return false;

  if (chore.recurrence !== undefined) {
    const recurrence = chore.recurrence;
    if (
      !isRecord(recurrence) ||
      (recurrence.frequency !== "weekly" &&
        recurrence.frequency !== "monthly") ||
      !Array.isArray(recurrence.rotation) ||
      recurrence.rotation.length === 0 ||
      new Set(recurrence.rotation).size !== recurrence.rotation.length ||
      !recurrence.rotation.every((name) => names.includes(name)) ||
      (recurrence.anchorDay !== undefined &&
        (!Number.isInteger(recurrence.anchorDay) ||
          Number(recurrence.anchorDay) < 1 ||
          Number(recurrence.anchorDay) > 31))
    )
      return false;
  }

  if (
    (chore.completedBy !== undefined || chore.completedOn !== undefined) &&
    (!names.includes(chore.completedBy) || !isDate(chore.completedOn))
  )
    return false;

  if (
    chore.completionHistory !== undefined &&
    (!Array.isArray(chore.completionHistory) ||
      !chore.completionHistory.every(
        (entry) =>
          isRecord(entry) && names.includes(entry.by) && isDate(entry.date),
      ))
  )
    return false;

  if (chore.swapRequest !== undefined) {
    const request = chore.swapRequest;
    if (
      !isRecord(request) ||
      chore.status === "completed" ||
      request.requestedBy !== chore.assignedTo ||
      !names.includes(request.requestedBy) ||
      !names.includes(request.requestedTo) ||
      request.requestedBy === request.requestedTo ||
      !isDate(request.requestedOn)
    )
      return false;
  }

  if (
    chore.swapHistory !== undefined &&
    (!Array.isArray(chore.swapHistory) ||
      !chore.swapHistory.every(
        (entry) =>
          isRecord(entry) &&
          names.includes(entry.from) &&
          names.includes(entry.to) &&
          entry.from !== entry.to &&
          entry.requestedBy === entry.from &&
          isDate(entry.date),
      ))
  )
    return false;

  return true;
}

export function nextOccurrence(chore: Chore, members: Member[]): Chore | null {
  if (
    !chore.recurrence ||
    chore.status !== "completed" ||
    !isDate(chore.dueDate)
  )
    return null;

  const rotation = chore.recurrence.rotation.filter((name) =>
    members.some((member) => !member.archived && member.name === name),
  );
  if (rotation.length === 0) return null;

  const date = new Date(`${chore.dueDate}T00:00:00Z`);
  const anchorDay = chore.recurrence.anchorDay ?? date.getUTCDate();
  if (chore.recurrence.frequency === "weekly") {
    date.setUTCDate(date.getUTCDate() + 7);
  } else {
    date.setUTCDate(1);
    date.setUTCMonth(date.getUTCMonth() + 1);
    const monthEnd = new Date(date.getTime());
    monthEnd.setUTCMonth(monthEnd.getUTCMonth() + 1);
    monthEnd.setUTCDate(0);
    date.setUTCDate(Math.min(anchorDay, monthEnd.getUTCDate()));
  }
  const dueDate = date.toISOString().slice(0, 10);
  if (!isDate(dueDate)) return null;

  const originalAssignee = chore.swapHistory?.[0]?.from ?? chore.assignedTo;
  const rotationIndex = rotation.indexOf(originalAssignee);
  const assignedTo = rotation[(rotationIndex + 1) % rotation.length];
  const seriesId = chore.seriesId ?? chore.id;
  return {
    id: `${seriesId}-${dueDate}`,
    seriesId,
    title: chore.title,
    assignedTo,
    dueDate,
    status: "pending",
    recurrence: {
      frequency: chore.recurrence.frequency,
      rotation: [...rotation],
      ...(chore.recurrence.frequency === "monthly" ? { anchorDay } : {}),
    },
  };
}
