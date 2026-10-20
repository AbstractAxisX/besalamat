/**
 * وبلاگ — فهرست مقاله‌های مجلهٔ سلامت
 * ─────────────────────────────
 * داده از سرویس DB-first (shop-data) با fallback امن به PREVIEW_ARTICLES.
 */

import type { Metadata } from "next";

import { BlogIndex } from "@/components/blog/blog-index";
import { GoldDivider } from "@/components/shared/brand-assets";
import { getArticles } from "@/server/shop-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "وبلاگ | مجلهٔ سلامت",
  description:
    "خواندنی‌های کاربردی برای سلامتی خانواده؛ راهنمای خرید و نکات نگهداری تجهیزات پزشکی در مجلهٔ سلامت بسلامت.",
};

export default async function BlogPage() {
  const articles = await getArticles();

  return (
    <div className="shell pb-8 md:pb-12">
      {/* الگوی PageHero — یکنواخت در صفحات محتوایی */}
      <div className="py-10 md:py-14">
        <h1 className="text-2xl font-black text-foreground md:text-3xl">
          مجلهٔ سلامت
        </h1>
        <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
          خواندنی‌های کاربردی برای سلامتی خانواده
        </p>
        <GoldDivider className="mt-6" />
      </div>

      <BlogIndex articles={articles} />
    </div>
  );
}
