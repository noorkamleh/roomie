import { Link } from "react-router-dom";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import { useToday } from "../../../shared/hooks/useToday";
import { dueLabel } from "../../../shared/utils/dates";
import { formatCurrency } from "../../../shared/utils/formatCurrency";
import { selectUnpaidBills } from "../utils/overview";
import { billStatus } from "../../bills/utils/status";
import StatusBadge from "../../../shared/components/StatusBadge";
import { getExpenseAppearance } from "../../../shared/utils/expenseAppearance";
import { usePreferences } from "../../../shared/preferences/PreferencesContext";

function UpcomingBills() {
  const { t } = usePreferences();
  const { state } = useHousehold();
  const today = useToday();
  const entries = selectUnpaidBills(state.bills).slice(0, 3);
  return (
    <div className="dashboard-attention-group">
      <div className="dashboard-group-heading">
        <h3>{t("Upcoming Bills")}</h3>
        <Link to="/bills" className="dashboard-text-link">
          {t("View all bills")}
        </Link>
      </div>
      {entries.length === 0 && (
        <p className="dashboard-empty">{t("All bills are paid.")}</p>
      )}
      <ul className="dashboard-action-list">
        {entries.map((bill) => {
          const { icon: Icon } = getExpenseAppearance({
            category: "Bills",
            utilityKind: bill.utilityKind,
          });
          return (
            <li className="dashboard-bill-row" key={bill.id}>
              <span className="dashboard-row-icon">
                <Icon size={18} aria-hidden="true" />
              </span>
              <div className="dashboard-row-copy">
                <p className="dashboard-row-title">
                  {bill.title} <StatusBadge status={billStatus(bill, today)} />
                </p>
                <p className="dashboard-row-detail">
                  {dueLabel(bill.dueDate, today)} ·{" "}
                  {formatCurrency(bill.amount)}
                </p>
              </div>
              <Link
                to="/bills"
                className="dashboard-row-action"
                aria-label={t("Review bill {title}", { title: bill.title })}
              >
                {t("Review bill")}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default UpcomingBills;
