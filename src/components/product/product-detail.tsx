"use client";

/**
 * جزئیات محصول — گالری زوم، باکس خرید طلایی، آکاردئون و نوار خرید موبایل
 * ─────────────────────────────
 * قیمت/موجودی مؤثر از تنوعِ انتخاب‌شده می‌آید (محصول ساده = فیلدهای خودش).
 * زوم دسکتاپ: با دنبال‌کردن نشانگر، transform-origin تصویر به‌روز می‌شود.
 * نوار خرید چسبان موبایل: بالای ناوبری پایین (bottom-16) — فقط موبایل.
 */

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  Check,
  CheckCircle2,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Truck,
  ZoomIn,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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
  BrandSummary,
  ProductDetail as ProductDetailDTO,
  ProductImageDTO,
  ProductSummary,
  ProductVariantDTO,
} from "@/types/shop";

interface ProductDetailProps {
  product: ProductDetailDTO;
  /** محصولات مرتبط — این کامپوننت رندر نمی‌کند؛ صفحهٔ محصول رندر می‌کند */
  related?: ProductSummary[];
  /** برندها — از سرویس DB-first؛ پیش‌فرض = دادهٔ پیش‌نمایش (fallback) */
  brands?: BrandSummary[];
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

/* ── ردیف اعتماد زیر باکس خرید ── */
const TRUST_ROW = [
  { icon: ShieldCheck, label: "اصالت کالا" },
  { icon: Truck, label: "ارسال سریع" },
  { icon: RotateCcw, label: "۷ روز بازگشت" },
] as const;

export function ProductDetail({ product, brands }: ProductDetailProps) {
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
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const [isZoomed, setIsZoomed] = useState(false);

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
  const savings =
    effectiveCompare != null && effectiveCompare > effectivePrice
      ? effectiveCompare - effectivePrice
      : null;
  const safeQty = inStock ? Math.min(qty, effectiveStock) : qty;

  const brandList = brands ?? PREVIEW_BRANDS;
  const brandSlug =
    brandList.find((brand) => brand.title === product.brandTitle)?.slug ??
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

  /** دنبال‌کردن نشانگر برای زوم */
  const handleZoomMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
  };

