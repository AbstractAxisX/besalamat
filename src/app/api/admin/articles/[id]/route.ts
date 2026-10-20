/**
 * GET/PUT/DELETE /api/admin/articles/[id] — مدیریت یک مقاله
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
import { articleBodySchema } from "@/server/admin-schemas";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  return adminHandler(async () => {
    const { id } = await context.params;
    const row = await db.article.findUnique({ where: { id }, include: { category: true } });
    if (row === null) return notFound("مقاله پیدا نشد.");
    return NextResponse.json({ article: row });
  });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return adminHandler(async () => {
    const { id } = await context.params;
    const existing = await db.article.findUnique({ where: { id }, select: { id: true } });
    if (existing === null) return notFound("مقاله پیدا نشد.");

    const body = await readJson(request);
    const parsed = articleBodySchema.safeParse(body);
    if (!parsed.success) return badRequest(zodMessage(parsed.error));
    const input = parsed.data;

    try {
      const updated = await db.article.update({
        where: { id },
        data: {
          title: input.title,
          slug: input.slug,
          coverUrl: input.coverUrl,
          excerpt: input.excerpt,
          contentHtml: input.contentHtml,
          categoryId: input.categoryId ?? null,
          seoTitle: input.seoTitle ?? null,
          seoDescription: input.seoDescription ?? null,
          isPublished: input.isPublished,
          publishedAt: input.publishedAt != null ? new Date(input.publishedAt) : input.isPublished ? new Date() : null,
        },
        select: { id: true, slug: true },
      });
      revalidatePath("/", "layout");
      return NextResponse.json({ article: updated });
    } catch (error) {
      return badRequest(prismaErrorMessage(error, "ویرایش مقاله ناموفق بود."));
    }
  });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  return adminHandler(async () => {
    const { id } = await context.params;
    const existing = await db.article.findUnique({ where: { id }, select: { id: true } });
    if (existing === null) return notFound("مقاله پیدا نشد.");

    try {
      await db.article.delete({ where: { id } });
      revalidatePath("/", "layout");
      return NextResponse.json({ ok: true });
    } catch (error) {
      return badRequest(prismaErrorMessage(error, "حذف مقاله ناموفق بود."));
    }
  });
}
