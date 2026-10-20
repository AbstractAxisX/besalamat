/**
 * کارت آمار داشبورد — آیکون + عدد فارسی درشت + متن ریز
 * (بدون "use client" تا در صفحهٔ سروری میزکار هم استفاده شود)
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
        "flex items-center gap-4 rounded-xl border bg-card p-4 md:p-5",
        className,
      )}
    >
      <div
        className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground md:size-12"
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground md:text-sm">{title}</p>
        <p className="mt-0.5 flex items-baseline gap-1">
          <span className="text-xl font-black tabular-nums md:text-2xl">{value}</span>
          {suffix ? (
            <span className="text-xs font-medium text-muted-foreground">{suffix}</span>
          ) : null}
        </p>
        {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
      </div>
    </div>
  );
}
