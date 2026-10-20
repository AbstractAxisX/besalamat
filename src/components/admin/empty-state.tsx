/**
 * حالت خالی (بدون داده / بدون نتیجه) — آیکون + متن فارسی
 * قابل استفاده در سرور و کلاینت.
 */

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  /** آیکون تبلر (پیش‌فرض: جعبه) */
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** محتوای اکشن زیر متن — مثلاً دکمهٔ «محصول جدید» */
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-10 text-center",
        className,
      )}
    >
      <div
        className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground"
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className="max-w-sm">
        <p className="font-bold">{title}</p>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
