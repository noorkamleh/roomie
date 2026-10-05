import { usePreferences } from "../../../shared/preferences/PreferencesContext";
import { ArrowRight, CircleCheck } from "lucide-react";
import type { Settlement } from "../../../shared/types";
import { formatCurrency } from "../../../shared/utils/formatCurrency";
import { formatRepaymentDate } from "../utils/presentation";
function RepaymentHistory({ payments }: { payments: Settlement[] }) {
  const { t } = usePreferences();
  return (
    <div className="members-repayment-history">
      <div className="members-history-heading">
        <h3>{t("Repayment history")}</h3>
        <span>{t("{count} recorded", { count: payments.length })}</span>
      </div>
      <ul aria-label={t("Repayment history")}>
        {[...payments].reverse().map((payment) => (
          <li key={payment.id}>
            <span className="members-history-check">
              <CircleCheck size={17} aria-hidden="true" />
            </span>
            <div className="members-history-detail">
              <p>
                <strong>{payment.from}</strong>
                <ArrowRight size={12} aria-hidden="true" />
                <strong>{payment.to}</strong>
              </p>
              <time dateTime={payment.date}>
                {formatRepaymentDate(payment.date)}
              </time>
            </div>
            <strong className="members-history-amount">
              {formatCurrency(payment.amount)}
            </strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default RepaymentHistory;
