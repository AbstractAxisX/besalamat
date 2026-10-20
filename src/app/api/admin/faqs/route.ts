/**
 * GET/POST /api/admin/faqs — پرسش‌های متداول (پنل ادمین)
 * ترتیب نمایش عمومی: sortOrder صعودی، فقط فعال‌ها.
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
import { faqBodySchema } from "@/server/admin-schemas";

export async function GET() {
  return adminHandler(async () => {
    const rows = await db.faq.findMany({ orderBy: { sortOrder: "asc" } });
    return NextResponse.json({ items: rows });
  });
}

export async function POST(request: NextRequest) {
  return adminHandler(async () => {
    const body = await readJson(request);
    const parsed = faqBodySchema.safeParse(body);
    if (!parsed.success) return badRequest(zodMessage(parsed.error));
    const input = parsed.data;

    try {
      const created = await db.faq.create({
        data: {
          question: input.question,
          answer: input.answer,
          sortOrder: input.sortOrder ?? 0,
          isActive: input.isActive,
        },
        select: { id: true },
      });
      revalidatePath("/", "layout");
      return NextResponse.json({ faq: created }, { status: 201 });
    } catch (error) {
      return badRequest(prismaErrorMessage(error, "ساخت پرسش ناموفق بود."));
    }
  });
}
