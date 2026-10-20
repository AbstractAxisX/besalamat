/**
 * GET/POST /api/admin/banners — کاشی‌های گرید تبلیغات (پنل ادمین)
 * ─────────────────────────────
 * قرارداد ذخیره (عین seed): عنوان و زیرعنوان با «\n» در ستون title
 * کنار هم می‌نشینند؛ slot = جایگاه کاشی در گرید (۰..۳، ۰ مبنا).
 * قالب گرید از Setting «ads.layout» خوانده می‌شود (مدیریت از /api/admin/settings).
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
import { bannerBodySchema } from "@/server/admin-schemas";

/** تفکیک title ذخیره‌شده به (عنوان، زیرعنوان) */
function splitTitle(stored: string | null): { title: string | null; subtitle: string | null } {
  if (stored === null) return { title: null, subtitle: null };
  const [title, subtitle] = stored.split("\n", 2);
  return {
    title: title !== undefined && title.length > 0 ? title : null,
    subtitle: subtitle ?? null,
  };
}

/** ادغام عنوان و زیرعنوان برای ذخیره در ستون واحد title */
function joinTitle(title: string, subtitle: string | null | undefined): string {
  return subtitle != null && subtitle.length > 0 ? `${title}\n${subtitle}` : title;
}

export async function GET() {
  return adminHandler(async () => {
    const rows = await db.banner.findMany({ orderBy: { slot: "asc" } });
    return NextResponse.json({
      items: rows.map((row) => ({
        id: row.id,
        slot: row.slot,
        imageUrl: row.imageUrl,
        href: row.href,
        isActive: row.isActive,
        ...splitTitle(row.title),
      })),
    });
  });
}

export async function POST(request: NextRequest) {
  return adminHandler(async () => {
    const body = await readJson(request);
    const parsed = bannerBodySchema.safeParse(body);
    if (!parsed.success) return badRequest(zodMessage(parsed.error));
    const input = parsed.data;

    try {
      const created = await db.banner.create({
        data: {
          title: joinTitle(input.title, input.subtitle),
          imageUrl: input.imageUrl,
          href: input.href,
          slot: input.slot,
          isActive: input.isActive,
        },
        select: { id: true },
      });
      revalidatePath("/", "layout");
      return NextResponse.json({ banner: created }, { status: 201 });
    } catch (error) {
      return badRequest(prismaErrorMessage(error, "ساخت بنر ناموفق بود."));
    }
  });
}
