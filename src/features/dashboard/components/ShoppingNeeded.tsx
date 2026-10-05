import { Link } from "react-router-dom";
import { ShoppingBasket } from "lucide-react";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import { formatShoppingQuantity } from "../../shopping/utils/quantity";
import { usePreferences } from "../../../shared/preferences/PreferencesContext";

function ShoppingNeeded() {
  const { t } = usePreferences();
  const { state } = useHousehold();
  const entries = state.shoppingItems.filter((item) => !item.completed);
  return (
    <section
      className="dashboard-panel"
      aria-labelledby="shopping-needed-heading"
    >
      <div className="dashboard-panel-heading">
        <div>
          <p className="dashboard-eyebrow">{t("Shared shopping list")}</p>
          <h2 id="shopping-needed-heading">{t("Shopping needed")}</h2>
        </div>
        <Link to="/shopping" className="dashboard-text-link">
          {t("Open shopping list")}
        </Link>
      </div>
      {entries.length === 0 && (
        <p className="dashboard-empty">
          {t("Everything on the list is bought.")}
        </p>
      )}
      <ul className="dashboard-action-list">
        {entries.slice(0, 3).map((item) => (
          <li className="dashboard-shopping-row" key={item.id}>
            <ShoppingBasket size={17} aria-hidden="true" />
            <p className="dashboard-row-title">{item.name}</p>
            <span className="dashboard-quantity">
              {t("Qty {quantity}", { quantity: formatShoppingQuantity(item) })}
            </span>
          </li>
        ))}
      </ul>
      {entries.length > 3 && (
        <p className="dashboard-row-detail">
          {t("{count} more items to buy.", { count: entries.length - 3 })}
        </p>
      )}
    </section>
  );
}

export default ShoppingNeeded;
