import {
  CalendarDays,
  Check,
  CircleCheck,
  Clock3,
  ReceiptText,
} from "lucide-react";
import type { Bill } from "../../../shared/types";
import { dueLabel } from "../../../shared/utils/dates";
import { formatCurrency } from "../../../shared/utils/formatCurrency";
import StatusBadge from "../../../shared/components/StatusBadge";
import { billStatus } from "../utils/status";
import { formatBillDate } from "../utils/presentation";

interface BillCardProps {
  bill: Bill;
  today: string;
  onPay: (bill: Bill) => void;
}

function BillCard({ bill, today, onPay }: BillCardProps) {
  const status = billStatus(bill, today);
  const paid = status === "paid";
  return (
    <article className={`bill-card bill-card--${status}`}>
      <div className="bill-card-topline">
        <span className="bill-kind">
          <ReceiptText size={13} aria-hidden="true" />
          Household bill
        </span>
        <div className="bill-status">
          <StatusBadge status={status} />
        </div>
      </div>
      <div className="bill-card-heading">
        <div className="bill-icon">
          <CalendarDays size={24} strokeWidth={1.7} aria-hidden="true" />
        </div>
        <div>
          <h2>{bill.title}</h2>
          <p>
            Due{" "}
            <time dateTime={bill.dueDate}>{formatBillDate(bill.dueDate)}</time>
          </p>
        </div>
      </div>
      <div className="bill-card-amount">
        <p>Bill amount</p>
        <strong>{formatCurrency(bill.amount)}</strong>
      </div>
      <div className="bill-card-footer">
        <span className="bill-timing">
          {paid ? (
            <CircleCheck size={15} aria-hidden="true" />
          ) : (
            <Clock3 size={15} aria-hidden="true" />
          )}
          {paid ? "Payment recorded" : dueLabel(bill.dueDate, today)}
        </span>
        {!paid && (
          <button
            type="button"
            className="bill-pay-button"
            onClick={() => onPay(bill)}
          >
            <Check size={16} aria-hidden="true" />
            Mark as paid
          </button>
        )}
      </div>
    </article>
  );
}
export default BillCard;
