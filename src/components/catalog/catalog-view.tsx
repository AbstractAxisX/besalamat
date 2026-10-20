"use client";

/**
 * نمای کاتالوگ — موتور فروشگاه (محصولات + جستجو)
 * ─────────────────────────────
 * کل منطق سمت کلاینت روی دادهٔ props (بدون fetch)؛ هر تغییر state در URL
 * همگام می‌شود (router.replace بدون اسکرول) تا لینک‌ها قابل اشتراک باشند و
 * back/forward سالم بماند. FilterPanel کاملاً کنترل‌شده است — state نزد همین
 * کامپوننت می‌ماند و هر دو نمونه (سایدبار دسکتاپ + دراور موبایل) از آن تغذیه می‌شوند.
 *
 * ساختار جدید:
 *   ShopHeader (باند سبز عمیقِ full-bleed)
 *   └ shell: جستجوهای پرطرفدار (صفحهٔ جستجو) → تولبار (جستجو/سورت/شمار/نما)
 *     → چیپ‌های فیلتر فعال → گریدِ [سایدبار ۱۷rem | محتوا + صفحه‌بندی]
 *   └ Drawer موبایل
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  IconAdjustmentsHorizontal,
  IconArrowsSort,
  IconChevronLeft,
  IconChevronRight,
  IconLayoutGrid,
  IconList,
  IconSearch,
  IconSparkles,
  IconX,
} from "@tabler/icons-react";

import { FilterPanel } from "@/components/catalog/filter-panel";
import {
  ShopHeader,
  type ShopHeaderCrumb,
} from "@/components/catalog/shop-header";
import { ProductGrid } from "@/components/product/product-grid";
import { StaggerItem, StaggerList } from "@/components/shared/motion";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
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
import { brand } from "@/config/brand";
import {
  discountPercent,
  formatTomanPlain,
  toEnDigits,
  toFa,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  BrandSummary,
  CategoryNode,
  ProductSummary,
} from "@/types/shop";

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

/** ارتفاع هدر چسبانِ دسکتاپ (۳ سطر: ۳۶+۷۶+۴۸) + حاشیه — برای سایدبار چسبان */
const STICKY_TOP = 172;
const STICKY_MAX_H = 196;

const SORT_OPTIONS: { key: CatalogSortKey; label: string }[] = [
  { key: "newest", label: "جدیدترین" },
  { key: "cheapest", label: "ارزان‌ترین" },
  { key: "expensive", label: "گران‌ترین" },
  { key: "popular", label: "محبوب‌ترین" },
];

const EMPTY_FILTERS: CatalogFilterState = {
  category: null,
  brands: [],
  min: null,
  max: null,
  inStock: false,
  discount: false,
  q: null,
};

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
      return new Set([
        parent.slug,
        ...parent.children.map((child) => child.slug),
      ]);
    }
    if (parent.children.some((child) => child.slug === slug)) {
      return new Set([slug]);
    }
  }
  return null;
}

