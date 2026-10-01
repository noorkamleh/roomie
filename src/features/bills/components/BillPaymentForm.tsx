import { ReceiptText } from "lucide-react";
import type { Bill } from "../../../shared/types";
import Field from "../../../shared/components/Field";
import { formatCurrency } from "../../../shared/utils/formatCurrency";
import ExpenseSplitFields from "../../expenses/components/ExpenseSplitFields";
import { formatBillDate } from "../utils/presentation";
import { useBillPayment } from "../hooks/useBillPayment";

function BillPaymentForm({
  bill,
  onSaved,
}: {
  bill: Bill;
  onSaved: () => void;
}) {
  const {
    members,
    paidBy,
    setPaidBy,
    date,
    setDate,
    participants,
    setParticipants,
    error,
    confirmPayment,
  } = useBillPayment(bill);
  return (
    <form
      className="bill-payment-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (confirmPayment()) onSaved();
      }}
    >
      <div className="bill-payment-summary" aria-label="Bill details">
        <span className="bill-payment-icon">
          <ReceiptText size={23} aria-hidden="true" />
        </span>
        <div>
          <h3>{bill.title}</h3>
          <p>
            Due{" "}
            <time dateTime={bill.dueDate}>{formatBillDate(bill.dueDate)}</time>
          </p>
        </div>
        <strong>{formatCurrency(bill.amount)}</strong>
      </div>
      <div className="bill-payment-fields">
        <Field label="Paid by">
          <select
            value={paidBy}
            onChange={(event) => setPaidBy(event.target.value)}
          >
            {members.map((member) => (
              <option key={member.id}>{member.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Payment date">
          <input
            type="date"
            required
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </Field>
      </div>
      <ExpenseSplitFields
        members={members}
        amount={bill.amount}
        participants={participants}
        onChange={setParticipants}
      />
      {participants.length === 0 && (
        <p role="alert" className="form-error">
          Choose at least one member to split this bill.
        </p>
      )}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <button
        className="primary-button w-full"
        type="submit"
        disabled={participants.length === 0}
      >
        Confirm payment
      </button>
    </form>
  );
}
export default BillPaymentForm;
