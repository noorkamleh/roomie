import { useId } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SpendingDay, SpendingPeriod } from "../utils/spending";
import SpendingTooltip from "./SpendingTooltip";

interface SpendingChartProps {
  data: SpendingDay[];
  period: SpendingPeriod;
}

function SpendingChart({ data, period }: SpendingChartProps) {
  const gradientId = useId().replace(/:/g, "");

  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
      <BarChart
        data={data}
        margin={{ top: 8, right: 4, left: -12, bottom: 0 }}
        accessibilityLayer
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#BC98FF" />
            <stop offset="100%" stopColor="#8246FF" />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical={false}
          stroke="#E8E3EF"
          strokeDasharray="3 5"
        />
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#918A9B", fontSize: 10 }}
          tickMargin={12}
          minTickGap={12}
          interval={period === "month" ? 4 : 0}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#918A9B", fontSize: 10 }}
          tickFormatter={(value: number) => `SAR ${value}`}
          tickCount={4}
          width={54}
          domain={[0, "auto"]}
        />
        <Tooltip
          cursor={{ fill: "#EEE8F8", radius: 6 }}
          content={SpendingTooltip}
        />
        <Bar
          dataKey="amount"
          name="Daily expenses"
          fill={`url(#${gradientId})`}
          radius={[6, 6, 0, 0]}
          maxBarSize={36}
          activeBar={{ fill: "#8246FF" }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default SpendingChart;
