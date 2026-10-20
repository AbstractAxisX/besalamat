/**
 * GET /api/admin/orders — فهرست سفارش‌ها (پنل ادمین)
 * ─────────────────────────────
 * ?status=PENDING_PAYMENT|PAID|… — فیلتر وضعیت؛ خروجی: شمار اقلام + جمع + خریدار.
 */

import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { adminHandler } from "@/server/api";
import type { OrderStatus } from "@prisma/client";

const VALID_STATUSES: ReadonlySet<string> = new Set([
  "PENDING_PAYMENT",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELED",
  "RETURNED",
]);

export async function GET(request: NextRequest) {
  return adminHandler(async () => {
    const statusParam = request.nextUrl.searchParams.get("status") ?? "";
    const status = VALID_STATUSES.has(statusParam) ? (statusParam as OrderStatus) : undefined;

    const rows = await db.order.findMany({
      where: status !== undefined ? { status } : undefined,
      include: {
        user: { select: { phone: true, fullName: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({
      items: rows.map((row) => ({
        id: row.id,
        orderNumber: row.orderNumber,
        status: row.status,
        shippingMethod: row.shippingMethod,
        shippingCost: row.shippingCost,
        subtotal: row.subtotal,
        total: row.total,
        receiverName: row.receiverName,
        receiverPhone: row.receiverPhone,
        province: row.province,
        city: row.city,
        itemsCount: row._count.items,
        userPhone: row.user.phone,
        userFullName: row.user.fullName,
        paidAt: row.paidAt?.toISOString() ?? null,
        createdAt: row.createdAt.toISOString(),
      })),
    });
  });
}
