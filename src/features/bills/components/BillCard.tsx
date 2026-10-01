import { CalendarDays } from "lucide-react";
import type { Bill } from "../../../shared/types";
import { dueLabel } from "../../../shared/utils/dates";
import { formatCurrency } from "../../../shared/utils/formatCurrency";
import StatusBadge from "../../../shared/components/StatusBadge";
import { billStatus } from "../utils/status";

interface BillCardProps {
  bill: Bill;
  today: string;
  onPay: (bill: Bill) => void;
}

function BillCard({ bill, today, onPay }: BillCardProps) {
  return (
    <article className="panel">
      <div className="flex items-start gap-3">
        <div className="feature-icon">
          <CalendarDays size={22} aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h2 className="font-semibold">{bill.title}</h2>
          <p className="mt-1 text-xs text-[#8A809E]">Due {bill.dueDate}</p>
        </div>
        <StatusBadge status={billStatus(bill, today)} />
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-2xl font-bold">{formatCurrency(bill.amount)}</p>
          {bill.status !== "paid" && (
            <p className="mt-1 text-xs text-[#8A809E]">
              {dueLabel(bill.dueDate, today)}
            </p>
          )}
        </div>
        {bill.status !== "paid" && (
          <button
            type="button"
            className="secondary-button"
            onClick={() => onPay(bill)}
          >
            Mark as paid
          </button>
        )}
      </div>
    </article>
  );
}
export default BillCard;
