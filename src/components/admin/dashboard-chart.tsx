"use client";

/**
 * نمودار ۱۴ روز اخیر میزکار — AreaChart (recharts)
 * دو سری: درآمد (سبز عمیق، محور چپ بر حسب هزار تومان)
 * و شمار سفارش‌ها (سبز تازه، محور راست). تولتیپ فارسی با ارقام فارسی.
 */

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { toFa, formatTomanPlain } from "@/lib/format";
import type { AdminStatsChartPoint } from "@/server/admin-stats";

const COLOR_REVENUE = "#0b4634";
const COLOR_ORDERS = "#1e9e6a";

/** تولتیپ سفارشی — کارت سفید کلاسیک با ارقام فارسی */
function ChartTip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number | string; dataKey?: string | number; name?: string }>;
  label?: string | number;
}) {
  if (!active || payload === undefined || payload.length === 0) return null;
  const revenue = payload.find((item) => item.dataKey === "revenue")?.value;
  const orders = payload.find((item) => item.dataKey === "orders")?.value;
  return (
    <div
      dir="rtl"
      className="rounded-lg border bg-popover px-3 py-2 text-popover-foreground shadow-md"
    >
      <p className="mb-1 text-xs font-bold">{String(label ?? "")}</p>
      <p className="flex items-center gap-1.5 text-xs">
        <span className="size-2 rounded-full" style={{ backgroundColor: COLOR_REVENUE }} aria-hidden="true" />
        درآمد:{" "}
        <span className="font-black tabular-nums">
          {typeof revenue === "number" ? `${formatTomanPlain(revenue)} تومان` : "—"}
        </span>
      </p>
      <p className="mt-0.5 flex items-center gap-1.5 text-xs">
        <span className="size-2 rounded-full" style={{ backgroundColor: COLOR_ORDERS }} aria-hidden="true" />
        سفارش‌ها: <span className="font-black tabular-nums">{typeof orders === "number" ? toFa(orders) : "—"}</span>
      </p>
    </div>
  );
}

interface DashboardChartProps {
  data: AdminStatsChartPoint[];
}

export function DashboardChart({ data }: DashboardChartProps) {
  return (
    <div>
      {/* راهنمای سری‌ها */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: COLOR_REVENUE }} aria-hidden="true" />
          درآمد (هزار تومان)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: COLOR_ORDERS }} aria-hidden="true" />
          شمار سفارش‌ها
        </span>
      </div>
      <div dir="ltr" className="mt-2 h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="adminRevFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLOR_REVENUE} stopOpacity={0.26} />
                <stop offset="100%" stopColor={COLOR_REVENUE} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="adminOrdFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLOR_ORDERS} stopOpacity={0.2} />
                <stop offset="100%" stopColor={COLOR_ORDERS} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={16}
            />
            {/* محور درآمد — چپ، بر حسب هزار تومان */}
            <YAxis
              yAxisId="revenue"
              width={42}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => toFa(Math.round(value / 1000))}
            />
            {/* محور سفارش‌ها — راست، عدد صحیح */}
            <YAxis
              yAxisId="orders"
              orientation="right"
              width={26}
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<ChartTip />} cursor={{ stroke: "var(--border)" }} />
            <Area
              yAxisId="revenue"
              type="monotone"
              dataKey="revenue"
              name="درآمد"
              stroke={COLOR_REVENUE}
              strokeWidth={2}
              fill="url(#adminRevFill)"
            />
            <Area
              yAxisId="orders"
              type="monotone"
              dataKey="orders"
              name="سفارش‌ها"
              stroke={COLOR_ORDERS}
              strokeWidth={2}
              fill="url(#adminOrdFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
