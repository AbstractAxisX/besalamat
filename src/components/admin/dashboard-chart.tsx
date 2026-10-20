"use client";

/**
 * نمودار ۱۴ روز اخیر میزکار — AreaChart (recharts)
 * دو سری: درآمد (سبز عمیق = primary، محور چپ بر حسب هزار تومان)
 * و شمار سفارش‌ها (سبز تازه = fresh، محور راست). تولتیپ سفید تمیز.
 * رنگ‌ها هنگام تعویض پوسته (روشن/تاریک) از CSS متغیرها خوانده می‌شوند.
 */

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/lib/utils";
import { toFa, formatTomanPlain } from "@/lib/format";
import type { AdminStatsChartPoint } from "@/server/admin-stats";

const FALLBACK_REVENUE = "#0b4634";
const FALLBACK_ORDERS = "#1e9e6a";

/** خواندن رنگ توکن‌ها از :root — با رصد تغییر پوسته (کلاس dark) */
function useTokenColors(): { revenue: string; orders: string } {
  const [colors, setColors] = useState({ revenue: FALLBACK_REVENUE, orders: FALLBACK_ORDERS });

  useEffect(() => {
    const root = document.documentElement;
    const read = (): void => {
      const styles = getComputedStyle(root);
      setColors({
        revenue: styles.getPropertyValue("--primary").trim() || FALLBACK_REVENUE,
        orders: styles.getPropertyValue("--fresh").trim() || FALLBACK_ORDERS,
      });
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return colors;
}

/** تولتیپ سفارشی — کارت سفید کلاسیک با ارقام فارسی */
function ChartTip({
  active,
  payload,
  label,
  colors,
}: {
  active?: boolean;
  payload?: Array<{ value?: number | string; dataKey?: string | number; name?: string }>;
  label?: string | number;
  colors: { revenue: string; orders: string };
}) {
  if (!active || payload === undefined || payload.length === 0) return null;
  const revenue = payload.find((item) => item.dataKey === "revenue")?.value;
  const orders = payload.find((item) => item.dataKey === "orders")?.value;
  return (
    <div
      dir="rtl"
      className="rounded-xl border border-border/60 bg-popover px-3 py-2 text-popover-foreground shadow-sm"
    >
      <p className="mb-1 text-xs font-bold">{String(label ?? "")}</p>
      <p className="flex items-center gap-1.5 text-xs">
        <span className="size-2 rounded-full" style={{ backgroundColor: colors.revenue }} aria-hidden="true" />
        درآمد:{" "}
        <span className="font-semibold tabular-nums">
          {typeof revenue === "number" ? `${formatTomanPlain(revenue)} تومان` : "—"}
        </span>
      </p>
      <p className="mt-0.5 flex items-center gap-1.5 text-xs">
        <span className="size-2 rounded-full" style={{ backgroundColor: colors.orders }} aria-hidden="true" />
        سفارش‌ها: <span className="font-semibold tabular-nums">{typeof orders === "number" ? toFa(orders) : "—"}</span>
      </p>
    </div>
  );
}

interface DashboardChartProps {
  data: AdminStatsChartPoint[];
  /** کلاس ظرف بیرونی — مثل mt-4 برای فاصله از سربرگ کارت */
  className?: string;
}

export function DashboardChart({ data, className }: DashboardChartProps) {
  const colors = useTokenColors();

  return (
    <div className={cn("p-2", className)}>
      <div dir="ltr" className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 4, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="adminRevFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.revenue} stopOpacity={0.22} />
                <stop offset="100%" stopColor={colors.revenue} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="adminOrdFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.orders} stopOpacity={0.18} />
                <stop offset="100%" stopColor={colors.orders} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" strokeOpacity={0.6} vertical={false} />
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
            <Tooltip content={<ChartTip colors={colors} />} cursor={{ stroke: "var(--border)" }} />
            <Area
              yAxisId="revenue"
              type="monotone"
              dataKey="revenue"
              name="درآمد"
              stroke={colors.revenue}
              strokeWidth={2}
              fill="url(#adminRevFill)"
            />
            <Area
              yAxisId="orders"
              type="monotone"
              dataKey="orders"
              name="سفارش‌ها"
              stroke={colors.orders}
              strokeWidth={2}
              fill="url(#adminOrdFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
