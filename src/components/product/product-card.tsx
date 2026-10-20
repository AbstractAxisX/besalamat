"use client";

/**
 * کارت محصول — واحد پول‌ساز فروشگاه (نسخهٔ ۲۰۲۶)
 * ─────────────────────────────
 * قواعد طراحی (سفارش مشتری):
 *  - تصویر مربع ۱:۱؛ نگهدارندهٔ تصویر p-2؛ خود عکس rounded-2xl (راندد لارج)
 *  - هاور: فقط یک بوردر ظریف — بدون اسکیل، بدون جابه‌جایی
 *  - دکمهٔ افزودن به سبد: همیشه‌دیدنی، دایره‌ای، گوشهٔ تصویر (لمس‌پذیر)
 * کلاینت به‌خاطر اکشن سبد خرید (zustand) و toast.
 */

import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { IconPlus } from "@tabler/icons-react";

import { discountPercent, formatTomanPlain, toFa } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import type { ProductSummary } from "@/types/shop";

interface ProductCardProps {
  product: ProductSummary;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const addLine = useCartStore((state) => state.addLine);
  const discount = discountPercent(product.price, product.comparePrice);

  const handleQuickAdd = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!product.inStock) return;
    addLine({
      productId: product.id,
      variantId: null,
      slug: product.slug,
      title: product.title,
      variantTitle: null,
      image: product.image,
      unitPrice: product.price,
      comparePrice: product.comparePrice,
      qty: 1,
      maxQty: 99,
    });
    toast.success("به سبد خرید اضافه شد");
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      draggable={false}
      className={cn(
        "group relative flex h-full flex-col rounded-2xl border border-border/60 bg-card",
        "transition-[border-color,box-shadow] duration-300 hover:border-primary/35 hover:shadow-card",
        "outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40",
        className,
      )}
    >
      {/* ناحیهٔ تصویر — نگهدارنده p-2، بوم مربع با گوشهٔ لارج */}
      <div className="p-2">
        <div className="img-canvas relative aspect-square overflow-hidden rounded-2xl">
          <Image
            src={product.image}
            alt={product.title}
            fill
            draggable={false}
            sizes="(max-width:768px) 50vw, 25vw"
            className={cn(
              "object-cover",
              !product.inStock && "opacity-40 grayscale",
            )}
          />

          {/* بج‌ها — گوشهٔ بالا-راست */}
          <div className="absolute top-2.5 start-2.5 flex flex-col items-start gap-1.5">
            {discount != null && product.inStock ? (
              <span className="rounded-full bg-destructive px-2 py-0.5 text-[11px] font-black text-destructive-foreground">
                ٪{toFa(discount)}
              </span>
            ) : null}
            {product.isNew && product.inStock ? (
              <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
                جدید
              </span>
            ) : null}
            {!product.inStock ? (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-bold text-secondary-foreground">
                ناموجود
              </span>
            ) : null}
          </div>

          {/* افزودن سریع — دکمهٔ دایره‌ای همیشه‌دیدنی، گوشهٔ پایین-چپ تصویر */}
          {product.inStock ? (
            <button
              type="button"
              onClick={handleQuickAdd}
              aria-label={`افزودن ${product.title} به سبد خرید`}
              className={cn(
                "absolute bottom-2.5 end-2.5 z-10 flex size-9 items-center justify-center rounded-full",
                "border border-border/70 bg-card/95 text-foreground shadow-soft backdrop-blur",
                "transition-colors duration-200 hover:bg-primary hover:text-primary-foreground hover:border-primary",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              <IconPlus className="size-4.5" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      {/* بدنه */}
      <div className="flex flex-1 flex-col px-3.5 pb-4 pt-1 md:px-4">
        {product.brandTitle ? (
          <p className="text-[11px] font-medium text-muted-foreground">
            {product.brandTitle}
          </p>
        ) : null}
        <h3 className="mt-1 line-clamp-2 min-h-10 text-[13px] leading-5 font-semibold text-foreground transition-colors group-hover:text-primary md:min-h-12 md:text-sm md:leading-6">
          {product.title}
        </h3>

        {product.inStock ? (
          <div className="mt-auto pt-3">
            {/* رزرو خط قیمت قبلی — هم‌ترازی قیمت‌ها در ردیف */}
            <p className="text-[11px] leading-4 text-muted-foreground">
              {product.comparePrice != null ? (
                <span className="line-through decoration-destructive/50">
                  {formatTomanPlain(product.comparePrice)}
                </span>
              ) : (
                <span aria-hidden="true">&nbsp;</span>
              )}
            </p>
            <p className="text-base font-black text-primary md:text-lg">
              {formatTomanPlain(product.price)}{" "}
              <span className="text-[10px] font-normal text-muted-foreground">
                تومان
              </span>
            </p>
          </div>
        ) : (
          <p className="mt-auto pt-3 text-[11px] font-medium text-warning">
            به‌زودی موجود می‌شود
          </p>
        )}
      </div>
    </Link>
  );
}

/** اسکلت کارت محصول — هم‌ساختار با ProductCard، بدون Link */
export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative block h-full overflow-hidden rounded-2xl border border-border/60 bg-card",
        className,
      )}
    >
      <div className="p-2">
        <div className="img-canvas aspect-square rounded-2xl" />
      </div>
      <div className="px-3.5 pb-4 pt-1 md:px-4">
        <div className="skeleton-shimmer h-3 w-16 rounded-full" />
        <div className="mt-2 space-y-1.5">
          <div className="skeleton-shimmer h-4 w-full rounded-full" />
          <div className="skeleton-shimmer h-4 w-3/5 rounded-full" />
        </div>
        <div className="mt-4 space-y-1">
          <div className="skeleton-shimmer h-3 w-14 rounded-full" />
          <div className="skeleton-shimmer h-6 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}
