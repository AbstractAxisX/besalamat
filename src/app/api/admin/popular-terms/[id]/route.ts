/**
 * PUT/DELETE /api/admin/popular-terms/[id] — مدیریت یک واژهٔ پرجستجو
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
import { popularTermBodySchema } from "@/server/admin-schemas";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return adminHandler(async () => {
    const { id } = await context.params;
    const existing = await db.popularSearchTerm.findUnique({ where: { id }, select: { id: true } });
    if (existing === null) return notFound("واژه پیدا نشد.");

    const body = await readJson(request);
    const parsed = popularTermBodySchema.safeParse(body);
    if (!parsed.success) return badRequest(zodMessage(parsed.error));
    const input = parsed.data;

    try {
      const updated = await db.popularSearchTerm.update({
        where: { id },
        data: {
          term: input.term,
          weight: input.weight ?? 0,
          isActive: input.isActive,
        },
        select: { id: true },
      });
      revalidatePath("/", "layout");
      return NextResponse.json({ term: updated });
    } catch (error) {
      return badRequest(prismaErrorMessage(error, "ویرایش واژه ناموفق بود؛ شاید تکراری است."));
    }
  });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  return adminHandler(async () => {
    const { id } = await context.params;
    const existing = await db.popularSearchTerm.findUnique({ where: { id }, select: { id: true } });
    if (existing === null) return notFound("واژه پیدا نشد.");

    try {
      await db.popularSearchTerm.delete({ where: { id } });
      revalidatePath("/", "layout");
      return NextResponse.json({ ok: true });
    } catch (error) {
      return badRequest(prismaErrorMessage(error, "حذف واژه ناموفق بود."));
    }
  });
}
