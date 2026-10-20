/**
 * PUT/DELETE /api/admin/brands/[id] — مدیریت یک برند
 * ─────────────────────────────
 * حذف برند مجاز است؛ محصولاتِ مرتبط طبق schema با SetNull بدون برند می‌شوند.
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
import { brandBodySchema } from "@/server/admin-schemas";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return adminHandler(async () => {
    const { id } = await context.params;
    const existing = await db.brand.findUnique({ where: { id }, select: { id: true } });
    if (existing === null) return notFound("برند پیدا نشد.");

    const body = await readJson(request);
    const parsed = brandBodySchema.safeParse(body);
    if (!parsed.success) return badRequest(zodMessage(parsed.error));
    const input = parsed.data;

    try {
      const updated = await db.brand.update({
        where: { id },
        data: {
          title: input.title,
          slug: input.slug,
          logoUrl: input.logoUrl ?? null,
          sortOrder: input.sortOrder ?? 0,
          isActive: input.isActive,
        },
        select: { id: true, slug: true },
      });
      revalidatePath("/", "layout");
      return NextResponse.json({ brand: updated });
    } catch (error) {
      return badRequest(prismaErrorMessage(error, "ویرایش برند ناموفق بود."));
    }
  });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  return adminHandler(async () => {
    const { id } = await context.params;
    const existing = await db.brand.findUnique({ where: { id }, select: { id: true } });
    if (existing === null) return notFound("برند پیدا نشد.");

    try {
      await db.brand.delete({ where: { id } });
      revalidatePath("/", "layout");
      return NextResponse.json({ ok: true });
    } catch (error) {
      return badRequest(prismaErrorMessage(error, "حذف برند ناموفق بود."));
    }
  });
}
