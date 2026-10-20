/**
 * PUT/DELETE /api/admin/banners/[id] — مدیریت یک کاشی تبلیغاتی
 * (قرارداد ذخیرهٔ عنوان/زیرعنوان در فایل banners/route.ts توضیح داده شده است)
 */

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import {
  adminHandler,
  badRequest,
  notFound,
  prismaErrorMessage,
  readJson,
  zodMessage,
} from "@/server/api";
import { bannerBodySchema } from "@/server/admin-schemas";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return adminHandler(async () => {
    const { id } = await context.params;
    const existing = await db.banner.findUnique({ where: { id }, select: { id: true } });
    if (existing === null) return notFound("بنر پیدا نشد.");

    const body = await readJson(request);
    const parsed = bannerBodySchema.safeParse(body);
    if (!parsed.success) return badRequest(zodMessage(parsed.error));
    const input = parsed.data;

    try {
      const updated = await db.banner.update({
        where: { id },
        data: {
          title:
            input.subtitle != null && input.subtitle.length > 0
              ? `${input.title}\n${input.subtitle}`
              : input.title,
          imageUrl: input.imageUrl,
          href: input.href,
          slot: input.slot,
          isActive: input.isActive,
        },
        select: { id: true },
      });
      revalidatePath("/", "layout");
      return NextResponse.json({ banner: updated });
    } catch (error) {
      return badRequest(prismaErrorMessage(error, "ویرایش بنر ناموفق بود."));
    }
  });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  return adminHandler(async () => {
    const { id } = await context.params;
    const existing = await db.banner.findUnique({ where: { id }, select: { id: true } });
    if (existing === null) return notFound("بنر پیدا نشد.");

    try {
      await db.banner.delete({ where: { id } });
      revalidatePath("/", "layout");
      return NextResponse.json({ ok: true });
    } catch (error) {
      return badRequest(prismaErrorMessage(error, "حذف بنر ناموفق بود."));
    }
  });
}
