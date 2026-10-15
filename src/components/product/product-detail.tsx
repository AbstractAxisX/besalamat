"use client";

/**
 * جزئیات محصول — گالری، تنوع‌ها، خرید و تب‌ها
 * ─────────────────────────────
 * قیمت/موجودی مؤثر از تنوعِ انتخاب‌شده می‌آید (محصول ساده = فیلدهای خودش).
 * افزودن به سبد با addLine استور (بدون خواندن state در رندر → بدون mismatch).
 * فاز ۳: گالری زوم می‌آید؛ فعلاً سوییچ ساده با انیمیشن fade.
 */

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Check, CheckCircle2, Minus, Plus, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  discountPercent,
  formatTomanPlain,
  normalizePhone,
  toFa,
} from "@/lib/format";
import { PREVIEW_BRANDS } from "@/lib/preview-data";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import type {
  ProductDetail,
  ProductImageDTO,
  ProductSummary,
  ProductVariantDTO,
} from "@/types/shop";

interface ProductDetailProps {
  product: ProductDetail;
  /** محصولات مرتبط — این کامپوننت رندر نمی‌کند؛ صفحهٔ محصول رندر می‌کند */
  related: ProductSummary[];
}

/** تنوع پیش‌فرض: isDefault وگرنه اولین تنوع موجود */
function defaultVariantId(variants: ProductVariantDTO[]): string | null {
  if (variants.length === 0) return null;
  const preferred =
    variants.find((variant) => variant.isDefault && variant.stock > 0) ??
    variants.find((variant) => variant.stock > 0) ??
    variants[0];
  return preferred?.id ?? null;
}

