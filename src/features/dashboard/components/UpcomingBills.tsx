import { ArrowRight, WalletCards } from "lucide-react";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import { useToday } from "../../../shared/hooks/useToday";
import { dueLabel } from "../../../shared/utils/dates";
import { billStatus, prioritizeBills } from "../../bills/utils/status";
import StatusBadge from "../../../shared/components/StatusBadge";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../../shared/utils/formatCurrency";

function UpcomingBills() {
  const { state } = useHousehold();
  const { bills } = state;
  const today = useToday();
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white bg-white/90 p-4 shadow-[0_8px_32px_rgba(109,91,180,0.04)]">
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[13px] font-semibold text-[#7973A5]">
            Upcoming Bills
          </p>
          <h2 className="mt-1 text-base font-bold text-[#141326]">
            Next payments
          </h2>
        </div>
        <Link
          to="/bills"
          aria-label="View all bills"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F1E8FF] text-[#8246FF] transition-all duration-300 hover:scale-105"
        >
          <ArrowRight size={17} />
        </Link>
      </div>
      <div className="relative mt-3 space-y-2">
        {!bills.some((bill) => bill.status === "pending") && (
          <p className="text-sm text-[#8A809E]">All bills are paid.</p>
        )}
        {prioritizeBills(bills, today)
          .filter((bill) => bill.status === "pending")
          .slice(0, 3)
          .map((bill) => (
            <div
              key={bill.id}
              className="flex items-center justify-between rounded-2xl border border-[#F0EDFA] bg-white/75 p-3 transition-all duration-300 hover:bg-white hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0E9FF]">
                  <WalletCards size={18} className="text-[#8246FF]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#282443]">
                    {bill.title}
                    <span className="ml-2">
                      <StatusBadge status={billStatus(bill, today)} />
                    </span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#69608D]">
                    {dueLabel(bill.dueDate, today)}
                  </p>
                </div>
              </div>
              <p className="text-sm font-bold text-[#282443]">
                {formatCurrency(bill.amount)}
              </p>
            </div>
          ))}
      </div>
    </section>
  );
}

export default UpcomingBills;
