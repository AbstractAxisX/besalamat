/**
 * GET /api/admin/users — فهرست کاربران (پنل ادمین)
 * ─────────────────────────────
 * ?q= — جست‌وجو در شمارهٔ موبایل / نام / رایانامه.
 */

import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { adminHandler } from "@/server/api";

export async function GET(request: NextRequest) {
  return adminHandler(async () => {
    const q = (request.nextUrl.searchParams.get("q") ?? "").trim();

    const rows = await db.user.findMany({
      where:
        q.length > 0
          ? {
              OR: [{ phone: { contains: q } }, { fullName: { contains: q } }, { email: { contains: q } }],
            }
          : undefined,
      include: { _count: { select: { orders: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({
      items: rows.map((row) => ({
        id: row.id,
        phone: row.phone,
        fullName: row.fullName,
        email: row.email,
        role: row.role,
        isBlocked: row.isBlocked,
        orderCount: row._count.orders,
        lastLoginAt: row.lastLoginAt?.toISOString() ?? null,
        createdAt: row.createdAt.toISOString(),
      })),
    });
  });
}
