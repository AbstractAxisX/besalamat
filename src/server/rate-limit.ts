/**
 * محدودساز نرخ در-حافظه با پنجرهٔ ثابت (fixed-window)
 * — مناسب پروسهٔ تک‌نودی (این پروژه SQLite تک‌نودی است).
 *
 * نخستین درخواستِ یک کلید، پنجره را باز می‌کند؛ پس از عبور شمارش از سقف،
 * تا پایان پنجره همهٔ درخواست‌های همان کلید رد می‌شوند.
 */

export interface RateLimitResult {
  allowed: boolean
  /** ۰ وقتی مجاز است؛ در غیر این صورت ثانیه‌های باقی‌مانده تا باز شدن پنجره */
  retryAfterSec: number
}

interface RateLimitEntry {
  count: number
  resetAt: number
}

// ذخیره‌ساز روی globalThis تا با هات‌ریلودِ dev هم وضعیت ریست نشود
const globalStore = globalThis as unknown as {
  __bsRateLimitStore?: Map<string, RateLimitEntry>
}

const store: Map<string, RateLimitEntry> =
  globalStore.__bsRateLimitStore ?? new Map<string, RateLimitEntry>()
globalStore.__bsRateLimitStore = store

/** آستانهٔ سویپ تنبل: اگر Map از این تعداد گذشت، رکوردهای منقضی پاک شوند */
const MAX_ENTRIES = 5000

function sweepExpired(): void {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key)
  }
}

/**
 * بررسی و شمارش یک درخواست در پنجرهٔ ثابت.
 * @param key     کلید یکتا (مثلاً «otp:p:09...:10m» یا «otp:ip:1.2.3.4:1m»)
 * @param limit   سقف تعداد در هر پنجره
 * @param windowMs طول پنجره به میلی‌ثانیه
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  // سویپ تنبل — فقط وقتی نگاشت از حد مجاز بزرگ‌تر شده باشد
  if (store.size > MAX_ENTRIES) sweepExpired()

  const now = Date.now()
  const entry = store.get(key)

  if (entry === undefined || entry.resetAt <= now) {
    // پنجرهٔ جدید (یا پنجرهٔ قبلی منقضی شده) — نخستین درخواست
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfterSec: 0 }
  }

  if (entry.count >= limit) {
    const retryAfterSec = Math.max(1, Math.ceil((entry.resetAt - now) / 1000))
    return { allowed: false, retryAfterSec }
  }

  entry.count += 1
  return { allowed: true, retryAfterSec: 0 }
}

/**
 * استخراج IP کاربر از هدرها — پشت Caddy/پروکسی، x-forwarded-for
 * می‌تواند «client, proxy1, proxy2» باشد؛ فقط اولین IP (خود کاربر) مهم است.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded !== null) {
    const first = forwarded.split(',')[0]?.trim()
    if (first !== undefined && first.length > 0) return first
  }
  return 'unknown'
}
