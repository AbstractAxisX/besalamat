/**
 * GET/PUT/DELETE /api/admin/products/[id] — مدیریت یک محصول
 * ─────────────────────────────
 * PUT: ویرایش کامل؛ فرزندان (تصاویر/تنوع‌ها/مشخصات) بازسازی می‌شوند
 * (deleteMany + create — همان قرارداد seed).
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
import { productBodySchema } from "@/server/admin-schemas";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const FULL_INCLUDE = {
  brand: true,
  category: { include: { parent: true } },
  images: { orderBy: { sortOrder: "asc" } },
  variants: { orderBy: { sortOrder: "asc" } },
  specs: { orderBy: { sortOrder: "asc" } },
} as const;

export async function GET(_request: NextRequest, context: RouteContext) {
  return adminHandler(async () => {
    const { id } = await context.params;
    const row = await db.product.findUnique({ where: { id }, include: FULL_INCLUDE });
    if (row === null) return notFound("محصول پیدا نشد.");
    return NextResponse.json({ product: row });
  });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return adminHandler(async () => {
    const { id } = await context.params;
    const existing = await db.product.findUnique({ where: { id }, select: { id: true } });
    if (existing === null) return notFound("محصول پیدا نشد.");

    const body = await readJson(request);
    const parsed = productBodySchema.safeParse(body);
    if (!parsed.success) return badRequest(zodMessage(parsed.error));
    const input = parsed.data;

    let searchText = input.searchText?.trim() ?? "";
    if (searchText.length === 0) {
      let brandTitle = "";
      if (input.brandId != null) {
        const brand = await db.brand.findUnique({ where: { id: input.brandId } });
        brandTitle = brand?.title ?? "";
      }
      searchText = `${input.title} ${brandTitle}`
        .replace(/ي/g, "ی")
        .replace(/ك/g, "ک")
        .replace(/\s+/g, " ")
        .toLowerCase()
        .trim();
    }

    try {
      const updated = await db.product.update({
        where: { id },
        data: {
          title: input.title,
          slug: input.slug,
          searchText,
          shortDescription: input.shortDescription ?? null,
          description: input.description ?? null,
          categoryId: input.categoryId ?? null,
          brandId: input.brandId ?? null,
          price: input.price,
          comparePrice: input.comparePrice ?? null,
          stock: input.stock,
          isActive: input.isActive,
          isNew: input.isNew,
          isFeatured: input.isFeatured,
          seoTitle: input.seoTitle ?? null,
          seoDescription: input.seoDescription ?? null,
          /* بازسازی فرزندان — همان قرارداد seed */
          images: {
            deleteMany: {},
            create: input.images.map((image, index) => ({ ...image, sortOrder: image.sortOrder ?? index })),
          },
          variants: {
            deleteMany: {},
            create: input.variants.map((variant, index) => ({ ...variant, sortOrder: variant.sortOrder ?? index })),
          },
          specs: {
            deleteMany: {},
            create: input.specs.map((spec, index) => ({ ...spec, sortOrder: spec.sortOrder ?? index })),
          },
        },
        select: { id: true, slug: true },
      });

      revalidatePath("/", "layout");
      return NextResponse.json({ product: updated });
    } catch (error) {
      return badRequest(prismaErrorMessage(error, "ویرایش محصول ناموفق بود."));
    }
  });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  return adminHandler(async () => {
    const { id } = await context.params;
    const existing = await db.product.findUnique({ where: { id }, select: { id: true } });
    if (existing === null) return notFound("محصول پیدا نشد.");

    try {
      await db.product.delete({ where: { id } });
      revalidatePath("/", "layout");
      return NextResponse.json({ ok: true });
    } catch (error) {
      return badRequest(prismaErrorMessage(error, "حذف محصول ناموفق بود."));
    }
  });
}
