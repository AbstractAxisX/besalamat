import { randomUUID } from 'crypto'

import type {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentDriver,
  VerifyPaymentInput,
  VerifyPaymentOutcome,
} from './types'

/**
 * درایور پرداخت ترب — Torob
 * =========================
 * دو حالت دارد که با env TOROB_MODE انتخاب می‌شود:
 *   - 'sandbox' (پیش‌فرض): شبیه‌سازِ بدونِ شبکه برای توسعه و تستِ پذیرش
 *   - 'live'           : اتصال واقعی به درگاه (ساختار کامل + TODOهای فارسی برای مستندات زنده)
 *
 * ─── قرارداد حالت sandbox (مستندسازی برای فاز ۴) ───
 * createPayment:
 *   authority   = 'sbx_' + randomUUID()
 *   redirectUrl = /payment/sandbox?authority=${authority}&order=${orderNumber}
 *   (صفحهٔ شبیه‌ساز درگاه در فاز ۴ ساخته می‌شود؛ همین قراردادِ مسیر/کوئری را باید نگه دارد.)
 * verify (stateless — وضعیتی از create نگه نمی‌دارد):
 *   - authority شامل «_fail» → FAILED با دلیل «پرداخت از سوی شبیه‌ساز لغو شد»
 *   - وگرنه → VERIFIED با refId انگلیسی `SBX-${Date.now().toString(36).toUpperCase()}` و
 *     cardPan='6037-99**-****-1234' و raw={ sandbox: true }
 *   شبیه‌ساز: صفحهٔ sandbox در فاز ۴ با افزودن پسوند «_fail» به authority، سناریوی شکست را شبیه‌سازی می‌کند.
 *
 * ─── قرارداد حالت live ───
 * ⚠️ TODO(ترب-زنده): آدرس و بدنهٔ دقیق را طبق مستندات زندهٔ ترب تکمیل کنید؛
 * کلیدها از TOROB_API_KEY / TOROB_MERCHANT_ID خوانده می‌شوند.
 * اگر «ساختِ پرداخت» در حالت live ناموفق بود (شبکه یا پاسخ نامعتبر)، authority و redirectUrl
 * «خالی» برگردانده می‌شوند — لایهٔ فراخواننده باید خالی بودن را بررسی و پیام خطا نمایش دهد.
 */

const TIMEOUT_MS = 10_000

