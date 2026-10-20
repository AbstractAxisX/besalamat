/**
 * میزکار پنل ادمین — آمار فروش + نمودار ۱۴ روز + سفارش‌های اخیر + کم‌موجودی‌ها
 * ─────────────────────────────
 * سروری است و مستقیم از getAdminStats (همان منطق /api/admin/stats) تغذیه می‌شود.
 * سفارش‌های اخیر با کامپوننت کلاینت RecentOrdersTable (TanStack) رندر می‌شود.
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
import { getAdminStats } from "@/server/admin-stats";
import { DashboardChart } from "@/components/admin/dashboard-chart";
import { PageHeader } from "@/components/admin/page-header";
import { RecentOrdersTable } from "@/components/admin/recent-orders-table";
import { StatCard } from "@/components/admin/stat-card";
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
                className="inline-flex items-center gap-1 rounded-full border border-warning/20 bg-warning/10 px-2 py-0.5 font-semibold text-warning transition-colors hover:bg-warning/20"
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
            <Link href="/admin/products" className="font-semibold text-primary hover:underline">
              مدیریت محصولات
            </Link>
          }
        />
      </section>

      {/* ── نمودار ۱۴ روز اخیر ── */}
      <section
        aria-label="نمودار ۱۴ روز اخیر"
        className="rounded-2xl border border-border/60 bg-card p-5 shadow-xs"
      >
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold">نمای ۱۴ روز اخیر</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">روند سفارش‌ها و درآمد روزانه</p>
          </div>
          {/* راهنمای سری‌ها */}
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
              درآمد (هزار تومان)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-fresh" aria-hidden="true" />
              شمار سفارش‌ها
            </span>
          </div>
        </header>
        <DashboardChart data={stats.chart} />
      </section>

      {/* ── سفارش‌های اخیر + کم‌موجودی‌ها ── */}
      <section className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* سفارش‌های اخیر — ستون راست (۲ ستون) */}
        <div className="space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between gap-2 px-1">
            <h2 className="text-sm font-bold">سفارش‌های اخیر</h2>
            <Button type="button" variant="ghost" size="sm" asChild className="text-primary">
              <Link href="/admin/orders">همهٔ سفارش‌ها</Link>
            </Button>
          </div>
          <RecentOrdersTable orders={stats.recentOrders} />
        </div>

        {/* کم‌موجودی‌ها — ستون چپ (۱ ستون) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <IconAlertTriangle className="size-4 text-warning" stroke={1.75} aria-hidden="true" />
            <h2 className="text-sm font-bold">کم‌موجودی‌ها</h2>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card shadow-xs">
            {stats.lowStock.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                موجودی همهٔ محصولات فعال مناسب است.
              </p>
            ) : (
              <ul className="divide-y divide-border/50">
                {stats.lowStock.map((product) => (
                  <li key={product.slug} className="flex items-center gap-3 px-4 py-3">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.title}
                        className="size-10 shrink-0 rounded-xl border border-border/60 object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span
                        className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted text-muted-foreground"
                        aria-hidden="true"
                      >
                        <IconPackage className="size-5" stroke={1.75} />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold" title={product.title}>
                        {product.title}
                      </p>
                      <p
                        className={`text-[11px] font-semibold tabular-nums ${
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
        </div>
      </section>
    </div>
  );
}
