/**
 * GET/PUT /api/admin/orders/[id] — مدیریت یک سفارش (پنل ادمین)
 * ─────────────────────────────
 * PUT: تغییر وضعیت / کد رهگیری / یادداشت؛ تغییر وضعیت یک ردیف
 * OrderStatusLog (actor: admin) نیز می‌نویسد و paidAt/canceledAt را هم‌گام می‌کند.
 */

import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import {
  adminHandler,
  badRequest,
  notFound,
  readJson,
  zodMessage,
} from "@/server/api";
import { orderUpdateSchema } from "@/server/admin-schemas";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  return adminHandler(async () => {
    const { id } = await context.params;
    const row = await db.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, phone: true, fullName: true, email: true } },
        items: { orderBy: { id: "asc" } },
        statusLogs: { orderBy: { createdAt: "asc" } },
      },
    });
    if (row === null) return notFound("سفارش پیدا نشد.");
    return NextResponse.json({ order: row });
  });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return adminHandler(async (admin) => {
    const { id } = await context.params;
    const existing = await db.order.findUnique({ where: { id }, select: { id: true, status: true } });
    if (existing === null) return notFound("سفارش پیدا نشد.");

    const body = await readJson(request);
    const parsed = orderUpdateSchema.safeParse(body);
    if (!parsed.success) return badRequest(zodMessage(parsed.error));
    const input = parsed.data;

    if (input.status === undefined && input.postalTrackingCode === undefined && input.note === undefined) {
      return badRequest("چیزی برای به‌روزرسانی ارسال نشده است.");
    }

    const statusChanged = input.status !== undefined && input.status !== existing.status;

    try {
      const updated = await db.$transaction(async (tx) => {
        const order = await tx.order.update({
          where: { id },
          data: {
            ...(input.status !== undefined ? { status: input.status } : {}),
            ...(input.postalTrackingCode !== undefined
              ? { postalTrackingCode: input.postalTrackingCode?.length ? input.postalTrackingCode : null }
              : {}),
            ...(input.note !== undefined ? { note: input.note?.length ? input.note : null } : {}),
            /* هم‌گام‌سازی زمان‌های معنی‌دار */
            ...(statusChanged && input.status === "PAID" ? { paidAt: new Date() } : {}),
            ...(statusChanged && input.status === "CANCELED" ? { canceledAt: new Date() } : {}),
          },
          select: { id: true, orderNumber: true, status: true },
        });

        if (statusChanged) {
          await tx.orderStatusLog.create({
            data: {
              orderId: id,
              fromStatus: existing.status,
              toStatus: input.status!,
              note: input.note?.length ? input.note : "به‌روزرسانی وضعیت از پنل مدیریت.",
              actor: `admin:${admin.phone}`,
            },
          });
        }

        return order;
      });

      return NextResponse.json({ order: updated });
    } catch (error) {
      console.error("[api/admin/orders/[id]] خطای به‌روزرسانی:", error);
      return badRequest("به‌روزرسانی سفارش ناموفق بود.");
    }
  });
}
