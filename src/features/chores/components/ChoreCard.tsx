import { CalendarDays, CircleCheck, Clock3, ListChecks } from "lucide-react";
import type { Chore } from "../../../shared/types";
import { daysUntil, dueLabel } from "../../../shared/utils/dates";
import StatusBadge from "../../../shared/components/StatusBadge";
import { choreStatuses, formatChoreDate } from "../utils/presentation";

interface ChoreCardProps {
  chore: Chore;
  today: string;
  onStatusChange: (chore: Chore, status: Chore["status"]) => void;
}

function ChoreCard({ chore, today, onStatusChange }: ChoreCardProps) {
  const completed = chore.status === "completed";
  const overdue = !completed && daysUntil(chore.dueDate, today) < 0;
  return (
    <article className={`chore-card chore-card--${chore.status}`}>
      <div className="chore-card-topline">
        <span className="chore-kind">
          <ListChecks size={13} aria-hidden="true" />
          Household chore
        </span>
        <div className="chore-status">
          <StatusBadge status={chore.status} />
        </div>
      </div>
      <div className="chore-card-heading">
        <div className="chore-icon">
          {completed ? (
            <CircleCheck size={24} strokeWidth={1.7} aria-hidden="true" />
          ) : (
            <ListChecks size={24} strokeWidth={1.7} aria-hidden="true" />
          )}
        </div>
        <h2>{chore.title}</h2>
      </div>
      <dl className="chore-details">
        <div>
          <dt>Assigned to</dt>
          <dd>
            <span className="chore-assignee-avatar" aria-hidden="true">
              {chore.assignedTo.slice(0, 1).toUpperCase()}
            </span>
            {chore.assignedTo}
          </dd>
        </div>
        <div>
          <dt>Due date</dt>
          <dd>
            <CalendarDays size={14} aria-hidden="true" />
            <time dateTime={chore.dueDate}>
              {formatChoreDate(chore.dueDate)}
            </time>
          </dd>
        </div>
      </dl>
      <div className="chore-card-footer">
        <p className={`chore-timing ${overdue ? "is-overdue" : ""}`}>
          {completed ? (
            <CircleCheck size={15} aria-hidden="true" />
          ) : (
            <Clock3 size={15} aria-hidden="true" />
          )}
          {completed ? "Task completed" : dueLabel(chore.dueDate, today)}
        </p>
        <label className="chore-status-control">
          <span>Status</span>
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
      </div>
    </article>
  );
}
export default ChoreCard;
