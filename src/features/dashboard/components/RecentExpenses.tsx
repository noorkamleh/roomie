import { ArrowRight } from "lucide-react";
import { getExpenseAppearance } from "../../../shared/utils/expenseAppearance";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../../shared/utils/formatCurrency";

function RecentExpenses() {
  const { state } = useHousehold();
  const { expenses } = state;
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white bg-white/90 p-6 shadow-[0_8px_32px_rgba(109,91,180,0.04)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] font-semibold text-[#7973A5]">
            Recent Expenses
          </p>
          <h2 className="mt-1 text-xl font-bold text-[#141326]">
            Latest spending
          </h2>
        </div>
        <Link
          to="/expenses"
          className="flex items-center gap-1 text-[12px] font-semibold text-[#8246FF] transition-all duration-300 hover:translate-x-1"
        >
          View all
          <ArrowRight size={14} />
        </Link>
      </div>
      <div className="mt-6 space-y-3">
        {expenses.length === 0 && (
          <p className="text-sm text-[#69608D]">No expenses recorded yet.</p>
        )}
        {[...expenses]
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 3)
          .map((expense) => {
            const { icon: Icon } = getExpenseAppearance(expense);
            return (
              <div
                key={expense.id}
                className="flex items-center justify-between rounded-2xl border border-[#F0EDFA] bg-white/75 p-3.5 transition-all duration-300 hover:bg-white hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0E9FF]">
                    <Icon
                      size={18}
                      className="text-[#8246FF]"
                      strokeWidth={1.8}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#282443]">
                      {expense.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#69608D]">
                      {expense.paidBy} &#183; {expense.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#282443]">
                    {formatCurrency(expense.amount)}
                  </p>
                  <p className="mt-0.5 text-[10px] font-medium text-[#69608D]">
                    {expense.participants.length} people
                  </p>
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
}

export default RecentExpenses;
