"use client";

/**
 * نمای کاتالوگ — تولبار شناور، چیپ‌های فیلتر فعال، سایدبار چسبان
 * ─────────────────────────────
 * کل منطق سمت کلاینت روی دادهٔ props (بدون fetch)؛ هر تغییر state در URL
 * همگام می‌شود (router.replace بدون اسکرول) تا لینک‌ها قابل اشتراک باشند.
 * FilterPanel کاملاً کنترل‌شده است — state نزد همین کامپوننت می‌ماند.
 */

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  SearchX,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { FilterPanel } from "@/components/catalog/filter-panel";
import { ProductGrid } from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  discountPercent,
  formatTomanPlain,
  toEnDigits,
  toFa,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BrandSummary, CategoryNode, ProductSummary } from "@/types/shop";

/* ── انواع عمومی (مصرف صفحه‌های سرور) ── */

export type CatalogSortKey = "newest" | "cheapest" | "expensive" | "popular";
export type CatalogViewMode = "grid" | "list";

/** state فیلترها — برند به‌صورت آرایه‌ای از اسلاگ‌ها */
export interface CatalogFilterState {
  category: string | null;
  brands: string[];
  min: number | null;
  max: number | null;
  inStock: boolean;
  discount: boolean;
  q: string | null;
}

/** مقدار اولیهٔ ساخته‌شده از searchParams در صفحهٔ سرور */
export interface CatalogInitialFilters {
  category?: string;
  brand?: string | string[];
  q?: string;
  sort?: CatalogSortKey;
  view?: CatalogViewMode;
  page?: number;
  min?: number;
  max?: number;
  inStock?: boolean;
  discount?: boolean;
}

const PAGE_SIZE = 8;

/** ارتفاع هدر دسکتاپ (۳ سطر) برای چسباندن تولبار/سایدبار درست زیر آن */
const DESKTOP_HEADER_H = 160;
const TOOLBAR_H = 76;

const SORT_OPTIONS: { key: CatalogSortKey; label: string }[] = [
  { key: "newest", label: "جدیدترین" },
  { key: "cheapest", label: "ارزان‌ترین" },
  { key: "expensive", label: "گران‌ترین" },
  { key: "popular", label: "محبوب‌ترین" },
];

/* ── ابزارهای خالص ── */

/** نرمال‌سازی متن جستجو: ارقام لاتین + ی/ک یکسان‌شده */
function normalizeText(value: string): string {
  return toEnDigits(value)
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .trim()
    .toLowerCase();
}

/** مجموعهٔ اسلاگ‌های یک دستهٔ انتخابی — والد، فرزندانش را هم شامل می‌شود */
function collectCategorySlugs(
  categories: CategoryNode[],
  slug: string,
): Set<string> | null {
  for (const parent of categories) {
    if (parent.slug === slug) {
      return new Set([parent.slug, ...parent.children.map((child) => child.slug)]);
    }
    if (parent.children.some((child) => child.slug === slug)) {
      return new Set([slug]);
    }
  }
  return null;
}

/** عنوان دستهٔ فعال (والد یا فرزند) */
function findCategoryTitle(
  categories: CategoryNode[],
  slug: string,
): string | null {
  for (const parent of categories) {
    if (parent.slug === slug) return parent.title;
    const child = parent.children.find((item) => item.slug === slug);
    if (child) return child.title;
  }
  return null;
}

/** پنجرهٔ صفحات: [۱، …، ۴، ۵، ۶، …، ۲۰] */
function pageWindow(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }
  const items: (number | "ellipsis")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push("ellipsis");
  for (let page = start; page <= end; page += 1) items.push(page);
  if (end < total - 1) items.push("ellipsis");
  items.push(total);
  return items;
}

interface CatalogViewProps {
  products: ProductSummary[];
  categories: CategoryNode[];
  brands: BrandSummary[];
  /** slug محصول → دستهٔ فرزند (برای فیلتر دسته‌بندی) */
  categoryByProduct: Record<string, string | null>;
  initialFilters: CatalogInitialFilters;
  /** صفحهٔ جستجو عنوان خودش را دارد و سرِ کاتالوگ را نمی‌خواهد */
  showHeading?: boolean;
}

