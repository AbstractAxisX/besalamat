import type { SmsDriver, SmsSendResult } from './types'

/**
 * درایور کاوه‌نگار — Kavenegar
 * ============================
 * ارسال ساده:  POST https://api.kavenegar.com/v1/{KAVENEGAR_API_KEY}/sms/send.json
 *              فرم: receptor، message
 * ارسال OTP:   POST https://api.kavenegar.com/v1/{KAVENEGAR_API_KEY}/verify/lookup.json
 *              فرم: receptor، token (=کد تأیید)، template (=env KAVENEGAR_OTP_TEMPLATE)
 *
 * پاسخ کاوه‌نگار به‌طور یکنواخت: { return: { status, message }, entries: [ { messageid, ... } ] }
 * return.status === 200 یعنی موفق و entries[0].messageid شناسهٔ پیام است.
 *
 * ⚠️ TODO(کلید واقعی): کلید و قالب واقعی را از پنل کاوه‌نگار (kavenegar.com) تنظیم کنید:
 *   - KAVENEGAR_API_KEY      → از «حساب کاربری > API Key»
 *   - KAVENEGAR_OTP_TEMPLATE → نام قالبِ ساخته‌شده در بخش «قالب‌ها» (برای verify/lookup قالبِ فعال الزامی است)
 * بدون هرکدام، درایور ok:false برمی‌گرداند و هرگز throw نمی‌کند.
 *
 * نکتهٔ TTL: اعتبارِ کد در کاوه‌نگار از طریق متنِ خودِ قالبِ پنل مدیریت می‌شود؛
 * پارامتر ttlSeconds فقط برای قرارداد مشترک درایورها حفظ شده است.
 */

const KAVENEGAR_BASE = 'https://api.kavenegar.com/v1'
const TIMEOUT_MS = 10_000

export class KavenegarSmsDriver implements SmsDriver {
  readonly name = 'kavenegar'

  async send(to: string, text: string): Promise<SmsSendResult> {
    const apiKey = readEnv('KAVENEGAR_API_KEY')
    if (!apiKey) return { ok: false, message: 'کلید کاوه‌نگار تنظیم نشده است' }
    try {
      const res = await fetch(`${KAVENEGAR_BASE}/${encodeURIComponent(apiKey)}/sms/send.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' },
        body: new URLSearchParams({ receptor: to, message: text }).toString(),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
      const raw: unknown = await res.json().catch(() => null)
      return mapKavenegarResponse(raw)
    } catch {
      return { ok: false, message: 'ارتباط با کاوه‌نگار برقرار نشد' }
    }
  }

  async sendOtp(to: string, code: string, _ttlSeconds: number): Promise<SmsSendResult> {
    const apiKey = readEnv('KAVENEGAR_API_KEY')
    const template = readEnv('KAVENEGAR_OTP_TEMPLATE')
    if (!apiKey) return { ok: false, message: 'کلید کاوه‌نگار تنظیم نشده است' }
    if (!template) return { ok: false, message: 'قالب تأیید کاوه‌نگار تنظیم نشده است' }
    try {
      const res = await fetch(`${KAVENEGAR_BASE}/${encodeURIComponent(apiKey)}/verify/lookup.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' },
        body: new URLSearchParams({ receptor: to, token: code, template }).toString(),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
      const raw: unknown = await res.json().catch(() => null)
      return mapKavenegarResponse(raw)
    } catch {
      return { ok: false, message: 'ارتباط با کاوه‌نگار برقرار نشد' }
    }
  }
}

/** پاسخ خام کاوه‌نگار را به SmsSendResult نگاشت می‌کند (بدون throw). */
function mapKavenegarResponse(raw: unknown): SmsSendResult {
  const root = asRecord(raw)
  const returnInfo = asRecord(root?.return)
  const firstEntry = asRecord(firstOf(root?.entries))
  const status = typeof returnInfo?.status === 'number' ? returnInfo.status : -1
  const ok = status === 200
  return {
    ok,
    message:
      typeof returnInfo?.message === 'string' ? returnInfo.message : ok ? undefined : 'پاسخ نامعتبر از کاوه‌نگار',
    providerId: readString(firstEntry, 'messageid'),
  }
}

// ─── ابزارک‌های محلی این درایور (بدون وابستگی بیرونی) ───

function readEnv(name: string): string | undefined {
  const value = process.env[name]
  return value && value.trim() !== '' ? value.trim() : undefined
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null
}

function firstOf(value: unknown): unknown {
  return Array.isArray(value) ? value[0] : undefined
}

function readString(obj: Record<string, unknown> | null, key: string): string | undefined {
  const v = obj?.[key]
  if (typeof v === 'string' && v.trim() !== '') return v.trim()
  if (typeof v === 'number' && Number.isFinite(v)) return String(v)
  return undefined
}
