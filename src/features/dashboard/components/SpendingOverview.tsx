import { ChartNoAxesColumnIncreasing } from "lucide-react";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import { formatCurrency } from "../../../shared/utils/formatCurrency";
import { useSpendingOverview } from "../hooks/useSpendingOverview";
import SpendingChart from "./SpendingChart";

function SpendingOverview() {
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
      className="relative min-w-0 overflow-hidden rounded-[28px] border border-white bg-white/90 p-5 shadow-[0_8px_32px_rgba(109,91,180,0.04)] sm:p-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#E5D7FF]/40 blur-3xl"
      />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#E6DDF8] bg-[#EEE7FC] text-[#8246FF]">
            <ChartNoAxesColumnIncreasing size={23} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#69608D]">
              Spending overview
            </p>
            <h2
              id="spending-heading"
              className="mt-1 text-lg font-bold tracking-tight text-[#141326]"
            >
              Your household spending
            </h2>
          </div>
        </div>
        <div
          role="group"
          aria-label="Spending period"
          className="flex rounded-xl border border-[#EAE6EF] bg-[#F8F6FF] p-1"
        >
          {(["month", "week", "thirty-days"] as const).map((period) => (
            <button
              key={period}
              type="button"
              aria-pressed={spendingPeriod === period}
              onClick={() => setSpendingPeriod(period)}
              className={`rounded-lg px-3 py-2 text-[11px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8246FF] ${spendingPeriod === period ? "bg-gradient-to-b from-[#AD7CFF] to-[#7938FF] text-white shadow-[0_4px_12px_rgba(130,70,255,0.22)]" : "text-[#69608D] hover:text-[#55496F]"}`}
            >
              {period === "month"
                ? "Monthly"
                : period === "week"
                  ? "Last 7 days"
                  : "Last 30 days"}
            </button>
          ))}
        </div>
      </div>
      <div className="relative mt-5 flex flex-wrap items-end justify-between gap-3">
        <div aria-live="polite">
          <p className="text-[34px] font-bold leading-none tracking-[-0.05em] text-[#25232E]">
            {formatCurrency(periodTotal)}
          </p>
          <p className="mt-2 text-xs text-[#69608D]">
            {spendingPeriod === "month"
              ? monthLabel
              : `${spendingData[0].date} \u2013 ${spendingData.at(-1)?.date}`}
            <span className="mx-2 text-[#CCC5D6]">&#183;</span>
            {transactionCount}{" "}
            {transactionCount === 1 ? "transaction" : "transactions"}
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-[11px] font-medium text-[#69608D]">
          <span className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-[#9A83E8]"
            />
            Daily expenses (SAR)
          </span>
          <span className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="w-5 border-t-2 border-dashed border-[#9D78FF]"
            />
            7-day average
          </span>
        </div>
      </div>
      <div
        className="relative mt-4 h-[180px] w-full min-w-0 sm:h-[190px]"
        role="group"
        aria-label={`Daily spending chart. Total ${formatCurrency(periodTotal)} across ${transactionCount} transactions.`}
      >
        <SpendingChart data={spendingData} period={spendingPeriod} />
      </div>
      <div className="relative mt-3 grid grid-cols-2 gap-4 border-t border-[#EAE5EF] pt-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#69608D]">
            {spendingPeriod === "month"
              ? "Daily average · month to date"
              : "Daily average · selected period"}
          </p>
          <p className="mt-1 text-sm font-bold text-[#393341]">
            {formatCurrency(dailyAverage)}
          </p>
        </div>
        <div className="border-l border-[#EAE5EF] pl-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#69608D]">
            Highest spending day
          </p>
          <p className="mt-1 text-sm font-bold text-[#393341]">
            {periodTotal > 0 ? formatCurrency(highestDay.amount) : "\u2014"}
            {periodTotal > 0 && (
              <span className="ml-2 text-[11px] font-normal text-[#69608D]">
                {highestDay.date.split(",")[0]}
              </span>
            )}
          </p>
        </div>
      </div>
      {transactionCount === 0 && (
        <p className="mt-3 text-xs text-[#69608D]">
          No expenses recorded for this period.
        </p>
      )}
    </section>
  );
}

export default SpendingOverview;
