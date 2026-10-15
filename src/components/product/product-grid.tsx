/**
 * شبکهٔ کارت محصول — ۲ ستون موبایل، ۳ تبلت، ۴ دسکتاپ
 * ─────────────────────────────
 * Server Component؛ سه حالت: کارت‌ها / اسکلت (loading) / حالت خالی.
 */

import { Search } from "lucide-react";

import {
  ProductCard,
  ProductCardSkeleton,
} from "@/components/product/product-card";
import { cn } from "@/lib/utils";
import type { ProductSummary } from "@/types/shop";

interface ProductGridProps {
  products: ProductSummary[];
  loading?: boolean;
  skeletonCount?: number;
  className?: string;
}

export function ProductGrid({
  products,
  loading = false,
  skeletonCount = 8,
  className,
}: ProductGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {loading ? (
        Array.from({ length: skeletonCount }, (_, index) => (
          <ProductCardSkeleton key={index} />
        ))
      ) : products.length > 0 ? (
        products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))
      ) : (
        <div className="col-span-full py-16 text-center text-muted-foreground">
          <Search className="mx-auto size-6 opacity-40" aria-hidden="true" />
          <p className="mt-3 text-sm">محصولی یافت نشد</p>
        </div>
      )}
    </div>
  );
}
