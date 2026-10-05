import { ArrowDownLeft, CircleCheck } from "lucide-react";
import { getExpenseAppearance } from "../../../shared/utils/expenseAppearance";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import { useToday } from "../../../shared/hooks/useToday";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../../shared/utils/formatCurrency";
import { selectRecentActivity } from "../utils/activity";
import { usePreferences } from "../../../shared/preferences/PreferencesContext";

function RecentExpenses() {
  const { t } = usePreferences();
  const { state } = useHousehold();
  const today = useToday();
  const entries = selectRecentActivity(state, today).slice(0, 5);
  return (
    <section
      className="dashboard-panel"
      aria-labelledby="recent-activity-heading"
    >
      <div className="dashboard-panel-heading">
        <div>
          <p className="dashboard-eyebrow">{t("Across your household")}</p>
          <h2 id="recent-activity-heading">{t("Recent activity")}</h2>
        </div>
        <Link to="/expenses" className="dashboard-text-link">
          {t("View all expenses")}
        </Link>
      </div>
      {entries.length === 0 && (
        <p className="dashboard-empty">{t("No activity recorded yet.")}</p>
      )}
      <ul className="dashboard-action-list">
        {entries.map((entry) => {
          const Icon =
            entry.type === "chore"
              ? CircleCheck
              : entry.type === "repayment"
                ? ArrowDownLeft
                : getExpenseAppearance({
                    category: entry.category ?? "Household",
                    utilityKind: entry.utilityKind,
                  }).icon;
          return (
            <li className="dashboard-activity-row" key={entry.id}>
              <span className="dashboard-row-icon">
                <Icon size={18} aria-hidden="true" />
              </span>
              <div className="dashboard-row-copy">
                <Link to={entry.to} className="dashboard-row-title">
                  {entry.title}
                </Link>
                <p className="dashboard-row-detail">{entry.detail}</p>
              </div>
              {entry.amount !== undefined && (
                <div className="dashboard-activity-amount">
                  <p>{formatCurrency(entry.amount)}</p>
                  {entry.participants !== undefined && (
                    <p>
                      {entry.participants}{" "}
                      {t(entry.participants === 1 ? "person" : "people")}
                    </p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default RecentExpenses;
