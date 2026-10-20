/**
 * GET/POST /api/admin/popular-terms — واژه‌های پرجستجو (پنل ادمین)
 * ترتیب نمایش عمومی: وزن نزولی، حداکثر ۶ واژهٔ فعال.
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
import { popularTermBodySchema } from "@/server/admin-schemas";

export async function GET() {
  return adminHandler(async () => {
    const rows = await db.popularSearchTerm.findMany({ orderBy: { weight: "desc" } });
    return NextResponse.json({ items: rows });
  });
}

export async function POST(request: NextRequest) {
  return adminHandler(async () => {
    const body = await readJson(request);
    const parsed = popularTermBodySchema.safeParse(body);
    if (!parsed.success) return badRequest(zodMessage(parsed.error));
    const input = parsed.data;

    try {
      const created = await db.popularSearchTerm.create({
        data: {
          term: input.term,
          weight: input.weight ?? 0,
          isActive: input.isActive,
        },
        select: { id: true },
      });
      revalidatePath("/", "layout");
      return NextResponse.json({ term: created }, { status: 201 });
    } catch (error) {
      return badRequest(prismaErrorMessage(error, "ساخت واژه ناموفق بود؛ شاید تکراری است."));
    }
  });
}
