/**
 * PrismaClient سینگلتون — با بوت‌استرپ مقاوم برای استقرار روی ورسل
 * ─────────────────────────────────────────────────────────────
 * خطاهای رایج دیتابیس روی ورسل که این ماژول پیش‌بینی و رفع می‌کند:
 *
 *  1) «P1003: Database file does not exist»
 *     → مسیر فایل SQLite با pathToFileURL مطلق و نسبت به process.cwd()
 *       ساخته می‌شود (نه رشتهٔ نسبیِ مبهم).
 *
 *  2) «Error: unable to open database file» (فایل‌سیستم فقط‌خواندنی لامبدا)
 *     → روی ورسل (process.env.VERCEL) فایل دیتابیس یک‌بار به /tmp کپی
 *       می‌شود ( تنها جای قابل‌نوشتن ) و اتصال به آن نسخه برقرار می‌شود.
 *       ⚠️ نوشتن روی ورسل ایفمرال است (هر لامبدا نمونهٔ خودش را دارد)؛
 *       برای ماندگاری دادهٔ واقعی DATABASE_URL را به Neon/Turso/PlanetScale
 *       تنظیم کنید — این ماژول خودکار از همان استفاده می‌کند.
 *
 *  3) «P1001: Can't reach database server»
 *       → اگر DATABASE_URL غیر file: باشد مستقیم پاس داده می‌شود.
 *
 * نکتهٔ مهم: هرگز -webkit-backdrop-filter و… (نامربوط) — این فایل فقط
 * دیتابیس است؛ قواعد CSS در globals.css است.
 */
import { PrismaClient } from "@prisma/client";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

/** آدرس مطلق فایل SQLite باندل‌شدهٔ پروژه (db/custom.db) */
function bundledSqlitePath(): string {
  return join(process.cwd(), "db", "custom.db");
}

/**
 * تصمیم‌گیری دربارهٔ URL نهایی اتصال:
 *  ۱. DATABASE_URL غیر file (پایتایپ واقعی: postgres/mysql/…) → همان.
 *  ۲. روی ورسل → کپی یک‌بارهٔ فایل به /tmp و اتصال به آن.
 *  ۳. لوکال/سلف‌هاست → آدرس مطلق فایل موجود.
 */
function resolveDatabaseUrl(): string | undefined {
  const envUrl = process.env.DATABASE_URL;

  // ۱) دیتابیس بیرونی — مستقیم
  if (envUrl !== undefined && !envUrl.startsWith("file:")) return envUrl;

  const bundledPath = bundledSqlitePath();
  if (!existsSync(bundledPath)) {
    // فایل نیست و env هم file: مطلق معتبر نداده — بگذاریم Prisma خودش
    // خطای شفاف بدهد (مثلاً در build لوکال بدون db:push)
    return envUrl;
  }

  // ۲) ورسل — فایل‌سیستم لامبدا فقط‌خواندنی است؛ /tmp تنها جای نوشتنی
  if (process.env.VERCEL === "1") {
    const tmpPath = join("/tmp", "besalamat.db");
    try {
      if (!existsSync(tmpPath)) {
        copyFileSync(bundledPath, tmpPath);
      }
      return pathToFileURL(tmpPath).href;
    } catch {
      // اگر کپی نشد (مثلاً فقط خواندن)، به همان فایل باندل وصل می‌شویم
      return pathToFileURL(bundledPath).href;
    }
  }

  // ۳) لوکال — آدرس مطلق؛ پایدار نسبت به هر cwd ای
  return pathToFileURL(bundledPath).href;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createDb(): PrismaClient {
  const url = resolveDatabaseUrl();
  return url === undefined
    ? new PrismaClient({ log: ["error", "warn"] })
    : new PrismaClient({
        log: ["error", "warn"],
        datasources: { db: { url } },
      });
}

export const db = globalForPrisma.prisma ?? createDb();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
