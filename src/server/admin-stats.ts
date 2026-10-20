/**
 * آمار داشبورد ادمین — تابع مشترک سرور
 * ─────────────────────────────
 * هم GET /api/admin/stats و هم صفحهٔ /admin (میزکار) مستقیماً از همین
 * تابع تغذیه می‌شوند (بدون خودفراخوانی HTTP). خروجی کاملاً سریالایز‌پذیر است.
 */

import { db } from "@/lib/db";
import { faDateTick } from "@/lib/jalali";
import type { OrderStatusDTO } from "@/types/shop";

const DAY_MS = 86_400_000;
const CHART_DAYS = 14;
const LOW_STOCK_THRESHOLD = 5;

export interface AdminStatsLowStock {
  title: string;
  slug: string;
  stock: number;
  /** نخستین تصویر محصول (بندانگشتی) */
  image: string | null;
}

export interface AdminStatsRecentOrder {
  id: string;
  orderNumber: string;
  receiverName: string;
  total: number;
  status: OrderStatusDTO;
  /** ISO */
  createdAt: string;
}

export interface AdminStatsChartPoint {
  /** برچسب جلالی «۱۵ آبان» */
  date: string;
  orders: number;
  revenue: number;
}

export interface AdminStats {
  ordersTotal: number;
  ordersPending: number;
  revenue: number;
  usersTotal: number;
  productsTotal: number;
  lowStock: AdminStatsLowStock[];
  chart: AdminStatsChartPoint[];
  recentOrders: AdminStatsRecentOrder[];
}

export async function getAdminStats(): Promise<AdminStats> {
  const now = new Date();
  const chartStart = new Date(now.getTime() - (CHART_DAYS - 1) * DAY_MS);
  chartStart.setHours(0, 0, 0, 0);

  const [
    ordersTotal,
    ordersPending,
    usersTotal,
    productsTotal,
    revenueRows,
    lowStockRows,
    recentOrders,
    chartOrders,
  ] = await Promise.all([
    db.order.count(),
    db.order.count({ where: { status: "PENDING_PAYMENT" } }),
    db.user.count(),
    db.product.count(),
    db.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ["PAID", "DELIVERED"] } },
    }),
    db.product.findMany({
      where: { isActive: true },
      include: {
        variants: { select: { stock: true } },
        images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
      },
      orderBy: { stock: "asc" },
      take: 60,
    }),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        orderNumber: true,
        receiverName: true,
        total: true,
        status: true,
        createdAt: true,
      },
    }),
    db.order.findMany({
      where: { createdAt: { gte: chartStart } },
      select: { total: true, status: true, createdAt: true },
    }),
  ]);

  /* کم‌موجودی‌ها — موجودی کل (تنوع‌دار = مجموع تنوع‌ها) ≤ آستانه */
  const lowStock = lowStockRows
    .map((row) => ({
      title: row.title,
      slug: row.slug,
      stock:
        row.variants.length > 0
          ? row.variants.reduce((total, variant) => total + variant.stock, 0)
          : row.stock,
      image: row.images[0]?.url ?? null,
    }))
    .filter((row) => row.stock <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 8);

  /* چارت ۱۴ روز اخیر — برچسب جلالی «۱۵ آبان» */
  const chart: AdminStatsChartPoint[] = [];
  for (let index = 0; index < CHART_DAYS; index += 1) {
    const dayStart = new Date(chartStart.getTime() + index * DAY_MS);
    const dayEnd = new Date(dayStart.getTime() + DAY_MS);
    const dayOrders = chartOrders.filter(
      (order) => order.createdAt >= dayStart && order.createdAt < dayEnd,
    );
    chart.push({
      date: faDateTick(dayStart),
      orders: dayOrders.length,
      revenue: dayOrders
        .filter((order) => order.status === "PAID" || order.status === "DELIVERED")
        .reduce((total, order) => total + order.total, 0),
    });
  }

  return {
    ordersTotal,
    ordersPending,
    revenue: revenueRows._sum.total ?? 0,
    usersTotal,
    productsTotal,
    lowStock,
    chart,
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      receiverName: order.receiverName,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
    })),
  };
}
