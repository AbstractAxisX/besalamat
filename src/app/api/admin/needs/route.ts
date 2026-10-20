/**
 * GET/POST /api/admin/needs — کارت‌های «خرید بر اساس نیاز» (پنل ادمین)
 * ─────────────────────────────
 * iconKey در DTO از پارامتر category داخل href استخراج می‌شود؛
 * href پیشنهادی: /products?category=<slug دستهٔ اصلی>
 */

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import {
  adminHandler,
  badRequest,
  prismaErrorMessage,
  readJson,
  zodMessage,
} from "@/server/api";
import { needBodySchema } from "@/server/admin-schemas";

export async function GET() {
  return adminHandler(async () => {
    const rows = await db.needCard.findMany({ orderBy: { sortOrder: "asc" } });
    return NextResponse.json({ items: rows });
  });
}

export async function POST(request: NextRequest) {
  return adminHandler(async () => {
    const body = await readJson(request);
    const parsed = needBodySchema.safeParse(body);
    if (!parsed.success) return badRequest(zodMessage(parsed.error));
    const input = parsed.data;

    try {
      const created = await db.needCard.create({
        data: {
          title: input.title,
          description: input.description,
          href: input.href,
          sortOrder: input.sortOrder ?? 0,
          isActive: input.isActive,
        },
        select: { id: true },
      });
      revalidatePath("/", "layout");
      return NextResponse.json({ need: created }, { status: 201 });
    } catch (error) {
      return badRequest(prismaErrorMessage(error, "ساخت کارت نیاز ناموفق بود."));
    }
  });
}
