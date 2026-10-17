/**
 * ایندکس دسته‌بندی‌ها — فهرست شماره‌دارِ ادیتوریال
 * ─────────────────────────────
 * Server Component؛ جایگزین گرید کارت‌های دایره‌ای:
 * هر ردیف = شمارهٔ طلایی + عنوان دسته + فرزندان (دسکتاپ: هم‌ردیف، موبایل: چیپ).
 * آیکون دسته در هاورِ ردیف نمایان می‌شود (جزئیات غافلگیرکننده).
 */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CategoryIcon } from "@/components/shared/category-icon";
import { SectionHeading } from "@/components/shared/section-heading";
import { toFa } from "@/lib/format";
import type { CategoryNode } from "@/types/shop";

interface CategoryIndexProps {
  categories: CategoryNode[];
  title: string;
  subtitle: string | null;
}

export function CategoryIndex({
  categories,
  title,
  subtitle,
}: CategoryIndexProps) {
  if (categories.length === 0) return null;

  return (
    <section className="shell py-12 md:py-16" aria-label={title}>
      <SectionHeading
        eyebrow="دسته‌بندی‌ها"
        title={title}
        subtitle={subtitle ?? undefined}
        href="/products"
        hrefLabel="همهٔ محصولات"
      />

      <ol className="grid gap-x-14 md:grid-cols-2">
        {categories.map((category, index) => (
          <li
            key={category.id}
            className="group border-b border-border/70 last:border-b-0 md:[&:nth-last-child(2)]:border-b-0"
          >
            <div className="flex items-center gap-4 py-4 md:py-5">
              {/* شمارهٔ طلایی */}
              <span
                className="w-7 shrink-0 text-center text-sm font-black text-gold/60 transition-colors duration-300 group-hover:text-gold"
                aria-hidden="true"
              >
                {toFa(String(index + 1).padStart(2, "0"))}
              </span>

              {/* عنوان + آیکون */}
              <Link
                href={`/products?category=${category.slug}`}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex size-10 shrink-0 translate-x-1 items-center justify-center rounded-full border border-gold/30 bg-gold-soft/20 text-gold-strong opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 dark:bg-gold-soft/10 dark:text-gold">
                  <CategoryIcon iconKey={category.iconKey} className="size-4.5" />
                </span>
                <span className="truncate text-[15px] font-bold text-foreground transition-colors duration-300 group-hover:text-primary">
                  {category.title}
                </span>
              </Link>

              {/* فرزندان — هم‌ردیف در دسکتاپ */}
              {category.children.length > 0 ? (
                <span className="hidden max-w-[52%] flex-wrap items-center justify-end gap-x-3 gap-y-1 lg:flex">
                  {category.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/products?category=${child.slug}`}
                      className="text-xs text-muted-foreground transition-colors hover:text-primary"
                    >
                      {child.title}
                    </Link>
                  ))}
                </span>
              ) : null}

              <ArrowLeft
                className="size-4 shrink-0 -translate-x-1 text-gold opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                aria-hidden="true"
              />
            </div>

            {/* فرزندان — چیپ در موبایل/تبلت */}
            {category.children.length > 0 ? (
              <div className="flex flex-wrap gap-2 pb-4 ps-11 lg:hidden">
                {category.children.map((child) => (
                  <Link
                    key={child.id}
                    href={`/products?category=${child.slug}`}
                    className="rounded-full bg-muted/70 px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
                  >
                    {child.title}
                  </Link>
                ))}
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
