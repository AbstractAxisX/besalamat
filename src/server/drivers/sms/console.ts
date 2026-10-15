import type { SmsDriver, SmsSendResult } from './types'

/**
 * درایور کنسول — پیش‌فرض توسعه
 * =============================
 * پیامک واقعی ارسال نمی‌شود؛ متن به‌صورت خوانا در کنسول چاپ می‌شود: [SMS] to=... text=...
 * همیشه ok:true برمی‌گرداند (مناسب توسعهٔ محلی، دمو و زمانی که SMS_DRIVER تنظیم نشده باشد).
 */
export class ConsoleSmsDriver implements SmsDriver {
  readonly name = 'console'

  async send(to: string, text: string): Promise<SmsSendResult> {
    // پیامک واقعی ارسال نمی‌شود؛ فقط برای توسعه
    console.log(`[SMS] to=${to} text=${text}`)
    return { ok: true }
  }

  async sendOtp(to: string, code: string, ttlSeconds: number): Promise<SmsSendResult> {
    const text = `کد تأیید شما: ${code} — اعتبار ${ttlSeconds} ثانیه`
    console.log(`[SMS] to=${to} text=${text}`)
    return { ok: true }
  }
}
