import { useState } from "react";
import { ChevronDown, CircleCheck } from "lucide-react";
import type { Chore } from "../../../shared/types";
import ChoreRow from "./ChoreRow";

function CompletedChores({
  title,
  entries,
  initiallyOpen,
  today,
  onStatusChange,
  showAssignee,
}: {
  title: string;
  entries: Chore[];
  initiallyOpen: boolean;
  today: string;
  onStatusChange: (chore: Chore, status: Chore["status"]) => void;
  showAssignee: boolean;
}) {
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <details
      className="completed-chores"
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary>
        <CircleCheck size={16} aria-hidden="true" />
        Completed<span>{entries.length}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </summary>
      <ul aria-label={`Completed ${title.toLowerCase()}`}>
        {entries.map((chore) => (
          <ChoreRow
            key={chore.id}
            chore={chore}
            today={today}
            onStatusChange={onStatusChange}
            showAssignee={showAssignee}
          />
        ))}
      </ul>
    </details>
  );
}
export default CompletedChores;
