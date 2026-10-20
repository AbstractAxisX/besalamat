"use client";

/**
 * جزئیات سفارش در پنل — اقلام + جمع‌بندی + وضعیت (تایم‌لاین و تغییر) + خریدار + نشانی
 * ─────────────────────────────
 * GET /api/admin/orders/[id] → {order} (با items و statusLogs و user)؛
 * PUT همان مسیر برای تغییر وضعیت / کد رهگیری پستی.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  IconArrowRight,
  IconDeviceFloppy,
  IconMapPin,
  IconNote,
  IconPackage,
  IconTruck,
  IconUser,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { formatPhoneFa, toFa, formatTomanPlain } from "@/lib/format";
import { faDateShort, faDateTime } from "@/lib/jalali";
import { apiFetch, apiSend } from "@/components/admin/api";
import { ADMIN_ORDER_STATUSES, StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminOrderDetail } from "@/types/admin";
import { ORDER_STATUS_LABELS, type OrderStatusDTO } from "@/types/shop";

/* برچسب بازیگر لاگ — admin:0912… / system */
function actorLabel(actor: string | null): string {
  if (actor === null || actor.length === 0) return "—";
  if (actor === "system") return "سیستم";
  if (actor.startsWith("admin:")) return `مدیر (${toFa(actor.slice(6))})`;
  return toFa(actor);
}