export class TorobPaymentDriver implements PaymentDriver {
  readonly name = 'torob'

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    return this.isLive() ? this.liveCreate(input) : this.sandboxCreate(input)
  }

  async verify(input: VerifyPaymentInput): Promise<VerifyPaymentOutcome> {
    return this.isLive() ? this.liveVerify(input) : this.sandboxVerify(input)
  }

  private isLive(): boolean {
    return process.env.TOROB_MODE === 'live'
  }

  // ─── SANDBOX (پیش‌فرض) ───────────────────────────────────────────

  private sandboxCreate(input: CreatePaymentInput): CreatePaymentResult {
    const authority = `sbx_${randomUUID()}`
    return {
      authority,
      redirectUrl: `/payment/sandbox?authority=${encodeURIComponent(authority)}&order=${encodeURIComponent(input.orderNumber)}`,
    }
  }

  private sandboxVerify(input: VerifyPaymentInput): VerifyPaymentOutcome {
    if (input.authority.includes('_fail')) {
      return {
        status: 'FAILED',
        reason: 'پرداخت از سوی شبیه‌ساز لغو شد',
        raw: { sandbox: true, authority: input.authority },
      }
    }
    return {
      status: 'VERIFIED',
      // refId انگلیسی می‌ماند (بدون toFa/ارقام فارسی) تا در پنل و پیام‌ها قابل کپی باشد
      refId: `SBX-${Date.now().toString(36).toUpperCase()}`,
      cardPan: '6037-99**-****-1234',
      raw: { sandbox: true },
    }
  }

  // ─── LIVE (اتصال واقعی — نیازمند تکمیل TODOها) ────────────────────

  private async liveCreate(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    // TODO(ترب-زنده): آدرس و بدنهٔ دقیق را طبق مستندات زندهٔ ترب تکمیل کنید؛
    // کلیدها از TOROB_API_KEY/TOROB_MERCHANT_ID؛ آدرس‌های پیش‌فرض فقط جانمایی هستند.
    const url = readEnv('TOROB_CREATE_URL') ?? 'https://api.torob.com/v1/payment/create'
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: this.liveHeaders(),
        body: JSON.stringify({
          merchantId: process.env.TOROB_MERCHANT_ID ?? '',
          orderNumber: input.orderNumber,
          amount: input.amount, // تومان — TODO(ترب-زنده): واحد مبلغ را با مستندات تطبیق دهید (ریال/تومان)
          callbackUrl: input.callbackUrl, // مسیر relative — TODO(ترب-زنده): اگر درگاه URL مطلق می‌خواهد، با آدرس سایت ترکیب شود
          description: input.description ?? '',
          mobile: input.mobile ?? '',
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
      const raw: unknown = await res.json().catch(() => null)
      const payload = unwrapData(raw)
      const authority = readString(payload, 'authority', 'token')
      const redirectUrl = readString(payload, 'redirectUrl', 'redirect_url', 'paymentUrl', 'payment_url')
      if (!authority || !redirectUrl) {
        console.error('[TorobPaymentDriver] ساختِ پرداختِ زنده ناموفق بود', { status: res.status, raw })
        return { authority: '', redirectUrl: '' }
      }
      return { authority, redirectUrl }
    } catch (error) {
      console.error('[TorobPaymentDriver] ارتباط با درگاه برقرار نشد (create)', error)
      return { authority: '', redirectUrl: '' }
    }
  }

  private async liveVerify(input: VerifyPaymentInput): Promise<VerifyPaymentOutcome> {
    // TODO(ترب-زنده): آدرس و بدنهٔ دقیق verify را طبق مستندات زندهٔ ترب تکمیل کنید.
    const url = readEnv('TOROB_VERIFY_URL') ?? 'https://api.torob.com/v1/payment/verify'
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: this.liveHeaders(),
        body: JSON.stringify({
          merchantId: process.env.TOROB_MERCHANT_ID ?? '',
          authority: input.authority,
          amount: input.amount,
          orderNumber: input.orderNumber,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
      const raw: unknown = await res.json().catch(() => null)
      return mapLiveVerifyResponse(res, raw)
    } catch (error) {
      // خطای شبکه/تایم‌اوت — طبق قرارداد: FAILED با دلیل فارسی ثابت
      return {
        status: 'FAILED',
        reason: 'ارتباط با درگاه برقرار نشد',
        raw: { error: error instanceof Error ? error.message : String(error) },
      }
    }
  }

  /** هدرهای احراز هویت حالت زنده — TODO(ترب-زنده): قالب هدر را با مستندات تطبیق دهید. */
  private liveHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.TOROB_API_KEY ?? ''}`,
      'X-Merchant-Id': process.env.TOROB_MERCHANT_ID ?? '',
    }
  }
}

/**
 * نگاشت پاسخ verify زنده به VerifyPaymentOutcome.
 * سیاست محافظه‌کارانه: فقط با «علامت موفقیت صریح» VERIFIED برمی‌گردد
 * (res.ok و status/code یکی از OK / SUCCESS / VERIFIED / 200).
 * TODO(ترب-زنده): نام فیلدها (refId، cardPan و…) را طبق مستندات زنده نهایی کنید.
 */
function mapLiveVerifyResponse(res: Response, raw: unknown): VerifyPaymentOutcome {
  const payload = unwrapData(raw)
  const statusText = (readString(payload, 'status', 'code', 'result') ?? '').toUpperCase()
  const isSuccess =
    res.ok && (statusText === 'OK' || statusText === 'SUCCESS' || statusText === 'VERIFIED' || statusText === '200')
  if (isSuccess) {
    const refId = readString(payload, 'refId', 'ref_id', 'referenceId', 'trackingCode', 'refNumber')
    if (refId) {
      return {
        status: 'VERIFIED',
        refId,
        cardPan: readString(payload, 'cardPan', 'card_pan', 'pan'),
        raw,
      }
    }
    return { status: 'FAILED', reason: 'پاسخ درگاه فاقد شمارهٔ پیگیری (refId) است', raw }
  }
  return {
    status: 'FAILED',
    reason: readString(payload, 'message', 'error', 'reason') ?? 'پرداخت ناموفق بود',
    raw,
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

/** اگر پاسخ لفافی مثل { data: {...} } دارد، از داخل data بخوان؛ وگرنه خودِ پاسخ. */
function unwrapData(raw: unknown): Record<string, unknown> | null {
  const root = asRecord(raw)
  if (!root) return null
  return asRecord(root['data']) ?? root
}

function readString(obj: Record<string, unknown> | null, ...keys: string[]): string | undefined {
  if (!obj) return undefined
  for (const key of keys) {
    const v = obj[key]
    if (typeof v === 'string' && v.trim() !== '') return v.trim()
    if (typeof v === 'number' && Number.isFinite(v)) return String(v)
  }
  return undefined
}