export function ProductDetail({ product }: ProductDetailProps) {
  /* فقط در رویدادها مصرف می‌شود — الگوی hydration-safe */
  const addLine = useCartStore((state) => state.addLine);

  const images: ProductImageDTO[] =
    product.images.length > 0
      ? product.images
      : [{ url: product.image, alt: product.title }];
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    () => defaultVariantId(product.variants),
  );
  const [qty, setQty] = useState(1);
  const [notifyPhone, setNotifyPhone] = useState("");
  const [notifyDone, setNotifyDone] = useState(false);

  /* قیمت/موجودی مؤثر — از تنوع انتخابی یا فیلدهای محصول */
  const selectedVariant =
    product.variants.find((variant) => variant.id === selectedVariantId) ?? null;
  const effectivePrice = selectedVariant
    ? selectedVariant.price
    : product.price;
  const effectiveCompare = selectedVariant
    ? selectedVariant.comparePrice
    : product.comparePrice;
  const effectiveStock = selectedVariant
    ? selectedVariant.stock
    : product.totalStock;
  const inStock = effectiveStock > 0;
  const discount = discountPercent(effectivePrice, effectiveCompare);
  const safeQty = inStock ? Math.min(qty, effectiveStock) : qty;

  const brandSlug =
    PREVIEW_BRANDS.find((brand) => brand.title === product.brandTitle)?.slug ??
    null;

  const currentImage =
    images[Math.min(activeImage, images.length - 1)] ?? images[0];

  const handleAddToCart = () => {
    if (!inStock) return;
    addLine({
      productId: product.id,
      variantId: selectedVariant?.id ?? null,
      slug: product.slug,
      title: product.title,
      variantTitle: selectedVariant?.title ?? null,
      image: images[0]?.url ?? product.image,
      unitPrice: effectivePrice,
      comparePrice: effectiveCompare,
      qty: safeQty,
      maxQty: effectiveStock,
    });
    toast.success("به سبد خرید اضافه شد");
  };

  const handleNotify = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const phone = normalizePhone(notifyPhone);
    if (phone == null) {
      toast.error("شمارهٔ موبایل معتبر نیست");
      return;
    }
    // TODO فاز ۵: اتصال به API اعلان موجودی
    setNotifyDone(true);
  };

  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* ── گالری ── */}
        <div>
          <div className="card-luxe relative aspect-square rounded-2xl border border-border/60 bg-white p-8 md:p-10">
            <Image
              key={currentImage.url}
              src={currentImage.url}
              alt={currentImage.alt ?? product.title}
              fill
              sizes="(max-width:1024px) 100vw, 560px"
              className="animate-in fade-in duration-300 object-contain"
              priority
            />
            {/* بج‌ها — هم‌سبک ProductCard */}
            <div className="absolute top-3 start-3 flex flex-col gap-1.5">
              {discount != null && inStock ? (
                <span className="rounded-full bg-gold px-2.5 py-0.5 text-xs font-bold text-gold-foreground">
                  ٪{toFa(discount)}
                </span>
              ) : null}
              {product.isNew && inStock ? (
                <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground">
                  جدید
                </span>
              ) : null}
              {!inStock ? (
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-secondary-foreground">
                  ناموجود
                </span>
              ) : null}
            </div>
          </div>

          {images.length > 1 ? (
            <div className="mt-4 flex gap-3">
              {images.map((image, index) => (
                <button
                  key={image.url}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`تصویر ${toFa(index + 1)} از ${toFa(images.length)}`}
                  aria-pressed={index === activeImage}
                  className={cn(
                    "relative size-20 shrink-0 rounded-xl border bg-white p-2 transition-colors",
                    index === activeImage
                      ? "border-gold ring-2 ring-gold/30"
                      : "border-border hover:border-gold/40",
                  )}
                >
                  <span className="relative block size-full">
                    <Image
                      src={image.url}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-contain"
                    />
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* ── اطلاعات ── */}
        <div>
          {/* برند / دسته */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {product.brandTitle ? (
              brandSlug ? (
                <Link
                  href={`/products?brand=${brandSlug}`}
                  className="text-muted-foreground transition-colors hover:text-gold"
                >
                  {product.brandTitle}
                </Link>
              ) : (
                <span className="text-muted-foreground">
                  {product.brandTitle}
                </span>
              )
            ) : null}
            {product.brandTitle && product.categoryTitle ? (
              <span className="text-muted-foreground/60">/</span>
            ) : null}
            {product.categoryTitle && product.categorySlug ? (
              <Link
                href={`/products?category=${product.categorySlug}`}
                className="text-muted-foreground transition-colors hover:text-gold"
              >
                {product.categoryTitle}
              </Link>
            ) : null}
          </div>

          <h1 className="mt-2 text-2xl font-black leading-10 text-foreground md:text-3xl">
            {product.title}
          </h1>

          {product.shortDescription ? (
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {product.shortDescription}
            </p>
          ) : null}

          {/* قیمت */}
          <div className="mt-5">
            {effectiveCompare != null ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground line-through">
                  {formatTomanPlain(effectiveCompare)}
                </span>
                {discount != null ? (
                  <span className="rounded-full bg-gold px-2.5 py-0.5 text-xs font-bold text-gold-foreground">
                    ٪{toFa(discount)} تخفیف
                  </span>
                ) : null}
              </div>
            ) : null}
            <p className="mt-1 text-3xl font-black text-primary">
              {formatTomanPlain(effectivePrice)}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                تومان
              </span>
            </p>
          </div>

          {/* مشخصات کلیدی (سه مورد اول) */}
          {product.specs.length > 0 ? (
            <dl className="mt-5 space-y-1.5 border-t border-border/60 pt-4 text-xs">
              {product.specs.slice(0, 3).map((spec) => (
                <div key={spec.key} className="flex items-baseline gap-2">
                  <dt className="shrink-0 text-muted-foreground">
                    {spec.key}:
                  </dt>
                  <dd className="font-medium text-foreground">{spec.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {/* تنوع‌ها */}
          {product.variants.length > 0 ? (
            <div className="mt-5">
              <p className="mb-2.5 text-xs font-medium text-muted-foreground">
                انتخاب گزینه:
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => {
                  const isSelected = variant.id === selectedVariantId;
                  const soldOut = variant.stock === 0;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      disabled={soldOut}
                      title={soldOut ? "ناموجود" : variant.title}
                      aria-pressed={isSelected}
                      onClick={() => {
                        setSelectedVariantId(variant.id);
                        setQty(1);
                      }}
                      className={cn(
                        "h-10 rounded-full border px-4 text-sm transition-all",
                        soldOut &&
                          "cursor-not-allowed line-through opacity-50",
                        isSelected
                          ? "border-gold bg-gold-soft/30 font-semibold text-foreground dark:bg-gold-soft/15"
                          : "border-border text-foreground hover:border-gold/50",
                      )}
                    >
                      {variant.title}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* موجودی */}
          <div className="mt-4 text-sm">
            {inStock ? (
              effectiveStock <= 2 ? (
                <p className="font-medium text-warning">
                  تنها {toFa(effectiveStock)} عدد در انبار باقی مانده
                </p>
              ) : (
                <p className="flex items-center gap-1.5 font-medium text-success">
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                  موجود در انبار
                </p>
              )
            ) : (
              <p className="font-medium text-destructive">
                فعلاً ناموجود است
              </p>
            )}
          </div>

          {/* خرید */}
          <div className="mt-6 flex items-stretch gap-3">
            <div
              className={cn(
                "flex items-center rounded-xl border border-border bg-card",
                !inStock && "pointer-events-none opacity-50",
              )}
              role="group"
              aria-label="تعداد"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-11 text-muted-foreground hover:text-foreground"
                disabled={safeQty <= 1}
                onClick={() => setQty((current) => Math.max(1, current - 1))}
                aria-label="کاهش تعداد"
              >
                <Minus className="size-4" aria-hidden="true" />
              </Button>
              <span className="w-10 text-center font-bold" aria-live="polite">
                {toFa(safeQty)}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-11 text-muted-foreground hover:text-foreground"
                disabled={!inStock || safeQty >= effectiveStock}
                onClick={() => setQty((current) => current + 1)}
                aria-label="افزایش تعداد"
              >
                <Plus className="size-4" aria-hidden="true" />
              </Button>
            </div>

            <Button
              type="button"
              className="btn-metallic h-12 flex-1 rounded-xl text-base font-bold gap-2"
              disabled={!inStock}
              onClick={handleAddToCart}
            >
              <ShoppingBag className="size-5" aria-hidden="true" />
              {inStock ? "افزودن به سبد خرید" : "ناموجود"}
            </Button>
          </div>

          {/* خبرم کن (ناموجود) */}
          {!inStock ? (
            <div className="card-luxe mt-5 p-4">
              <p className="text-sm font-semibold text-foreground">
                این کالا موجود شد، بهم خبر بده
              </p>
              {notifyDone ? (
                <p className="mt-3 flex items-center gap-1.5 text-sm text-success">
                  <Check className="size-4" aria-hidden="true" />
                  ثبت شد؛ به‌محض موجود‌شدن خبرتان می‌کنیم
                </p>
              ) : (
                <form className="mt-3 flex gap-2" onSubmit={handleNotify}>
                  <Input
                    type="tel"
                    dir="ltr"
                    value={notifyPhone}
                    onChange={(event) => setNotifyPhone(event.target.value)}
                    placeholder="۰۹۱۲…"
                    aria-label="شمارهٔ موبایل"
                    className="h-11 flex-1"
                    required
                  />
                  <Button type="submit" className="h-11 rounded-xl px-5">
                    خبرم کن
                  </Button>
                </form>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* ── تب‌ها: توضیحات / مشخصات فنی ── */}
      <div className="mt-10">
        <Tabs defaultValue="description">
          <TabsList className="h-11 rounded-xl p-1">
            <TabsTrigger value="description" className="rounded-lg px-6">
              توضیحات
            </TabsTrigger>
            <TabsTrigger value="specs" className="rounded-lg px-6">
              مشخصات فنی
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-4">
            {product.description ? (
              // TODO فاز ۶: sanitize محتوای HTML با Tiptap (دادهٔ preview مطمئن است)
              <div
                className="card-luxe p-5 md:p-8 [&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-bold [&_li]:leading-7 [&_p]:leading-8 [&_p]:text-muted-foreground [&_ul]:list-disc [&_ul]:ps-6"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            ) : (
              <p className="card-luxe p-6 text-sm text-muted-foreground">
                توضیحاتی برای این محصول ثبت نشده است.
              </p>
            )}
          </TabsContent>

          <TabsContent value="specs" className="mt-4">
            {product.specs.length > 0 ? (
              <div className="card-luxe overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="w-1/3 p-4 text-start">
                        ویژگی
                      </TableHead>
                      <TableHead className="p-4 text-start">مقدار</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.specs.map((spec) => (
                      <TableRow
                        key={spec.key}
                        className="even:bg-muted/40 hover:bg-muted/40"
                      >
                        <TableCell className="p-4 font-medium">
                          {spec.key}
                        </TableCell>
                        <TableCell className="p-4 text-muted-foreground">
                          {spec.value}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="card-luxe p-6 text-sm text-muted-foreground">
                مشخصه‌ای برای این محصول ثبت نشده است.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
