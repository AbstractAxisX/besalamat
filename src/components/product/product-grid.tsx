/**
 * شبکهٔ کارت محصول — ۲ ستون موبایل، ۳ تبلت، ۴ دسکتاپ
 * ─────────────────────────────
 * سه حالت: کارت‌ها / اسکلت (loading) / حالت خالی.
 *  - stagger اختیاری: هر کارت داخل StaggerItem می‌نشیند تا با StaggerListِ
 *    والد (کاتالوگ) پلکانی ظاهر شود؛ مصرف‌کننده‌های دیگر بی‌تفاوت‌اند.
 *  - onReset اختیاری: دکمهٔ «حذف فیلترها» در حالت خالی (فقط کاتالوگ).
 * Server-safe؛ StaggerItem خودش مرز کلاینت است.
 */

import { IconPackageOff } from "@tabler/icons-react";

import {
  ProductCard,
  ProductCardSkeleton,
} from "@/components/product/product-card";
import { StaggerItem } from "@/components/shared/motion";
import { cn } from "@/lib/utils";
import type { ProductSummary } from "@/types/shop";

interface ProductGridProps {
  products: ProductSummary[];
  loading?: boolean;
  skeletonCount?: number;
  className?: string;
  /** هر کارت داخل StaggerItem بسته می‌شود (برای StaggerList والد) */
  stagger?: boolean;
  /** در حالت خالی، دکمهٔ «حذف فیلترها» این تابع را صدا می‌زند */
  onReset?: () => void;
}

const GRID_CLASSES =
  "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4";

/** حالت خالی — مرکز‌چین با جعبهٔ آیکون و دکمهٔ ریست */
function EmptyState({ onReset }: { onReset?: () => void }) {
  return (
    <div
      className={cn(
        "col-span-full flex flex-col items-center gap-4 rounded-2xl",
        "border border-dashed border-border/80 bg-card/60 px-4 py-16 text-center md:py-20",
      )}
    >
      <span
        aria-hidden="true"
        className="flex size-16 items-center justify-center rounded-3xl bg-secondary p-4 text-muted-foreground"
      >
        <IconPackageOff className="size-full" stroke={1.5} aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm font-bold text-foreground">
          محصولی مطابق فیلترها پیدا نشد
        </p>
        <p className="mt-1 text-[13px] leading-6 text-muted-foreground">
          فیلترها را تغییر دهید یا عبارت دیگری جستجو کنید
        </p>
      </div>
      {onReset ? (
        <button
          type="button"
          onClick={onReset}
          className="h-10 rounded-full bg-primary px-6 text-[13px] font-bold text-primary-foreground shadow-soft transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          حذف فیلترها
        </button>
      ) : null}
    </div>
  );
}

export function ProductGrid({
  products,
  loading = false,
  skeletonCount = 8,
  className,
  stagger = false,
  onReset,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className={cn(GRID_CLASSES, className)}>
        {Array.from({ length: skeletonCount }, (_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={cn(GRID_CLASSES, className)}>
        <EmptyState onReset={onReset} />
      </div>
    );
  }

  return (
    <div className={cn(GRID_CLASSES, className)}>
      {products.map((product) =>
        stagger ? (
          <StaggerItem key={product.id}>
            <ProductCard product={product} />
          </StaggerItem>
        ) : (
          <ProductCard key={product.id} product={product} />
        ),
      )}
    </div>
  );
}
