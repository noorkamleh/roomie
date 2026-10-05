import { usePreferences } from "../../../shared/preferences/PreferencesContext";
import { Check, Trash2 } from "lucide-react";
import type { ShoppingItem } from "../../../shared/types";
import { Link } from "react-router-dom";
import { formatShoppingQuantity } from "../utils/quantity";

interface ShoppingRowProps {
  item: ShoppingItem;
  onToggle: (item: ShoppingItem) => void;
  onRemove: (item: ShoppingItem) => void;
}

function ShoppingRow({ item, onToggle, onRemove }: ShoppingRowProps) {
  const { t } = usePreferences();
  return (
    <li
      className={`shopping-row ${item.completed ? "shopping-row--bought" : ""}`}
    >
      <label className="shopping-item-name">
        <span className="shopping-completion">
          <input
            type="checkbox"
            aria-label={t("Mark {name} as bought", { name: item.name })}
            checked={item.completed}
            onChange={() => onToggle(item)}
          />
          <span aria-hidden="true">
            {item.completed && <Check size={15} strokeWidth={2.5} />}
          </span>
        </span>
        <span className="shopping-item-title">{item.name}</span>
      </label>
      {item.expenseId && (
        <Link
          className="shopping-expense-link"
          to={`/expenses?expense=${encodeURIComponent(item.expenseId)}`}
        >
          {t("View expense for {name}", { name: item.name })}
        </Link>
      )}
      <span className="shopping-quantity">
        <span>{t("Qty")}</span>
        {formatShoppingQuantity(item)}
      </span>
      <span className="shopping-item-status">
        <span aria-hidden="true" />
        {t(item.completed ? "Bought" : "Needed")}
      </span>
      <button
        type="button"
        className="shopping-delete-button"
        aria-label={t("Delete {name}", { name: item.name })}
        title={t("Delete {name}", { name: item.name })}
        onClick={() => onRemove(item)}
      >
        <Trash2 size={15} aria-hidden="true" />
      </button>
    </li>
  );
}
export default ShoppingRow;
