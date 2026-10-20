/**
 * GET /api/search?q=<term> — جستجوی عمومی محصولات
 * ─────────────────────────────
 * کوئری DB: isActive && (searchText شامل عبارت نرمال‌شده یا title شامل عبارت).
 * نرمال‌سازی عین seed (ي/ك عربی→فارسی، فشرده‌سازی فاصله‌ها، lowercase).
 * حداکثر ۸ نتیجه؛ در خطای DB → فیلتر محلی روی PREVIEW_PRODUCTS.
 * مسیر عمومی است (بدون احراز هویت)؛ نرخ: ۶۰ درخواست در دقیقه برای هر IP.
 */

import { NextRequest, NextResponse } from "next/server";

import { PREVIEW_PRODUCTS } from "@/lib/preview-data";
import { db } from "@/lib/db";
import { normalizeSearchText } from "@/server/shop-data";
import { clientIp, rateLimit } from "@/server/rate-limit";
import type { ProductSummary } from "@/types/shop";

const MAX_RESULTS = 8;

/** فیلتر محلی روی دادهٔ پیش‌نمایش — fallback خطای DB */
function previewFilter(term: string): ProductSummary[] {
  const normalized = normalizeSearchText(term);
  if (normalized.length === 0) return [];
  return PREVIEW_PRODUCTS.filter((product) => {
    const title = normalizeSearchText(product.title);
    const brand = normalizeSearchText(product.brandTitle ?? "");
    return title.includes(normalized) || brand.includes(normalized);
  }).slice(0, MAX_RESULTS);
}

export async function GET(request: NextRequest) {
  /* محدودسازی نرخ — جلوگیری از اسکن/هدرِ بی‌پایان */
  const ip = clientIp(request.headers);
  const limit = rateLimit(`search:ip:${ip}`, 60, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { message: "درخواست‌های شما زیاد است؛ چند لحظه بعد دوباره تلاش کنید." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  const term = (request.nextUrl.searchParams.get("q") ?? "").trim();
  if (term.length < 2) {
    return NextResponse.json({ products: [] });
  }

  try {
    const normalized = normalizeSearchText(term);
    const rows = await db.product.findMany({
      where: {
        isActive: true,
        OR: [
          { searchText: { contains: normalized } },
          { title: { contains: term } },
        ],
      },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        variants: { select: { stock: true } },
      },
      take: MAX_RESULTS,
      orderBy: { createdAt: "desc" },
    });

    const products: ProductSummary[] = rows.map((row) => {
      const totalStock =
        row.variants.length > 0
          ? row.variants.reduce((total, variant) => total + variant.stock, 0)
          : row.stock;
      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        image: row.images[0]?.url ?? "/placeholders/og-default.svg",
        price: row.price,
        comparePrice: row.comparePrice,
        inStock: totalStock > 0,
        brandTitle: row.brand?.title ?? null,
        isNew: row.isNew,
        isFeatured: row.isFeatured,
        categorySlug: row.category?.slug ?? null,
      };
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("[api/search] خطای DB — fallback پیش‌نمایش:", error);
    return NextResponse.json({ products: previewFilter(term) });
  }
}
