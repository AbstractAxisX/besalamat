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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
          className="pe-11"
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
          ? "text-sm text-muted-foreground hover:text-gold"
          : "font-medium text-foreground hover:text-gold",
        active && "font-semibold text-gold hover:text-gold",
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

  return (
    <div className="space-y-6">
      {/* دسته‌بندی — درخت دوسطحی */}
      <section aria-label="دسته‌بندی">
        <h3 className="mb-3 text-sm font-bold">دسته‌بندی</h3>
        <ul>
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

      <Separator />

      {/* محدودهٔ قیمت */}
      <section aria-label="محدودهٔ قیمت">
        <h3 className="mb-3 text-sm font-bold">محدودهٔ قیمت</h3>
        <div className="grid grid-cols-2 gap-2">
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

      <Separator />

      {/* سوییچ‌ها */}
      <section aria-label="وضعیت کالا" className="space-y-3">
        <label className="flex cursor-pointer items-center justify-between gap-3">
          <span className="text-sm">فقط کالاهای موجود</span>
          <Switch
            checked={filters.inStock}
            onCheckedChange={(checked) =>
              onChange({ ...filters, inStock: checked })
            }
            aria-label="فقط کالاهای موجود"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-3">
          <span className="text-sm">فقط تخفیف‌دار</span>
          <Switch
            checked={filters.discount}
            onCheckedChange={(checked) =>
              onChange({ ...filters, discount: checked })
            }
            aria-label="فقط تخفیف‌دار"
          />
        </label>
      </section>

      <Separator />

      {/* برند */}
      <section aria-label="برند">
        <h3 className="mb-3 text-sm font-bold">برند</h3>
        <div className="max-h-48 space-y-1 overflow-y-auto pe-1">
          {brands.map((brand) => (
            <label
              key={brand.id}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg py-2 text-sm transition-colors hover:text-gold"
            >
              <Checkbox
                checked={filters.brands.includes(brand.slug)}
                onCheckedChange={(checked) =>
                  toggleBrand(brand.slug, checked === true)
                }
                aria-label={brand.title}
              />
              {brand.title}
            </label>
          ))}
        </div>
      </section>

      <Button
        type="button"
        variant="ghost"
        className="mt-4 h-9 w-full text-destructive hover:text-destructive"
        onClick={onReset}
      >
        حذف فیلترها
      </Button>
    </div>
  );
}
