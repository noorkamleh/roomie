import { ArrowLeftRight, ArrowRight, Check, CircleCheck } from "lucide-react";
import { formatCurrency } from "../../../shared/utils/formatCurrency";
import { useBalanceTransfers } from "../hooks/useBalanceTransfers";
import MemberAvatar from "./MemberAvatar";
import RepaymentHistory from "./RepaymentHistory";
function BalanceTransfers() {
  const { transfers, settlements, error, record } = useBalanceTransfers();
  return (
    <section
      className="members-panel members-transfers"
      aria-labelledby="members-transfers-heading"
    >
      <div className="members-section-heading">
        <span className="members-section-icon">
          <ArrowLeftRight size={19} aria-hidden="true" />
        </span>
        <div>
          <h2 id="members-transfers-heading">Who pays whom?</h2>
          <p>Suggested transfers to settle your shared balances.</p>
        </div>
      </div>
      <ul className="members-transfer-list" aria-label="Suggested repayments">
        {transfers.map((transfer) => (
          <li key={`${transfer.from}-${transfer.to}`}>
            <div className="members-transfer-route">
              <div className="members-transfer-person">
                <MemberAvatar name={transfer.from} size="small" tone="rose" />
                <span>{transfer.from}</span>
              </div>
              <ArrowRight
                size={17}
                aria-hidden="true"
                className="members-transfer-arrow"
              />
              <div className="members-transfer-person">
                <MemberAvatar name={transfer.to} size="small" tone="mint" />
                <span>{transfer.to}</span>
              </div>
            </div>
            <strong className="members-transfer-amount">
              {formatCurrency(transfer.amount)}
            </strong>
            <button
              type="button"
              className="members-record-button"
              onClick={() => record(transfer)}
            >
              <Check size={14} aria-hidden="true" />
              Record repayment
            </button>
          </li>
        ))}
      </ul>
      {transfers.length === 0 && (
        <div className="members-settled-state">
          <span>
            <CircleCheck size={24} aria-hidden="true" />
          </span>
          <h3>All balances are settled.</h3>
          <p>Everyone is up to date with their share.</p>
        </div>
      )}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {settlements.length > 0 && <RepaymentHistory payments={settlements} />}
    </section>
  );
}
export default BalanceTransfers;
