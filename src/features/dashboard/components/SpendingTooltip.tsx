import type { TooltipContentProps } from "recharts";
import { formatCurrency } from "../../../shared/utils/formatCurrency";
import type { SpendingDay } from "../utils/spending";

function SpendingTooltip({
  active,
  payload,
}: Pick<TooltipContentProps<number, string>, "active" | "payload">) {
  if (!active || !payload?.length) return null;
  const day = payload[0].payload as SpendingDay;

  return (
    <div className="rounded-2xl border border-[#EAE4F4] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(70,50,100,0.12)]">
      <p className="flex items-center gap-2 text-sm font-bold text-[#282443]">
        <span
          aria-hidden="true"
          className="h-2.5 w-2.5 rounded-full bg-[#8246FF]"
        />
        {formatCurrency(day.amount)}
      </p>
      <p className="mt-1 pl-4 text-[11px] text-[#69608D]">{day.date}</p>
      <p className="mt-1 text-[11px] text-[#69608D]">
        {day.transactions}{" "}
        {day.transactions === 1 ? "transaction" : "transactions"}
      </p>
    </div>
  );
}

export default SpendingTooltip;
