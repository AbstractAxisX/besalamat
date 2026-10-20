/**
 * GET/POST /api/admin/brands — مدیریت برندها (پنل ادمین)
 * GET — فهرست فعال/غیرفعال با شمار محصول.
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
import { brandBodySchema } from "@/server/admin-schemas";

export async function GET() {
  return adminHandler(async () => {
    const rows = await db.brand.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({
      items: rows.map((row) => ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        logoUrl: row.logoUrl,
        sortOrder: row.sortOrder,
        isActive: row.isActive,
        productCount: row._count.products,
      })),
    });
  });
}

export async function POST(request: NextRequest) {
  return adminHandler(async () => {
    const body = await readJson(request);
    const parsed = brandBodySchema.safeParse(body);
    if (!parsed.success) return badRequest(zodMessage(parsed.error));
    const input = parsed.data;

    try {
      const created = await db.brand.create({
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
      return NextResponse.json({ brand: created }, { status: 201 });
    } catch (error) {
      return badRequest(prismaErrorMessage(error, "ساخت برند ناموفق بود."));
    }
  });
}
