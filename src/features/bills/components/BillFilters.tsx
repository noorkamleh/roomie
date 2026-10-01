import type { BillFilter } from "../hooks/useBillList";

const filters: BillFilter[] = ["all", "pending", "due-soon", "overdue", "paid"];

interface BillFiltersProps {
  filter: BillFilter;
  onChange: (filter: BillFilter) => void;
}

function BillFilters({ filter, onChange }: BillFiltersProps) {
  return (
    <div className="bill-filters" role="group" aria-label="Filter bills">
      {filters.map((status) => (
        <button
          key={status}
          type="button"
          className={`bill-filter bill-filter--${status} ${filter === status ? "is-active" : ""}`}
          aria-pressed={filter === status}
          onClick={() => onChange(status)}
        >
          <span className="bill-filter-dot" aria-hidden="true" />
          {status.replaceAll("-", " ")}
        </button>
      ))}
    </div>
  );
}
export default BillFilters;
