/**
 * PUT/DELETE /api/admin/slides/[id] — مدیریت یک اسلاید
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
import { slideBodySchema } from "@/server/admin-schemas";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return adminHandler(async () => {
    const { id } = await context.params;
    const existing = await db.slide.findUnique({ where: { id }, select: { id: true } });
    if (existing === null) return notFound("اسلاید پیدا نشد.");

    const body = await readJson(request);
    const parsed = slideBodySchema.safeParse(body);
    if (!parsed.success) return badRequest(zodMessage(parsed.error));
    const input = parsed.data;

    try {
      const updated = await db.slide.update({
        where: { id },
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
      return NextResponse.json({ slide: updated });
    } catch (error) {
      return badRequest(prismaErrorMessage(error, "ویرایش اسلاید ناموفق بود."));
    }
  });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  return adminHandler(async () => {
    const { id } = await context.params;
    const existing = await db.slide.findUnique({ where: { id }, select: { id: true } });
    if (existing === null) return notFound("اسلاید پیدا نشد.");

    try {
      await db.slide.delete({ where: { id } });
      revalidatePath("/", "layout");
      return NextResponse.json({ ok: true });
    } catch (error) {
      return badRequest(prismaErrorMessage(error, "حذف اسلاید ناموفق بود."));
    }
  });
}
