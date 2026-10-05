import { WalletCards } from "lucide-react";
import { formatCurrency } from "../../../shared/utils/formatCurrency";
import { usePreferences } from "../../../shared/preferences/PreferencesContext";
function ExpensesOverview({
  total,
  periodLabel,
  filtered,
  includesFuture,
}: {
  total: number;
  periodLabel: string;
  filtered: boolean;
  includesFuture: boolean;
}) {
  const { t } = usePreferences();
  return (
    <section
      className="expense-overview"
      aria-label={t("Total recorded expenses")}
    >
      <div className="expense-overview-icon">
        <WalletCards size={25} strokeWidth={1.7} aria-hidden="true" />
      </div>
      <div className="expense-overview-total">
        <p>
          {filtered
            ? t("Matching recorded expenses")
            : t("All recorded expenses")}
        </p>
        <strong>{formatCurrency(total)}</strong>
        <p className="expense-overview-period">
          {periodLabel}
          {includesFuture ? ` · ${t("Includes future-dated records")}` : ""}
        </p>
      </div>
      <div className="expense-overview-waves" aria-hidden="true" />
    </section>
  );
}
export default ExpensesOverview;
