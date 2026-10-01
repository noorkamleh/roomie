import { Check, CircleCheck, Clock3 } from "lucide-react";
import type { Chore } from "../../../shared/types";
import { daysUntil, dueLabel } from "../../../shared/utils/dates";
import { choreStatuses, formatChoreDate } from "../utils/presentation";

interface ChoreRowProps {
  showAssignee: boolean;
  chore: Chore;
  today: string;
  onStatusChange: (chore: Chore, status: Chore["status"]) => void;
}

function ChoreRow({
  chore,
  today,
  showAssignee,
  onStatusChange,
}: ChoreRowProps) {
  const completed = chore.status === "completed";
  const days = daysUntil(chore.dueDate, today);
  const overdue = !completed && days < 0;
  const timing = completed
    ? "Task completed"
    : days === -1
      ? "1 day overdue"
      : dueLabel(chore.dueDate, today);
  return (
    <li className={`chore-row chore-row--${chore.status}`}>
      <div className="chore-row-task">
        <label className="chore-completion">
          <input
            type="checkbox"
            aria-label={`Complete ${chore.title}`}
            checked={completed}
            onChange={(event) =>
              onStatusChange(
                chore,
                event.target.checked ? "completed" : "pending",
              )
            }
          />
          <span aria-hidden="true">
            {completed && <Check size={15} strokeWidth={2.5} />}
          </span>
        </label>
        <h3>{chore.title}</h3>
      </div>
      {showAssignee && (
        <div className="chore-row-assignee">
          <span className="chore-cell-label">Assigned to</span>
          <span className="chore-person">
            <span className="chore-assignee-avatar" aria-hidden="true">
              {chore.assignedTo.slice(0, 1).toUpperCase()}
            </span>
            <span>{chore.assignedTo}</span>
          </span>
        </div>
      )}
      <div className="chore-row-date">
        <span className="chore-cell-label">Due date</span>
        <time dateTime={chore.dueDate}>{formatChoreDate(chore.dueDate)}</time>
        <p className={`chore-timing ${overdue ? "is-overdue" : ""}`}>
          {completed ? (
            <CircleCheck size={12} aria-hidden="true" />
          ) : (
            <Clock3 size={12} aria-hidden="true" />
          )}
          {timing}
        </p>
      </div>
      <label className="chore-status-control">
        <span className="chore-cell-label">Status</span>
        <select
          aria-label={`Status of ${chore.title}`}
          value={chore.status}
          onChange={(event) => {
            const status = choreStatuses.find(
              (value) => value === event.target.value,
            );
            if (status) onStatusChange(chore, status);
          }}
        >
          {choreStatuses.map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("-", " ")}
            </option>
          ))}
        </select>
      </label>
    </li>
  );
}
export default ChoreRow;
