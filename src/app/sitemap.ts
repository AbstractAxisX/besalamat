/**
 * نقشهٔ سایت — مسیرهای ایستا + محصولات + مقالات
 * ─────────────────────────────
 * داده از سرویس DB-first (shop-data) با fallback امن تغذیه می‌شود.
 */

import type { MetadataRoute } from "next";

import { brand } from "@/config/brand";
import { getArticles, getProductSummaries } from "@/server/shop-data";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, articles] = await Promise.all([
    getProductSummaries(),
    getArticles(),
  ]);
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: brand.domain, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${brand.domain}/products`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${brand.domain}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${brand.domain}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${brand.domain}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${brand.domain}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${brand.domain}/products/${product.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${brand.domain}/blog/${article.slug}`,
    lastModified: new Date(article.publishedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...articleRoutes];
}
