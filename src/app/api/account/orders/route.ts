/**
 * GET /api/account/orders — سفارش‌های واقعی کاربر سشن‌دار
 * ─────────────────────────────
 * خروجی هم‌شکل PreviewOrder (lib/preview-orders) است تا تب «سفارش‌های من»
 * بدون تغییر رندر شود؛ ۴۰۱ فارسی بدون سشن.
 */

import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getSessionUser } from "@/server/session";
import type { OrderStatusDTO } from "@/types/shop";

/** شکل نمایشی سفارش — قرارداد مشترک با صفحهٔ جزئیات سفارش */
export interface AccountOrderDTO {
  orderNumber: string;
  status: OrderStatusDTO;
  /** ISO */
  createdAt: string;
  total: number;
  shippingCost: number;
  items: {
    title: string;
    variantTitle: string | null;
    qty: number;
    unitPrice: number;
    image: string;
  }[];
  timeline: {
    status: OrderStatusDTO;
    note: string | null;
    /** ISO */
    createdAt: string;
  }[];
  receiverName: string;
  receiverPhone: string;
  province: string;
  city: string;
  addressLine: string;
  postalCode: string | null;
  postalTrackingCode: string | null;
}

export async function GET() {
  const user = await getSessionUser();
  if (user === null) {
    return NextResponse.json(
      { message: "برای مشاهدهٔ سفارش‌ها ابتدا وارد حساب خود شوید." },
      { status: 401 },
    );
  }

  try {
    const orders = await db.order.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        statusLogs: { orderBy: { createdAt: "asc" } },
      },
    });

    const payload: AccountOrderDTO[] = orders.map((order) => ({
      orderNumber: order.orderNumber,
      status: order.status as OrderStatusDTO,
      createdAt: order.createdAt.toISOString(),
      total: order.total,
      shippingCost: order.shippingCost,
      items: order.items.map((item) => ({
        title: item.titleSnapshot,
        variantTitle: item.variantSnapshot,
        qty: item.quantity,
        unitPrice: item.unitPrice,
        image: item.imageSnapshot ?? "/placeholders/og-default.svg",
      })),
      timeline: order.statusLogs.map((log) => ({
        status: log.toStatus as OrderStatusDTO,
        note: log.note,
        createdAt: log.createdAt.toISOString(),
      })),
      receiverName: order.receiverName,
      receiverPhone: order.receiverPhone,
      province: order.province,
      city: order.city,
      addressLine: order.addressLine,
      postalCode: order.postalCode,
      postalTrackingCode: order.postalTrackingCode,
    }));

    return NextResponse.json({ orders: payload });
  } catch (error) {
    console.error("[api/account/orders] خطای DB:", error);
    return NextResponse.json(
      { message: "خواندن سفارش‌ها ناموفق بود؛ لطفاً دوباره تلاش کنید." },
      { status: 500 },
    );
  }
}
