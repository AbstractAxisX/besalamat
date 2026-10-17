/**
 * تیزر مقالات — کارت‌های ادیتوریال با کاور و چشم‌بند طلایی
 * ─────────────────────────────
 * Server Component؛ کل کارت یک Link به صفحهٔ مقاله است.
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
        eyebrow="مجله"
        title={title}
        subtitle={subtitle ?? undefined}
        href="/blog"
        hrefLabel="همهٔ مقالات"
      />

      <div className="grid gap-4 md:grid-cols-3 md:gap-5">
        {articles.map((article, index) => (
          <Link
            key={article.id}
            href={`/blog/${article.slug}`}
            className="group card-luxe relative block h-full overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {/* کاور */}
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src={article.coverUrl}
                alt={article.title}
                fill
                sizes="(max-width:768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
              />
              {/* چشم‌بند دسته روی کاور */}
              {article.categoryTitle ? (
                <span className="absolute bottom-3 start-3 rounded-full bg-pine/80 px-3 py-1 text-[10px] font-bold text-white backdrop-blur">
                  {article.categoryTitle}
                </span>
              ) : null}
            </div>

            {/* بدنه */}
            <div className="p-5">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Calendar className="size-3.5" aria-hidden="true" />
                {faDate(article.publishedAt)}
              </span>

              <h3 className="mt-2.5 line-clamp-2 text-[15px] leading-7 font-bold text-foreground transition-colors group-hover:text-primary">
                {article.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-[13px] leading-6 text-muted-foreground">
                {article.excerpt}
              </p>

              <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-gold">
                ادامهٔ مطلب
                <ArrowLeft
                  className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5"
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
