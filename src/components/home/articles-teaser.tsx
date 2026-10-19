/**
 * تیزر مقالات — سه کارت ادیتوریال با کاور ۳:۲
 * ─────────────────────────────
 * Server Component + ورود پلکانی؛ کل کارت یک Link به مقاله.
 */

import Image from "next/image";
import Link from "next/link";
import { IconClock } from "@tabler/icons-react";

import { StaggerItem, StaggerList } from "@/components/shared/motion";
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
  if (articles.length === 0) return null;

  return (
    <section className="shell py-14 md:py-20" aria-label={title}>
      <SectionHeading
        eyebrow="مجلهٔ سلامت"
        title={title}
        subtitle={subtitle ?? undefined}
        href="/blog"
        hrefLabel="همهٔ مقالات"
      />

      <StaggerList
        className="grid grid-cols-1 gap-5 sm:grid-cols-3"
        step={0.1}
      >
        {articles.map((article) => (
          <StaggerItem key={article.id} className="h-full">
            <Link
              href={`/blog/${article.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card outline-none transition-colors duration-300 hover:border-fresh/60 focus-visible:ring-2 focus-visible:ring-ring"
            >
              {/* کاور + بج دسته */}
              <span className="relative block aspect-[3/2] overflow-hidden">
                <Image
                  src={article.coverUrl}
                  alt={article.title}
                  fill
                  sizes="(max-width:640px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                {article.categoryTitle ? (
                  <span className="absolute start-3 top-3 rounded-full bg-card/90 px-3 py-1 text-[10px] font-bold text-primary backdrop-blur">
                    {article.categoryTitle}
                  </span>
                ) : null}
              </span>

              {/* بدنه */}
              <span className="flex flex-1 flex-col p-4">
                <h3 className="min-h-11 line-clamp-2 text-[14px] leading-6 font-bold text-foreground transition-colors group-hover:text-primary">
                  {article.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-xs leading-6 text-muted-foreground">
                  {article.excerpt}
                </p>
                <p className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <IconClock className="size-3.5" aria-hidden="true" />
                  ۵ دقیقه مطالعه
                  <span aria-hidden="true" className="px-0.5">
                    ·
                  </span>
                  {faDate(article.publishedAt)}
                </p>
              </span>
            </Link>
          </StaggerItem>
        ))}
      </StaggerList>
    </section>
  );
}
