/**
 * POST /api/admin/upload — آپلود تصویر (multipart form-data)
 * ─────────────────────────────
 * فیلد «file» — اعتبارسنجی نوع/حجم توسط آداپتر آپلود (PNG/JPG/WebP، حداکثر ۵MB)
 * و ذخیره در public/uploads/{سال}/ با نام sha256 → پاسخ {url}.
 */

import { NextRequest, NextResponse } from "next/server";

import {
  adminHandler,
  badRequest,
} from "@/server/api";
import { getUploadAdapter } from "@/server/upload";

export async function POST(request: NextRequest) {
  return adminHandler(async () => {
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return badRequest("بدنهٔ درخواست باید multipart/form-data باشد.");
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return badRequest("فایلی با نام «file» ارسال نشده است.");
    }

    try {
      const adapter = getUploadAdapter();
      const result = await adapter.put(file);
      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "آپلود فایل ناموفق بود.";
      return badRequest(message);
    }
  });
}
