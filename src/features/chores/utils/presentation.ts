import type { Chore } from "../../../shared/types";

export const choreStatuses: Chore["status"][] = [
  "pending",
  "in-progress",
  "completed",
];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function formatChoreDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`));
}
