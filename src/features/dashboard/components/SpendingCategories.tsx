import { useHousehold } from "../../household/hooks/HouseholdContext";
import { useToday } from "../../../shared/hooks/useToday";
import { formatCurrency } from "../../../shared/utils/formatCurrency";
import { calculateMonthlySpending } from "../utils/overview";
import { usePreferences } from "../../../shared/preferences/PreferencesContext";

function SpendingCategories() {
  const { t } = usePreferences();
  const { state } = useHousehold();
  const today = useToday();
  const { categories } = calculateMonthlySpending(
    state.expenses,
    state.currentUser,
    today,
  );
  return (
    <section className="dashboard-panel" aria-labelledby="category-heading">
      <div className="dashboard-panel-heading">
        <div>
          <p className="dashboard-eyebrow">{t("Household · month to date")}</p>
          <h2 id="category-heading">{t("Spending by category")}</h2>
        </div>
      </div>
      {categories.length === 0 && (
        <p className="dashboard-empty">
          {t("No expenses recorded this month.")}
        </p>
      )}
      <ul className="dashboard-category-list">
        {categories.map((category) => (
          <li key={category.name}>
            <div className="dashboard-category-heading">
              <p className="dashboard-row-title">{t(category.name)}</p>
              <span>
                {formatCurrency(category.amount)} ·{" "}
                {Math.round(category.percent)}%
              </span>
            </div>
            <div aria-hidden="true" className="dashboard-category-track">
              <span style={{ width: `${category.percent}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default SpendingCategories;
