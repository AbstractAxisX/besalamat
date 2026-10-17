"use client";

/**
 * پنل فیلترهای کاتالوگ — کاملاً کنترل‌شده (state نزد والد)
 * ─────────────────────────────
 * ورودی‌های قیمت متن محلی خودشان را دارند و فقط با blur/Enter اعمال می‌شوند؛
 * همگام‌سازی دو نمونهٔ پنل (سایدبار دسکتاپ + دراور موبایل) با key وابسته به
 * مقدار commit شده انجام می‌شود (بدون effect و بدون setState در رندر).
 */

import { useState } from "react";
import { Check } from "lucide-react";

import type { CatalogFilterState } from "@/components/catalog/catalog-view";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { formatTomanPlain, toEnDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BrandSummary, CategoryNode } from "@/types/shop";

interface FilterPanelProps {
  categories: CategoryNode[];
  brands: BrandSummary[];
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

/** آیتم لینک‌مانند درخت دسته‌بندی */
function CategoryItem({
  label,
  active,
  onClick,
  small = false,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-lg py-2 text-start transition-colors",
        small
          ? "text-xs text-muted-foreground hover:text-primary"
          : "text-[13px] font-bold text-foreground hover:text-primary",
        active && "font-bold text-gold-strong hover:text-gold-strong dark:text-gold dark:hover:text-gold",
      )}
    >
      {label}
      {active ? (
        <Check className="size-3.5 shrink-0" aria-hidden="true" />
      ) : null}
    </button>
  );
}

export function FilterPanel({
  categories,
  brands,
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

      {/* دسته‌بندی — درخت دوسطحی */}
      <section aria-label="دسته‌بندی">
        <SectionTitle>دسته‌بندی</SectionTitle>
        <ul className="mt-3">
          <li>
            <CategoryItem
              label="همهٔ دسته‌ها"
              active={filters.category == null}
              onClick={() => onChange({ ...filters, category: null })}
            />
          </li>
          {categories.map((parent) => (
            <li key={parent.id}>
              <CategoryItem
                label={parent.title}
                active={filters.category === parent.slug}
                onClick={() => onChange({ ...filters, category: parent.slug })}
              />
              <ul className="ps-4">
                {parent.children.map((child) => (
                  <li key={child.id}>
                    <CategoryItem
                      label={child.title}
                      active={filters.category === child.slug}
                      onClick={() =>
                        onChange({ ...filters, category: child.slug })
                      }
                      small
                    />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <Separator className="!bg-border/60" />

      {/* محدودهٔ قیمت */}
      <section aria-label="محدودهٔ قیمت">
        <SectionTitle>محدودهٔ قیمت</SectionTitle>
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
        <div className="mt-3 max-h-56 space-y-0.5 overflow-y-auto pe-1">
          {brands.map((brand) => (
            <label
              key={brand.id}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg py-2 text-[13px] transition-colors hover:text-primary"
            >
              <input
                type="checkbox"
                className="peer sr-only"
                checked={filters.brands.includes(brand.slug)}
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
                  filters.brands.includes(brand.slug)
                    ? "border-gold bg-gold text-gold-foreground"
                    : "border-input bg-card",
                )}
              >
                {filters.brands.includes(brand.slug) ? (
                  <Check className="size-3" />
                ) : null}
              </span>
              {brand.title}
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
