import { Check, Trash2 } from "lucide-react";
import type { ShoppingItem } from "../../../shared/types";

interface ShoppingRowProps {
  item: ShoppingItem;
  onToggle: (item: ShoppingItem) => void;
  onRemove: (item: ShoppingItem) => void;
}

function ShoppingRow({ item, onToggle, onRemove }: ShoppingRowProps) {
  return (
    <li
      className={`shopping-row ${item.completed ? "shopping-row--bought" : ""}`}
    >
      <label className="shopping-item-name">
        <span className="shopping-completion">
          <input
            type="checkbox"
            aria-label={`Mark ${item.name} as bought`}
            checked={item.completed}
            onChange={() => onToggle(item)}
          />
          <span aria-hidden="true">
            {item.completed && <Check size={15} strokeWidth={2.5} />}
          </span>
        </span>
        <span className="shopping-item-title">{item.name}</span>
      </label>
      <span className="shopping-quantity">
        <span>Qty</span>
        {item.quantity}
      </span>
      <span className="shopping-item-status">
        <span aria-hidden="true" />
        {item.completed ? "Bought" : "Needed"}
      </span>
      <button
        type="button"
        className="shopping-delete-button"
        aria-label={`Delete ${item.name}`}
        onClick={() => onRemove(item)}
      >
        <Trash2 size={15} aria-hidden="true" />
        <span>Delete</span>
      </button>
    </li>
  );
}
export default ShoppingRow;
