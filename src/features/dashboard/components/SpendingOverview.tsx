import { ChartNoAxesColumnIncreasing } from "lucide-react";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import { formatCurrency } from "../../../shared/utils/formatCurrency";
import { useSpendingOverview } from "../hooks/useSpendingOverview";
import SpendingChart from "./SpendingChart";
import { usePreferences } from "../../../shared/preferences/PreferencesContext";

function SpendingOverview() {
  const { t, currency } = usePreferences();
  const {
    state: { expenses },
  } = useHousehold();
  const {
    spendingPeriod,
    setSpendingPeriod,
    spendingData,
    monthLabel,
    dailyAverage,
    periodTotal,
    transactionCount,
    highestDay,
  } = useSpendingOverview(expenses);
  return (
    <section
      aria-labelledby="spending-heading"
      className="relative min-w-0 overflow-hidden rounded-[28px] border border-[var(--roomie-card-border)] bg-[color:var(--roomie-surface,#fff)]/90 p-5 shadow-[0_8px_32px_rgba(109,91,180,0.04)] sm:p-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[color:var(--roomie-tint-purple,#E5D7FF)]/40 blur-3xl"
      />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[color:var(--roomie-border,#E6DDF8)] bg-[color:var(--roomie-tint-purple,#EEE7FC)] text-[color:var(--roomie-accent-purple,#8246FF)]">
            <ChartNoAxesColumnIncreasing
              size={20}
              strokeWidth={2.5}
              aria-hidden="true"
            />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--roomie-muted,#69608D)]">
              {t("Spending overview")}
            </p>
            <h2
              id="spending-heading"
              className="mt-1 text-lg font-bold tracking-tight text-[color:var(--roomie-ink,#141326)]"
            >
              {t("Your household spending")}
            </h2>
          </div>
        </div>
        <div
          role="group"
          aria-label={t("Spending period")}
          className="flex rounded-xl border border-[color:var(--roomie-border,#EAE6EF)] bg-[color:var(--roomie-surface,#F8F6FF)] p-1"
        >
          {(["month", "week", "thirty-days"] as const).map((period) => (
            <button
              key={period}
              type="button"
              aria-pressed={spendingPeriod === period}
              onClick={() => setSpendingPeriod(period)}
              className={`rounded-lg px-3 py-2 text-[11px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8246FF] ${spendingPeriod === period ? "bg-gradient-to-b from-[var(--roomie-tint-purple,#AD7CFF)] to-[#7938FF] text-white shadow-[0_4px_12px_rgba(130,70,255,0.22)]" : "text-[color:var(--roomie-muted,#69608D)] hover:text-[color:var(--roomie-text,#55496F)]"}`}
            >
              {t(
                period === "month"
                  ? "Monthly"
                  : period === "week"
                    ? "Last 7 days"
                    : "Last 30 days",
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="relative mt-5 flex flex-wrap items-end justify-between gap-3">
        <div aria-live="polite">
          <p className="text-[28px] font-bold leading-none tracking-[-0.05em] text-[color:var(--roomie-ink,#25232E)]">
            {formatCurrency(periodTotal)}
          </p>
          <p className="mt-2 text-xs text-[color:var(--roomie-muted,#69608D)]">
            {spendingPeriod === "month"
              ? t("{month} · month to date", { month: monthLabel })
              : `${spendingData[0].date} \u2013 ${spendingData.at(-1)?.date}`}
            <span className="mx-2 text-[color:var(--roomie-muted,#CCC5D6)]">
              &#183;
            </span>
            {transactionCount}{" "}
            {t(transactionCount === 1 ? "transaction" : "transactions")}
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-[11px] font-medium text-[color:var(--roomie-muted,#69608D)]">
          <span className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-[#9A83E8]"
            />
            {t("Daily expenses ({currency})", {
              currency: currency === "SAR" ? t("SAR") : "$",
            })}
          </span>
          <span className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="w-5 border-t-2 border-dashed border-[color:var(--roomie-border-purple,#9D78FF)]"
            />
            {t("7-day average")}
          </span>
        </div>
      </div>
      <div
        className="relative mt-4 h-[155px] w-full min-w-0 sm:h-[165px]"
        role="group"
        aria-label={t(
          "Daily spending chart. Total {amount} across {count} transactions.",
          { amount: formatCurrency(periodTotal), count: transactionCount },
        )}
      >
        <SpendingChart data={spendingData} period={spendingPeriod} />
      </div>
      <div className="relative mt-3 grid grid-cols-2 gap-4 border-t border-[color:var(--roomie-border,#EAE5EF)] pt-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--roomie-muted,#69608D)]">
            {t(
              spendingPeriod === "month"
                ? "Daily average · month to date"
                : "Daily average · selected period",
            )}
          </p>
          <p className="mt-1 text-sm font-bold text-[color:var(--roomie-ink,#393341)]">
            {formatCurrency(dailyAverage)}
          </p>
        </div>
        <div className="border-s border-[color:var(--roomie-border,#EAE5EF)] ps-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--roomie-muted,#69608D)]">
            {t("Highest spending day")}
          </p>
          <p className="mt-1 text-sm font-bold text-[color:var(--roomie-ink,#393341)]">
            {periodTotal > 0
              ? formatCurrency(highestDay.amount ?? 0)
              : "\u2014"}
            {periodTotal > 0 && (
              <span className="ms-2 text-[11px] font-normal text-[color:var(--roomie-muted,#69608D)]">
                {highestDay.day}
              </span>
            )}
          </p>
        </div>
      </div>
      {spendingPeriod === "month" && (
        <p className="mt-2 text-[11px] text-[color:var(--roomie-muted,#69608D)]">
          {t(
            "Future dates are empty; only recorded spending through today is included.",
          )}
        </p>
      )}
      {transactionCount === 0 && (
        <p className="mt-3 text-xs text-[color:var(--roomie-muted,#69608D)]">
          {t("No expenses recorded for this period.")}
        </p>
      )}
    </section>
  );
}

export default SpendingOverview;
