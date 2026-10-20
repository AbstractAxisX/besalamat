/**
 * بج وضعیت سفارش — پیل‌های نرم یکدست (bg-x/10 + border-x/20)
 * (کهربایی/سبز/سبز-تازه/سبزعمیق/قرمز — بدون آبی و بنفش)
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
  PENDING_PAYMENT: "border-warning/20 bg-warning/10 text-warning",
  PAID: "border-success/20 bg-success/10 text-success",
  PROCESSING: "border-fresh/20 bg-fresh/10 text-fresh",
  SHIPPED: "border-primary/20 bg-primary/10 text-primary",
  DELIVERED: "border-success/30 bg-success/15 text-success",
  CANCELED: "border-destructive/20 bg-destructive/10 text-destructive",
  RETURNED: "border-destructive/20 bg-destructive/10 text-destructive",
};

interface StatusBadgeProps {
  status: OrderStatusDTO;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold",
        STATUS_STYLES[status],
        className,
      )}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
