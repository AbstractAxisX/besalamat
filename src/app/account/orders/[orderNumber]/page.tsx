/**
 * جزئیات سفارش (نمایشی فاز ۱) — Server Component
 * ─────────────────────────────────────────────────
 * شمارهٔ سفارش از PREVIEW_ORDERS خوانده می‌شود؛
 * فاز ۴: خواندن واقعی از DB با گارد مالکیت سفارش.
 */

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Package, Truck } from "lucide-react";

import { OrderTimeline } from "@/components/account/order-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPhoneFa, formatToman, formatTomanPlain, toFa } from "@/lib/format";
import { faDateTime } from "@/lib/jalali";
import { PREVIEW_ORDERS } from "@/lib/preview-orders";
import { cn } from "@/lib/utils";
import {
  ORDER_STATUS_LABELS,
  type OrderStatusDTO,
} from "@/types/shop";

interface OrderPageProps {
  params: Promise<{ orderNumber: string }>;
}

/** رنگ بج وضعیت سفارش — قرارداد مشترک با صفحهٔ حساب */
const STATUS_BADGE_CLASS: Record<OrderStatusDTO, string> = {
  PENDING_PAYMENT: "bg-warning/10 text-warning",
  PAID: "bg-success/10 text-success",
  PROCESSING: "bg-success/10 text-success",
  SHIPPED: "bg-gold-soft/40 text-gold-strong dark:bg-gold-soft/15 dark:text-gold",
  DELIVERED: "bg-primary/10 text-primary",
  CANCELED: "bg-destructive/10 text-destructive",
  RETURNED: "bg-destructive/10 text-destructive",
};

export async function generateMetadata({
  params,
}: OrderPageProps): Promise<Metadata> {
  const { orderNumber } = await params;
  return {
    title: `سفارش ${orderNumber}`,
    robots: { index: false, follow: false },
  };
}

export default async function OrderDetailPage({ params }: OrderPageProps) {
  const { orderNumber } = await params;
  const order = PREVIEW_ORDERS.find((row) => row.orderNumber === orderNumber);
  if (order === undefined) notFound();

  const itemsSum = order.items.reduce(
    (total, item) => total + item.unitPrice * item.qty,
    0,
  );

  return (
    <div className="shell max-w-4xl py-8 md:py-12">
      {/* هدر */}
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h1 className="text-2xl font-black">سفارش {toFa(order.orderNumber)}</h1>
        <Badge
          className={cn("border-transparent", STATUS_BADGE_CLASS[order.status])}
        >
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {faDateTime(order.createdAt)}
        </span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
          نمایشی
        </span>
      </header>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-3">
        {/* ستون اصلی */}
        <div className="space-y-8 lg:col-span-2">
          {/* اقلام */}
          <section className="card-luxe p-6" aria-label="اقلام سفارش">
            <h2 className="flex items-center gap-2 font-bold">
              <Package className="size-4 text-gold" aria-hidden="true" />
              اقلام سفارش
            </h2>
            <ul className="mt-5 space-y-5">
              {order.items.map((item, index) => (
                <li
                  key={`${item.title}-${index}`}
                  className="flex items-center gap-4"
                >
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-white md:size-20">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="80px"
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-semibold">
                      {item.title}
                    </p>
                    {item.variantTitle ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.variantTitle}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatTomanPlain(item.unitPrice)} تومان × {toFa(item.qty)}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-primary">
                    {formatTomanPlain(item.unitPrice * item.qty)}{" "}
                    <span className="text-[10px] font-normal text-muted-foreground">
                      تومان
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {/* روند سفارش */}
          <section className="card-luxe p-6" aria-label="روند سفارش">
            <h2 className="font-bold">روند سفارش</h2>
            <div className="mt-5">
              <OrderTimeline items={order.timeline} current={order.status} />
            </div>

            {order.postalTrackingCode !== null ? (
              <>
                <Separator className="my-5" />
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <Truck className="size-4 text-gold" aria-hidden="true" />
                  <span className="text-muted-foreground">کد رهگیری مرسوله:</span>
                  <span
                    dir="ltr"
                    className="font-bold tracking-wide text-foreground"
                  >
                    {order.postalTrackingCode}
                  </span>
                </div>
              </>
            ) : null}
          </section>
        </div>

        {/* ستون کنار */}
        <div className="space-y-8">
          {/* اطلاعات تحویل */}
          <section className="card-luxe p-6" aria-label="اطلاعات تحویل">
            <h2 className="font-bold">اطلاعات تحویل</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">گیرنده</dt>
                <dd className="mt-0.5 font-medium">{order.receiverName}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">موبایل</dt>
                <dd dir="ltr" className="mt-0.5 text-right font-medium">
                  {formatPhoneFa(order.receiverPhone)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">نشانی</dt>
                <dd className="mt-0.5 leading-6">
                  {order.province}، {order.city}، {order.addressLine}
                </dd>
              </div>
              {order.postalCode !== null ? (
                <div>
                  <dt className="text-xs text-muted-foreground">کد پستی</dt>
                  <dd className="mt-0.5">{toFa(order.postalCode)}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          {/* پرداخت */}
          <section className="card-luxe p-6" aria-label="جزئیات پرداخت">
            <h2 className="font-bold">پرداخت</h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">جمع اقلام</dt>
                <dd className="font-medium">{formatToman(itemsSum)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">هزینهٔ ارسال</dt>
                <dd className="font-medium">
                  {formatToman(order.shippingCost)}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-border/70 pt-3">
                <dt className="font-bold">مبلغ کل</dt>
                <dd className="font-black text-primary">
                  {formatToman(order.total)}
                </dd>
              </div>
            </dl>
          </section>

          <Button
            asChild
            variant="ghost"
            className="h-11 w-full rounded-xl text-muted-foreground"
          >
            <Link href="/account">
              <ArrowRight className="size-4" aria-hidden="true" />
              بازگشت به سفارش‌ها
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
