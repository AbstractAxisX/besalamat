/**
 * سرویس تنظیمات «بسلامت»
 * ─────────────────────────
 * مقادیر به‌صورت رشتهٔ JSON در Setting.value ذخیره می‌شوند.
 * کش در-حافظهٔ کوتاه (۳ ثانیه) برای هر کلید و هر پیشوند — عمداً کوتاه:
 * «پنل ادمین ذخیره می‌کند → سایت باید فوراً نشان دهد»؛
 * دودوپلیکتِ هر درخواست را React cache() در shop-data انجام می‌دهد.
 *
 * نکته: store.* های تعریف‌نشده در DB توسط src/config/brand.ts تکمیل می‌شوند؛
 * این سرویس فقط کلیدهای ذخیره‌شده را برمی‌گرداند.
 */
import { db } from "@/lib/db";

const CACHE_TTL_MS = 3_000;

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/** کش مقدار خامِ تک‌کلید (null = کلید در DB وجود ندارد) */
const keyCache = new Map<string, CacheEntry<string | null>>();

/** کش نتیجهٔ کوئری پیشوندی */
const prefixCache = new Map<string, CacheEntry<Record<string, string>>>();

function isFresh<T>(entry: CacheEntry<T> | undefined): entry is CacheEntry<T> {
  return entry !== undefined && entry.expiresAt > Date.now();
}

/**
 * خواندن یک تنظیم با parse از JSON.
 * کلید ناموجود یا مقدار خراب → مقدار fallback برمی‌گردد.
 */
export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const cached = keyCache.get(key);
  let raw: string | null;
  if (isFresh(cached)) {
    raw = cached.value;
  } else {
    const row = await db.setting.findUnique({ where: { key } });
    raw = row?.value ?? null;
    keyCache.set(key, { value: raw, expiresAt: Date.now() + CACHE_TTL_MS });
  }

  if (raw === null) return fallback;
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed as T;
  } catch {
    return fallback;
  }
}

/**
 * همهٔ کلیدهای دارای پیشوند داده‌شده به‌همراه مقدار خام (بدون JSON.parse).
 * نمونه: getSettingsByPrefix('store.') → { 'store.mapEmbedUrl': '"https://…"' }
 */
export async function getSettingsByPrefix(prefix: string): Promise<Record<string, string>> {
  const cached = prefixCache.get(prefix);
  if (isFresh(cached)) {
    return { ...cached.value };
  }

  const rows = await db.setting.findMany({
    where: { key: { startsWith: prefix } },
    select: { key: true, value: true },
  });
  const record: Record<string, string> = {};
  for (const row of rows) {
    record[row.key] = row.value;
  }

  prefixCache.set(prefix, { value: record, expiresAt: Date.now() + CACHE_TTL_MS });
  return { ...record };
}

/** نوشتن یک تنظیم (JSON.stringify) + بی‌اعتبارسازی کش همان کلید و کش‌های پیشوندی مرتبط */
export async function setSetting(key: string, value: unknown): Promise<void> {
  const serialized = JSON.stringify(value);
  await db.setting.upsert({
    where: { key },
    create: { key, value: serialized },
    update: { value: serialized },
  });
  keyCache.delete(key);
  prefixCache.clear();
}

/** پاک‌سازی کامل کش تنظیمات (مثلاً پس از تغییرات دستی در پنل ادمین) */
export function invalidateSettingsCache(): void {
  keyCache.clear();
  prefixCache.clear();
}