/** کارت ستون کناری */
function SideCard({
  icon,
  title,
  action,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <header className="flex items-center justify-between gap-2 border-b bg-muted/50 px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-black">
          <span className="text-muted-foreground" aria-hidden="true">
            {icon}
          </span>
          {title}
        </h2>
        {action}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

function InfoRow({ label, value, ltr }: { label: string; value: React.ReactNode; ltr?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span
        dir={ltr ? "ltr" : undefined}
        className={cn("text-end font-bold", ltr && "text-start")}
      >
        {value}
      </span>
    </div>
  );
}

interface OrderDetailViewProps {
  orderId: string;
}

export function OrderDetailView({ orderId }: OrderDetailViewProps) {
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* فرم تغییر وضعیت */
  const [nextStatus, setNextStatus] = useState<OrderStatusDTO>("PENDING_PAYMENT");
  const [statusNote, setStatusNote] = useState("");
  const [statusBusy, setStatusBusy] = useState(false);

  /* کد رهگیری پستی */
  const [tracking, setTracking] = useState("");
  const [trackingBusy, setTrackingBusy] = useState(false);

  const load = useCallback(() => {
    let active = true;
    apiFetch<{ order: AdminOrderDetail }>(`/api/admin/orders/${orderId}`)
      .then((response) => {
        if (!active) return;
        setOrder(response.order);
        setNextStatus(response.order.status);
        setTracking(response.order.postalTrackingCode ?? "");
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "بارگذاری سفارش ناموفق بود");
      });
    return () => {
      active = false;
    };
  }, [orderId]);

  useEffect(() => load(), [load]);

  /* تغییر وضعیت + یادداشت */
  const submitStatus = useCallback(async (): Promise<void> => {
    if (order === null) return;
    if (nextStatus === order.status && statusNote.trim().length === 0) {
      toast.info("وضعیتی برای ذخیره انتخاب نشده است");
      return;
    }
    setStatusBusy(true);
    try {
      await apiSend(`/api/admin/orders/${orderId}`, "PUT", {
        status: nextStatus,
        ...(statusNote.trim().length > 0 ? { note: statusNote.trim() } : {}),
      });
      toast.success(`وضعیت سفارش به «${ORDER_STATUS_LABELS[nextStatus]}» تغییر کرد`);
      setStatusNote("");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تغییر وضعیت ناموفق بود");
    } finally {
      setStatusBusy(false);
    }
  }, [order, nextStatus, statusNote, orderId, load]);

  /* ذخیرهٔ کد رهگیری */
  const submitTracking = useCallback(async (): Promise<void> => {
    setTrackingBusy(true);
    try {
      await apiSend(`/api/admin/orders/${orderId}`, "PUT", {
        postalTrackingCode: tracking.trim(),
      });
      toast.success("کد رهگیری پستی ذخیره شد");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ذخیرهٔ کد رهگیری ناموفق بود");
    } finally {
      setTrackingBusy(false);
    }
  }, [tracking, orderId, load]);

  /* آخرین لاگ = وضعیت جاری */
  const currentLogIndex = useMemo(
    () => (order === null ? -1 : order.statusLogs.length - 1),
    [order],
  );

  if (error !== null) {
    return (
      <div className="space-y-4">
        <Button type="button" variant="ghost" size="sm" asChild className="gap-1.5">
          <Link href="/admin/orders">
            <IconArrowRight className="size-4" stroke={1.75} aria-hidden="true" />
            بازگشت به سفارش‌ها
          </Link>
        </Button>
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </p>
      </div>
    );
  }

  if (order === null) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="h-72 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* سربرگ */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="icon" asChild aria-label="بازگشت به فهرست">
            <Link href="/admin/orders">
              <IconArrowRight className="size-5" stroke={1.75} aria-hidden="true" />
            </Link>
          </Button>
          <div>
            <h1 className="flex flex-wrap items-center gap-2 text-xl font-black md:text-2xl">
              سفارش <span dir="ltr">{toFa(order.orderNumber)}</span>
              <StatusBadge status={order.status} />
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              ثبت در {faDateTime(order.createdAt)}
              {order.paidAt !== null ? ` — پرداخت در ${faDateTime(order.paidAt)}` : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* ── ستون راست: اقلام + جمع‌بندی ── */}
        <div className="space-y-6 lg:col-span-2">
          <section className="overflow-hidden rounded-xl border bg-card">
            <header className="border-b bg-muted/50 px-4 py-3">
              <h2 className="flex items-center gap-2 text-sm font-black">
                <IconPackage className="size-4.5 text-muted-foreground" stroke={1.75} aria-hidden="true" />
                اقلام سفارش ({toFa(order.items.length)} قلم)
              </h2>
            </header>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-muted-foreground">
                    <th className="px-4 py-2.5 text-start font-medium">کالا</th>
                    <th className="px-4 py-2.5 text-start font-medium">قیمت واحد</th>
                    <th className="px-4 py-2.5 text-start font-medium">تعداد</th>
                    <th className="px-4 py-2.5 text-start font-medium">جمع</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {item.imageSnapshot ? (
                            <img
                              src={item.imageSnapshot}
                              alt={item.titleSnapshot}
                              className="size-12 shrink-0 rounded-lg border object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <span
                              className="flex size-12 shrink-0 items-center justify-center rounded-lg border bg-muted text-muted-foreground"
                              aria-hidden="true"
                            >
                              <IconPackage className="size-5" stroke={1.75} />
                            </span>
                          )}
                          <div className="min-w-0">
                            <p className="max-w-52 truncate font-bold" title={item.titleSnapshot}>
                              {item.titleSnapshot}
                            </p>
                            {item.variantSnapshot ? (
                              <p className="text-xs text-muted-foreground">
                                تنوع: {item.variantSnapshot}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {formatTomanPlain(item.unitPrice)}
                      </td>
                      <td className="px-4 py-3 font-black tabular-nums">
                        {toFa(item.quantity)}
                      </td>
                      <td className="px-4 py-3 font-black tabular-nums">
                        {formatTomanPlain(item.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* جمع‌بندی */}
          <section className="rounded-xl border bg-card p-4 md:p-6">
            <h2 className="text-sm font-black">جمع‌بندی مبلغ</h2>
            <div className="mt-3 space-y-1">
              <InfoRow
                label="جمع اقلام"
                value={`${formatTomanPlain(order.subtotal)} تومان`}
              />
              {order.discountTotal > 0 ? (
                <InfoRow
                  label="تخفیف"
                  value={`−${formatTomanPlain(order.discountTotal)} تومان`}
                />
              ) : null}
              <InfoRow
                label="هزینهٔ ارسال"
                value={
                  order.shippingCost === 0
                    ? "رایگان"
                    : `${formatTomanPlain(order.shippingCost)} تومان`
                }
              />
              <Separator className="my-2" />
              <div className="flex items-center justify-between">
                <span className="font-bold">مبلغ نهایی</span>
                <span className="text-lg font-black tabular-nums text-primary">
                  {formatTomanPlain(order.total)} تومان
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* ── ستون چپ: وضعیت + خریدار + نشانی ── */}
        <div className="space-y-6">
          {/* وضعیت + تایم‌لاین */}
          <SideCard
            icon={<IconTruck className="size-4.5" stroke={1.75} aria-hidden="true" />}
            title="وضعیت سفارش"
          >
            {/* فرم تغییر وضعیت */}
            <div className="space-y-3 rounded-lg border bg-muted/40 p-3">
              <div className="space-y-1.5">
                <Label htmlFor="order-status" className="text-xs font-bold">
                  تغییر وضعیت به
                </Label>
                <Select value={nextStatus} onValueChange={(value) => setNextStatus(value as OrderStatusDTO)}>
                  <SelectTrigger id="order-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMIN_ORDER_STATUSES.map((item) => (
                      <SelectItem key={item} value={item}>
                        {ORDER_STATUS_LABELS[item]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="order-status-note" className="text-xs font-bold">
                  یادداشت تغییر (اختیاری)
                </Label>
                <Input
                  id="order-status-note"
                  placeholder="مثلاً بسته به پست سپرده شد"
                  value={statusNote}
                  onChange={(event) => setStatusNote(event.target.value)}
                />
              </div>
              <Button
                type="button"
                size="sm"
                className="w-full gap-1.5 font-bold"
                disabled={statusBusy}
                onClick={() => void submitStatus()}
              >
                {statusBusy ? (
                  <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <IconDeviceFloppy className="size-4" stroke={1.75} aria-hidden="true" />
                )}
                ثبت وضعیت
              </Button>
            </div>

            {/* کد رهگیری پستی */}
            <div className="mt-4 space-y-1.5">
              <Label htmlFor="order-tracking" className="text-xs font-bold">
                کد رهگیری پستی
              </Label>
              <div className="flex gap-2">
                <Input
                  id="order-tracking"
                  dir="ltr"
                  placeholder="مثلاً ۲۴۵۶۷۸۹۰۱۲۳۴"
                  className="text-start"
                  value={tracking}
                  onChange={(event) => setTracking(event.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={trackingBusy}
                  onClick={() => void submitTracking()}
                  aria-label="ذخیرهٔ کد رهگیری"
                  title="ذخیرهٔ کد رهگیری"
                >
                  {trackingBusy ? (
                    <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <IconDeviceFloppy className="size-4" stroke={1.75} aria-hidden="true" />
                  )}
                </Button>
              </div>
            </div>

            <Separator className="my-4" />

            {/* تایم‌لاین لاگ وضعیت‌ها */}
            <h3 className="mb-3 text-xs font-bold text-muted-foreground">روند وضعیت</h3>
            {order.statusLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">لاگی ثبت نشده است.</p>
            ) : (
              <ol aria-label="روند وضعیت سفارش">
                {order.statusLogs.map((log, index) => {
                  const isCurrent = index === currentLogIndex;
                  const isLast = index === order.statusLogs.length - 1;
                  return (
                    <li key={log.id} className="flex gap-3">
                      <div className="flex flex-col items-center" aria-hidden="true">
                        <span
                          className={cn(
                            "mt-1.5 size-3 shrink-0 rounded-full",
                            isCurrent ? "bg-primary ring-4 ring-primary/15" : "bg-primary/40",
                          )}
                        />
                        {isLast ? null : <span className="w-px flex-1 bg-primary/20" />}
                      </div>
                      <div className={cn("min-w-0 flex-1", !isLast && "pb-5")}>
                        <p className={cn("text-sm", isCurrent ? "font-black text-primary" : "font-bold")}>
                          {ORDER_STATUS_LABELS[log.toStatus]}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {faDateTime(log.createdAt)} — {actorLabel(log.actor)}
                        </p>
                        {log.note ? (
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">{log.note}</p>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </SideCard>

          {/* خریدار */}
          <SideCard icon={<IconUser className="size-4.5" stroke={1.75} aria-hidden="true" />} title="خریدار">
            <InfoRow label="نام" value={order.user.fullName ?? order.receiverName} />
            <InfoRow label="موبایل حساب" value={formatPhoneFa(order.user.phone)} ltr />
            <InfoRow label="موبایل گیرنده" value={formatPhoneFa(order.receiverPhone)} ltr />
            {order.user.email ? <InfoRow label="رایانامه" value={order.user.email} ltr /> : null}
            <InfoRow label="عضویت از" value={faDateShort(order.createdAt)} />
          </SideCard>

          {/* نشانی */}
          <SideCard icon={<IconMapPin className="size-4.5" stroke={1.75} aria-hidden="true" />} title="نشانی تحویل">
            <InfoRow
              label="روش ارسال"
              value={order.shippingMethod === "POST" ? "پست (ارسال به نشانی)" : "تحویل حضوری"}
            />
            <InfoRow label="استان" value={toFa(order.province)} />
            <InfoRow label="شهر" value={toFa(order.city)} />
            <InfoRow label="نشانی" value={order.addressLine} />
            {order.postalCode ? <InfoRow label="کد پستی" value={toFa(order.postalCode)} ltr /> : null}
            {order.note ? (
              <>
                <Separator className="my-2" />
                <p className="flex items-start gap-1.5 text-xs leading-6 text-muted-foreground">
                  <IconNote className="mt-1 size-4 shrink-0" stroke={1.75} aria-hidden="true" />
                  یادداشت مشتری: {order.note}
                </p>
              </>
            ) : null}
          </SideCard>
        </div>
      </div>
    </div>
  );
}
