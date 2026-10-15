/**
 * کارت‌های دسته‌بندی — ۹ دستهٔ اصلی هوم
 * ─────────────────────────────
 * Server Component (لینک‌های ساده)؛
 * موبایل: نوار اسکرول افقی با snap — دسکتاپ: گرید ۵/۹ ستونه.
 * عنوان/زیرعنوان از compose صفحه پاس می‌شود (PREVIEW_HOME_SECTIONS).
 */

import Link from "next/link";

import { CategoryIcon } from "@/components/shared/category-icon";
import { SectionHeading } from "@/components/shared/section-heading";
import { cn } from "@/lib/utils";
import type { CategoryNode } from "@/types/shop";

interface CategoryCardsProps {
  categories: CategoryNode[];
  title: string;
  subtitle: string | null;
}

export function CategoryCards({
  categories,
  title,
  subtitle,
}: CategoryCardsProps) {
  if (categories.length === 0) return null;

  return (
    <section className="shell py-12 md:py-16" aria-label={title}>
      <SectionHeading
        title={title}
        subtitle={subtitle ?? undefined}
        href="/products"
        hrefLabel="مشاهدهٔ همه"
      />

      <ul
        className={cn(
          // موبایل: اسکرول افقی لبه‌به‌لبه تا لبهٔ viewport
          "-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 scrollbar-none sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8",
          // دسکتاپ: گرید بدون اسکرول
          "md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-9",
        )}
      >
        {categories.map((category) => (
          <li
            key={category.id}
            className="min-w-[104px] snap-start md:min-w-0"
          >
            <Link
              href={`/products?category=${category.slug}`}
              className="card-luxe card-lift group flex h-full flex-col items-center gap-3 p-4 text-center outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:p-5"
            >
              <span className="flex size-12 items-center justify-center rounded-full border border-transparent bg-accent text-primary transition-colors group-hover:border-gold/40 group-hover:text-gold-strong dark:group-hover:text-gold md:size-14">
                <CategoryIcon iconKey={category.iconKey} className="size-5" />
              </span>
              <span className="text-xs leading-5 font-medium text-foreground md:text-sm">
                {category.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
