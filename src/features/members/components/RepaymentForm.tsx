import { usePreferences } from "../../../shared/preferences/PreferencesContext";
import type { Settlement } from "../../../shared/types";
import Field from "../../../shared/components/Field";
import { formatCurrency } from "../../../shared/utils/formatCurrency";
import { useRepaymentForm } from "../hooks/useRepaymentForm";

function RepaymentForm({
  transfer,
  onSaved,
}: {
  transfer: Omit<Settlement, "id" | "date">;
  onSaved: () => void;
}) {
  const { t, currency, toDisplayAmount } = usePreferences();
  const {
    members,
    from,
    setFrom,
    to,
    setTo,
    amount,
    baseAmount,
    setAmount,
    date,
    setDate,
    limit,
    error,
    save,
  } = useRepaymentForm(transfer);
  const remaining =
    Math.max(0, Math.round(limit * 100) - Math.round(baseAmount * 100)) / 100;
  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (save()) onSaved();
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("Who paid")}>
          <select
            value={from}
            onChange={(event) => setFrom(event.target.value)}
          >
            {members.map((member) => (
              <option key={member.id}>{member.name}</option>
            ))}
          </select>
        </Field>
        <Field label={t("Paid to")}>
          <select value={to} onChange={(event) => setTo(event.target.value)}>
            {members.map((member) => (
              <option key={member.id}>{member.name}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label={t("Payment amount ({currency})", { currency })}>
        <input
          type="number"
          required
          min={baseAmount > 0 && Number(amount) === 0 ? 0 : 0.01}
          step="0.01"
          max={limit > 0 ? toDisplayAmount(limit) : undefined}
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </Field>
      <Field label={t("Payment date")}>
        <input
          type="date"
          required
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </Field>
      <p className="members-field-hint">
        {t(
          "Outstanding: {outstanding}. Remaining after this payment: {remaining}.",
          {
            outstanding: formatCurrency(limit),
            remaining: formatCurrency(remaining),
          },
        )}
      </p>
      <p className="members-field-hint">
        {t(
          "This payment updates balances and stays in repayment history. It does not add to household spending.",
        )}
      </p>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <button type="submit" className="primary-button w-full">
        {t("Record payment")}
      </button>
    </form>
  );
}
export default RepaymentForm;
