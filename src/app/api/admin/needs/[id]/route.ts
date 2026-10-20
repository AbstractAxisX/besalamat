/**
 * PUT/DELETE /api/admin/needs/[id] — مدیریت یک کارت نیاز
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
import { needBodySchema } from "@/server/admin-schemas";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return adminHandler(async () => {
    const { id } = await context.params;
    const existing = await db.needCard.findUnique({ where: { id }, select: { id: true } });
    if (existing === null) return notFound("کارت نیاز پیدا نشد.");

    const body = await readJson(request);
    const parsed = needBodySchema.safeParse(body);
    if (!parsed.success) return badRequest(zodMessage(parsed.error));
    const input = parsed.data;

    try {
      const updated = await db.needCard.update({
        where: { id },
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
      return NextResponse.json({ need: updated });
    } catch (error) {
      return badRequest(prismaErrorMessage(error, "ویرایش کارت نیاز ناموفق بود."));
    }
  });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  return adminHandler(async () => {
    const { id } = await context.params;
    const existing = await db.needCard.findUnique({ where: { id }, select: { id: true } });
    if (existing === null) return notFound("کارت نیاز پیدا نشد.");

    try {
      await db.needCard.delete({ where: { id } });
      revalidatePath("/", "layout");
      return NextResponse.json({ ok: true });
    } catch (error) {
      return badRequest(prismaErrorMessage(error, "حذف کارت نیاز ناموفق بود."));
    }
  });
}