/** دستهٔ فعال (والد + فرزند) برای عنوان و بریدکرامب */
function findActiveCategory(
  categories: CategoryNode[],
  slug: string | null,
): { parent: CategoryNode; child: CategoryNode | null } | null {
  if (slug == null) return null;
  for (const parent of categories) {
    if (parent.slug === slug) return { parent, child: null };
    const child = parent.children.find((item) => item.slug === slug);
    if (child) return { parent, child };
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
  /** slug محصول → دستهٔ فرزند (سازگاری؛ محصولات جدید categorySlug خودشان را دارند) */
  categoryByProduct: Record<string, string | null>;
  initialFilters: CatalogInitialFilters;
  /** عنوان باند وقتی نه جستجویی فعال است نه دسته‌ای — پیش‌فرض «فروشگاه بسلامت» */
  shopTitle?: string;
  /** جستجوهای پرطرفدار — ردیف چیپ زیر باند (صفحهٔ جستجو) */
  popularSearches?: string[];
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
  shopTitle = `فروشگاه ${brand.name}`,
  popularSearches,
}: CatalogViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isSearchPage = pathname === "/search";

  /* ── state (همگی با URL همگام می‌شوند) ── */

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
    q: initialFilters.q?.trim() || null,
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
  const updateFilters = useCallback((patch: Partial<CatalogFilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }, []);

  /* ── جستجوی درون‌کاتالوگ: ورودی محلی + commit روی Enter + دیبانس ۴۰۰ms ── */

  const [searchText, setSearchText] = useState(
    initialFilters.q?.trim() || "",
  );
  const committedQRef = useRef<string | null>(
    initialFilters.q?.trim() || null,
  );

  /* تغییر از بیرون (چیپ/ریست/ناوبری) → ورودی محلی دنبال می‌کند */
  useEffect(() => {
    if (filters.q !== committedQRef.current) {
      committedQRef.current = filters.q;
      setSearchText(filters.q ?? "");
    }
  }, [filters.q]);

  /* تایپِ کاربر → اعمال با تأخیر کوتاه (بدون غرق‌کردن آدرس صفحه) */
  useEffect(() => {
    if (searchText === (committedQRef.current ?? "")) return;
    const timer = window.setTimeout(() => {
      const trimmed = searchText.trim();
      const next = trimmed === "" ? null : trimmed;
      if (next === committedQRef.current) return;
      committedQRef.current = next;
      updateFilters({ q: next });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [searchText, updateFilters]);

  const commitSearchNow = () => {
    const trimmed = searchText.trim();
    const next = trimmed === "" ? null : trimmed;
    if (next !== committedQRef.current) {
      committedQRef.current = next;
      updateFilters({ q: next });
    } else {
      setSearchText(next ?? "");
    }
  };

  const clearSearch = () => {
    setSearchText("");
    if (committedQRef.current != null) {
      committedQRef.current = null;
      updateFilters({ q: null });
    }
  };

  /* ── فیلتر + سورت (روی دادهٔ props) ── */

  const brandTitleBySlug = useMemo(
    () => new Map(brands.map((item) => [item.slug, item.title])),
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
        const productCategory =
          product.categorySlug ?? categoryByProduct[product.slug] ?? null;
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

  /* ── همگام‌سازی با URL (فقط مقادیر غیرپیش‌فرض؛ replace بدون اسکرول) ── */

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

  /* ── مشتقات نمایشی: عنوان/بریدکرامب باند + چیپ‌ها ── */

  const activeQuery = filters.q?.trim() || null;
  const activeCategory = useMemo(
    () => findActiveCategory(categories, filters.category),
    [categories, filters.category],
  );
  const activeCategoryTitle =
    activeCategory?.child?.title ?? activeCategory?.parent.title ?? null;

  const headerTitle = activeQuery
    ? `نتایج جستجو برای «${activeQuery}»`
    : (activeCategoryTitle ?? shopTitle);

  const headerDescription = activeQuery
    ? "جستجو در میان لوازم و تجهیزات پزشکی فروشگاه؛ اگر نتیجه‌ای نبود، فیلترها را ساده‌تر کنید یا عبارت دیگری را امتحان کنید."
    : activeCategoryTitle
      ? `خرید آنلاین ${activeCategoryTitle} با ضمانت اصالت کالا و ارسال سریع.`
      : "خرید آنلاین لوازم و تجهیزات پزشکی با ضمانت اصالت کالا و ارسال سریع.";

  const breadcrumbItems = useMemo<ShopHeaderCrumb[]>(() => {
    const items: ShopHeaderCrumb[] = [
      { label: "خانه", href: "/" },
      { label: "فروشگاه", href: "/products" },
    ];
    if (isSearchPage) {
      items.push(
        activeCategory ? { label: "جستجو", href: "/search" } : { label: "جستجو" },
      );
    } else if (!activeCategory) {
      /* بدون دسته: خودِ «فروشگاه» صفحهٔ جاری است */
      items[items.length - 1] = { label: "فروشگاه" };
    }
    if (activeCategory) {
      if (activeCategory.child) {
        items.push({
          label: activeCategory.parent.title,
          href: `/products?category=${activeCategory.parent.slug}`,
        });
        items.push({ label: activeCategory.child.title });
      } else {
        items.push({ label: activeCategory.parent.title });
      }
    }
    return items;
  }, [isSearchPage, activeCategory]);

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
    if (filters.min != null || filters.max != null) {
      const parts: string[] = [];
      if (filters.min != null) {
        parts.push(`از ${formatTomanPlain(filters.min)}`);
      }
      if (filters.max != null) {
        parts.push(`تا ${formatTomanPlain(filters.max)}`);
      }
      chips.push({
        key: "price",
        label: `${parts.join(" ")} تومان`,
        clear: () => updateFilters({ min: null, max: null }),
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
        label: `«${query}»`,
        clear: () => updateFilters({ q: null }),
      });
    }
    return chips;
  }, [filters, activeCategoryTitle, brandTitleBySlug, updateFilters]);

  const hasActiveFilters = activeChips.length > 0;

  /* کلید پخش‌شدن دوبارهٔ انیمیشن گرید (صفحه/فیلتر/سورت عوض شد) */
  const staggerKey = useMemo(
    () =>
      [
        `p${safePage}`,
        `s${sort}`,
        `v${view}`,
        filters.category ?? "-",
        filters.brands.join(",") || "-",
        filters.min ?? "-",
        filters.max ?? "-",
        filters.inStock ? "i1" : "i0",
        filters.discount ? "d1" : "d0",
        filters.q ?? "-",
      ].join("|"),
    [safePage, sort, view, filters],
  );

  const filterPanel = (
    <FilterPanel
      categories={categories}
      brands={brands}
      products={products}
      filters={filters}
      onChange={updateFilters}
      onReset={resetFilters}
    />
  );

  return (
    <div>
      {/* ── باند هدر فروشگاه — سبز عمیق ── */}
      <ShopHeader
        title={headerTitle}
        description={headerDescription}
        breadcrumbItems={breadcrumbItems}
        count={totalCount}
      />

      <div className="shell py-6 md:py-10">
        {/* جستجوهای پرطرفدار (صفحهٔ جستجو) */}
        {popularSearches && popularSearches.length > 0 ? (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <IconSparkles
                className="size-3.5 text-fresh"
                stroke={1.75}
                aria-hidden="true"
              />
              جستجوهای پرطرفدار:
            </span>
            {popularSearches.map((term) => (
              <Link
                key={term}
                href={`/search?q=${encodeURIComponent(term)}`}
                className="rounded-full border border-border/70 bg-card px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-fresh/60 hover:text-fresh-strong"
              >
                {term}
              </Link>
            ))}
          </div>
        ) : null}

        {/* ── تولبار: فیلتر موبایل + جستجو + سورت + شمار + نما ── */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            aria-label="باز کردن پنل فیلترها"
            className="flex h-11 shrink-0 items-center gap-2 rounded-xl border border-border/70 bg-card px-4 text-[13px] font-semibold text-foreground transition-colors hover:border-fresh/50 hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 lg:hidden"
          >
            <IconAdjustmentsHorizontal
              className="size-4.5"
              stroke={1.75}
              aria-hidden="true"
            />
            فیلترها
            {hasActiveFilters ? (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-black tabular-nums text-primary-foreground ring-2 ring-fresh/70">
                {toFa(activeChips.length)}
              </span>
            ) : null}
          </button>

          {/* جستجوی درون‌کاتالوگ */}
          <div className="relative min-w-44 flex-1 sm:max-w-md">
            <IconSearch
              className="pointer-events-none absolute start-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground"
              stroke={1.75}
              aria-hidden="true"
            />
            <Input
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  commitSearchNow();
                }
              }}
              placeholder="جستجو در محصولات…"
              aria-label="جستجو در محصولات"
              className="h-11 rounded-xl border-border bg-card ps-10 pe-9 text-[13px] shadow-none focus-visible:border-fresh/60 focus-visible:ring-fresh/15"
            />
            {searchText !== "" ? (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="پاک کردن جستجو"
                className="absolute end-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <IconX className="size-4" stroke={1.75} aria-hidden="true" />
              </button>
            ) : null}
          </div>

          {/* مرتب‌سازی */}
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
              aria-label="مرتب‌سازی محصولات"
              className="h-11 w-40 rounded-xl border-border bg-card text-[13px] shadow-none"
            >
              <span className="flex items-center gap-2">
                <IconArrowsSort
                  className="size-4 text-muted-foreground"
                  stroke={1.75}
                  aria-hidden="true"
                />
                <SelectValue placeholder="مرتب‌سازی" />
              </span>
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
            className="hidden items-center gap-0.5 rounded-xl border border-border/70 bg-card p-1 sm:flex"
            role="group"
            aria-label="نوع نمایش محصولات"
          >
            <button
              type="button"
              onClick={() => setView("grid")}
              aria-label="نمای شبکه‌ای"
              aria-pressed={view === "grid"}
              className={cn(
                "flex size-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                view === "grid"
                  ? "bg-secondary text-primary"
                  : "text-muted-foreground hover:text-primary",
              )}
            >
              <IconLayoutGrid
                className="size-4"
                stroke={1.75}
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              aria-label="نمای فهرستی"
              aria-pressed={view === "list"}
              className={cn(
                "flex size-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                view === "list"
                  ? "bg-secondary text-primary"
                  : "text-muted-foreground hover:text-primary",
              )}
            >
              <IconList className="size-4" stroke={1.75} aria-hidden="true" />
            </button>
          </div>

          {/* شمار نتیجه */}
          <p
            className="ms-auto text-xs tabular-nums text-muted-foreground"
            aria-live="polite"
          >
            {toFa(totalCount)} کالا
          </p>
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
                aria-label={`حذف فیلتر: ${chip.label}`}
                className="group inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-[11px] font-medium text-secondary-foreground transition-colors hover:bg-fresh-soft"
              >
                {chip.label}
                <IconX
                  className="size-3.5 text-muted-foreground transition-colors group-hover:text-destructive"
                  stroke={1.75}
                  aria-hidden="true"
                />
              </button>
            ))}
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-medium text-destructive transition-colors hover:text-destructive/80"
            >
              حذف همه
            </button>
          </div>
        ) : null}

        {/* ── بدنه: سایدبار فیلتر + محتوا ── */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-8">
          <aside className="hidden lg:block" aria-label="فیلترهای محصولات">
            <div
              className="sticky overflow-y-auto pb-6 pe-1"
              style={{
                top: `${STICKY_TOP}px`,
                maxHeight: `calc(100vh - ${STICKY_MAX_H}px)`,
              }}
            >
              {filterPanel}
            </div>
          </aside>

          <div className="min-w-0">
            {totalCount === 0 ? (
              <ProductGrid products={[]} onReset={resetFilters} />
            ) : view === "grid" ? (
              <StaggerList key={staggerKey} step={0.05}>
                <ProductGrid
                  products={pageItems}
                  stagger
                  onReset={resetFilters}
                />
              </StaggerList>
            ) : (
              <StaggerList
                key={staggerKey}
                className="space-y-3"
                step={0.05}
              >
                {pageItems.map((product) => (
                  <StaggerItem key={product.id}>
                    <CatalogListCard product={product} />
                  </StaggerItem>
                ))}
              </StaggerList>
            )}

            {totalPages > 1 ? (
              <Pagination className="mt-10">
                <PaginationContent className="gap-1.5">
                  {/* در RTL دکمهٔ «قبلی» سمت راست قرار می‌گیرد */}
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      aria-label="صفحهٔ قبلی"
                      aria-disabled={safePage === 1}
                      className={cn(
                        "size-10 rounded-full",
                        safePage === 1 && "pointer-events-none opacity-40",
                      )}
                      onClick={(event) => {
                        event.preventDefault();
                        goToPage(safePage - 1);
                      }}
                    >
                      <IconChevronRight
                        className="size-4"
                        stroke={1.75}
                        aria-hidden="true"
                      />
                    </PaginationLink>
                  </PaginationItem>

                  {pageWindow(safePage, totalPages).map((item, index) =>
                    item === "ellipsis" ? (
                      <PaginationItem key={`ellipsis-${index}`}>
                        <PaginationEllipsis className="text-muted-foreground" />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={item}>
                        <PaginationLink
                          href="#"
                          isActive={item === safePage}
                          className={cn(
                            "size-10 rounded-full font-bold tabular-nums transition-colors hover:bg-secondary",
                            item === safePage &&
                              "border-transparent bg-primary text-primary-foreground shadow-soft hover:bg-primary",
                          )}
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
                        "size-10 rounded-full",
                        safePage === totalPages && "pointer-events-none opacity-40",
                      )}
                      onClick={(event) => {
                        event.preventDefault();
                        goToPage(safePage + 1);
                      }}
                    >
                      <IconChevronLeft
                        className="size-4"
                        stroke={1.75}
                        aria-hidden="true"
                      />
                    </PaginationLink>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── دراور فیلتر موبایل ── */}
      <Drawer open={filtersOpen} onOpenChange={setFiltersOpen}>
        <DrawerContent className="rounded-t-3xl!">
          <DrawerHeader className="text-start">
            <DrawerTitle className="flex items-center justify-between text-base font-bold text-foreground">
              فیلترها
              <span className="text-xs font-medium tabular-nums text-muted-foreground">
                {toFa(totalCount)} کالا
              </span>
            </DrawerTitle>
            <DrawerDescription className="sr-only">
              فیلتر محصولات بر اساس دسته‌بندی، برند، قیمت و موجودی
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-2">
            {filterPanel}
          </div>
          <DrawerFooter className="flex-row items-stretch gap-3 border-t border-border/60 bg-card pb-[calc(1rem_+_env(safe-area-inset-bottom))]">
            {hasActiveFilters ? (
              <Button
                type="button"
                variant="outline"
                className="h-12 flex-1 rounded-xl text-[13px] font-semibold"
                onClick={resetFilters}
              >
                حذف همه
              </Button>
            ) : null}
            <Button
              type="button"
              className="h-12 flex-[2] rounded-xl text-sm font-bold"
              onClick={() => setFiltersOpen(false)}
            >
              نمایش {toFa(totalCount)} کالا
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

/* ── کارت افقی نمای فهرستی ── */

function CatalogListCard({ product }: { product: ProductSummary }) {
  const discount = discountPercent(product.price, product.comparePrice);

  return (
    <div className="group flex items-stretch gap-4 rounded-2xl border border-border/60 bg-card p-4 transition-[border-color,box-shadow] duration-300 hover:border-primary/35 hover:shadow-card">
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
            "object-cover",
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
            <span className="rounded-full bg-destructive px-2.5 py-0.5 text-[11px] font-black text-destructive-foreground">
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
