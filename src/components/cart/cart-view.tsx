"use client";

/**
 * نمای سبد خرید — لیست ظریف + جمع‌بندی چسبان
 * ─────────────────────────────────────────────────
 * تا پیش از commit کلاینت، Skeleton نمایش داده می‌شود تا با HTML سرور
 * (store خالی) اختلاف نیفتد؛ پس از mount مقدار واقعی خوانده می‌شود.
 * نوار جمع‌بندی چسبان موبایل، بالای ناوبری پایین می‌نشیند.
 */

import { useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  LockKeyhole,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";

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
      className="flex items-center gap-0.5 rounded-full border border-input/70 bg-card p-0.5"
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
    <article className="flex items-start gap-4 p-4 md:p-5">
      <Link
        href={`/products/${line.slug}`}
        className="img-canvas relative size-24 shrink-0 overflow-hidden rounded-xl border border-border/50"
      >
        <Image
          src={line.image}
          alt={line.title}
          fill
          sizes="96px"
          className="object-contain p-1.5"
        />
      </Link>

      {/* بدنه */}
      <div className="min-w-0 flex-1">
        <Link
          href={`/products/${line.slug}`}
          className="line-clamp-1 text-sm font-bold transition-colors hover:text-primary"
        >
          {line.title}
        </Link>
        {line.variantTitle ? (
          <span className="mt-1.5 inline-block rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground">
            {line.variantTitle}
          </span>
        ) : null}
        <div className="mt-3 flex items-center gap-2">
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

      {/* جمع خط — ستون چپ */}
      <div className="hidden w-28 shrink-0 flex-col items-end justify-between self-stretch sm:flex">
        <p className="text-[11px] text-muted-foreground">
          {formatTomanPlain(line.unitPrice)} تومان / عدد
        </p>
        <p className="text-base font-black text-primary">
          {formatTomanPlain(lineTotal)}
          <span className="ms-1 text-[10px] font-normal text-muted-foreground">
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
          <Skeleton className="size-24 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/4" />
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
      <span className="flex size-20 items-center justify-center rounded-full bg-accent text-primary">
        <ShoppingBag className="size-9" aria-hidden="true" />
      </span>
      <p className="mt-5 text-lg font-black">سبد خرید شما خالی است</p>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">
        از پرفروش‌های این هفته شروع کنید یا دستهٔ موردنیازتان را ببینید
      </p>
      <Button asChild className="mt-8 h-12 rounded-full px-8 text-sm font-bold">
        <Link href="/products">رفتن به فروشگاه</Link>
      </Button>
    </div>
  );
}

export function CartView() {
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
    <div className="pb-24 md:pb-12">
      {/* هدر صفحه */}
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h1 className="text-2xl font-black md:text-3xl">سبد خرید</h1>
        <p className="text-sm text-muted-foreground">
          {mounted && !isEmpty ? `${toFa(count)} قلم کالا` : "—"}
        </p>
        <Link
          href="/products"
          className="ms-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-gold-strong"
        >
          <ArrowRight className="size-4" aria-hidden="true" />
          ادامهٔ خرید
        </Link>
      </header>

      {!mounted ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
          <CartSkeleton />
          <div className="card-luxe space-y-4 p-6">
            <Skeleton className="h-5 w-24" />
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
        <div className="mt-6 grid gap-6 md:mt-8 lg:grid-cols-[1fr_22rem] lg:gap-8">
          {/* ستون اصلی */}
          <section
            className="min-w-0 space-y-4"
            aria-label="اقلام سبد خرید"
          >
            <div className="card-luxe divide-y divide-border/60 overflow-hidden">
              {hydratedLines.map((line) => (
                <CartLineRow
                  key={`${line.productId}::${line.variantId ?? "base"}`}
                  line={line}
                />
              ))}
            </div>

            <div className="flex items-center justify-between">
              <Link
                href="/products"
                className="text-sm font-medium text-primary transition-colors hover:text-gold-strong"
              >
                افزودن کالای بیشتر
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-9 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
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
          </section>

          {/* جمع‌بندی — کنار در lg */}
          <aside className="shrink-0">
            <div className="card-luxe p-6 lg:sticky lg:top-[184px]">
              <h2 className="font-black">جمع سفارش</h2>

              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">تعداد اقلام</dt>
                  <dd className="font-medium">{toFa(count)} قلم</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">جمع کالاها</dt>
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

              <p className="flex items-center gap-1.5 text-[11px] leading-5 text-muted-foreground">
                <Truck className="size-3.5 shrink-0" aria-hidden="true" />
                هزینهٔ ارسال در مرحلهٔ بعد و بر اساس روش ارسال محاسبه می‌شود
              </p>

              <Button
                asChild
                className="mt-4 h-13 w-full rounded-xl text-base font-black"
              >
                <Link href="/checkout">ادامهٔ ثبت سفارش</Link>
              </Button>

              <div className="mt-4 flex items-center justify-center gap-5 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="size-3.5" aria-hidden="true" />
                  اصالت کالا
                </span>
                <span className="flex items-center gap-1">
                  <LockKeyhole className="size-3.5" aria-hidden="true" />
                  پرداخت امن
                </span>
                <span className="flex items-center gap-1">
                  <RotateCcw className="size-3.5" aria-hidden="true" />
                  بازگشت ۷ روزه
                </span>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* نوار جمع‌بندی چسبان — موبایل */}
      {mounted && !isEmpty ? (
        <div className="fixed inset-x-0 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-40 border-t border-border/70 bg-background/95 px-4 py-3 backdrop-blur md:hidden">
          <div className="flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-muted-foreground">
                جمع {toFa(count)} قلم کالا
              </p>
              <p className="text-base font-black text-primary">
                {formatTomanPlain(subtotal)}{" "}
                <span className="text-[10px] font-normal text-muted-foreground">
                  تومان
                </span>
              </p>
            </div>
            <Button
              asChild
              className="h-12 shrink-0 rounded-xl px-8 text-sm font-black"
            >
              <Link href="/checkout">ثبت سفارش</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
