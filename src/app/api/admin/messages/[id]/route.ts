/**
 * PUT /api/admin/messages/[id] — علامت‌گذاری خوانده‌شده/نخوانده پیام تماس
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
import { messageUpdateSchema } from "@/server/admin-schemas";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return adminHandler(async () => {
    const { id } = await context.params;
    const existing = await db.contactMessage.findUnique({ where: { id }, select: { id: true } });
    if (existing === null) return notFound("پیام پیدا نشد.");

    const body = await readJson(request);
    const parsed = messageUpdateSchema.safeParse(body);
    if (!parsed.success) return badRequest(zodMessage(parsed.error));

    try {
      const updated = await db.contactMessage.update({
        where: { id },
        data: { isRead: parsed.data.isRead },
        select: { id: true, isRead: true },
      });
      return NextResponse.json({ message: updated });
    } catch (error) {
      console.error("[api/admin/messages/[id]] خطای به‌روزرسانی:", error);
      return badRequest("به‌روزرسانی پیام ناموفق بود.");
    }
  });
}
