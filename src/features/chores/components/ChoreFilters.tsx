import type { ChoreFilter } from "../hooks/useChoreList";

const filters: ChoreFilter[] = ["all", "pending", "in-progress", "completed"];

function ChoreFilters({
  filter,
  onChange,
}: {
  filter: ChoreFilter;
  onChange: (filter: ChoreFilter) => void;
}) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="Filter chores"
    >
      {filters.map((status) => (
        <button
          key={status}
          type="button"
          className={`filter-button ${filter === status ? "is-active" : ""}`}
          aria-pressed={filter === status}
          onClick={() => onChange(status)}
        >
          {status.replaceAll("-", " ")}
        </button>
      ))}
    </div>
  );
}
export default ChoreFilters;
