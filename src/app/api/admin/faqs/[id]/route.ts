/**
 * PUT/DELETE /api/admin/faqs/[id] — مدیریت یک پرسش متداول
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
import { faqBodySchema } from "@/server/admin-schemas";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return adminHandler(async () => {
    const { id } = await context.params;
    const existing = await db.faq.findUnique({ where: { id }, select: { id: true } });
    if (existing === null) return notFound("پرسش پیدا نشد.");

    const body = await readJson(request);
    const parsed = faqBodySchema.safeParse(body);
    if (!parsed.success) return badRequest(zodMessage(parsed.error));
    const input = parsed.data;

    try {
      const updated = await db.faq.update({
        where: { id },
        data: {
          question: input.question,
          answer: input.answer,
          sortOrder: input.sortOrder ?? 0,
          isActive: input.isActive,
        },
        select: { id: true },
      });
      revalidatePath("/", "layout");
      return NextResponse.json({ faq: updated });
    } catch (error) {
      return badRequest(prismaErrorMessage(error, "ویرایش پرسش ناموفق بود."));
    }
  });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  return adminHandler(async () => {
    const { id } = await context.params;
    const existing = await db.faq.findUnique({ where: { id }, select: { id: true } });
    if (existing === null) return notFound("پرسش پیدا نشد.");

    try {
      await db.faq.delete({ where: { id } });
      revalidatePath("/", "layout");
      return NextResponse.json({ ok: true });
    } catch (error) {
      return badRequest(prismaErrorMessage(error, "حذف پرسش ناموفق بود."));
    }
  });
}
