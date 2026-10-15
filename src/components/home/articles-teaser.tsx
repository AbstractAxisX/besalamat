/**
 * تیزر مقالات — کارت‌های وبلاگ با کاور، دسته، تاریخ جلالی و چکیده
 * ─────────────────────────────
 * Server Component؛ کل کارت یک Link به صفحهٔ مقاله است.
 * تصاویر SVG لوکال با next/image (dangerouslyAllowSVG فعال است).
 */

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";
import { faDate } from "@/lib/jalali";
import type { ArticleSummary } from "@/types/shop";

interface ArticlesTeaserProps {
  title: string;
  subtitle: string | null;
  articles: ArticleSummary[];
}

export function ArticlesTeaser({
  title,
  subtitle,
  articles,
}: ArticlesTeaserProps) {
  return (
    <section className="shell py-12 md:py-16">
      <SectionHeading
        title={title}
        subtitle={subtitle ?? undefined}
        href="/blog"
        hrefLabel="همهٔ مقالات"
      />

      <div className="grid gap-4 md:grid-cols-3">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/blog/${article.slug}`}
            className="group card-luxe card-lift block h-full overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {/* کاور */}
            <div className="relative aspect-[16/9] overflow-hidden">
              <Image
                src={article.coverUrl}
                alt={article.title}
                fill
                sizes="(max-width:768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
            </div>

            {/* بدنه */}
            <div className="p-5">
              <div className="flex items-center justify-between gap-2">
                {article.categoryTitle ? (
                  <span className="rounded-full bg-accent px-2.5 py-1 text-xs text-accent-foreground">
                    {article.categoryTitle}
                  </span>
                ) : null}
                <span className="ms-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="size-3.5" aria-hidden="true" />
                  {faDate(article.publishedAt)}
                </span>
              </div>

              <h3 className="mt-3 line-clamp-2 font-bold leading-7 text-foreground transition-colors group-hover:text-primary">
                {article.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {article.excerpt}
              </p>

              <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-gold">
                ادامهٔ مطلب
                <ArrowLeft
                  className="size-3.5 opacity-60 transition-opacity group-hover:opacity-100"
                  aria-hidden="true"
                />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
