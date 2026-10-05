import type { Chore } from "../../../shared/types";

export const choreStatuses: Chore["status"][] = [
  "pending",
  "in-progress",
  "completed",
];

export { formatDate as formatChoreDate } from "../../../shared/utils/dates";
