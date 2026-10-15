"use client";

/**
 * صفحهٔ سبد خرید — کلاینت با الگوی hydration مطابق هدر
 * ─────────────────────────────────────────────────
 * تا پیش از commit، Skeleton نمایش داده می‌شود تا با HTML سرور
 * (store خالی) اختلاف نیفتد؛ پس از mount مقدار واقعی خوانده می‌شود.
 */

import { useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTomanPlain, toFa } from "@/lib/format";
import type { CartLine } from "@/types/shop";
import { cartCount, cartSubtotal, useCartStore } from "@/store/cart";

/* الگوی mounted — همان قرارداد header.tsx (بدون setState در effect) */
const emptySubscribe = () => () => {};

function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

/* ── استپر تعداد ── */
function QtyStepper({ line }: { line: CartLine }) {
  const setQty = useCartStore((state) => state.setQty);
  const atMax = line.qty >= line.maxQty;

  return (
    <div
      className="flex items-center gap-0.5 rounded-full border border-input/70 bg-muted/40 p-0.5"
      role="group"
      aria-label={`تعداد ${line.title}`}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-9 rounded-full text-foreground"
        disabled={line.qty <= 1}
        onClick={() => setQty(line.productId, line.variantId, line.qty - 1)}
        aria-label="کاهش تعداد"
      >
        <Minus className="size-4" aria-hidden="true" />
      </Button>
      <span className="w-8 text-center text-sm font-bold tabular-nums">
        {toFa(line.qty)}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-9 rounded-full text-foreground"
        disabled={atMax}
        onClick={() => setQty(line.productId, line.variantId, line.qty + 1)}
        aria-label="افزایش تعداد"
      >
        <Plus className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}

/* ── یک خط سبد ── */
function CartLineRow({ line }: { line: CartLine }) {
  const removeLine = useCartStore((state) => state.removeLine);
  const lineTotal = line.qty * line.unitPrice;

  return (
    <article className="card-luxe flex items-center gap-3 p-4 sm:gap-4">
      {/* تصویر روی بوم روشن — الگوی کارت محصول */}
      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-white md:size-24">
        <Image
          src={line.image}
          alt={line.title}
          fill
          sizes="96px"
          className="object-contain p-1"
        />
      </div>

      {/* بدنه */}
      <div className="min-w-0 flex-1">
        <Link
          href={`/products/${line.slug}`}
          className="line-clamp-1 font-semibold transition-colors hover:text-gold"
        >
          {line.title}
        </Link>
        {line.variantTitle ? (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {line.variantTitle}
          </p>
        ) : null}
        <p className="mt-1 text-xs text-muted-foreground">
          قیمت واحد: {formatTomanPlain(line.unitPrice)} تومان
        </p>
        <div className="mt-3 flex items-center gap-3">
          <QtyStepper line={line} />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 rounded-full text-muted-foreground hover:text-destructive"
            onClick={() => removeLine(line.productId, line.variantId)}
            aria-label={`حذف ${line.title}`}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* جمع خط — ستون چپ، فقط دسکتاپ */}
      <div className="hidden w-28 shrink-0 text-end sm:block">
        <p className="text-xs text-muted-foreground">جمع</p>
        <p className="mt-1 font-bold text-primary">
          {formatTomanPlain(lineTotal)}{" "}
          <span className="text-[10px] font-normal text-muted-foreground">
            تومان
          </span>
        </p>
      </div>
    </article>
  );
}

/* ── Skeleton لیست هنگام hydration ── */
function CartSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="در حال بارگذاری سبد">
      {[0, 1, 2].map((row) => (
        <div key={row} className="card-luxe flex items-center gap-4 p-4">
          <Skeleton className="size-20 shrink-0 rounded-xl md:size-24" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-3 h-9 w-36 rounded-full" />
          </div>
          <Skeleton className="hidden h-10 w-28 sm:block" />
        </div>
      ))}
    </div>
  );
}

