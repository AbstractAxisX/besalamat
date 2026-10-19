/**
 * جزئیات مقالهٔ مجلهٔ سلامت (فاز ۱: دادهٔ پیش‌نمایش)
 * ─────────────────────────────
 * فاز ۶: خروجی HTML ادیتور Tiptap پیش از رندر sanitize می‌شود.
 */

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, CalendarDays, ChevronLeft } from "lucide-react";

import { GoldDivider } from "@/components/shared/brand-assets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toFa } from "@/lib/format";
import { faDate } from "@/lib/jalali";
import { PREVIEW_ARTICLE_DETAILS } from "@/lib/preview-data";
import { JsonLd } from "@/components/shared/json-ld";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/jsonld";
import { brand } from "@/config/brand";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return Object.keys(PREVIEW_ARTICLE_DETAILS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = PREVIEW_ARTICLE_DETAILS[slug];
  if (!article) {
    return { title: "مقاله پیدا نشد" };
  }
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      publishedTime: article.publishedAt,
      images: [{ url: article.coverUrl }],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = PREVIEW_ARTICLE_DETAILS[slug] ?? notFound();

  /* تخمین زمان مطالعه: شمار کلمات ÷ ۲۰۰ (بدون تگ‌های HTML) */
  const wordCount = article.contentHtml
    .replace(/<[^>]*>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 200));
  const articleUrl = `${brand.domain}/blog/${article.slug}`;

  return (
    <>
      <JsonLd data={articleJsonLd(article, articleUrl)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "خانه", url: brand.domain },
          { name: "مجلهٔ سلامت", url: `${brand.domain}/blog` },
          { name: article.title, url: articleUrl },
        ])}
      />
    <div className="shell pb-8 md:pb-12">
      <article className="mx-auto max-w-3xl">
        {/* مسیر صفحه */}
        <nav
          aria-label="مسیر صفحه"
          className="flex items-center gap-1.5 pt-6 text-xs text-muted-foreground md:pt-8"
        >
          <Link href="/" className="transition-colors hover:text-foreground">
            خانه
          </Link>
          <ChevronLeft className="size-3.5" aria-hidden="true" />
          <Link href="/blog" className="transition-colors hover:text-foreground">
            وبلاگ
          </Link>
          <ChevronLeft className="size-3.5" aria-hidden="true" />
          <span
            aria-current="page"
            className="min-w-0 truncate font-medium text-foreground"
          >
            {article.title}
          </span>
        </nav>

        {/* فراداده: دسته + تاریخ + زمان مطالعه */}
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          {article.categoryTitle ? (
            <Badge variant="secondary" className="rounded-full px-3 font-medium">
              {article.categoryTitle}
            </Badge>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            {faDate(article.publishedAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="size-3.5" aria-hidden="true" />
            {toFa(readingMinutes)} دقیقه مطالعه
          </span>
        </div>

        <h1 className="mt-4 text-2xl font-black leading-snug text-foreground md:text-4xl">
          {article.title}
        </h1>

        {/* کاور */}
        <div className="card-luxe relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl">
          <Image
            src={article.coverUrl}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 48rem"
            className="object-cover"
          />
        </div>

        {/* بدنهٔ مقاله */}
        {/* TODO(فاز ۶): خروجی HTML ادیتور Tiptap پیش از رندر sanitize شود */}
        <div
          className="mt-8 [&_h2]:mb-2 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-black md:[&_h2]:text-2xl [&_li]:leading-8 [&_li]:text-foreground/90 [&_p]:mt-5 [&_p]:leading-9 [&_p]:text-foreground/90 [&_strong]:font-bold [&_ul]:mt-5 [&_ul]:list-disc [&_ul]:ps-6"
          dangerouslySetInnerHTML={{ __html: article.contentHtml }}
        />

        {/* پایان مقاله */}
        <GoldDivider className="mt-10" />
        <div className="mt-8 flex justify-center">
          <Button
            asChild
            variant="ghost"
            className="h-11 gap-2 px-6 text-gold hover:text-gold-strong"
          >
            <Link href="/blog">
              <ArrowRight className="size-4" aria-hidden="true" />
              بازگشت به مجله
            </Link>
          </Button>
        </div>
      </article>
    </div>
    </>
  );
}
