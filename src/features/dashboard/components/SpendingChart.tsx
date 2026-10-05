import { useId } from "react";
import {
  Bar,
  ComposedChart,
  Line,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SpendingDay, SpendingPeriod } from "../utils/spending";
import SpendingTooltip from "./SpendingTooltip";
import { usePreferences } from "../../../shared/preferences/PreferencesContext";

interface SpendingChartProps {
  data: SpendingDay[];
  period: SpendingPeriod;
}

function SpendingChart({ data, period }: SpendingChartProps) {
  const { t, locale, language, currency, toDisplayAmount } = usePreferences();
  const axisAmount = new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  });
  const gradientId = useId().replace(/:/g, "");

  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
      <ComposedChart
        data={data}
        margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
        accessibilityLayer
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#BC98FF" />
            <stop offset="100%" stopColor="#8246FF" />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical
          stroke="var(--roomie-border,#E8E3EF)"
          strokeDasharray="3 5"
        />
        <XAxis
          dataKey="day"
          tickFormatter={(value: string) =>
            language === "ar" ? (value.match(/\d+/)?.[0] ?? value) : value
          }
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--roomie-muted,#716A97)", fontSize: 10 }}
          tickMargin={12}
          minTickGap={12}
          interval={period === "week" ? 0 : 4}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--roomie-muted,#716A97)", fontSize: 10 }}
          tickFormatter={(value: number) =>
            `${currency === "USD" ? "$" : t("SAR")} ${axisAmount.format(toDisplayAmount(value))}`
          }
          tickCount={4}
          width={64}
          domain={[0, "auto"]}
        />
        <Tooltip
          filterNull={false}
          cursor={{ fill: "var(--roomie-surface-soft,#EEE8F8)", radius: 6 }}
          content={SpendingTooltip}
        />
        <Bar
          isAnimationActive={false}
          dataKey="amount"
          name={t("Daily expenses")}
          fill={`url(#${gradientId})`}
          radius={[6, 6, 0, 0]}
          maxBarSize={36}
          activeBar={{ fill: "var(--roomie-accent-purple,#8246FF)" }}
        />
        <Line
          connectNulls={false}
          isAnimationActive={false}
          type="monotone"
          dataKey="average"
          name={t("7-day average")}
          stroke="#9D78FF"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          dot={false}
          activeDot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export default SpendingChart;
