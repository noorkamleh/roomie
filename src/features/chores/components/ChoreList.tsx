import { usePreferences } from "../../../shared/preferences/PreferencesContext";
import type { Chore } from "../../../shared/types";
import { useId } from "react";
import { CircleCheck, UserRound } from "lucide-react";
import EmptyState from "../../../shared/components/EmptyState";
import ChoreRow from "./ChoreRow";
import CompletedChores from "./CompletedChores";
import type { ChoreSwapProps } from "./ChoreSwapControls";

interface ChoreListProps extends ChoreSwapProps {
  variant: "personal" | "household";
  owner?: string;
  openCount?: number;
  entries: Chore[];
  showCompleted: boolean;
  today: string;
  onStatusChange: (chore: Chore, status: Chore["status"]) => void;
}

function ChoreList({
  variant,
  owner,
  openCount,
  entries,
  showCompleted,
  today,
  onStatusChange,
  ...swapProps
}: ChoreListProps) {
  const { t } = usePreferences();
  const headingId = useId();
  const personal = variant === "personal";
  const title = t(personal ? "My chores" : "Household chores");
  const active = entries.filter((chore) => chore.status !== "completed");
  const completed = entries.filter((chore) => chore.status === "completed");
  const allDone = personal && openCount === 0;
  return (
    <section
      className={`chore-list chore-list--${variant}`}
      aria-labelledby={headingId}
    >
      <div className="chore-list-heading">
        <h2 id={headingId}>{title}</h2>
        <span>
          {t(entries.length === 1 ? "{count} task" : "{count} tasks", {
            count: entries.length,
          })}
        </span>
        {personal && (
          <p className="chore-list-owner">
            <UserRound size={14} aria-hidden="true" />
            {owner}
          </p>
        )}
      </div>
      {active.length > 0 && (
        <div className="chore-list-columns" aria-hidden="true">
          <span>{t("Task")}</span>
          {!personal && <span>{t("Assigned to")}</span>}
          <span>{t("Due date")}</span>
          <span>{t("Status")}</span>
        </div>
      )}
      <ul aria-label={title}>
        {active.map((chore) => (
          <ChoreRow
            key={chore.id}
            chore={chore}
            today={today}
            onStatusChange={onStatusChange}
            showAssignee={!personal}
            {...swapProps}
          />
        ))}
      </ul>
      {allDone && (
        <div className="chore-list-done">
          <CircleCheck size={23} aria-hidden="true" />
          <div>
            <h3>{t("All your tasks are done")}</h3>
            <p>
              {t(
                completed.length > 0
                  ? "Completed chores stay below for your records."
                  : "You have no open tasks in this household.",
              )}
            </p>
          </div>
        </div>
      )}
      {completed.length > 0 && (
        <CompletedChores
          title={title}
          entries={completed}
          initiallyOpen={showCompleted}
          today={today}
          onStatusChange={onStatusChange}
          showAssignee={!personal}
          {...swapProps}
        />
      )}
      {entries.length === 0 && !allDone && (
        <div className="chore-list-empty">
          <EmptyState
            message={t(
              personal
                ? "No chores assigned to you in this view."
                : "No chores in this view.",
            )}
          />
        </div>
      )}
    </section>
  );
}
export default ChoreList;
