/**
 * GET /api/admin/messages — پیام‌های تماس (پنل ادمین)
 * ?unread=1 — فقط خوانده‌نشده‌ها؛ ترتیب: تازه‌ترین اول.
 */

import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { adminHandler } from "@/server/api";

export async function GET(request: NextRequest) {
  return adminHandler(async () => {
    const unreadOnly = request.nextUrl.searchParams.get("unread") === "1";

    const rows = await db.contactMessage.findMany({
      where: unreadOnly ? { isRead: false } : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({
      items: rows.map((row) => ({
        ...row,
        createdAt: row.createdAt.toISOString(),
      })),
    });
  });
}