  return (
    <div className="pb-20 md:pb-0">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12">
        {/* ════════ گالری ════════ */}
        <div>
          <div className="flex flex-col-reverse gap-4 md:flex-row">
            {/* تصاویر بندانگشتی — عمودی در دسکتاپ */}
            {images.length > 1 ? (
              <div className="flex gap-3 overflow-x-auto scrollbar-none md:flex-col md:overflow-visible">
                {images.map((image, index) => (
                  <button
                    key={image.url}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-label={`تصویر ${toFa(index + 1)} از ${toFa(images.length)}`}
                    aria-pressed={index === activeImage}
                    className={cn(
                      "img-canvas relative size-20 shrink-0 overflow-hidden rounded-xl border transition-all duration-300",
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
                        className="object-cover"
                      />
                    </span>
                  </button>
                ))}
              </div>
            ) : null}

            {/* تصویر اصلی — با زومِ دنبال‌کننده */}
            <div
              className="img-canvas group relative aspect-square flex-1 cursor-zoom-in overflow-hidden rounded-2xl border border-border/60"
              onMouseMove={handleZoomMove}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
            >
              <Image
                key={currentImage.url}
                src={currentImage.url}
                alt={currentImage.alt ?? product.title}
                fill
                sizes="(max-width:1024px) 100vw, 560px"
                priority
                style={{ transformOrigin: zoomOrigin }}
                className={cn(
                  "animate-in fade-in duration-300 object-cover transition-transform duration-200",
                  isZoomed && "scale-[1.7]",
                )}
              />

              {/* بج‌ها */}
              <div className="absolute top-4 start-4 flex flex-col items-start gap-1.5">
                {discount != null && inStock ? (
                  <span className="rounded-full bg-gold px-3 py-1 text-xs font-black text-gold-foreground">
                    ٪{toFa(discount)} تخفیف
                  </span>
                ) : null}
                {product.isNew && inStock ? (
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                    جدید
                  </span>
                ) : null}
                {!inStock ? (
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
                    ناموجود
                  </span>
                ) : null}
              </div>

              {/* راهنمای زوم — دسکتاپ */}
              <span className="pointer-events-none absolute end-4 top-4 hidden items-center gap-1.5 rounded-full bg-background/80 px-3 py-1.5 text-[10px] font-medium text-muted-foreground opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100 md:flex">
                <ZoomIn className="size-3.5" aria-hidden="true" />
                برای بزرگ‌نمایی نشانگر را حرکت دهید
              </span>
            </div>
          </div>
        </div>

        {/* ════════ اطلاعات ════════ */}
        <div className="flex flex-col">
          {/* برند */}
          {product.brandTitle ? (
            <p className="text-xs font-bold text-gold-strong dark:text-gold">
              {brandSlug ? (
                <Link
                  href={`/products?brand=${brandSlug}`}
                  className="transition-colors hover:text-gold"
                >
                  {product.brandTitle}
                </Link>
              ) : (
                product.brandTitle
              )}
            </p>
          ) : null}

          <h1 className="mt-2 text-2xl font-black leading-10 text-foreground md:text-[1.75rem] md:leading-[2.75rem]">
            {product.title}
          </h1>

          {product.shortDescription ? (
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {product.shortDescription}
            </p>
          ) : null}

          <Separator className="my-5 !bg-border/60" />

          {/* قیمت */}
          <div>
            {effectiveCompare != null ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground line-through">
                  {formatTomanPlain(effectiveCompare)}
                </span>
                {discount != null ? (
                  <span className="rounded-full bg-gold px-2.5 py-0.5 text-[11px] font-black text-gold-foreground">
                    ٪{toFa(discount)}
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
            {savings != null ? (
              <p className="mt-1.5 text-xs font-medium text-success">
                سود شما از این خرید: {formatTomanPlain(savings)} تومان
              </p>
            ) : null}
          </div>

          {/* تنوع‌ها */}
          {product.variants.length > 0 ? (
            <div className="mt-6">
              <p className="mb-2.5 text-xs font-bold text-muted-foreground">
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
                        "h-11 rounded-full border px-5 text-sm font-medium transition-all duration-200",
                        soldOut &&
                          "cursor-not-allowed line-through opacity-50",
                        isSelected
                          ? "border-gold bg-gold-soft/30 font-bold text-foreground dark:bg-gold-soft/15"
                          : "border-border text-foreground hover:border-gold/50",
                      )}
                    >
                      {variant.title}
                      {!soldOut && variant.price !== effectivePrice ? (
                        <span className="ms-2 text-[11px] text-muted-foreground">
                          {formatTomanPlain(variant.price)}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* موجودی */}
          <div className="mt-5 flex items-center gap-2 text-sm">
            {inStock ? (
              effectiveStock <= 2 ? (
                <p className="flex items-center gap-2 font-medium text-warning">
                  <span className="size-2 animate-pulse rounded-full bg-warning" aria-hidden="true" />
                  تنها {toFa(effectiveStock)} عدد در انبار باقی مانده
                </p>
              ) : (
                <p className="flex items-center gap-2 font-medium text-success">
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                  موجود در انبار
                </p>
              )
            ) : (
              <p className="font-medium text-destructive">
                فعلاً ناموجود است
              </p>
            )}
            {inStock ? (
              <span className="ms-auto flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Truck className="size-3.5" aria-hidden="true" />
                ارسال از فردا
              </span>
            ) : null}
          </div>

          {/* باکس خرید */}
          <div className="mt-6 rounded-2xl border border-gold/30 bg-gold-soft/15 p-4 dark:bg-gold-soft/[0.07] md:p-5">
            {/* موبایل: دکمهٔ تمام‌عرض بالا + استپر کامل پایین (بدون سرریز افقی) — دسکتاپ: یک ردیف */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-stretch">
              <div
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border border-border bg-card sm:w-fit sm:justify-start",
                  !inStock && "pointer-events-none opacity-50",
                )}
                role="group"
                aria-label="تعداد"
              >
                <span
                  className="ps-4 text-xs font-bold text-muted-foreground sm:hidden"
                  aria-hidden="true"
                >
                  تعداد
                </span>
                <div className="flex items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-11 text-muted-foreground hover:text-foreground sm:size-12"
                    disabled={safeQty <= 1}
                    onClick={() => setQty((current) => Math.max(1, current - 1))}
                    aria-label="کاهش تعداد"
                  >
                    <Minus className="size-4" aria-hidden="true" />
                  </Button>
                  <span
                    className="w-10 text-center text-base font-black tabular-nums"
                    aria-live="polite"
                  >
                    {toFa(safeQty)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-11 text-muted-foreground hover:text-foreground sm:size-12"
                    disabled={!inStock || safeQty >= effectiveStock}
                    onClick={() => setQty((current) => current + 1)}
                    aria-label="افزایش تعداد"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>

              <Button
                type="button"
                className="h-13 w-full rounded-xl text-base font-black gap-2 sm:h-14 sm:w-auto sm:flex-1"
                disabled={!inStock}
                onClick={handleAddToCart}
              >
                <ShoppingBag className="size-5" aria-hidden="true" />
                {inStock ? "افزودن به سبد خرید" : "ناموجود"}
              </Button>
            </div>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              پرداخت امن · اصالت کالا تضمین‌شده · امکان بازگشت تا ۷ روز
            </p>
          </div>

          {/* ردیف اعتماد */}
          <div className="mt-5 grid grid-cols-3 divide-x divide-x-reverse divide-border/60 border-y border-border/60 py-4">
            {TRUST_ROW.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 text-[11px] font-medium text-muted-foreground"
              >
                <Icon className="size-5 text-gold-strong dark:text-gold" aria-hidden="true" />
                {label}
              </div>
            ))}
          </div>

          {/* خبرم کن (ناموجود) */}
          {!inStock ? (
            <div className="card-luxe mt-5 p-4">
              <p className="text-sm font-bold text-foreground">
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

          {/* آکاردئون — مشخصات کلیدی و ارسال */}
          <Accordion type="single" collapsible className="mt-5">
            {product.specs.length > 0 ? (
              <AccordionItem value="key-specs" className="border-border/60">
                <AccordionTrigger className="py-3.5 text-start text-sm font-bold hover:no-underline">
                  مشخصات کلیدی
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <dl className="space-y-2">
                    {product.specs.slice(0, 4).map((spec) => (
                      <div
                        key={spec.key}
                        className="flex items-baseline justify-between gap-4 text-xs"
                      >
                        <dt className="shrink-0 text-muted-foreground">
                          {spec.key}
                        </dt>
                        <dd className="font-medium text-foreground">
                          {spec.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </AccordionContent>
              </AccordionItem>
            ) : null}
            <AccordionItem value="shipping" className="border-border/60">
              <AccordionTrigger className="py-3.5 text-start text-sm font-bold hover:no-underline">
                ارسال و بازگشت کالا
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-xs leading-6 text-muted-foreground">
                سفارش‌های ثبت‌شده تا ساعت ۱۳، همان روز در تهران ارسال می‌شوند.
                ارسال به سایر شهرها ۲ تا ۴ روز کاری زمان می‌برد. در صورت
                مغایرت یا ایراد فنی، کالا تا ۷ روز قابل بازگشت است.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* ════════ توضیحات و مشخصات کامل ════════ */}
      <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12">
        {product.description ? (
          <section aria-label="توضیحات محصول">
            <h2 className="text-lg font-black text-foreground">
              توضیحات محصول
            </h2>
            <span className="gold-hairline mt-3 block w-16" aria-hidden="true" />
            {/* TODO فاز ۶: sanitize محتوای HTML با Tiptap (دادهٔ preview مطمئن است) */}
            <div
              className="mt-5 text-sm leading-8 text-muted-foreground [&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-foreground [&_li]:leading-7 [&_ul]:list-disc [&_ul]:ps-6"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </section>
        ) : null}

        {product.specs.length > 0 ? (
          <section aria-label="مشخصات فنی">
            <h2 className="text-lg font-black text-foreground">مشخصات فنی</h2>
            <span className="gold-hairline mt-3 block w-16" aria-hidden="true" />
            <dl className="card-luxe mt-5 divide-y divide-border/60 overflow-hidden">
              {product.specs.map((spec, index) => (
                <div
                  key={spec.key}
                  className={cn(
                    "grid grid-cols-[140px_1fr] gap-4 px-5 py-3.5 text-[13px]",
                    index % 2 === 1 && "bg-muted/40",
                  )}
                >
                  <dt className="font-medium text-foreground">{spec.key}</dt>
                  <dd className="text-muted-foreground">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
      </div>

      {/* ════════ نوار خرید چسبان — موبایل ════════ */}
      <div className="fixed inset-x-0 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-40 border-t border-border/70 bg-background/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-3">
          <span className="img-canvas relative size-12 shrink-0 overflow-hidden rounded-lg border border-border/60">
            <Image
              src={currentImage.url}
              alt=""
              fill
              sizes="48px"
              className="object-cover"
            />
          </span>
          <div className="min-w-0 flex-1">
            {effectiveCompare != null ? (
              <p className="text-[10px] text-muted-foreground line-through">
                {formatTomanPlain(effectiveCompare)}
              </p>
            ) : null}
            <p className="text-sm font-black text-primary">
              {formatTomanPlain(effectivePrice)}{" "}
              <span className="text-[10px] font-normal text-muted-foreground">
                تومان
              </span>
            </p>
          </div>
          <Button
            type="button"
            className="h-11 shrink-0 rounded-xl px-6 text-sm font-bold"
            disabled={!inStock}
            onClick={handleAddToCart}
          >
            <ShoppingBag className="size-4" aria-hidden="true" />
            {inStock ? "افزودن به سبد" : "ناموجود"}
          </Button>
        </div>
      </div>
    </div>
  );
}
