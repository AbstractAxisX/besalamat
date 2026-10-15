/**
 * قرارداد مشترک درایورهای پیامک — «بسلامت»
 * =========================================
 * همهٔ درایورها (console / kavenegar / smsir / mellipayamak) همین اینترفیس را پیاده می‌کنند.
 * امضاها را تغییر ندهید؛ لایه‌های دیگر (ایجنت 3-b و فازهای بعد) با همین امضا import می‌کنند.
 *
 * قاعدهٔ طلایی همهٔ درایورها: هرگز throw نکن —
 * خطا همیشه به‌صورت { ok: false, message } به فراخواننده برمی‌گردد.
 */

/** نتیجهٔ یک عملیات ارسال پیامک */
export interface SmsSendResult {
  ok: boolean
  message?: string
  providerId?: string
}

/** درایور پیامک */
export interface SmsDriver {
  readonly name: string
  send(to: string, text: string): Promise<SmsSendResult>
  sendOtp(to: string, code: string, ttlSeconds: number): Promise<SmsSendResult>
}
