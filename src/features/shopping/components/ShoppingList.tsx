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
    <div className="panel space-y-3">
      {entries.map((item) => (
        <ShoppingRow
          key={item.id}
          item={item}
          onToggle={onToggle}
          onRemove={onRemove}
        />
      ))}
      {entries.length === 0 && (
        <EmptyState message="Your shopping list is clear. Add what your household needs." />
      )}
    </div>
  );
}
export default ShoppingList;
