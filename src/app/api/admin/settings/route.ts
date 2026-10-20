/**
 * GET/PUT /api/admin/settings — تنظیمات فروشگاه (پنل ادمین)
 * ─────────────────────────────
 * GET  — مقدار خام همهٔ Settingها + overlay تایپ‌شدهٔ store.* (getStoreSettings).
 * PUT  — آبجکت {key: value}؛ هر کلید JSON.stringify و upsert می‌شود؛
 *        پس از نوشتن، کش تنظیمات بی‌اعتبار و صفحات عمومی revalidate می‌شوند.
 * کلیدهای شناخته‌شدهٔ store.*: name, tagline, phone, email, address, hours,
 * mapEmbedUrl, instagram, telegram, whatsapp, twitter, aboutShort, shippingNote
 * (+ کلیدهای سیستمی: order.sequence، shipping.cost، ads.layout).
 */

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { adminHandler, badRequest, readJson, zodMessage } from "@/server/api";
import { getStoreSettings } from "@/server/shop-data";
import { invalidateSettingsCache } from "@/server/settings";

const settingsPutSchema = z.record(z.string().min(1, "کلید تنظیم خالی است"), z.unknown());

export async function GET() {
  return adminHandler(async () => {
    const rows = await db.setting.findMany({ orderBy: { key: "asc" } });
    const raw: Record<string, string> = {};
    for (const row of rows) {
      raw[row.key] = row.value;
    }
    const store = await getStoreSettings();
    return NextResponse.json({ raw, store });
  });
}

export async function PUT(request: NextRequest) {
  return adminHandler(async () => {
    const body = await readJson(request);
    const parsed = settingsPutSchema.safeParse(body);
    if (!parsed.success) return badRequest(zodMessage(parsed.error));
    const entries = Object.entries(parsed.data);

    if (entries.length === 0) {
      return badRequest("هیچ تنظیمی برای ذخیره ارسال نشده است.");
    }

    try {
      for (const [key, value] of entries) {
        await db.setting.upsert({
          where: { key },
          create: { key, value: JSON.stringify(value ?? null) },
          update: { value: JSON.stringify(value ?? null) },
        });
      }

      invalidateSettingsCache();
      revalidatePath("/", "layout");
      return NextResponse.json({ ok: true, count: entries.length });
    } catch (error) {
      console.error("[api/admin/settings] خطای ذخیره:", error);
      return badRequest("ذخیرهٔ تنظیمات ناموفق بود.");
    }
  });
}
