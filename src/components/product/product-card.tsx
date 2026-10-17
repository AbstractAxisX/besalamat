"use client";

/**
 * کارت محصول — واحد پول‌ساز فروشگاه
 * ─────────────────────────────
 * کلاینت به‌خاطر «افزودن سریع به سبد» که در دسکتاپ با هاور ظاهر می‌شود؛
 * در موبایل لمسِ کارت به صفحهٔ محصول می‌رود (بدون دکمه‌های ریزِ خطاخطر).
 */

import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
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
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card",
        "transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-lift",
        "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      {/* ناحیهٔ تصویر */}
      <div className="img-canvas relative aspect-square overflow-hidden p-4 md:p-6">
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(max-width:768px) 50vw, 25vw"
          className={cn(
            "object-contain transition-transform duration-500 group-hover:scale-[1.06]",
            !product.inStock && "opacity-40 grayscale",
          )}
        />

        {/* بج‌ها */}
        <div className="absolute top-3 start-3 flex flex-col items-start gap-1.5">
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

        {/* افزودن سریع — فقط دسکتاپ با هاور */}
        {product.inStock ? (
          <button
            type="button"
            onClick={handleQuickAdd}
            aria-label={`افزودن ${product.title} به سبد خرید`}
            className="absolute inset-x-4 bottom-3 hidden h-10 translate-y-14 items-center justify-center gap-2 rounded-xl bg-primary/95 text-xs font-bold text-primary-foreground opacity-0 backdrop-blur transition-all duration-300 hover:bg-primary group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex"
          >
            <ShoppingBag className="size-4" aria-hidden="true" />
            افزودن به سبد
          </button>
        ) : null}
      </div>

      {/* بدنه */}
      <div className="flex flex-1 flex-col p-3.5 md:p-4">
        {product.brandTitle ? (
          <p className="text-[11px] font-medium text-muted-foreground">
            {product.brandTitle}
          </p>
        ) : null}
        <h3 className="mt-1 line-clamp-2 min-h-10 text-[13px] leading-5 font-medium text-foreground transition-colors group-hover:text-primary md:min-h-12 md:text-sm md:leading-6">
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
        "relative block h-full overflow-hidden rounded-2xl border border-border/70 bg-card",
        className,
      )}
    >
      <Skeleton className="img-canvas aspect-square rounded-none" />
      <div className="p-3.5 md:p-4">
        <Skeleton className="h-3 w-16" />
        <div className="mt-2 space-y-1.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/5" />
        </div>
        <div className="mt-4 space-y-1">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-6 w-28" />
        </div>
      </div>
    </div>
  );
}
