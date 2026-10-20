/**
 * GET/POST /api/admin/slides — اسلایدهای هیرو (پنل ادمین)
 * ⚠️ id اسلایدهای seed (slide-1..3) قراردادی است — hero.tsx عبارت مارکرشدهٔ
 * هر اسلاید را با slide.id انتخاب می‌کند؛ تغییرشان مارکر را می‌شکند.
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
import { slideBodySchema } from "@/server/admin-schemas";

export async function GET() {
  return adminHandler(async () => {
    const rows = await db.slide.findMany({ orderBy: { sortOrder: "asc" } });
    return NextResponse.json({ items: rows });
  });
}

export async function POST(request: NextRequest) {
  return adminHandler(async () => {
    const body = await readJson(request);
    const parsed = slideBodySchema.safeParse(body);
    if (!parsed.success) return badRequest(zodMessage(parsed.error));
    const input = parsed.data;

    try {
      const created = await db.slide.create({
        data: {
          title: input.title,
          subtitle: input.subtitle ?? null,
          imageUrl: input.imageUrl,
          mobileImageUrl: input.mobileImageUrl ?? null,
          ctaLabel: input.ctaLabel ?? null,
          ctaHref: input.ctaHref ?? null,
          sortOrder: input.sortOrder ?? 0,
          isActive: input.isActive,
        },
        select: { id: true },
      });
      revalidatePath("/", "layout");
      return NextResponse.json({ slide: created }, { status: 201 });
    } catch (error) {
      return badRequest(prismaErrorMessage(error, "ساخت اسلاید ناموفق بود."));
    }
  });
}
