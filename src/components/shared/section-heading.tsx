/**
 * سرِ بخش‌ها — عنوان + زیرعنوان + لینک «مشاهدهٔ همه» + خط طلایی محوشونده
 * ─────────────────────────────
 * Server Component؛ مصرف در همهٔ بخش‌های صفحهٔ خانه و صفحات فهرستی.
 */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  href?: string;
  hrefLabel?: string;
  className?: string;
}

export function SectionHeading({
  title,
  subtitle,
  href,
  hrefLabel,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("mb-8 md:mb-10", className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-black text-foreground md:text-3xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {href ? (
          <Link
            href={href}
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-medium text-gold transition-colors hover:text-gold-strong"
          >
            {hrefLabel ?? "مشاهدهٔ همه"}
            <ArrowLeft className="size-4" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
      <div className="gold-hairline mt-5" role="presentation" aria-hidden="true" />
    </div>
  );
}
