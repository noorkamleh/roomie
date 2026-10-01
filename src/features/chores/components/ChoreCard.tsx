import { ListChecks } from "lucide-react";
import type { Chore } from "../../../shared/types";
import { dueLabel } from "../../../shared/utils/dates";
import StatusBadge from "../../../shared/components/StatusBadge";

interface ChoreCardProps {
  chore: Chore;
  today: string;
  onStatusChange: (chore: Chore, status: Chore["status"]) => void;
}

function ChoreCard({ chore, today, onStatusChange }: ChoreCardProps) {
  return (
    <article className="panel">
      <div className="flex items-start gap-3">
        <div className="feature-icon">
          <ListChecks size={22} aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h2
            className={`font-semibold ${chore.status === "completed" ? "text-[#968BA7] line-through" : ""}`}
          >
            {chore.title}
          </h2>
          <p className="mt-1 text-xs text-[#8A809E]">
            Assigned to {chore.assignedTo}
          </p>
        </div>
        <StatusBadge status={chore.status} />
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[#8A809E]">
          {chore.status === "completed"
            ? `Due ${chore.dueDate}`
            : dueLabel(chore.dueDate, today)}
        </p>
        <select
          className="compact-select"
          aria-label={`Status of ${chore.title}`}
          value={chore.status}
          onChange={(event) =>
            onStatusChange(chore, event.target.value as Chore["status"])
          }
        >
          {["pending", "in-progress", "completed"].map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("-", " ")}
            </option>
          ))}
        </select>
      </div>
    </article>
  );
}
export default ChoreCard;
