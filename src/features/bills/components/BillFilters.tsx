import type { BillFilter } from "../hooks/useBillList";

const filters: BillFilter[] = ["all", "pending", "due-soon", "overdue", "paid"];

interface BillFiltersProps {
  filter: BillFilter;
  onChange: (filter: BillFilter) => void;
}

function BillFilters({ filter, onChange }: BillFiltersProps) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="Filter bills"
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
export default BillFilters;
