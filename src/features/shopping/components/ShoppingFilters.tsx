import type { ShoppingFilter } from "../hooks/useShoppingList";

const filters: ShoppingFilter[] = ["all", "needed", "bought"];

function ShoppingFilters({
  filter,
  onChange,
}: {
  filter: ShoppingFilter;
  onChange: (filter: ShoppingFilter) => void;
}) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="Filter shopping items"
    >
      {filters.map((status) => (
        <button
          key={status}
          type="button"
          className={`filter-button ${filter === status ? "is-active" : ""}`}
          aria-pressed={filter === status}
          onClick={() => onChange(status)}
        >
          {status}
        </button>
      ))}
    </div>
  );
}
export default ShoppingFilters;
