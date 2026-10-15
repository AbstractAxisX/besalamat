/**
 * صفحهٔ جستجو — Server Component
 * ─────────────────────────────
 * q خام کاربر (بدون toFa) نمایش داده می‌شود؛ چیپ‌های جستجوهای پرطرفدار
 * همیشه زیر عنوان هستند. CatalogView با تمام پارامترها (مثل فروشگاه)
 * مقداردهی می‌شود تا بازخوانی لینک‌های همگام‌شده با URL درست باشد.
 */

import type { Metadata } from "next";
import Link from "next/link";

import {
  CatalogView,
  type CatalogInitialFilters,
  type CatalogSortKey,
  type CatalogViewMode,
} from "@/components/catalog/catalog-view";
import {
  PREVIEW_BRANDS,
  PREVIEW_CATEGORIES,
  PREVIEW_POPULAR_SEARCHES,
  PREVIEW_PRODUCT_DETAILS,
  PREVIEW_PRODUCTS,
} from "@/lib/preview-data";
import { toEnDigits } from "@/lib/format";

export const metadata: Metadata = {
  title: "جستجو",
  description: "جستجو در میان محصولات فروشگاه.",
  robots: { index: false, follow: true },
};

type RawParams = Record<string, string | string[] | undefined>;

interface SearchPageProps {
  searchParams: Promise<RawParams>;
}

const SORT_KEYS: readonly CatalogSortKey[] = [
  "newest",
  "cheapest",
  "expensive",
  "popular",
];

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toInt(value: string | string[] | undefined): number | undefined {
  const raw = single(value);
  if (!raw) return undefined;
  const parsed = Number.parseInt(toEnDigits(raw).replace(/[^\d]/g, ""), 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function toFlag(value: string | string[] | undefined): boolean {
  const raw = single(value);
  return raw === "1" || raw === "true";
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const rawQuery = single(params.q);
  const q = rawQuery?.trim() || undefined;

  const sortRaw = single(params.sort);
  const sort = SORT_KEYS.find((key) => key === sortRaw);
  const viewRaw = single(params.view);
  const view: CatalogViewMode | undefined =
    viewRaw === "list" ? "list" : viewRaw === "grid" ? "grid" : undefined;

  const initialFilters: CatalogInitialFilters = {
    q,
    category: single(params.category) || undefined,
    brand: params.brand,
    sort,
    view,
    page: toInt(params.page),
    min: toInt(params.min),
    max: toInt(params.max),
    inStock: toFlag(params.inStock),
    discount: toFlag(params.discount),
  };

  const categoryByProduct: Record<string, string | null> = {};
  for (const product of Object.values(PREVIEW_PRODUCT_DETAILS)) {
    categoryByProduct[product.slug] = product.categorySlug;
  }

  return (
    <div className="shell py-8 md:py-12">
      {/* عنوان — q خامِ کاربر، بدون تبدیل ارقام */}
      <h1 className="text-xl font-black text-foreground md:text-2xl">
        {q ? (
          <>
            نتایج جستجو برای «{q}»
          </>
        ) : (
          "جستجو در فروشگاه"
        )}
      </h1>

      {/* جستجوهای پرطرفدار */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">
          جستجوهای پرطرفدار:
        </span>
        {PREVIEW_POPULAR_SEARCHES.map((term) => (
          <Link
            key={term}
            href={`/search?q=${encodeURIComponent(term)}`}
            className="rounded-full bg-accent px-3 py-1.5 text-xs text-accent-foreground transition-colors hover:bg-gold/20"
          >
            {term}
          </Link>
        ))}
      </div>

      <div className="mt-6 md:mt-8">
        <CatalogView
          products={PREVIEW_PRODUCTS}
          categories={PREVIEW_CATEGORIES}
          brands={PREVIEW_BRANDS}
          categoryByProduct={categoryByProduct}
          initialFilters={initialFilters}
          showHeading={false}
        />
      </div>
    </div>
  );
}
