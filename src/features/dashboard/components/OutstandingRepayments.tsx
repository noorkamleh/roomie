import { Link } from "react-router-dom";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import { suggestedRepayments } from "../../members/utils/repayments";
import { formatCurrency } from "../../../shared/utils/formatCurrency";
import { usePreferences } from "../../../shared/preferences/PreferencesContext";

function OutstandingRepayments() {
  const { t } = usePreferences();
  const { state } = useHousehold();
  const transfers = suggestedRepayments(state).filter(
    (transfer) =>
      transfer.from === state.currentUser || transfer.to === state.currentUser,
  );
  return (
    <div className="dashboard-attention-group">
      <div className="dashboard-group-heading">
        <h3>{t("Your outstanding repayments")}</h3>
        <Link to="/members" className="dashboard-text-link">
          {t("Manage repayments")}
        </Link>
      </div>
      {transfers.length === 0 && (
        <p className="dashboard-empty">{t("Your balance is settled.")}</p>
      )}
      <ul className="dashboard-action-list">
        {transfers.map((transfer) => (
          <li
            className="dashboard-repayment-row"
            key={`${transfer.from}-${transfer.to}`}
          >
            <p className="dashboard-row-title">
              {transfer.from === state.currentUser
                ? t("You owe {name} {amount}", {
                    name: transfer.to,
                    amount: formatCurrency(transfer.amount),
                  })
                : t("{name} owes you {amount}", {
                    name: transfer.from,
                    amount: formatCurrency(transfer.amount),
                  })}
            </p>
            <Link to="/members" className="dashboard-row-action">
              {t("Review repayment")}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default OutstandingRepayments;
