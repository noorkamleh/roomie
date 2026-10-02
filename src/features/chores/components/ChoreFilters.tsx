import type { ChoreFilter } from "../hooks/useChoreList";
import StatusFilters from "../../../shared/components/StatusFilters";
const options = [
  { value: "all", label: "All", tone: "purple" },
  { value: "pending", label: "Pending", tone: "purple" },
  { value: "in-progress", label: "In progress", tone: "blue" },
  { value: "completed", label: "Completed", tone: "mint" },
] as const;
function ChoreFilters({
  filter,
  counts,
  onChange,
}: {
  filter: ChoreFilter;
  counts: Record<ChoreFilter, number>;
  onChange: (filter: ChoreFilter) => void;
}) {
  return (
    <StatusFilters
      label="Filter chores"
      options={options}
      value={filter}
      counts={counts}
      onChange={onChange}
    />
  );
}
export default ChoreFilters;