/* ── حالت خالی ── */
function EmptyCart() {
  return (
    <div className="card-luxe mx-auto flex max-w-md flex-col items-center px-6 py-16 text-center">
      <ShoppingBag
        className="mx-auto size-12 text-muted-foreground/40"
        aria-hidden="true"
      />
      <p className="mt-4 text-lg font-bold">سبد خرید شما خالی است</p>
      <p className="mt-1 text-sm text-muted-foreground">
        هنوز چیزی انتخاب نکرده‌اید
      </p>
      <Button
        asChild
        className="btn-metallic mt-8 h-12 rounded-xl px-8 text-base font-bold"
      >
        <Link href="/products">رفتن به فروشگاه</Link>
      </Button>
    </div>
  );
}

export default function CartPage() {
  const mounted = useMounted();
  const lines = useCartStore((state) => state.lines);
  const clear = useCartStore((state) => state.clear);

  const hydratedLines = mounted ? lines : [];
  const count = cartCount(hydratedLines);
  const subtotal = cartSubtotal(hydratedLines);
  const savings = hydratedLines.reduce(
    (total, line) =>
      line.comparePrice != null && line.comparePrice > line.unitPrice
        ? total + (line.comparePrice - line.unitPrice) * line.qty
        : total,
    0,
  );
  const isEmpty = mounted && hydratedLines.length === 0;

  return (
    <div className="shell py-8 md:py-12">
      {/* هدر صفحه */}
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="text-2xl font-black">سبد خرید</h1>
        <p className="text-sm text-muted-foreground">
          {mounted && !isEmpty ? `${toFa(count)} قلم کالا` : "—"}
        </p>
      </header>

      {/* هنوز هیدریشن نشده → Skeleton */}
      {!mounted ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_24rem]">
          <CartSkeleton />
          <div className="card-luxe space-y-4 p-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-3 w-48" />
            <Skeleton className="mt-4 h-12 w-full rounded-xl" />
          </div>
        </div>
      ) : isEmpty ? (
        <div className="mt-10">
          <EmptyCart />
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          {/* لیست خطوط */}
          <section
            className="min-w-0 flex-1 space-y-4"
            aria-label="اقلام سبد خرید"
          >
            {hydratedLines.map((line) => (
              <CartLineRow
                key={`${line.productId}::${line.variantId ?? "base"}`}
                line={line}
              />
            ))}
          </section>

          {/* جمع‌بندی — کنار در lg، زیر در موبایل */}
          <aside className="shrink-0 lg:w-96">
            <div className="card-luxe sticky top-24 p-6">
              <h2 className="font-bold">جمع سفارش</h2>

              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">تعداد اقلام</dt>
                  <dd className="font-medium">{toFa(count)} قلم</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">جمع کل</dt>
                  <dd className="font-semibold">
                    {formatTomanPlain(subtotal)}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      تومان
                    </span>
                  </dd>
                </div>
                {savings > 0 ? (
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">سود شما از تخفیف</dt>
                    <dd className="font-semibold text-success">
                      {formatTomanPlain(savings)}{" "}
                      <span className="text-xs font-normal">تومان</span>
                    </dd>
                  </div>
                ) : null}
              </dl>

              <Separator className="my-4" />

              <p className="text-xs leading-6 text-muted-foreground">
                هزینهٔ ارسال در مرحلهٔ بعد محاسبه می‌شود
              </p>

              <Button
                asChild
                className="btn-metallic mt-4 h-12 w-full rounded-xl text-base font-bold"
              >
                <Link href="/checkout">ادامهٔ ثبت سفارش</Link>
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="mt-2 h-9 w-full text-destructive hover:text-destructive"
                  >
                    خالی کردن سبد
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>خالی کردن سبد خرید</AlertDialogTitle>
                    <AlertDialogDescription>
                      همهٔ اقلام سبد حذف می‌شوند و این کار قابل بازگشت نیست.
                      مطمئن هستید؟
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>انصراف</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-white hover:bg-destructive/90"
                      onClick={() => clear()}
                    >
                      بله، خالی کن
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
