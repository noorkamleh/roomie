import type { ChoreFilter } from "../hooks/useChoreList";
import { choreStatuses } from "../utils/presentation";

const filters: ChoreFilter[] = ["all", ...choreStatuses];

function ChoreFilters({
  filter,
  onChange,
}: {
  filter: ChoreFilter;
  onChange: (filter: ChoreFilter) => void;
}) {
  return (
    <div className="chore-filters" role="group" aria-label="Filter chores">
      {filters.map((status) => (
        <button
          key={status}
          type="button"
          className={`chore-filter chore-filter--${status} ${filter === status ? "is-active" : ""}`}
          aria-pressed={filter === status}
          onClick={() => onChange(status)}
        >
          <span className="chore-filter-dot" aria-hidden="true" />
          {status.replaceAll("-", " ")}
        </button>
      ))}
    </div>
  );
}
export default ChoreFilters;
