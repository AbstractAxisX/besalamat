/**
 * میزکار پنل ادمین — آمار فروش + نمودار ۱۴ روز + سفارش‌های اخیر + کم‌موجودی‌ها
 * ─────────────────────────────
 * سروری است و مستقیم از getAdminStats (همان منطق /api/admin/stats) تغذیه می‌شود.
 */

import Link from "next/link";
import {
  IconAlertTriangle,
  IconChartLine,
  IconExternalLink,
  IconPackage,
  IconShoppingBag,
  IconUsers,
} from "@tabler/icons-react";

import { toFa, formatTomanPlain } from "@/lib/format";
import { faDateShort } from "@/lib/jalali";
import { getAdminStats } from "@/server/admin-stats";
import { DashboardChart } from "@/components/admin/dashboard-chart";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = { title: "میزکار" };

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-6">
      <PageHeader
        title="میزکار"
        description="نمای کلی فروشگاه در یک نگاه"
        actions={
          <Button type="button" variant="outline" size="sm" asChild className="gap-1.5">
            <Link href="/" target="_blank" rel="noreferrer">
              مشاهدهٔ فروشگاه
              <IconExternalLink className="size-4" stroke={1.75} aria-hidden="true" />
            </Link>
          </Button>
        }
      />

      {/* ── کارت‌های آمار ── */}
      <section aria-label="آمار کلی" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="سفارش‌ها"
          value={toFa(stats.ordersTotal)}
          icon={<IconShoppingBag className="size-5" stroke={1.75} aria-hidden="true" />}
          hint={
            stats.ordersPending > 0 ? (
              <Link
                href="/admin/orders?status=PENDING_PAYMENT"
                className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 font-bold text-warning hover:bg-warning/20"
              >
                {toFa(stats.ordersPending)} در انتظار پرداخت
              </Link>
            ) : (
              "بدون سفارش معلق"
            )
          }
        />
        <StatCard
          title="درآمد"
          value={formatTomanPlain(stats.revenue)}
          suffix="تومان"
          icon={<IconChartLine className="size-5" stroke={1.75} aria-hidden="true" />}
          hint="مجموع سفارش‌های پرداخت‌شده و تحویل‌شده"
        />
        <StatCard
          title="کاربران"
          value={toFa(stats.usersTotal)}
          icon={<IconUsers className="size-5" stroke={1.75} aria-hidden="true" />}
          hint="ثبت‌نام‌شده در فروشگاه"
        />
        <StatCard
          title="محصولات"
          value={toFa(stats.productsTotal)}
          icon={<IconPackage className="size-5" stroke={1.75} aria-hidden="true" />}
          hint={
            <Link href="/admin/products" className="font-bold text-primary hover:underline">
              مدیریت محصولات
            </Link>
          }
        />
      </section>

      {/* ── نمودار ۱۴ روز اخیر ── */}
      <section aria-label="نمودار ۱۴ روز اخیر" className="rounded-xl border bg-card p-4 md:p-6">
        <h2 className="text-base font-black">نمای ۱۴ روز اخیر</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">روند سفارش‌ها و درآمد روزانه</p>
        <DashboardChart data={stats.chart} />
      </section>

      {/* ── سفارش‌های اخیر + کم‌موجودی‌ها ── */}
      <section className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* سفارش‌های اخیر — ستون راست (۲ ستون) */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="flex items-center justify-between gap-2 border-b bg-muted/50 px-4 py-3">
              <h2 className="text-sm font-black">سفارش‌های اخیر</h2>
              <Button type="button" variant="ghost" size="sm" asChild className="text-primary">
                <Link href="/admin/orders">همهٔ سفارش‌ها</Link>
              </Button>
            </div>
            {stats.recentOrders.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                هنوز سفارشی ثبت نشده است.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-start text-xs text-muted-foreground">
                      <th className="px-4 py-2.5 text-start font-medium">شمارهٔ سفارش</th>
                      <th className="px-4 py-2.5 text-start font-medium">گیرنده</th>
                      <th className="px-4 py-2.5 text-start font-medium">مبلغ</th>
                      <th className="px-4 py-2.5 text-start font-medium">وضعیت</th>
                      <th className="px-4 py-2.5 text-start font-medium">تاریخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-t transition-colors hover:bg-muted/40"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-black text-primary hover:underline"
                          >
                            {toFa(order.orderNumber)}
                          </Link>
                        </td>
                        <td className="max-w-32 truncate px-4 py-3">{order.receiverName}</td>
                        <td className="px-4 py-3 font-black tabular-nums">
                          {formatTomanPlain(order.total)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                          {faDateShort(order.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* کم‌موجودی‌ها — ستون چپ (۱ ستون) */}
        <div className="rounded-xl border bg-card">
          <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-3">
            <IconAlertTriangle className="size-4 text-warning" stroke={1.75} aria-hidden="true" />
            <h2 className="text-sm font-black">کم‌موجودی‌ها</h2>
          </div>
          {stats.lowStock.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              موجودی همهٔ محصولات فعال مناسب است.
            </p>
          ) : (
            <ul className="divide-y">
              {stats.lowStock.map((product) => (
                <li key={product.slug} className="flex items-center gap-3 px-4 py-3">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="size-10 shrink-0 rounded-lg border object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span
                      className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted text-muted-foreground"
                      aria-hidden="true"
                    >
                      <IconPackage className="size-5" stroke={1.75} />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold" title={product.title}>
                      {product.title}
                    </p>
                    <p
                      className={`text-xs font-bold tabular-nums ${
                        product.stock === 0 ? "text-destructive" : "text-warning"
                      }`}
                    >
                      {product.stock === 0 ? "ناموجود" : `${toFa(product.stock)} عدد باقی مانده`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
