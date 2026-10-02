import type { ShoppingItem } from "../../../shared/types";
import EmptyState from "../../../shared/components/EmptyState";
import ShoppingRow from "./ShoppingRow";

interface ShoppingListProps {
  entries: ShoppingItem[];
  onToggle: (item: ShoppingItem) => void;
  onRemove: (item: ShoppingItem) => void;
}

function ShoppingList({ entries, onToggle, onRemove }: ShoppingListProps) {
  return (
    <section className="shopping-list" aria-labelledby="shopping-list-heading">
      <div className="shopping-list-heading">
        <h2 id="shopping-list-heading">Shopping list</h2>
        <span>
          {entries.length} {entries.length === 1 ? "item" : "items"}
        </span>
      </div>
      <div className="shopping-list-columns" aria-hidden="true">
        <span>Item</span>
        <span>Quantity</span>
        <span>Status</span>
        <span>Actions</span>
      </div>
      <ul aria-label="Shopping list">
        {entries.map((item) => (
          <ShoppingRow
            key={item.id}
            item={item}
            onToggle={onToggle}
            onRemove={onRemove}
          />
        ))}
      </ul>
      {entries.length === 0 && (
        <div className="shopping-list-empty">
          <EmptyState message="Your shopping list is clear. Add what your household needs." />
        </div>
      )}
    </section>
  );
}
export default ShoppingList;
