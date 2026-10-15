/**
 * آداپتر آپلود تصویر — «بسلامت»
 * ═════════════════════════════════
 * آداپتر لوکال (پیش‌فرض، UPLOAD_DRIVER=local): ذخیرهٔ فایل در public/uploads/{سال}/ با نام sha256
 * + آداپتر S3 آروان (stub برای فاز آینده).
 *
 * نکته: این ماژول فقط در سمت سرور import می‌شود (route handlers) —
 * گارد 'server-only' لازم نیست.
 *
 * env:
 *   UPLOAD_DRIVER — 'local' (پیش‌فرض) یا 's3' | 'arvan' | 's3-arvan' (آروان؛ هنوز فعال نیست)
 */

import { createHash } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export interface UploadResult {
  url: string;
}

export interface UploadAdapter {
  readonly name: string;
  put(file: File): Promise<UploadResult>;
  remove(url: string): Promise<void>;
}

export const UPLOAD_MAX_BYTES = 5 * 1024 * 1024;

export const UPLOAD_ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

/** برای includes روی File.type بدون cast در فراخواننده */
const MIME_LIST: readonly string[] = UPLOAD_ALLOWED_MIME_TYPES;

/** پسوند فایل بر اساس mime (پس از اعتبارسنجی همیشه موجود است) */
const EXT_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

/** اعتبارسنجی مشترک — خطاها با پیام فارسی throw می‌شوند (فراخواننده route آن‌ها را به پاسخ تبدیل می‌کند) */
function validateImage(file: File): string {
  if (!MIME_LIST.includes(file.type)) {
    throw new Error("فرمت فایل مجاز نیست (PNG/JPG/WebP)");
  }
  const ext = EXT_BY_MIME[file.type];
  if (ext === undefined) {
    throw new Error("فرمت فایل مجاز نیست (PNG/JPG/WebP)");
  }
  if (file.size <= 0) {
    throw new Error("فایل خالی است");
  }
  if (file.size > UPLOAD_MAX_BYTES) {
    throw new Error("حجم فایل بیشتر از ۵ مگابایت است");
  }
  return ext;
}

/** ریشهٔ آپلود — مسیر مطلق public/uploads برای محافظت path-traversal */
function uploadsRoot(): string {
  return path.resolve(process.cwd(), "public", "uploads");
}

/**
 * آداپتر لوکال (پیش‌فرض): public/uploads/{yyyy}/{sha256}.{ext}
 * url نسبی /uploads/{yyyy}/{sha256}.{ext} — next/static از public سرو می‌کند.
 */
class LocalUploadAdapter implements UploadAdapter {
  readonly name = "local";

  async put(file: File): Promise<UploadResult> {
    const ext = validateImage(file);
    const buffer = Buffer.from(await file.arrayBuffer());
    const hash = createHash("sha256").update(buffer).digest("hex");
    const year = new Date().getFullYear().toString();
    const fileName = `${hash}.${ext}`;

    const dir = path.join(uploadsRoot(), year);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, fileName), buffer);

    return { url: `/uploads/${year}/${fileName}` };
  }

  async remove(url: string): Promise<void> {
    try {
      // '/uploads/2026/abc.png' → داخل public/uploads قفل می‌شود
      const relative = url.replace(/^\/+/, "");
      const absolute = path.resolve(process.cwd(), "public", relative);
      const root = uploadsRoot();
      if (!absolute.startsWith(root + path.sep)) return; // خارج از ریشهٔ آپلود → بی‌صدا رد
      await unlink(absolute);
    } catch {
      // حذف بی‌صدا — فایل ممکن است از قبل وجود نداشته باشد؛ خطا اهمیتی ندارد
    }
  }
}

/**
 * آداپتر S3 آروان — stub کامل برای فاز آینده.
 * TODO فاز آینده: کلیدهای آروان S3 — env ARVAN_ACCESS_KEY/ARVAN_SECRET/ARVAN_BUCKET/ARVAN_ENDPOINT؛
 * با fetch امضاشده یا SDK.
 */
class S3ArvanAdapter implements UploadAdapter {
  readonly name = "s3-arvan";

  async put(): Promise<UploadResult> {
    throw new Error("آپلود ابری در این نسخه فعال نیست");
  }

  async remove(): Promise<void> {
    throw new Error("آپلود ابری در این نسخه فعال نیست");
  }
}

/** انتخاب آداپتر بر اساس env UPLOAD_DRIVER (پیش‌فرض: local) */
export function getUploadAdapter(): UploadAdapter {
  switch ((process.env.UPLOAD_DRIVER ?? "").trim().toLowerCase()) {
    case "s3":
    case "arvan":
    case "s3-arvan":
      return new S3ArvanAdapter();
    default:
      return new LocalUploadAdapter();
  }
}
