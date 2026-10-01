import type { Chore } from "../../../shared/types";
import EmptyState from "../../../shared/components/EmptyState";
import ChoreRow from "./ChoreRow";

interface ChoreListProps {
  entries: Chore[];
  today: string;
  onStatusChange: (chore: Chore, status: Chore["status"]) => void;
}

function ChoreList({ entries, today, onStatusChange }: ChoreListProps) {
  return (
    <section className="chore-list" aria-labelledby="chore-list-heading">
      <div className="chore-list-heading">
        <h2 id="chore-list-heading">Household chores</h2>
        <span>
          {entries.length} {entries.length === 1 ? "task" : "tasks"}
        </span>
      </div>
      <div className="chore-list-columns" aria-hidden="true">
        <span>Task</span>
        <span>Assigned to</span>
        <span>Due date</span>
        <span>Status</span>
      </div>
      <ul aria-label="Household chores">
        {entries.map((chore) => (
          <ChoreRow
            key={chore.id}
            chore={chore}
            today={today}
            onStatusChange={onStatusChange}
          />
        ))}
      </ul>
      {entries.length === 0 && (
        <div className="chore-list-empty">
          <EmptyState message="No chores in this view." />
        </div>
      )}
    </section>
  );
}
export default ChoreList;
