/**
 * GET/POST /api/admin/categories — مدیریت دسته‌بندی‌ها (پنل ادمین)
 * ─────────────────────────────
 * GET  — درخت کامل با شمار محصول هر گره
 * POST — ساخت دسته (والد یا فرزند)
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
import { categoryBodySchema } from "@/server/admin-schemas";

interface AdminCategoryNode {
  id: string;
  parentId: string | null;
  title: string;
  slug: string;
  iconKey: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
  children: AdminCategoryNode[];
}

/* ── GET: درخت ── */

export async function GET() {
  return adminHandler(async () => {
    const rows = await db.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }],
    });

    const nodes = new Map<string, AdminCategoryNode>();
    for (const row of rows) {
      nodes.set(row.id, {
        id: row.id,
        parentId: row.parentId,
        title: row.title,
        slug: row.slug,
        iconKey: row.iconKey,
        sortOrder: row.sortOrder,
        isActive: row.isActive,
        productCount: row._count.products,
        children: [],
      });
    }
    const roots: AdminCategoryNode[] = [];
    for (const node of nodes.values()) {
      if (node.parentId !== null) {
        nodes.get(node.parentId)?.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return NextResponse.json({ tree: roots });
  });
}

/* ── POST: ساخت ── */

export async function POST(request: NextRequest) {
  return adminHandler(async () => {
    const body = await readJson(request);
    const parsed = categoryBodySchema.safeParse(body);
    if (!parsed.success) return badRequest(zodMessage(parsed.error));
    const input = parsed.data;

    /* چرخهٔ والد-فرزند ممنوع */
    if (input.parentId != null) {
      const parent = await db.category.findUnique({ where: { id: input.parentId } });
      if (parent === null) return badRequest("دستهٔ والد پیدا نشد.");
      if (parent.parentId !== null) {
        return badRequest("درخت دسته‌ها فقط دو سطح است؛ فرزندِ فرزند مجاز نیست.");
      }
    }

    try {
      const created = await db.category.create({
        data: {
          title: input.title,
          slug: input.slug,
          parentId: input.parentId ?? null,
          iconKey: input.iconKey ?? null,
          sortOrder: input.sortOrder ?? 0,
          isActive: input.isActive,
          seoTitle: input.seoTitle ?? null,
          seoDescription: input.seoDescription ?? null,
        },
        select: { id: true, slug: true },
      });
      revalidatePath("/", "layout");
      return NextResponse.json({ category: created }, { status: 201 });
    } catch (error) {
      return badRequest(prismaErrorMessage(error, "ساخت دسته ناموفق بود."));
    }
  });
}
