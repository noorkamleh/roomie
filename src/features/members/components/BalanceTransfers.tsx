import { usePreferences } from "../../../shared/preferences/PreferencesContext";
import { ArrowLeftRight, ArrowRight, Check, CircleCheck } from "lucide-react";
import { formatCurrency } from "../../../shared/utils/formatCurrency";
import { useBalanceTransfers } from "../hooks/useBalanceTransfers";
import MemberAvatar from "./MemberAvatar";
import RepaymentHistory from "./RepaymentHistory";
import Modal from "../../../shared/components/Modal";
import RepaymentForm from "./RepaymentForm";
function BalanceTransfers({
  controller,
}: {
  controller: ReturnType<typeof useBalanceTransfers>;
}) {
  const { t } = usePreferences();
  const {
    transfers,
    settlements,
    error,
    record,
    paying,
    openPayment,
    closePayment,
    simplifyDebts,
    changeDebtMode,
  } = controller;
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
          <h2 id="members-transfers-heading">{t("Who pays whom?")}</h2>
          <p>{t("Suggested transfers to settle your shared balances.")}</p>
        </div>
      </div>
      <div className="members-repayment-controls">
        <label className="members-debt-toggle">
          <input
            type="checkbox"
            checked={simplifyDebts}
            onChange={(event) => changeDebtMode(event.target.checked)}
          />
          {t("Simplify debts")}
        </label>
        <button
          type="button"
          className="secondary-button"
          onClick={() => openPayment()}
        >
          {t("Settle up")}
        </button>
      </div>
      <p className="members-debt-explanation">
        {t(
          simplifyDebts
            ? "Suggested payments use net balances to reduce transfers. Your original expenses and each person's net balance stay the same."
            : "Payments follow the original expense routes after offsetting repayments and circular debts. Each person's net balance stays the same.",
        )}
      </p>
      <ul
        className="members-transfer-list"
        aria-label={t("Suggested repayments")}
      >
        {transfers.map((transfer) => (
          <li key={`${transfer.from}-${transfer.to}`}>
            <div className="members-transfer-route">
              <div className="members-transfer-person">
                <MemberAvatar name={transfer.from} size="small" />
                <span>{transfer.from}</span>
              </div>
              <ArrowRight
                size={17}
                aria-hidden="true"
                className="members-transfer-arrow"
              />
              <div className="members-transfer-person">
                <MemberAvatar name={transfer.to} size="small" />
                <span>{transfer.to}</span>
              </div>
            </div>
            <strong className="members-transfer-amount">
              {formatCurrency(transfer.amount)}
            </strong>
            <div className="members-transfer-actions">
              <button
                type="button"
                className="members-record-button"
                onClick={() => record(transfer)}
              >
                <Check size={14} aria-hidden="true" />
                {t("Record repayment")}
              </button>
              <button
                type="button"
                className="members-record-button"
                onClick={() => openPayment(transfer)}
              >
                {t("Partial payment")}
              </button>
            </div>
          </li>
        ))}
      </ul>
      {transfers.length === 0 && (
        <div className="members-settled-state">
          <span>
            <CircleCheck size={24} aria-hidden="true" />
          </span>
          <h3>{t("All balances are settled.")}</h3>
          <p>{t("Everyone is up to date with their share.")}</p>
        </div>
      )}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {settlements.length > 0 && <RepaymentHistory payments={settlements} />}
      {paying && (
        <Modal title={t("Record a repayment")} onClose={closePayment}>
          <RepaymentForm transfer={paying} onSaved={closePayment} />
        </Modal>
      )}
    </section>
  );
}
export default BalanceTransfers;
