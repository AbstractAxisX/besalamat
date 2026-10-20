/**
 * GET/POST /api/admin/products — مدیریت محصولات (پنل ادمین)
 * ─────────────────────────────
 * GET  ?q=&page=&pageSize= — فهرست با نام برند/دسته + شمار تصویر/تنوع (صفحه‌بندی ساده)
 * POST — ساخت محصول با فرزندان (تصاویر/تنوع‌ها/مشخصات)
 * همهٔ مسیرها گارد ادمین (نقش ADMIN) + اعتبارسنجی zod فارسی + revalidate.
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
import { productBodySchema } from "@/server/admin-schemas";

/* ── GET: فهرست ── */

export async function GET(request: NextRequest) {
  return adminHandler(async () => {
    const params = request.nextUrl.searchParams;
    const q = (params.get("q") ?? "").trim();
    const page = Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Number.parseInt(params.get("pageSize") ?? "20", 10) || 20),
    );

    const where = q.length > 0
      ? {
          OR: [
            { title: { contains: q } },
            { slug: { contains: q } },
            { searchText: { contains: q } },
          ],
        }
      : {};

    const [rows, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          brand: true,
          category: true,
          images: { orderBy: { sortOrder: "asc" }, select: { url: true } },
          variants: { select: { stock: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.product.count({ where }),
    ]);

    const items = rows.map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      price: row.price,
      comparePrice: row.comparePrice,
      stock:
        row.variants.length > 0
          ? row.variants.reduce((total, variant) => total + variant.stock, 0)
          : row.stock,
      isActive: row.isActive,
      isNew: row.isNew,
      isFeatured: row.isFeatured,
      brandId: row.brandId,
      brandTitle: row.brand?.title ?? null,
      categoryId: row.categoryId,
      categoryTitle: row.category?.title ?? null,
      images: row.images.map((image) => image.url),
      imageCount: row.images.length,
      variantCount: row.variants.length,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      pageCount: Math.max(1, Math.ceil(total / pageSize)),
    });
  });
}

/* ── POST: ساخت ── */

export async function POST(request: NextRequest) {
  return adminHandler(async () => {
    const body = await readJson(request);
    const parsed = productBodySchema.safeParse(body);
    if (!parsed.success) return badRequest(zodMessage(parsed.error));
    const input = parsed.data;

    /* searchText خودکار از عنوان + برند */
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
      const created = await db.product.create({
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
          images: { create: input.images.map((image, index) => ({ ...image, sortOrder: image.sortOrder ?? index })) },
          variants: { create: input.variants.map((variant, index) => ({ ...variant, sortOrder: variant.sortOrder ?? index })) },
          specs: { create: input.specs.map((spec, index) => ({ ...spec, sortOrder: spec.sortOrder ?? index })) },
        },
        select: { id: true, slug: true },
      });

      revalidatePath("/", "layout");
      return NextResponse.json({ product: created }, { status: 201 });
    } catch (error) {
      return badRequest(prismaErrorMessage(error, "ساخت محصول ناموفق بود."));
    }
  });
}
