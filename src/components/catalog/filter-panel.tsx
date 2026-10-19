"use client";

/**
 * پنل فیلترهای کاتالوگ — کاملاً کنترل‌شده (state نزد والد)
 * ─────────────────────────────
 *  - درخت دسته‌بندی دوسطحی: انتخاب دسته با خودِ ردیف، باز/بستن زیردسته‌ها
 *    با دکمهٔ جداگانهٔ شِوران (aria-expanded خودکار از Radix).
 *  - اسلایدر دو‌انگشتی قیمت: مقدار محلی دارد و فقط با رهاکردن (onValueCommit)
 *    اعمال می‌شود — کشیدنِ انگشت، آدرس صفحه را غرق در replace نمی‌کند.
 *    انگشتِ ابتدای مسیر = بدون فیلترِ همان طرف (قرارداد دیجی‌کالایی).
 *  - ورودی‌های عددی همان الگوی مستحکمِ قبل را دارند: commit روی blur/Enter و
 *    همگام‌سازی دو نمونهٔ پنل با key وابسته به مقدارِ commit شده.
 *    اسلایدر با الگوی «تنظیم state حین رندر» (React docs) همگام می‌شود.
 */

import { useMemo, useState } from "react";
import {
  IconCheck,
  IconChevronDown,
  IconLayoutGrid,
} from "@tabler/icons-react";

import type { CatalogFilterState } from "@/components/catalog/catalog-view";
import { CategoryIcon } from "@/components/shared/category-icon";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { formatTomanPlain, toEnDigits, toFa } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  BrandSummary,
  CategoryNode,
  ProductSummary,
} from "@/types/shop";

interface FilterPanelProps {
  categories: CategoryNode[];
  brands: BrandSummary[];
  /** برای شمارش محصولِ هر گرهٔ درخت و سقف اسلایدر قیمت */
  products: ProductSummary[];
  filters: CatalogFilterState;
  onChange: (filters: CatalogFilterState) => void;
  onReset: () => void;
}

/** سرفصل بخش */
function SectionTitle({ children }: { children: string }) {
  return (
    <h3 className="text-xs font-black tracking-wide text-foreground">
      {children}
    </h3>
  );
}

/** بج شمارش کوچک کنار ردیف‌های درخت */
function CountBadge({ value }: { value: number }) {
  return (
    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] tabular-nums text-muted-foreground">
      {toFa(value)}
    </span>
  );
}

/** ورودی قیمت — اعداد فارسی/لاتین را می‌پذیرد و با blur/Enter اعمال می‌شود */
function PriceInput({
  label,
  value,
  onCommit,
}: {
  label: string;
  value: number | null;
  onCommit: (value: number | null) => void;
}) {
  const [text, setText] = useState(value != null ? formatTomanPlain(value) : "");

  const commit = () => {
    const digits = toEnDigits(text).replace(/[^\d]/g, "");
    const parsed = digits === "" ? null : Number.parseInt(digits, 10);
    if (parsed !== value) {
      /* تغییر از والد برمی‌گردد و با key این ورودی دوباره mount می‌شود */
      onCommit(parsed);
    } else {
      setText(parsed != null ? formatTomanPlain(parsed) : "");
    }
  };

  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-muted-foreground">{label}</span>
      <span className="relative block">
        <Input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={text}
          placeholder="مثلاً ۵۰۰٬۰۰۰"
          onChange={(event) => setText(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              event.currentTarget.blur();
            }
          }}
          className="h-10 pe-11 text-xs"
        />
        <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
          تومان
        </span>
      </span>
    </label>
  );
}

