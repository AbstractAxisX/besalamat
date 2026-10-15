/**
 * کارت محصول — کلاسیک-مدرن با لمسهٔ طلایی محدود
 * ─────────────────────────────
 * Server Component بدون state؛ کل کارت یک Link به صفحهٔ محصول است.
 * تصاویر SVG لوکال با next/image (dangerouslyAllowSVG فعال است).
 */

import Image from "next/image";
import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";
import { discountPercent, formatTomanPlain, toFa } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ProductSummary } from "@/types/shop";

interface ProductCardProps {
  product: ProductSummary;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const discount = discountPercent(product.price, product.comparePrice);

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        "card-luxe card-lift group relative block h-full overflow-hidden",
        "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      {/* ناحیهٔ تصویر — بوم روشن برای پلیس‌هولدرهای SVG */}
      <div className="relative aspect-square bg-white p-6 md:p-8">
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(max-width:768px) 50vw, 25vw"
          className={cn(
            "object-contain transition-transform duration-300 group-hover:scale-[1.04]",
            !product.inStock && "opacity-40 grayscale",
          )}
        />
        {/* بج‌ها */}
        <div className="absolute top-3 start-3 flex flex-col gap-1.5">
          {discount != null && product.inStock ? (
            <span className="rounded-full bg-gold px-2.5 py-0.5 text-xs font-bold text-gold-foreground">
              ٪{toFa(discount)}
            </span>
          ) : null}
          {product.isNew && product.inStock ? (
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground">
              جدید
            </span>
          ) : null}
          {!product.inStock ? (
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-secondary-foreground">
              ناموجود
            </span>
          ) : null}
        </div>
      </div>

      {/* بدنه */}
      <div className="p-4">
        {product.brandTitle ? (
          <p className="text-xs text-muted-foreground">{product.brandTitle}</p>
        ) : null}
        <h3 className="mt-1 line-clamp-2 min-h-12 text-sm font-medium leading-6 text-foreground">
          {product.title}
        </h3>

        {product.inStock ? (
          <div className="mt-3">
            {product.comparePrice != null ? (
              <p className="text-xs text-muted-foreground line-through decoration-destructive/60">
                {formatTomanPlain(product.comparePrice)}
              </p>
            ) : null}
            <p className="text-lg font-extrabold text-primary">
              {formatTomanPlain(product.price)}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                تومان
              </span>
            </p>
          </div>
        ) : (
          <p className="mt-3 text-xs text-warning">به‌زودی موجود می‌شود</p>
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
      className={cn("card-luxe relative block h-full overflow-hidden", className)}
    >
      <Skeleton className="aspect-square rounded-none rounded-t-2xl" />
      <div className="p-4">
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
