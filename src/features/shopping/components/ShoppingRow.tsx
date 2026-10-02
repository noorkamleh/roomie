import { Trash2 } from "lucide-react";
import type { ShoppingItem } from "../../../shared/types";

interface ShoppingRowProps {
  item: ShoppingItem;
  onToggle: (item: ShoppingItem) => void;
  onRemove: (item: ShoppingItem) => void;
}

function ShoppingRow({ item, onToggle, onRemove }: ShoppingRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#F0EAF8] bg-[#FDFBFF] p-4">
      <label className="flex flex-1 cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={item.completed}
          onChange={() => onToggle(item)}
        />
        <span
          className={
            item.completed ? "text-[#9C90AC] line-through" : "font-medium"
          }
        >
          {item.name}
        </span>
        <span className="rounded-lg bg-[#F0E9FF] px-2 py-1 text-xs text-[#8659BE]">
          Qty {item.quantity}
        </span>
      </label>
      <button
        type="button"
        className="icon-button"
        aria-label={`Delete ${item.name}`}
        onClick={() => onRemove(item)}
      >
        <Trash2 size={17} aria-hidden="true" />
      </button>
    </div>
  );
}
export default ShoppingRow;
