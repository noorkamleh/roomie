import { WalletCards, UsersRound } from "lucide-react";
import { formatCurrency } from "../../../shared/utils/formatCurrency";
function ExpensesOverview({ total }: { total: number }) {
  return (
    <section className="expense-overview" aria-label="Total recorded expenses">
      <div className="expense-overview-icon">
        <WalletCards size={25} strokeWidth={1.7} aria-hidden="true" />
      </div>
      <div className="expense-overview-total">
        <p>All recorded expenses</p>
        <strong>{formatCurrency(total)}</strong>
      </div>
      <div className="expense-overview-note">
        <span>
          <UsersRound size={17} aria-hidden="true" />A little clarity for your
          shared home
        </span>
        <p>Every payment recorded. Every share accounted for.</p>
      </div>
      <div className="expense-overview-waves" aria-hidden="true" />
    </section>
  );
}
export default ExpensesOverview;
