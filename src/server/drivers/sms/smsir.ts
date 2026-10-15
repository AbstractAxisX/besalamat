import type { SmsDriver, SmsSendResult } from './types'

/**
 * درایور پیام‌رسان — SMS.ir (v1)
 * ==============================
 * ارسال ساده:  POST https://api.sms.ir/v1/send/bulk
 *              هدر: Authorization: Bearer {SMSIR_API_KEY}
 *              بدنه: { lineNumber: {SMSIR_LINE_NUMBER}, messageText, mobiles: [ to ] }
 * ارسال OTP:   POST https://api.sms.ir/v1/send/verify
 *              بدنه: { mobile, templateId: {SMSIR_OTP_TEMPLATE_ID}, parameters: [ { name: 'CODE', value: کد } ] }
 *
 * پاسخ موفق v1: { status: 1, message: 'موفق', data: [ { id, ... } ] }
 *
 * ⚠️ TODO(کلید واقعی): کلید و قالب واقعی را از پنل پیام‌رسان (sms.ir) تنظیم کنید:
 *   - SMSIR_API_KEY         → «حساب کاربری > توسعه‌دهندگان > کلید API»
 *   - SMSIR_OTP_TEMPLATE_ID → شناسهٔ عددی قالب تأیید از بخش «قالب‌ها»
 *   - SMSIR_LINE_NUMBER     → شمارهٔ خطِ فعالِ پنل برای ارسال ساده
 * بدون هرکدام، درایور ok:false برمی‌گرداند و هرگز throw نمی‌کند.
 *
 * نکتهٔ TTL: اعتبارِ کد در پیام‌رسان از طریق متنِ قالبِ پنل مدیریت می‌شود؛
 * پارامتر ttlSeconds فقط برای قرارداد مشترک درایورها حفظ شده است.
 */

const SMSIR_BASE = 'https://api.sms.ir/v1'
const TIMEOUT_MS = 10_000

export class SmsIrSmsDriver implements SmsDriver {
  readonly name = 'smsir'

  async send(to: string, text: string): Promise<SmsSendResult> {
    const apiKey = readEnv('SMSIR_API_KEY')
    const lineNumber = readEnv('SMSIR_LINE_NUMBER')
    if (!apiKey) return { ok: false, message: 'کلید پیام‌رسان تنظیم نشده است' }
    if (!lineNumber) return { ok: false, message: 'شمارهٔ خط پیام‌رسان تنظیم نشده است' }
    try {
      const res = await fetch(`${SMSIR_BASE}/send/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ lineNumber, messageText: text, mobiles: [to] }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
      const raw: unknown = await res.json().catch(() => null)
      return mapSmsIrResponse(raw)
    } catch {
      return { ok: false, message: 'ارتباط با پیام‌رسان برقرار نشد' }
    }
  }

  async sendOtp(to: string, code: string, _ttlSeconds: number): Promise<SmsSendResult> {
    const apiKey = readEnv('SMSIR_API_KEY')
    const template = readEnv('SMSIR_OTP_TEMPLATE_ID')
    if (!apiKey) return { ok: false, message: 'کلید پیام‌رسان تنظیم نشده است' }
    if (!template) return { ok: false, message: 'قالب تأیید پیام‌رسان تنظیم نشده است' }
    const templateId = Number(template)
    if (!Number.isFinite(templateId)) {
      return { ok: false, message: 'قالب تأیید پیام‌رسان معتبر نیست (باید شناسهٔ عددی باشد)' }
    }
    try {
      const res = await fetch(`${SMSIR_BASE}/send/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          mobile: to,
          templateId,
          parameters: [
            { name: 'CODE', value: code },
            // TODO(پنل): اگر قالب شما متغیر «اعتبار» دارد، ردیف زیر را فعال کنید:
            // { name: 'TTL', value: String(_ttlSeconds) },
          ],
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
      const raw: unknown = await res.json().catch(() => null)
      return mapSmsIrResponse(raw)
    } catch {
      return { ok: false, message: 'ارتباط با پیام‌رسان برقرار نشد' }
    }
  }
}

/** پاسخ خام پیام‌رسان را به SmsSendResult نگاشت می‌کند (بدون throw). */
function mapSmsIrResponse(raw: unknown): SmsSendResult {
  const root = asRecord(raw)
  // data در v1 ممکن است آرایه باشد (bulk) یا خودش رکورد باشد (verify)
  const data = asRecord(root?.data) ?? asRecord(firstOf(root?.data))
  const status = root?.status
  const ok = status === 1 || status === '1'
  return {
    ok,
    message: typeof root?.message === 'string' ? root.message : ok ? undefined : 'پاسخ نامعتبر از پیام‌رسان',
    providerId: readString(data, 'id'),
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
