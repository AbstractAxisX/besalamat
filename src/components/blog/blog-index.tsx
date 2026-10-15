"use client";

/**
 * فهرست مقاله‌های مجلهٔ سلامت — فیلتر دسته + گرید کارت
 * ─────────────────────────────
 * کارت هم‌شکل تیزرِ مقاله‌های صفحهٔ خانه است (کاور ۱۶:۹ + متا + ادامهٔ مطلب).
 * فاز ۳: داده از API تغذیه می‌شود (همین شکل ArticleSummary).
 */

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { faDate } from "@/lib/jalali";
import { cn } from "@/lib/utils";
import type { ArticleSummary } from "@/types/shop";

/* چیپ دسته — فعال: قاب طلایی + زمینهٔ طلاییِ نرم؛ غیرفعال: خاموش با هاور ظریف */
const CHIP_CLASS =
  "inline-flex h-9 items-center rounded-full border px-4 text-sm transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const CHIP_ACTIVE =
  "border-gold bg-gold-soft/30 font-semibold text-foreground dark:bg-gold-soft/15";
const CHIP_INACTIVE = "border-border text-muted-foreground hover:border-gold/40";

const CARD_LINK_CLASS =
  "card-luxe card-lift group block h-full overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

interface BlogIndexProps {
  articles: ArticleSummary[];
}

export function BlogIndex({ articles }: BlogIndexProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  /* دسته‌های یکتا به ترتیب ظهور در داده */
  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          articles
            .map((article) => article.categoryTitle)
            .filter((title): title is string => title != null),
        ),
      ),
    [articles],
  );

  const visibleArticles =
    activeCategory == null
      ? articles
      : articles.filter((article) => article.categoryTitle === activeCategory);

  return (
    <section aria-label="فهرست مقاله‌ها">
      {/* فیلتر دسته‌ها */}
      <div
        className="flex flex-wrap items-center gap-2"
        role="group"
        aria-label="فیلتر دستهٔ مقاله‌ها"
      >
        <button
          type="button"
          aria-pressed={activeCategory == null}
          onClick={() => setActiveCategory(null)}
          className={cn(
            CHIP_CLASS,
            activeCategory == null ? CHIP_ACTIVE : CHIP_INACTIVE,
          )}
        >
          همه
        </button>
        {categories.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              type="button"
              aria-pressed={isActive}
              /* کلیک روی دستهٔ فعال، فیلتر را برمی‌گرداند به «همه» */
              onClick={() => setActiveCategory(isActive ? null : category)}
              className={cn(CHIP_CLASS, isActive ? CHIP_ACTIVE : CHIP_INACTIVE)}
            >
              {category}
            </button>
          );
        })}
      </div>

      {visibleArticles.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          مقاله‌ای در این دسته یافت نشد
        </p>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleArticles.map((article) => (
            <Link
              key={article.id}
              href={`/blog/${article.slug}`}
              className={CARD_LINK_CLASS}
            >
              {/* کاور */}
              <div className="relative aspect-[16/9] bg-muted">
                <Image
                  src={article.coverUrl}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>

              {/* بدنه */}
              <div className="p-4 md:p-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
                  {article.categoryTitle ? (
                    <Badge
                      variant="secondary"
                      className="rounded-full px-3 font-medium"
                    >
                      {article.categoryTitle}
                    </Badge>
                  ) : null}
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    {faDate(article.publishedAt)}
                  </span>
                </div>

                <h3 className="mt-3 line-clamp-2 font-bold leading-7 text-foreground transition-colors duration-200 group-hover:text-primary">
                  {article.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm leading-7 text-muted-foreground">
                  {article.excerpt}
                </p>

                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-gold transition-colors duration-200 group-hover:text-gold-strong">
                  ادامهٔ مطلب
                  <ArrowLeft
                    className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