interface ActiveChip {
  key: string;
  label: string;
  clear: () => void;
}

export function CatalogView({
  products,
  categories,
  brands,
  categoryByProduct,
  initialFilters,
}: CatalogViewProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [filters, setFilters] = useState<CatalogFilterState>(() => ({
    category: initialFilters.category ?? null,
    brands:
      initialFilters.brand == null
        ? []
        : Array.isArray(initialFilters.brand)
          ? initialFilters.brand
          : [initialFilters.brand],
    min: initialFilters.min ?? null,
    max: initialFilters.max ?? null,
    inStock: initialFilters.inStock ?? false,
    discount: initialFilters.discount ?? false,
    q: initialFilters.q ?? null,
  }));
  const [sort, setSort] = useState<CatalogSortKey>(
    initialFilters.sort ?? "newest",
  );
  const [view, setView] = useState<CatalogViewMode>(
    initialFilters.view === "list" ? "list" : "grid",
  );
  const [page, setPage] = useState(Math.max(1, initialFilters.page ?? 1));
  const [filtersOpen, setFiltersOpen] = useState(false);

  /* تغییر فیلتر همیشه به صفحهٔ اول برمی‌گردد */
  const updateFilters = (patch: Partial<CatalogFilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({
      category: null,
      brands: [],
      min: null,
      max: null,
      inStock: false,
      discount: false,
      q: null,
    });
    setPage(1);
  };

  /* ── فیلتر + سورت (روی دادهٔ props) ── */

  const brandTitleBySlug = useMemo(
    () => new Map(brands.map((brand) => [brand.slug, brand.title])),
    [brands],
  );

  const filtered = useMemo(() => {
    const query = filters.q?.trim();
    const needle = query ? normalizeText(query) : null;
    const categorySlugs = filters.category
      ? collectCategorySlugs(categories, filters.category)
      : null;
    const selectedBrandTitles = new Set(
      filters.brands
        .map((slug) => brandTitleBySlug.get(slug))
        .filter((title): title is string => title != null),
    );

    const result = products.filter((product) => {
      if (categorySlugs) {
        const productCategory = categoryByProduct[product.slug] ?? null;
        if (productCategory == null || !categorySlugs.has(productCategory)) {
          return false;
        }
      }
      if (
        selectedBrandTitles.size > 0 &&
        !(product.brandTitle != null && selectedBrandTitles.has(product.brandTitle))
      ) {
        return false;
      }
      if (filters.min != null && product.price < filters.min) return false;
      if (filters.max != null && product.price > filters.max) return false;
      if (filters.inStock && !product.inStock) return false;
      if (filters.discount && product.comparePrice == null) return false;
      if (needle != null && needle !== "" && !normalizeText(product.title).includes(needle)) {
        return false;
      }
      return true;
    });

    switch (sort) {
      case "cheapest":
        return [...result].sort((a, b) => a.price - b.price);
      case "expensive":
        return [...result].sort((a, b) => b.price - a.price);
      /* آرایهٔ preview قدیمی→جدید است؛ newest یعنی وارونهٔ آن */
      case "newest":
        return [...result].reverse();
      case "popular":
        return result;
    }
  }, [products, categories, categoryByProduct, brandTitleBySlug, filters, sort]);

  /* ── صفحه‌بندی ── */

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage],
  );

  const goToPage = (next: number) => {
    setPage(Math.min(Math.max(1, next), totalPages));
    window.scrollTo({ top: 0 });
  };

  /* ── همگام‌سازی با URL (فقط مقادیر غیرپیش‌فرض) ── */

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.category) params.set("category", filters.category);
    for (const slug of filters.brands) params.append("brand", slug);
    const query = filters.q?.trim();
    if (query) params.set("q", toEnDigits(query));
    if (sort !== "newest") params.set("sort", sort);
    if (view !== "grid") params.set("view", view);
    if (safePage > 1) params.set("page", String(safePage));
    if (filters.min != null) params.set("min", String(filters.min));
    if (filters.max != null) params.set("max", String(filters.max));
    if (filters.inStock) params.set("inStock", "1");
    if (filters.discount) params.set("discount", "1");
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }, [filters, sort, view, safePage, pathname, router]);

  /* ── مشتقات نمایشی ── */

  const activeCategoryTitle = filters.category
    ? findCategoryTitle(categories, filters.category)
    : null;

  const activeChips = useMemo<ActiveChip[]>(() => {
    const chips: ActiveChip[] = [];
    if (filters.category != null) {
      chips.push({
        key: "category",
        label: activeCategoryTitle ?? filters.category,
        clear: () => updateFilters({ category: null }),
      });
    }
    for (const slug of filters.brands) {
      chips.push({
        key: `brand-${slug}`,
        label: brandTitleBySlug.get(slug) ?? slug,
        clear: () =>
          updateFilters({
            brands: filters.brands.filter((item) => item !== slug),
          }),
      });
    }
    if (filters.min != null) {
      chips.push({
        key: "min",
        label: `از ${formatTomanPlain(filters.min)}`,
        clear: () => updateFilters({ min: null }),
      });
    }
    if (filters.max != null) {
      chips.push({
        key: "max",
        label: `تا ${formatTomanPlain(filters.max)}`,
        clear: () => updateFilters({ max: null }),
      });
    }
    if (filters.inStock) {
      chips.push({
        key: "inStock",
        label: "فقط موجود",
        clear: () => updateFilters({ inStock: false }),
      });
    }
    if (filters.discount) {
      chips.push({
        key: "discount",
        label: "فقط تخفیف‌دار",
        clear: () => updateFilters({ discount: false }),
      });
    }
    const query = filters.q?.trim();
    if (query) {
      chips.push({
        key: "q",
        label: `جستجو: «${query}»`,
        clear: () => updateFilters({ q: null }),
      });
    }
    return chips;
  }, [filters, activeCategoryTitle, brandTitleBySlug]);

  const hasActiveFilters = activeChips.length > 0;

  const filterPanel = (
    <FilterPanel
      categories={categories}
      brands={brands}
      filters={filters}
      onChange={updateFilters}
      onReset={resetFilters}
    />
  );

  return (
    <div>
      {/* ── تولبار — شناورِ شیشه‌ای در دسکتاپ ── */}
      <div
        className="rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-card lg:sticky lg:z-30 lg:bg-background/85 lg:backdrop-blur-md"
        style={{ top: `${DESKTOP_HEADER_H - 1}px` }}
      >
        <div className="flex flex-wrap items-center gap-3">
          {/* فیلتر موبایل — دراور پایین‌کش */}
          <Drawer open={filtersOpen} onOpenChange={setFiltersOpen}>
            <DrawerTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="h-11 gap-2 rounded-full border-border/70 lg:hidden"
              >
                <SlidersHorizontal className="size-4" aria-hidden="true" />
                فیلترها
                {hasActiveFilters ? (
                  <span className="flex size-5 items-center justify-center rounded-full bg-gold text-[10px] font-black text-gold-foreground">
                    {toFa(activeChips.length)}
                  </span>
                ) : null}
              </Button>
            </DrawerTrigger>
            <DrawerContent className="rounded-t-3xl!">
              <DrawerHeader className="text-start">
                <DrawerTitle className="text-base font-bold">
                  فیلترها
                </DrawerTitle>
                <DrawerDescription className="sr-only">
                  فیلتر محصولات بر اساس دسته‌بندی، برند، قیمت و موجودی
                </DrawerDescription>
              </DrawerHeader>
              <div className="flex-1 overflow-y-auto px-4 pb-2">
                {filterPanel}
              </div>
              <DrawerFooter className="border-t border-border/60">
                {hasActiveFilters ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-9 text-destructive hover:text-destructive"
                    onClick={resetFilters}
                  >
                    حذف همهٔ فیلترها
                  </Button>
                ) : null}
                <Button
                  type="button"
                  className="h-12 rounded-xl text-base font-bold"
                  onClick={() => setFiltersOpen(false)}
                >
                  مشاهدهٔ {toFa(totalCount)} کالا
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          {/* شمار نتیجه */}
          <p className="hidden text-sm text-muted-foreground lg:block">
            {toFa(totalCount)} کالا
          </p>

          <div className="ms-auto flex items-center gap-2">
            {/* سورت */}
            <Select
              value={sort}
              onValueChange={(value) => {
                const option = SORT_OPTIONS.find((item) => item.key === value);
                if (option) {
                  setSort(option.key);
                  setPage(1);
                }
              }}
            >
              <SelectTrigger
                className="h-11 w-[10.5rem] rounded-full border-border/70"
                aria-label="مرتب‌سازی محصولات"
              >
                <SelectValue placeholder="مرتب‌سازی" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.key} value={option.key}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* نمای شبکه/فهرست */}
            <div
              className="flex items-center gap-0.5 rounded-full border border-border/70 bg-card p-1"
              role="group"
              aria-label="نوع نمایش محصولات"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "size-9 rounded-full",
                  view === "grid"
                    ? "bg-accent text-primary"
                    : "text-muted-foreground",
                )}
                onClick={() => setView("grid")}
                aria-label="نمای شبکه‌ای"
                aria-pressed={view === "grid"}
              >
                <LayoutGrid className="size-4" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "size-9 rounded-full",
                  view === "list"
                    ? "bg-accent text-primary"
                    : "text-muted-foreground",
                )}
                onClick={() => setView("list")}
                aria-label="نمای فهرستی"
                aria-pressed={view === "list"}
              >
                <List className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── چیپ‌های فیلتر فعال ── */}
      {hasActiveFilters ? (
        <div
          className="mt-4 flex flex-wrap items-center gap-2"
          aria-label="فیلترهای فعال"
        >
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.clear}
              className="group inline-flex h-8 items-center gap-1.5 rounded-full border border-gold/40 bg-gold-soft/25 px-3 text-xs font-medium text-foreground transition-colors hover:bg-gold-soft/50 dark:bg-gold-soft/15 dark:hover:bg-gold-soft/25"
            >
              {chip.label}
              <X
                className="size-3.5 text-muted-foreground transition-colors group-hover:text-destructive"
                aria-hidden="true"
              />
            </button>
          ))}
          <button
            type="button"
            onClick={resetFilters}
            className="mr-1 text-xs font-medium text-destructive transition-colors hover:text-destructive/80"
          >
            حذف همه
          </button>
        </div>
      ) : null}

      {/* ── بدنه: سایدبار فیلتر + محتوا ── */}
      <div className="mt-6 flex gap-8">
        <aside
          className="hidden w-64 shrink-0 lg:block"
          aria-label="فیلترهای محصولات"
        >
          <div
            className="sticky overflow-y-auto pb-4 pe-1"
            style={{
              top: `${DESKTOP_HEADER_H + TOOLBAR_H}px`,
              maxHeight: `calc(100vh - ${DESKTOP_HEADER_H + TOOLBAR_H + 24}px)`,
            }}
          >
            {filterPanel}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {totalCount === 0 ? (
            <div className="card-luxe flex flex-col items-center gap-4 px-4 py-20 text-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-accent text-primary">
                <SearchX className="size-7" aria-hidden="true" />
              </span>
              <div>
                <p className="font-bold text-foreground">
                  {hasActiveFilters
                    ? "محصولی مطابق فیلترهای شما یافت نشد"
                    : "محصولی یافت نشد"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  فیلترها را تغییر دهید یا عبارت دیگری جستجو کنید
                </p>
              </div>
              {hasActiveFilters ? (
                <Button
                  type="button"
                  className="h-10 rounded-full px-6"
                  onClick={resetFilters}
                >
                  حذف فیلترها
                </Button>
              ) : null}
            </div>
          ) : view === "grid" ? (
            <ProductGrid products={pageItems} />
          ) : (
            <div className="space-y-3">
              {pageItems.map((product) => (
                <CatalogListCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {totalPages > 1 ? (
            <Pagination className="mt-10">
              <PaginationContent>
                {/* در RTL دکمهٔ «قبلی» سمت راست قرار می‌گیرد */}
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    aria-label="صفحهٔ قبلی"
                    aria-disabled={safePage === 1}
                    className={cn(
                      "size-11",
                      safePage === 1 && "pointer-events-none opacity-40",
                    )}
                    onClick={(event) => {
                      event.preventDefault();
                      goToPage(safePage - 1);
                    }}
                  >
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </PaginationLink>
                </PaginationItem>

                {pageWindow(safePage, totalPages).map((item, index) =>
                  item === "ellipsis" ? (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={item}>
                      <PaginationLink
                        href="#"
                        isActive={item === safePage}
                        className="size-11"
                        onClick={(event) => {
                          event.preventDefault();
                          goToPage(item);
                        }}
                      >
                        {toFa(item)}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}

                <PaginationItem>
                  <PaginationLink
                    href="#"
                    aria-label="صفحهٔ بعدی"
                    aria-disabled={safePage === totalPages}
                    className={cn(
                      "size-11",
                      safePage === totalPages && "pointer-events-none opacity-40",
                    )}
                    onClick={(event) => {
                      event.preventDefault();
                      goToPage(safePage + 1);
                    }}
                  >
                    <ChevronLeft className="size-4" aria-hidden="true" />
                  </PaginationLink>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ── کارت افقی نمای فهرستی ── */

function CatalogListCard({ product }: { product: ProductSummary }) {
  const discount = discountPercent(product.price, product.comparePrice);

  return (
    <div className="group card-luxe flex items-stretch gap-4 p-4 transition-all duration-300 hover:border-gold/40 hover:shadow-lift">
      <Link
        href={`/products/${product.slug}`}
        className="img-canvas relative size-24 shrink-0 overflow-hidden rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:size-28"
      >
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="112px"
          className={cn(
            "object-contain p-1.5 transition-transform duration-500 group-hover:scale-[1.06]",
            !product.inStock && "opacity-40 grayscale",
          )}
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        {product.brandTitle ? (
          <p className="text-[11px] font-medium text-muted-foreground">
            {product.brandTitle}
          </p>
        ) : null}
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="line-clamp-1 min-w-0 basis-full text-sm leading-6 font-medium text-foreground transition-colors group-hover:text-primary sm:basis-auto sm:flex-1">
            {product.title}
          </h3>
          {discount != null && product.inStock ? (
            <span className="rounded-full bg-gold px-2.5 py-0.5 text-[11px] font-black text-gold-foreground">
              ٪{toFa(discount)}
            </span>
          ) : null}
          {product.isNew && product.inStock ? (
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-bold text-primary-foreground">
              جدید
            </span>
          ) : null}
          {!product.inStock ? (
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-bold text-secondary-foreground">
              ناموجود
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          {product.inStock ? (
            <div className="min-w-0">
              {product.comparePrice != null ? (
                <p className="text-xs text-muted-foreground line-through decoration-destructive/50">
                  {formatTomanPlain(product.comparePrice)}
                </p>
              ) : null}
              <p className="text-base font-black text-primary md:text-lg">
                {formatTomanPlain(product.price)}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  تومان
                </span>
              </p>
            </div>
          ) : (
            <p className="text-xs text-warning">به‌زودی موجود می‌شود</p>
          )}
          <Button
            asChild
            className="h-10 shrink-0 rounded-full px-6 text-xs font-bold"
          >
            <Link href={`/products/${product.slug}`}>مشاهدهٔ محصول</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
