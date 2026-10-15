/**
 * صفحهٔ فروشگاه (کاتالوگ) — Server Component
 * ─────────────────────────────
 * searchParams (Next 16: Promise) → initialFilters برای CatalogView.
 * بریدکرامب: خانه / فروشگاه [/ دستهٔ والد / دستهٔ فرزند]
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import {
  CatalogView,
  type CatalogInitialFilters,
  type CatalogSortKey,
  type CatalogViewMode,
} from "@/components/catalog/catalog-view";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  PREVIEW_BRANDS,
  PREVIEW_CATEGORIES,
  PREVIEW_PRODUCT_DETAILS,
  PREVIEW_PRODUCTS,
} from "@/lib/preview-data";
import { toEnDigits } from "@/lib/format";
import type { CategoryNode } from "@/types/shop";

export const metadata: Metadata = {
  title: "فروشگاه | انتخاب محصولات",
  description:
    "انتخاب از میان لوازم و تجهیزات پزشکی اصل؛ فیلتر دسته‌بندی، برند، قیمت و موجودی در یک نگاه.",
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

/** نقشهٔ slug محصول → دستهٔ فرزند (برای فیلتر دسته‌بندی در CatalogView) */
function buildCategoryByProduct(): Record<string, string | null> {
  const map: Record<string, string | null> = {};
  for (const product of Object.values(PREVIEW_PRODUCT_DETAILS)) {
    map[product.slug] = product.categorySlug;
  }
  return map;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;

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

  /* دستهٔ فعال برای بریدکرامب (والد یا فرزند) */
  const activeSlug = initialFilters.category ?? null;
  let activeParent: CategoryNode | null = null;
  let activeChild: CategoryNode | null = null;
  if (activeSlug) {
    for (const parent of PREVIEW_CATEGORIES) {
      if (parent.slug === activeSlug) {
        activeParent = parent;
        break;
      }
      const child = parent.children.find((item) => item.slug === activeSlug);
      if (child) {
        activeParent = parent;
        activeChild = child;
        break;
      }
    }
  }

  return (
    <div className="shell py-8 md:py-12">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">خانه</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronLeft aria-hidden="true" />
          </BreadcrumbSeparator>
          {activeParent ? (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/products">فروشگاه</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronLeft aria-hidden="true" />
              </BreadcrumbSeparator>
            </>
          ) : (
            <BreadcrumbItem>
              <BreadcrumbPage>فروشگاه</BreadcrumbPage>
            </BreadcrumbItem>
          )}
          {activeChild ? (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/products?category=${activeParent?.slug ?? ""}`}>
                    {activeParent?.title}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronLeft aria-hidden="true" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>{activeChild.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          ) : activeParent ? (
            <BreadcrumbItem>
              <BreadcrumbPage>{activeParent.title}</BreadcrumbPage>
            </BreadcrumbItem>
          ) : null}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6 md:mt-8">
        <CatalogView
          products={PREVIEW_PRODUCTS}
          categories={PREVIEW_CATEGORIES}
          brands={PREVIEW_BRANDS}
          categoryByProduct={buildCategoryByProduct()}
          initialFilters={initialFilters}
        />
      </div>
    </div>
  );
}
