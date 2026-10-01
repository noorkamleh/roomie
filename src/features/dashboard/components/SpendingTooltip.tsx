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
      <p className="text-[11px] font-medium text-[#85818F]">{day.date}</p>
      <p className="mt-1 text-lg font-bold text-[#7540E8]">
        {formatCurrency(day.amount)}
      </p>
      <p className="mt-1 text-[11px] text-[#85818F]">
        {day.transactions}{" "}
        {day.transactions === 1 ? "transaction" : "transactions"}
      </p>
    </div>
  );
}

export default SpendingTooltip;
