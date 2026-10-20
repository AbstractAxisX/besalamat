/**
 * PUT /api/admin/users/[id] — ویرایش کاربر (مسدودی / نام / نقش)
 * ─────────────────────────────
 * «مسدودکردن خودتان» ممنوع است؛ با مسدودی یا تغییر نقش، همهٔ سشن‌های
 * کاربر باطل می‌شوند (اگر خودتان نباشد).
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
import { revokeAllUserSessions } from "@/server/session";
import { userUpdateSchema } from "@/server/admin-schemas";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return adminHandler(async (admin) => {
    const { id } = await context.params;
    const existing = await db.user.findUnique({ where: { id }, select: { id: true, phone: true, role: true } });
    if (existing === null) return notFound("کاربر پیدا نشد.");

    const body = await readJson(request);
    const parsed = userUpdateSchema.safeParse(body);
    if (!parsed.success) return badRequest(zodMessage(parsed.error));
    const input = parsed.data;

    /* حفاظت از خودِ مدیر */
    if (input.isBlocked === true && id === admin.userId) {
      return badRequest("نمی‌توانید حساب کاربری خودتان را مسدود کنید.");
    }
    if (input.role !== undefined && id === admin.userId && input.role !== "ADMIN") {
      return badRequest("نمی‌توانید نقش مدیرِ خودتان را بردارید.");
    }

    try {
      const updated = await db.user.update({
        where: { id },
        data: {
          ...(input.isBlocked !== undefined ? { isBlocked: input.isBlocked } : {}),
          ...(input.fullName !== undefined ? { fullName: input.fullName?.length ? input.fullName : null } : {}),
          ...(input.role !== undefined ? { role: input.role } : {}),
        },
        select: { id: true, phone: true, fullName: true, role: true, isBlocked: true },
      });

      /* مسدودی یا تغییر نقش → ابطال سشن‌ها (به‌جز خودِ مدیرِ جاری) */
      const securityChange =
        (input.isBlocked === true) ||
        (input.role !== undefined && input.role !== existing.role);
      if (securityChange && id !== admin.userId) {
        await revokeAllUserSessions(id);
      }

      return NextResponse.json({ user: updated });
    } catch (error) {
      console.error("[api/admin/users/[id]] خطای به‌روزرسانی:", error);
      return badRequest("به‌روزرسانی کاربر ناموفق بود.");
    }
  });
}
