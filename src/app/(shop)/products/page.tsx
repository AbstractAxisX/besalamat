/**
 * صفحهٔ فروشگاه (کاتالوگ) — Server Component
 * ─────────────────────────────
 * تجزیهٔ امن searchParams (Next 16: Promise) → initialFilters برای CatalogView.
 * باند هدر، تولبار، سایدبار درختی و صفحه‌بندی همه داخل CatalogView (کلاینت)
 * رندر می‌شوند تا با URL همگام بمانند — این صفحه فقط داده می‌رساند.
 * داده از سرویس DB-first (shop-data) با fallback امن.
 */

import type { Metadata } from "next";

import {
  CatalogView,
  type CatalogInitialFilters,
  type CatalogSortKey,
  type CatalogViewMode,
} from "@/components/catalog/catalog-view";
import { toEnDigits } from "@/lib/format";
import {
  getBrands,
  getCategoriesTree,
  getProductSummaries,
} from "@/server/shop-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "فروشگاه تجهیزات پزشکی",
  description:
    "خرید آنلاین لوازم و تجهیزات پزشکی از بسلامت؛ فیلتر دسته‌بندی، برند، محدودهٔ قیمت و موجودی همراه مرتب‌سازی و صفحه‌بندی.",
};

type RawParams = Record<string, string | string[] | undefined>;

interface ProductsPageProps {
  searchParams: Promise<RawParams>;
}

const SORT_KEYS: readonly CatalogSortKey[] = [
  "newest",
  "cheapest",
  "expensive",
  "popular",
];

/* ── تجزیهٔ امن searchParams ── */

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

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;

  const [products, categories, brands] = await Promise.all([
    getProductSummaries(),
    getCategoriesTree(),
    getBrands(),
  ]);

  const sortRaw = single(params.sort);
  const sort = SORT_KEYS.find((key) => key === sortRaw);
  const viewRaw = single(params.view);
  const view: CatalogViewMode | undefined =
    viewRaw === "list" ? "list" : viewRaw === "grid" ? "grid" : undefined;

  const initialFilters: CatalogInitialFilters = {
    category: single(params.category) || undefined,
    brand: params.brand,
    q: single(params.q) || undefined,
    sort,
    view,
    page: toInt(params.page),
    min: toInt(params.min),
    max: toInt(params.max),
    inStock: toFlag(params.inStock),
    discount: toFlag(params.discount),
  };

  /* نقشهٔ slug محصول → دستهٔ مستقیم (سازگاری با قرارداد props کاتالوگ) */
  const categoryByProduct: Record<string, string | null> = {};
  for (const product of products) {
    categoryByProduct[product.slug] = product.categorySlug;
  }

  return (
    <CatalogView
      products={products}
      categories={categories}
      brands={brands}
      categoryByProduct={categoryByProduct}
      initialFilters={initialFilters}
    />
  );
}
