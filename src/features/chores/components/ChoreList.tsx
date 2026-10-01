import type { Chore } from "../../../shared/types";
import { useId } from "react";
import { UserRound } from "lucide-react";
import EmptyState from "../../../shared/components/EmptyState";
import ChoreRow from "./ChoreRow";

interface ChoreListProps {
  variant: "personal" | "household";
  owner?: string;
  entries: Chore[];
  today: string;
  onStatusChange: (chore: Chore, status: Chore["status"]) => void;
}

function ChoreList({
  variant,
  owner,
  entries,
  today,
  onStatusChange,
}: ChoreListProps) {
  const headingId = useId();
  const personal = variant === "personal";
  const title = personal ? "My chores" : "Household chores";
  return (
    <section
      className={`chore-list chore-list--${variant}`}
      aria-labelledby={headingId}
    >
      <div className="chore-list-heading">
        <h2 id={headingId}>{title}</h2>
        <span>
          {entries.length} {entries.length === 1 ? "task" : "tasks"}
        </span>
        {personal && (
          <p className="chore-list-owner">
            <UserRound size={14} aria-hidden="true" />
            {owner}
          </p>
        )}
      </div>
      <div className="chore-list-columns" aria-hidden="true">
        <span>Task</span>
        {!personal && <span>Assigned to</span>}
        <span>Due date</span>
        <span>Status</span>
      </div>
      <ul aria-label={title}>
        {entries.map((chore) => (
          <ChoreRow
            key={chore.id}
            chore={chore}
            today={today}
            onStatusChange={onStatusChange}
            showAssignee={!personal}
          />
        ))}
      </ul>
      {entries.length === 0 && (
        <div className="chore-list-empty">
          <EmptyState
            message={
              personal
                ? "No chores assigned to you in this view."
                : "No chores in this view."
            }
          />
        </div>
      )}
    </section>
  );
}
export default ChoreList;
