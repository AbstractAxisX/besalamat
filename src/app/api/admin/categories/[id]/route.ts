/**
 * GET/PUT/DELETE /api/admin/categories/[id] — مدیریت یک دسته
 * ─────────────────────────────
 * DELETE: اگر زیردسته یا محصول داشته باشد → خطای فارسی (جابه‌جایی پیش از حذف لازم است).
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
import { categoryBodySchema } from "@/server/admin-schemas";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  return adminHandler(async () => {
    const { id } = await context.params;
    const row = await db.category.findUnique({
      where: { id },
      include: { parent: true, _count: { select: { products: true, children: true } } },
    });
    if (row === null) return notFound("دسته پیدا نشد.");
    return NextResponse.json({ category: row });
  });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return adminHandler(async () => {
    const { id } = await context.params;
    const existing = await db.category.findUnique({ where: { id }, select: { id: true, parentId: true } });
    if (existing === null) return notFound("دسته پیدا نشد.");

    const body = await readJson(request);
    const parsed = categoryBodySchema.safeParse(body);
    if (!parsed.success) return badRequest(zodMessage(parsed.error));
    const input = parsed.data;

    /* جابه‌جایی سطح: فقط دستهٔ سطح ۲ می‌تواند والد بگیرد و برعکس ممنوع است */
    if (input.parentId != null && input.parentId === id) {
      return badRequest("دسته نمی‌تواند والد خودش باشد.");
    }
    if (input.parentId != null) {
      const parent = await db.category.findUnique({ where: { id: input.parentId } });
      if (parent === null) return badRequest("دستهٔ والد پیدا نشد.");
      if (parent.parentId !== null) {
        return badRequest("درخت دسته‌ها فقط دو سطح است؛ فرزندِ فرزند مجاز نیست.");
      }
      if (existing.parentId === null) {
        const childCount = await db.category.count({ where: { parentId: id } });
        if (childCount > 0) {
          return badRequest("این دسته زیردسته دارد و نمی‌تواند خودش فرزند شود.");
        }
      }
    }

    try {
      const updated = await db.category.update({
        where: { id },
        data: {
          title: input.title,
          slug: input.slug,
          parentId: input.parentId ?? null,
          iconKey: input.iconKey ?? null,
          sortOrder: input.sortOrder ?? 0,
          isActive: input.isActive,
          /* سئو فقط وقتی در بدنه آمده باشد بازنویسی می‌شود؛
           * ارسال نشود (مثل سوییچ سریع فعال/غیرفعال از پنل) مقدار قبلی حفظ می‌شود */
          ...(input.seoTitle !== undefined ? { seoTitle: input.seoTitle } : {}),
          ...(input.seoDescription !== undefined ? { seoDescription: input.seoDescription } : {}),
        },
        select: { id: true, slug: true },
      });
      revalidatePath("/", "layout");
      return NextResponse.json({ category: updated });
    } catch (error) {
      return badRequest(prismaErrorMessage(error, "ویرایش دسته ناموفق بود."));
    }
  });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  return adminHandler(async () => {
    const { id } = await context.params;
    const existing = await db.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true, children: true } } },
    });
    if (existing === null) return notFound("دسته پیدا نشد.");

    if (existing._count.children > 0) {
      return badRequest("این دسته زیردسته دارد؛ ابتدا زیردسته‌ها را حذف یا جابه‌جا کنید.");
    }
    if (existing._count.products > 0) {
      return badRequest("این دسته محصول دارد؛ ابتدا محصولات را به دستهٔ دیگری منتقل کنید.");
    }

    try {
      await db.category.delete({ where: { id } });
      revalidatePath("/", "layout");
      return NextResponse.json({ ok: true });
    } catch (error) {
      return badRequest(prismaErrorMessage(error, "حذف دسته ناموفق بود."));
    }
  });
}
