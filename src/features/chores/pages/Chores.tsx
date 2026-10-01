import { useAddDialog } from "../../../shared/hooks/useAddDialog";
import { useState } from "react";
import { Plus, ListChecks } from "lucide-react";
import type { Chore } from "../../../shared/types";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import { useAction } from "../../../shared/hooks/useAction";
import { useToday } from "../../../shared/hooks/useToday";
import { dueLabel } from "../../../shared/utils/dates";
import PageHeader from "../../../shared/components/PageHeader";
import Modal from "../../../shared/components/Modal";
import StatusBadge from "../../../shared/components/StatusBadge";
import EmptyState from "../../../shared/components/EmptyState";
import ChoreForm from "../components/ChoreForm";
function Chores() {
  const { state, commit } = useHousehold();
  const today = useToday();
  const { isOpen: adding, open: openAdd, close: closeAdd } = useAddDialog();
  const [filter, setFilter] = useState("all");
  const { error, perform } = useAction();
  const entries = [...state.chores]
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .filter((chore) => filter === "all" || chore.status === filter);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Chores"
        description="Share the work, assign responsibilities, and keep your home running smoothly."
        action={
          <button className="primary-button" onClick={openAdd}>
            <Plus size={18} />
            Add chore
          </button>
        }
      />
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filter chores"
      >
        {["all", "pending", "in-progress", "completed"].map((status) => (
          <button
            key={status}
            className={`filter-button ${filter === status ? "is-active" : ""}`}
            aria-pressed={filter === status}
            onClick={() => setFilter(status)}
          >
            {status.replaceAll("-", " ")}
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        {entries.map((chore) => (
          <article key={chore.id} className="panel">
            <div className="flex items-start gap-3">
              <div className="feature-icon">
                <ListChecks size={22} />
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
                  perform(() =>
                    commit({
                      type: "chore.status",
                      id: chore.id,
                      status: event.target.value as Chore["status"],
                    }),
                  )
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
        ))}
      </div>
      {entries.length === 0 && <EmptyState message="No chores in this view." />}
      {adding && (
        <Modal title="Add chore" onClose={closeAdd}>
          <ChoreForm onSaved={closeAdd} />
        </Modal>
      )}
    </div>
  );
}
export default Chores;
