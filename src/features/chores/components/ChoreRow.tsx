import { usePreferences } from "../../../shared/preferences/PreferencesContext";
import { Check, CircleCheck, Clock3 } from "lucide-react";
import type { Chore } from "../../../shared/types";
import { daysUntil, dueLabel, formatDate } from "../../../shared/utils/dates";
import { memberTone } from "../../../shared/utils/memberTone";
import { choreStatuses } from "../utils/presentation";
import ChoreHistory from "./ChoreHistory";
import ChoreSwapControls, { type ChoreSwapProps } from "./ChoreSwapControls";

interface ChoreRowProps extends ChoreSwapProps {
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
  currentUser,
  members,
  onSwapRequest,
  onSwapResponse,
}: ChoreRowProps) {
  const { t, language } = usePreferences();
  const completed = chore.status === "completed";
  const hasExtras =
    !!chore.recurrence ||
    !!chore.completedBy ||
    !!chore.completionHistory?.length ||
    !!chore.swapHistory?.length ||
    (!completed &&
      (!!chore.swapRequest ||
        (currentUser === chore.assignedTo && members.length > 1)));
  const days = daysUntil(chore.dueDate, today);
  const overdue = !completed && days < 0;
  const timing = completed
    ? t("Task completed")
    : days === -1
      ? t("1 day overdue")
      : dueLabel(chore.dueDate, today);
  return (
    <li className={`chore-row chore-row--${chore.status}`}>
      <div className="chore-row-task">
        <label className="chore-completion">
          <input
            type="checkbox"
            aria-label={t("Complete {title}", { title: chore.title })}
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
          <span className="chore-cell-label">{t("Assigned to")}</span>
          <span className="chore-person">
            <span
              className="chore-assignee-avatar member-identity"
              data-member-tone={memberTone(chore.assignedTo)}
              aria-hidden="true"
            >
              {chore.assignedTo.slice(0, 1).toUpperCase()}
            </span>
            <span>{chore.assignedTo}</span>
          </span>
        </div>
      )}
      <div className="chore-row-date">
        <span className="chore-cell-label">{t("Due date")}</span>
        <time dateTime={chore.dueDate}>{formatDate(chore.dueDate)}</time>
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
        <span className="chore-cell-label">{t("Status")}</span>
        <select
          aria-label={t("Status of {title}", { title: chore.title })}
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
              {t(
                status === "in-progress"
                  ? "In progress"
                  : status === "completed"
                    ? "Completed"
                    : "Pending",
              )}
            </option>
          ))}
        </select>
      </label>
      {hasExtras && (
        <div className="chore-row-extras">
          {chore.recurrence && (
            <p className="chore-recurrence">
              {t(
                chore.recurrence.frequency === "weekly" ? "Weekly" : "Monthly",
              )}
              {" · "}
              {t("Rotation: {members}", {
                members: chore.recurrence.rotation.join(
                  language === "ar" ? " ← " : " → ",
                ),
              })}
            </p>
          )}
          <ChoreHistory chore={chore} />
          <ChoreSwapControls
            chore={chore}
            currentUser={currentUser}
            members={members}
            onSwapRequest={onSwapRequest}
            onSwapResponse={onSwapResponse}
          />
        </div>
      )}
    </li>
  );
}
export default ChoreRow;
