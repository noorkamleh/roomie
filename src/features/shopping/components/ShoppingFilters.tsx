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
      className="shopping-filters"
      role="group"
      aria-label="Filter shopping items"
    >
      {filters.map((status) => (
        <button
          key={status}
          type="button"
          className={`shopping-filter shopping-filter--${status} ${filter === status ? "is-active" : ""}`}
          aria-pressed={filter === status}
          onClick={() => onChange(status)}
        >
          <span className="shopping-filter-dot" aria-hidden="true" />
          {status}
        </button>
      ))}
    </div>
  );
}
export default ShoppingFilters;
