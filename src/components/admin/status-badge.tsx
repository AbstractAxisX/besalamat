/**
 * بج وضعیت سفارش — نگاشت هر OrderStatus به رنگ‌های برند
 * (کهربایی/سبز/فیروزه‌ای/سرمه‌ای-سبز/قرمز — بدون آبی و بنفش)
 * قابل استفاده در سرور و کلاینت.
 */

import { cn } from "@/lib/utils";
import { ORDER_STATUS_LABELS, type OrderStatusDTO } from "@/types/shop";

/** همهٔ وضعیت‌ها به ترتیب جریان + لغو/مرجوع (برای فیلترها و Selectها) */
export const ADMIN_ORDER_STATUSES: OrderStatusDTO[] = [
  "PENDING_PAYMENT",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELED",
  "RETURNED",
];

const STATUS_STYLES: Record<OrderStatusDTO, string> = {
  PENDING_PAYMENT: "border-warning/30 bg-warning/10 text-warning",
  PAID: "border-success/30 bg-success/10 text-success",
  PROCESSING: "border-teal-600/30 bg-teal-600/10 text-teal-700 dark:text-teal-400",
  SHIPPED: "border-cyan-700/30 bg-cyan-700/10 text-cyan-800 dark:text-cyan-300",
  DELIVERED: "border-success bg-success text-success-foreground",
  CANCELED: "border-destructive/30 bg-destructive/10 text-destructive",
  RETURNED: "border-destructive/30 bg-destructive/10 text-destructive",
};

interface StatusBadgeProps {
  status: OrderStatusDTO;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-bold",
        STATUS_STYLES[status],
        className,
      )}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
