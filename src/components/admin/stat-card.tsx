/**
 * کارت آمار داشبورد — آیکون نرم + عدد فارسی + متن ریز
 * (بدون "use client" تا در صفحهٔ سروری میزکار هم استفاده شود)
 * مینیمال-پریمیوم: کارت سفید rounded-2xl، بوردر مویی، سایهٔ محو؛
 * هاور فقط کمی سبز می‌شود (border-primary/25).
 */

import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  /** مقدار از پیش قالب‌بندی‌شده (ارقام فارسی) */
  value: string;
  /** پسوند کوچک زیر/کنار عدد — مثل «تومان» */
  suffix?: string;
  icon: React.ReactNode;
  /** متن ریز روند/توضیح یا بج کوچک */
  hint?: React.ReactNode;
  className?: string;
}

export function StatCard({ title, value, suffix, icon, hint, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-xs transition-colors hover:border-primary/25",
        className,
      )}
    >
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary"
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        <p className="mt-1 flex items-baseline gap-1">
          <span className="text-2xl font-bold tabular-nums">{value}</span>
          {suffix ? (
            <span className="text-xs font-medium text-muted-foreground">{suffix}</span>
          ) : null}
        </p>
        {hint ? (
          <div className="mt-1.5 text-[11px] leading-5 text-muted-foreground">{hint}</div>
        ) : null}
      </div>
    </div>
  );
}
