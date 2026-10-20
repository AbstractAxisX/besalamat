/**
 * سربرگ صفحه‌های پنل ادمین — عنوان + توضیح + جای دکمه‌ها
 * (بدون "use client" تا در صفحات سروری هم قابل استفاده باشد)
 */

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  /** اسلات دکمه‌ها/اکشن‌ها (سمت چپ در RTL) */
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="truncate text-xl font-black md:text-2xl">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
