/**
 * GET/PUT /api/admin/home/sections — بخش‌های صفحهٔ خانه (پنل ادمین)
 * ─────────────────────────────
 * PUT: آرایهٔ کامل {key,title,subtitle,sortOrder,isActive} —
 * کلیدهای ارسالی upsert می‌شوند و کلیدهای غایب حذف (جایگزینی کامل).
 */

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import {
  adminHandler,
  badRequest,
  readJson,
  zodMessage,
} from "@/server/api";
import { homeSectionsPutSchema } from "@/server/admin-schemas";

export async function GET() {
  return adminHandler(async () => {
    const rows = await db.homePageSection.findMany({ orderBy: { sortOrder: "asc" } });
    return NextResponse.json({ items: rows });
  });
}

export async function PUT(request: NextRequest) {
  return adminHandler(async () => {
    const body = await readJson(request);
    const parsed = homeSectionsPutSchema.safeParse(body);
    if (!parsed.success) return badRequest(zodMessage(parsed.error));
    const sections = parsed.data;

    try {
      await db.$transaction(async (tx) => {
        for (const section of sections) {
          await tx.homePageSection.upsert({
            where: { key: section.key },
            create: {
              key: section.key,
              title: section.title ?? null,
              subtitle: section.subtitle ?? null,
              sortOrder: section.sortOrder ?? 0,
              isActive: section.isActive,
            },
            update: {
              title: section.title ?? null,
              subtitle: section.subtitle ?? null,
              sortOrder: section.sortOrder ?? 0,
              isActive: section.isActive,
            },
          });
        }
        /* کلیدهای غایب از آرایهٔ ارسالی حذف می‌شوند (جایگزینی کامل) */
        const keys = sections.map((section) => section.key);
        await tx.homePageSection.deleteMany({
          where: { key: { notIn: keys } },
        });
      });

      revalidatePath("/", "layout");
      return NextResponse.json({ ok: true, count: sections.length });
    } catch (error) {
      console.error("[api/admin/home/sections] خطای به‌روزرسانی:", error);
      return badRequest("به‌روزرسانی بخش‌های خانه ناموفق بود.");
    }
  });
}
