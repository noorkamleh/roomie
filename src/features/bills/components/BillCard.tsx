import {
  CalendarDays,
  Check,
  CircleCheck,
  Clock3,
  Repeat2,
} from "lucide-react";
import type { Bill, Expense } from "../../../shared/types";
import { Link } from "react-router-dom";
import { dueLabel, formatDate } from "../../../shared/utils/dates";
import { formatCurrency } from "../../../shared/utils/formatCurrency";
import StatusBadge from "../../../shared/components/StatusBadge";
import { billStatus } from "../utils/status";
import { usePreferences } from "../../../shared/preferences/PreferencesContext";

interface BillCardProps {
  bill: Bill;
  today: string;
  onPay: (bill: Bill) => void;
  expense?: Expense;
}

function BillCard({ bill, today, onPay, expense }: BillCardProps) {
  const { t } = usePreferences();
  const status = billStatus(bill, today);
  const paid = status === "paid";
  return (
    <article className={`bill-card bill-card--${status}`}>
      <div className="bill-card-topline">
        <div className="bill-card-heading">
          <span className="bill-icon">
            <CalendarDays size={19} strokeWidth={1.7} aria-hidden="true" />
          </span>
          <div>
            <h2>{bill.title}</h2>
            <p className="bill-kind">
              {bill.recurrence ? (
                <>
                  <Repeat2 size={12} aria-hidden="true" /> {t("Monthly")}
                </>
              ) : (
                t("Household bill")
              )}
            </p>
          </div>
        </div>
        <div className="bill-status">
          <StatusBadge status={status} />
        </div>
      </div>
      <div className="bill-card-main">
        <div className="bill-card-amount">
          <p>{t("Bill amount")}</p>
          <strong>{formatCurrency(bill.amount)}</strong>
        </div>
        <div className="bill-card-due">
          <p>
            {t("Due")}{" "}
            <time dateTime={bill.dueDate}>{formatDate(bill.dueDate)}</time>
          </p>
          <span className="bill-timing">
            {paid ? (
              <CircleCheck size={12} aria-hidden="true" />
            ) : (
              <Clock3 size={12} aria-hidden="true" />
            )}
            {paid ? t("Payment recorded") : dueLabel(bill.dueDate, today)}
          </span>
        </div>
        {!paid && (
          <button
            type="button"
            className="bill-pay-button"
            onClick={() => onPay(bill)}
          >
            <Check size={16} aria-hidden="true" />
            {t("Mark as paid")}
          </button>
        )}
      </div>
      {paid && (
        <div className="bill-payment-details">
          {expense ? (
            <>
              <p>
                {t("Paid by")} <strong>{expense.paidBy}</strong> {t("on")}{" "}
                <time dateTime={expense.date}>{formatDate(expense.date)}</time>
              </p>
              <Link to={`/expenses?expense=${encodeURIComponent(expense.id)}`}>
                {t("View linked expense")}
              </Link>
            </>
          ) : (
            <p>{t("Payment details were not recorded.")}</p>
          )}
        </div>
      )}
    </article>
  );
}
export default BillCard;
