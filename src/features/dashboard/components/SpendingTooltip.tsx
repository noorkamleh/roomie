import type { TooltipContentProps } from "recharts";
import { formatCurrency } from "../../../shared/utils/formatCurrency";
import type { SpendingDay } from "../utils/spending";
import { usePreferences } from "../../../shared/preferences/PreferencesContext";

function SpendingTooltip({
  active,
  payload,
}: Pick<TooltipContentProps<number, string>, "active" | "payload">) {
  const { t } = usePreferences();
  if (!active || !payload?.length) return null;
  const day = payload[0].payload as SpendingDay;

  return (
    <div className="rounded-2xl border border-[var(--roomie-card-border)] bg-[color:var(--roomie-surface,#fff)] px-4 py-3 shadow-[0_8px_24px_rgba(70,50,100,0.12)]">
      <p className="flex items-center gap-2 text-sm font-bold text-[color:var(--roomie-ink,#282443)]">
        <span
          aria-hidden="true"
          className="h-2.5 w-2.5 rounded-full bg-[#8246FF]"
        />
        {day.future ? t("Future day") : formatCurrency(day.amount ?? 0)}
      </p>
      <p className="mt-1 ps-4 text-[11px] text-[color:var(--roomie-muted,#69608D)]">
        {day.date}
      </p>
      <p className="mt-1 text-[11px] text-[color:var(--roomie-muted,#69608D)]">
        {day.future
          ? t("No recorded spending yet.")
          : t("{count} {transactions}", {
              count: day.transactions,
              transactions: t(
                day.transactions === 1 ? "transaction" : "transactions",
              ),
            })}
      </p>
    </div>
  );
}

export default SpendingTooltip;
