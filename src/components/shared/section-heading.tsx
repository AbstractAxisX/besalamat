/**
 * سرِ بخش‌ها — چشم‌بند سبز + عنوان درشت + لینک دکمه‌ای
 * ─────────────────────────────
 * Server Component؛ مصرف در همهٔ بخش‌های صفحهٔ خانه و صفحات فهرستی.
 * چشم‌بند (eyebrow) برچسب کوچک سبز بالای عنوان است — ریتم ادیتوریال.
 */

import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  /** برچسب کوچک سبز بالای عنوان */
  eyebrow?: string;
  href?: string;
  hrefLabel?: string;
  className?: string;
  /** تراز عمودی لینک با عنوان (برای سرفصل‌های همراه اکشن) */
  align?: "start" | "center";
}

export function SectionHeading({
  title,
  subtitle,
  eyebrow,
  href,
  hrefLabel,
  className,
  align = "start",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-8 md:mb-10",
        align === "center" && "text-center",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className={cn("min-w-0", align === "center" && "mx-auto")}>
          {eyebrow ? (
            <p className="flex items-center gap-2 text-[11px] font-bold tracking-wide text-fresh-strong dark:text-fresh">
              <span
                className="h-px w-6 bg-fresh/70"
                aria-hidden="true"
              />
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-[1.375rem] leading-snug font-black text-foreground md:text-[1.75rem]">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {subtitle}
            </p>
          ) : null}
        </div>
        {href ? (
          <Link
            href={href}
            className={cn(
              "group/link inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-[13px] font-medium text-foreground transition-all duration-300 hover:border-fresh/60 hover:bg-secondary hover:text-primary",
              align === "center" && "mx-auto",
            )}
          >
            {hrefLabel ?? "مشاهدهٔ همه"}
            <IconArrowLeft
              className="size-4 transition-transform duration-300 group-hover/link:-translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
