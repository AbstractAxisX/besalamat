import type { SmsDriver, SmsSendResult } from './types'

/**
 * درایور ملی‌پیامک — MelliPayamak (REST)
 * ======================================
 * سرویس REST: https://rest.payamak-panel.com
 * ارسال ساده و OTP: POST /api/SendSMS/SendSMS (فرم urlencoded)
 *   username={MELLIPAYAMAK_USERNAME}  password={MELLIPAYAMAK_PASSWORD}
 *   to  from={MELLIPAYAMAK_FROM}  text  isFlash=false
 *
 * پاسخ: { Value, RetStatus, StrRetStatus } — RetStatus === 1 یعنی موفق و Value همان recId است.
 *
 * ⚠️ TODO(کلید واقعی): اطلاعات واقعی را از پنل ملی‌پیامک (mellipayamak.com) تنظیم کنید:
 *   - MELLIPAYAMAK_USERNAME / MELLIPAYAMAK_PASSWORD → «حساب کاربری» پنل
 *   - MELLIPAYAMAK_FROM → شمارهٔ خطِ فعال (یا شمارهٔ سرویسِ اشتراکیِ ۵۰۰۰…)
 * بدون هرکدام، درایور ok:false برمی‌گرداند و هرگز throw نمی‌کند.
 *
 * نکتهٔ OTP: در این نسخه، کد تأیید با همان متن استاندارد «کد تأیید شما: … — اعتبار … ثانیه»
 * از طریق ارسال ساده فرستاده می‌شود؛
 * TODO(پنل): اگر سرویس «کد تأیید» اختصاصیِ ملی‌پیامک را تهیه کردید، endpoint و بدنهٔ
 * مربوطه را در sendOtp جایگزین کنید.
 */

const MELLIPAYAMAK_SEND_URL = 'https://rest.payamak-panel.com/api/SendSMS/SendSMS'
const TIMEOUT_MS = 10_000

export class MelliPayamakSmsDriver implements SmsDriver {
  readonly name = 'mellipayamak'

  async send(to: string, text: string): Promise<SmsSendResult> {
    return this.sendViaRest(to, text)
  }

  async sendOtp(to: string, code: string, ttlSeconds: number): Promise<SmsSendResult> {
    const text = `کد تأیید شما: ${code} — اعتبار ${ttlSeconds} ثانیه`
    return this.sendViaRest(to, text)
  }

  private async sendViaRest(to: string, text: string): Promise<SmsSendResult> {
    const username = readEnv('MELLIPAYAMAK_USERNAME')
    const password = readEnv('MELLIPAYAMAK_PASSWORD')
    const from = readEnv('MELLIPAYAMAK_FROM')
    if (!username || !password) return { ok: false, message: 'اطلاعات ملی‌پیامک تنظیم نشده است' }
    if (!from) return { ok: false, message: 'شمارهٔ فرستندهٔ ملی‌پیامک تنظیم نشده است' }
    try {
      const res = await fetch(MELLIPAYAMAK_SEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' },
        body: new URLSearchParams({ username, password, to, from, text, isFlash: 'false' }).toString(),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
      const raw: unknown = await res.json().catch(() => null)
      const root = asRecord(raw)
      const ok = root?.RetStatus === 1
      return {
        ok,
        message:
          typeof root?.StrRetStatus === 'string' ? root.StrRetStatus : ok ? undefined : 'پاسخ نامعتبر از ملی‌پیامک',
        providerId: readString(root, 'Value'),
      }
    } catch {
      return { ok: false, message: 'ارتباط با ملی‌پیامک برقرار نشد' }
    }
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

function readString(obj: Record<string, unknown> | null, key: string): string | undefined {
  const v = obj?.[key]
  if (typeof v === 'string' && v.trim() !== '') return v.trim()
  if (typeof v === 'number' && Number.isFinite(v)) return String(v)
  return undefined
}
