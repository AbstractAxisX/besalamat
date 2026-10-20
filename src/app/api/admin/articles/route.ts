/**
 * GET/POST /api/admin/articles — مدیریت مقالات مجله (پنل ادمین)
 * ─────────────────────────────
 * GET ?published=1|0 — فهرست با عنوان دسته؛ POST — ساخت مقاله.
 * publishedAt به‌صورت ISO می‌آید و در DB ذخیرهٔ Date می‌شود.
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
import { articleBodySchema } from "@/server/admin-schemas";

export async function GET(request: NextRequest) {
  return adminHandler(async () => {
    const publishedParam = request.nextUrl.searchParams.get("published");
    const where =
      publishedParam === "1"
        ? { isPublished: true }
        : publishedParam === "0"
          ? { isPublished: false }
          : undefined;

    /* دسته‌های مقاله هم برگردانده می‌شوند تا فرم ادیتور (Task 8-d-2)
     * بدون endpoint جدا انتخاب دسته را داشته باشد — افزودنی و بی‌اثر بر قرارداد قبلی */
    const [rows, categories] = await Promise.all([
      db.article.findMany({
        where,
        include: { category: true },
        orderBy: { publishedAt: "desc" },
      }),
      db.articleCategory.findMany({
        orderBy: { title: "asc" },
        select: { id: true, title: true },
      }),
    ]);

    return NextResponse.json({
      items: rows.map((row) => ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        coverUrl: row.coverUrl,
        excerpt: row.excerpt,
        categoryId: row.categoryId,
        categoryTitle: row.category?.title ?? null,
        isPublished: row.isPublished,
        publishedAt: row.publishedAt?.toISOString() ?? null,
        updatedAt: row.updatedAt.toISOString(),
      })),
      categories,
    });
  });
}

export async function POST(request: NextRequest) {
  return adminHandler(async () => {
    const body = await readJson(request);
    const parsed = articleBodySchema.safeParse(body);
    if (!parsed.success) return badRequest(zodMessage(parsed.error));
    const input = parsed.data;

    try {
      const created = await db.article.create({
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
      return NextResponse.json({ article: created }, { status: 201 });
    } catch (error) {
      return badRequest(prismaErrorMessage(error, "ساخت مقاله ناموفق بود."));
    }
  });
}
