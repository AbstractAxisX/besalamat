/**
 * پیل/بج‌های نرم مشترک پنل — منبع یکتای همهٔ بج‌ها (DRY)
 * ─────────────────────────────
 * Pill: پیل نرم عمومی (bg-x/10 + border-x/20 + text-[11px]) با تُن‌های
 * مجاز برند (primary/success/fresh/warning/destructive/muted).
 * StatusBadge: بج وضعیت سفارش که خودش از Pill ساخته می‌شود.
 * قابل استفاده در سرور و کلاینت.
 */

import { cn } from "@/lib/utils";
import { ORDER_STATUS_LABELS, type OrderStatusDTO } from "@/types/shop";

/** همهٔ وضعیت‌ها به ترتیب جریان + لغو/مرجوع (برای فیلترها و Comboboxها) */
export const ADMIN_ORDER_STATUSES: OrderStatusDTO[] = [
  "PENDING_PAYMENT",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELED",
  "RETURNED",
];

/** تُن‌های مجاز پیل — فقط لهجه‌های سبز + قرمز + خنثی (بدون آبی/بنفش) */
export type PillTone = "primary" | "success" | "fresh" | "warning" | "destructive" | "muted";

const PILL_TONES: Record<PillTone, string> = {
  primary: "border-primary/20 bg-primary/10 text-primary",
  success: "border-success/20 bg-success/10 text-success",
  fresh: "border-fresh/20 bg-fresh/10 text-fresh",
  warning: "border-warning/20 bg-warning/10 text-warning",
  destructive: "border-destructive/20 bg-destructive/10 text-destructive",
  muted: "border-border bg-muted text-muted-foreground",
};

interface PillProps {
  tone: PillTone;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

/** پیل نرم یکدست — همهٔ بج‌های پنل از همین ساخته می‌شوند */
export function Pill({ tone, children, className, title }: PillProps) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold",
        PILL_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const STATUS_TONES: Record<OrderStatusDTO, PillTone> = {
  PENDING_PAYMENT: "warning",
  PAID: "success",
  PROCESSING: "fresh",
  SHIPPED: "primary",
  DELIVERED: "success",
  CANCELED: "destructive",
  RETURNED: "destructive",
};

interface StatusBadgeProps {
  status: OrderStatusDTO;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Pill tone={STATUS_TONES[status]} className={className}>
      {ORDER_STATUS_LABELS[status]}
    </Pill>
  );
}