export function FilterPanel({
  categories,
  brands,
  products,
  filters,
  onChange,
  onReset,
}: FilterPanelProps) {
  const toggleBrand = (slug: string, checked: boolean) => {
    const next = checked
      ? [...filters.brands, slug]
      : filters.brands.filter((item) => item !== slug);
    onChange({ ...filters, brands: next });
  };

  const hasActive =
    filters.category != null ||
    filters.brands.length > 0 ||
    filters.min != null ||
    filters.max != null ||
    filters.inStock ||
    filters.discount ||
    (filters.q != null && filters.q.trim() !== "");

  /* ── شمارش هر گرهٔ درخت از روی categorySlug محصولات ── */
  const { childCounts, parentCounts } = useMemo(() => {
    const childCounts = new Map<string, number>();
    for (const product of products) {
      const slug = product.categorySlug;
      if (slug == null) continue;
      childCounts.set(slug, (childCounts.get(slug) ?? 0) + 1);
    }
    const parentCounts = new Map<string, number>();
    for (const parent of categories) {
      let total = childCounts.get(parent.slug) ?? 0;
      for (const child of parent.children) {
        total += childCounts.get(child.slug) ?? 0;
      }
      parentCounts.set(parent.slug, total);
    }
    return { childCounts, parentCounts };
  }, [products, categories]);

  /* والدِ دستهٔ فعال — برای defaultOpen درخت */
  const activeParentSlug = useMemo(() => {
    if (filters.category == null) return null;
    for (const parent of categories) {
      if (parent.slug === filters.category) return parent.slug;
      if (parent.children.some((child) => child.slug === filters.category)) {
        return parent.slug;
      }
    }
    return null;
  }, [categories, filters.category]);

  /* ── اسلایدر قیمت: سقف از داده، مقدار محلی، اعمال با رهاکردن ── */
  const priceMax = useMemo(() => {
    const max = products.reduce(
      (acc, product) => Math.max(acc, product.price),
      0,
    );
    return Math.max(100_000, Math.ceil(max / 100_000) * 100_000);
  }, [products]);

  const [range, setRange] = useState<[number, number]>([
    filters.min ?? 0,
    filters.max ?? priceMax,
  ]);

  /* تغییر از بیرون (چیپ/ریست/لینک اشتراکی) → اسلایدر برمی‌گردد.
     الگوی «تنظیم state حین رندر» (React docs) — بدون effect. */
  const [syncedRange, setSyncedRange] = useState<[number, number]>([
    filters.min ?? 0,
    filters.max ?? priceMax,
  ]);
  if (
    (filters.min ?? 0) !== syncedRange[0] ||
    (filters.max ?? priceMax) !== syncedRange[1]
  ) {
    const next: [number, number] = [filters.min ?? 0, filters.max ?? priceMax];
    setSyncedRange(next);
    setRange(next);
  }

  const allSelected = filters.category == null;

  return (
    <div className="space-y-5">
      {/* سرِ پنل */}
      <div className="flex items-center justify-between">
        <SectionTitle>فیلترها</SectionTitle>
        {hasActive ? (
          <button
            type="button"
            onClick={onReset}
            className="text-[11px] font-medium text-destructive transition-colors hover:text-destructive/80"
          >
            حذف همه
          </button>
        ) : null}
      </div>

      <Separator className="!bg-border/60" />

      {/* دسته‌بندی — درخت دوسطحی با باز/بستن */}
      <section aria-label="دسته‌بندی">
        <SectionTitle>دسته‌بندی</SectionTitle>
        <ul className="mt-3 space-y-0.5">
          <li>
            <button
              type="button"
              aria-pressed={allSelected}
              onClick={() => onChange({ ...filters, category: null })}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-start text-[13px] font-bold transition-colors",
                allSelected
                  ? "bg-secondary text-primary"
                  : "text-foreground hover:bg-secondary/60 hover:text-primary",
              )}
            >
              <span
                aria-hidden="true"
                className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary/70 text-primary"
              >
                <IconLayoutGrid className="size-4.5" stroke={1.75} />
              </span>
              <span className="min-w-0 flex-1">همهٔ دسته‌ها</span>
              {allSelected ? (
                <IconCheck
                  className="size-4 shrink-0 text-fresh-strong"
                  stroke={1.75}
                  aria-hidden="true"
                />
              ) : (
                <CountBadge value={products.length} />
              )}
            </button>
          </li>

          {categories.map((parent) => {
            const isParentActive = filters.category === parent.slug;
            return (
              <li key={parent.id}>
                <Collapsible defaultOpen={activeParentSlug === parent.slug}>
                  <div className="flex items-center gap-1">
                    {/* ردیف = انتخاب دستهٔ والد */}
                    <button
                      type="button"
                      aria-pressed={isParentActive}
                      onClick={() =>
                        onChange({ ...filters, category: parent.slug })
                      }
                      className={cn(
                        "flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-start text-[13px] font-bold transition-colors",
                        isParentActive
                          ? "bg-secondary text-primary"
                          : "text-foreground hover:bg-secondary/60 hover:text-primary",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary/70 text-primary"
                      >
                        <CategoryIcon
                          iconKey={parent.iconKey}
                          className="size-4.5"
                        />
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {parent.title}
                      </span>
                      {isParentActive ? (
                        <IconCheck
                          className="size-4 shrink-0 text-fresh-strong"
                          stroke={1.75}
                          aria-hidden="true"
                        />
                      ) : (
                        <CountBadge
                          value={parentCounts.get(parent.slug) ?? 0}
                        />
                      )}
                    </button>

                    {/* شوران — باز/بستن زیردسته‌ها (aria-expanded خودکار) */}
                    <CollapsibleTrigger asChild>
                      <button
                        type="button"
                        aria-label={`باز کردن زیردسته‌های ${parent.title}`}
                        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-[color,transform] duration-200 hover:bg-secondary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=open]:rotate-180"
                      >
                        <IconChevronDown
                          className="size-4"
                          stroke={1.75}
                          aria-hidden="true"
                        />
                      </button>
                    </CollapsibleTrigger>
                  </div>

                  <CollapsibleContent>
                    <ul className="ps-3 pt-1 pb-0.5">
                      {parent.children.map((child) => {
                        const isChildActive =
                          filters.category === child.slug;
                        return (
                          <li key={child.id}>
                            <button
                              type="button"
                              aria-pressed={isChildActive}
                              onClick={() =>
                                onChange({ ...filters, category: child.slug })
                              }
                              className={cn(
                                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-start text-xs transition-colors",
                                isChildActive
                                  ? "bg-secondary font-bold text-fresh-strong dark:text-fresh"
                                  : "text-muted-foreground hover:bg-secondary/50 hover:text-primary",
                              )}
                            >
                              <span
                                aria-hidden="true"
                                className={cn(
                                  "size-1 shrink-0 rounded-full",
                                  isChildActive
                                    ? "bg-fresh"
                                    : "bg-fresh/60",
                                )}
                              />
                              <span className="min-w-0 flex-1 truncate">
                                {child.title}
                              </span>
                              <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground/80">
                                {toFa(childCounts.get(child.slug) ?? 0)}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              </li>
            );
          })}
        </ul>
      </section>

      <Separator className="!bg-border/60" />

      {/* محدودهٔ قیمت — اسلایدر دومفهومی + ورودی‌های عددی */}
      <section aria-label="محدودهٔ قیمت">
        <SectionTitle>محدودهٔ قیمت</SectionTitle>
        {/* مارجین تاپ ۲ اسلایدر — درخواست صریح مشتری */}
        <div className="mt-2">
          <Slider
            aria-label="بازهٔ قیمت"
            min={0}
            max={priceMax}
            step={50_000}
            value={range}
            onValueChange={(value) => setRange([value[0], value[1]])}
            onValueCommit={(value) =>
              onChange({
                ...filters,
                min: value[0] > 0 ? value[0] : null,
                max: value[1] < priceMax ? value[1] : null,
              })
            }
            className="[&_[data-slot=slider-range]]:bg-fresh [&_[data-slot=slider-thumb]]:size-4.5 [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-fresh [&_[data-slot=slider-thumb]]:bg-card [&_[data-slot=slider-thumb]]:shadow-soft"
          />
          <p className="mt-3 text-center text-[11px] leading-5 tabular-nums text-muted-foreground">
            {toFa(range[0])} — {toFa(range[1])} تومان
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <PriceInput
              key={`min-${filters.min ?? "empty"}`}
              label="از"
              value={filters.min}
              onCommit={(min) => onChange({ ...filters, min })}
            />
            <PriceInput
              key={`max-${filters.max ?? "empty"}`}
              label="تا"
              value={filters.max}
              onCommit={(max) => onChange({ ...filters, max })}
            />
          </div>
        </div>
      </section>

      <Separator className="!bg-border/60" />

      {/* سوییچ‌ها */}
      <section aria-label="وضعیت کالا" className="space-y-3">
        <SectionTitle>وضعیت کالا</SectionTitle>
        <label className="mt-3 flex cursor-pointer items-center justify-between gap-3">
          <span className="text-[13px]">فقط کالاهای موجود</span>
          <Switch
            checked={filters.inStock}
            onCheckedChange={(checked) =>
              onChange({ ...filters, inStock: checked })
            }
            aria-label="فقط کالاهای موجود"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-3">
          <span className="text-[13px]">فقط تخفیف‌دار</span>
          <Switch
            checked={filters.discount}
            onCheckedChange={(checked) =>
              onChange({ ...filters, discount: checked })
            }
            aria-label="فقط تخفیف‌دار"
          />
        </label>
      </section>

      <Separator className="!bg-border/60" />

      {/* برند */}
      <section aria-label="برند">
        <SectionTitle>برند</SectionTitle>
        <div className="mt-3 max-h-64 space-y-0.5 overflow-y-auto pe-1">
          {brands.map((brand) => {
            const checked = filters.brands.includes(brand.slug);
            return (
              <label
                key={brand.id}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg py-2 text-start text-[13px] transition-colors hover:text-primary"
              >
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={checked}
                  onChange={(event) =>
                    toggleBrand(brand.slug, event.target.checked)
                  }
                  aria-label={brand.title}
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-4.5 shrink-0 items-center justify-center rounded-md border transition-colors",
                    "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-1",
                    checked
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-card",
                  )}
                >
                  {checked ? (
                    <IconCheck
                      className="size-3"
                      stroke={1.75}
                      aria-hidden="true"
                    />
                  ) : null}
                </span>
                {brand.title}
              </label>
            );
          })}
        </div>
      </section>
    </div>
  );
}
