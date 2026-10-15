/**
 * قرارداد مشترک درایورهای پرداخت — «بسلامت»
 * ==========================================
 * همهٔ درایورها (فعلاً ترب) همین اینترفیس‌ها را پیاده می‌کنند.
 * امضاها را تغییر ندهید؛ لایه‌های دیگر (ایجنت 3-b و فازهای بعد) با همین امضا import می‌کنند.
 */

/** ورودی ساخت پرداخت */
export interface CreatePaymentInput {
  orderNumber: string
  amount: number // تومان
  callbackUrl: string // مسیر بازگشت از درگاه (relative)
  description?: string
  mobile?: string
}

/** نتیجهٔ ساخت پرداخت — redirectUrl مقصدِ هدایت کاربر به درگاه است */
export interface CreatePaymentResult {
  authority: string
  redirectUrl: string
}

/** ورودی تأیید پرداخت */
export interface VerifyPaymentInput {
  authority: string
  amount: number
  orderNumber: string
}

/** نتیجهٔ تأیید — raw پاسخ خام درگاه است (unknown) */
export type VerifyPaymentOutcome =
  | { status: 'VERIFIED'; refId: string; cardPan?: string; raw: unknown }
  | { status: 'FAILED'; reason: string; raw: unknown }

/** درایور پرداخت */
export interface PaymentDriver {
  readonly name: string
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>
  verify(input: VerifyPaymentInput): Promise<VerifyPaymentOutcome>
}
