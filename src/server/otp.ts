/**
 * هستهٔ OTP — تولید، ذخیره (هش‌شده با pepper) و تأیید کد یک‌بارمصرف
 *
 * امنیت:
 * - کد ۵ رقمی فقط به‌صورت sha256(`${phone}:${code}:${PEPPER}`) ذخیره می‌شود.
 * - سقف ۵ تلاش تأیید برای هر کد؛ رسیدن به سقف = ابطال کد.
 * - سقف درخواست: ۳ کد در ۱۰ دقیقه و ۵ کد در ساعت برای هر شماره، ۱۰ درخواست در دقیقه برای هر IP.
 * - در هر لحظه فقط یک کد فعال برای هر phone+purpose (کدهای مصرف‌نشدهٔ قبلی حذف می‌شوند).
 */

import { createHash, randomInt } from 'node:crypto'
import type { OtpPurpose } from '@prisma/client'
import { db } from '@/lib/db'
import { normalizePhone, toFa } from '@/lib/format'
import { getSmsDriver } from '@/server/drivers/sms'
import { rateLimit } from '@/server/rate-limit'

export type OtpRequestResult =
  | { ok: true; expiresInSeconds: number; devCode?: string }
  | { ok: false; status: 429; message: string; retryAfterSec: number }

export type OtpVerifyResult =
  | { ok: true }
  | { ok: false; status: 400 | 429; message: string }

const RATE_LIMIT_MESSAGE =
  'برای امنیت، تعداد درخواست‌های شما زیاد بوده؛ چند دقیقه دیگر تلاش کنید.'
const MAX_VERIFY_ATTEMPTS = 5
const DEFAULT_TTL_SECONDS = 120

/** TTL کد از env (OTP_TTL_SECONDS) — مقدار نامعتبر = پیش‌فرض ۱۲۰ ثانیه */
function getTtlSeconds(): number {
  const parsed = Number.parseInt(process.env.OTP_TTL_SECONDS ?? '', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TTL_SECONDS
}

// هشدارِ «pepper تنظیم نشده» فقط یک‌بار در طول عمر پروسه چاپ شود
const pepperGuard = globalThis as unknown as { __bsOtpPepperWarned?: boolean }

function getPepper(): string {
  const pepper = process.env.OTP_PEPPER
  if (pepper !== undefined && pepper.length > 0) return pepper
  if (pepperGuard.__bsOtpPepperWarned !== true) {
    console.warn(
      '[otp] OTP_PEPPER در متغیرهای محیطی تنظیم نشده؛ از pepper توسعه‌ای استفاده می‌شود. برای محیط تولید حتماً مقدار تصادفی تنظیم کنید.',
    )
    pepperGuard.__bsOtpPepperWarned = true
  }
  return 'bsalam-dev-pepper'
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function hashCode(phone: string, code: string): string {
  return sha256(`${phone}:${code}:${getPepper()}`)
}

function isDevMode(): boolean {
  return process.env.SMS_DEV_MODE === 'true'
}

/**
 * کد OTP دموی ثابت (سفارش مشتری — فاز تست):
 * تا زمان اتصال درایور پیامک واقعی، همهٔ کدها یک عدد ثابت هستند تا
 * دمو و استقرار آزمایشی بدون پیامک قابل تست باشد.
 * خاموش‌کردن: OTP_DEMO_MODE=false → کد تصادفی واقعی صادر می‌شود.
 */
function isDemoOtpMode(): boolean {
  return process.env.OTP_DEMO_MODE !== 'false'
}

export function getDemoOtpCode(): string | null {
  if (!isDemoOtpMode()) return null
  return process.env.OTP_DEMO_CODE ?? '12345'
}

/**
 * شماره‌های مجاز ورود به پنل مدیریت — از env ADMIN_PHONES (جدا با کاما).
 * هر ورودی با normalizePhone نرمال می‌شود؛ ورودی نامعتبر حذف می‌شود.
 */
export function getAdminPhoneWhitelist(): string[] {
  const raw = process.env.ADMIN_PHONES ?? ''
  const whitelist: string[] = []
  for (const entry of raw.split(',')) {
    const phone = normalizePhone(entry)
    if (phone !== null) whitelist.push(phone)
  }
  return whitelist
}

/**
 * صدور کد یک‌بارمصرف برای phone+purpose.
 * شکست ارسال پیامک به خروجی بازتاب نمی‌یابد (تا سفارش اصلی گم نشود)؛
 * فقط console.error می‌شود و در حالت dev، devCode برگردانده می‌شود تا فلو تست شود.
 *
 * در حالت دمو، نوشتن در DB هم «به‌افسانه» است: اگر نوشتن شکست بخورد
 * (مثلاً فایل‌سیستم فقط‌خواندنی) باز هم پاسخ موفق با devCode برمی‌گردد،
 * چون تأییدِ حالت دمو بدون رکورد DB هم انجام می‌شود (verifyOtp را ببینید).
 */
export async function requestOtp(
  phone: string,
  purpose: OtpPurpose,
  ip: string,
): Promise<OtpRequestResult> {
  // سقف‌های سه‌گانه — پنجرهٔ ۱۰ دقیقه‌ای و ساعتیِ شماره، سپس پنجرهٔ دقیقه‌ایِ IP
  const phoneShortWindow = rateLimit(`otp:p:${phone}:10m`, 3, 10 * 60 * 1000)
  if (!phoneShortWindow.allowed) {
    return {
      ok: false,
      status: 429,
      message: RATE_LIMIT_MESSAGE,
      retryAfterSec: phoneShortWindow.retryAfterSec,
    }
  }

  const phoneHourlyWindow = rateLimit(`otp:p:${phone}:1h`, 5, 60 * 60 * 1000)
  if (!phoneHourlyWindow.allowed) {
    return {
      ok: false,
      status: 429,
      message: RATE_LIMIT_MESSAGE,
      retryAfterSec: phoneHourlyWindow.retryAfterSec,
    }
  }

  const ipWindow = rateLimit(`otp:ip:${ip}:1m`, 10, 60 * 1000)
  if (!ipWindow.allowed) {
    return {
      ok: false,
      status: 429,
      message: RATE_LIMIT_MESSAGE,
      retryAfterSec: ipWindow.retryAfterSec,
    }
  }

  const now = new Date()
  const ttlSecondsBase = getTtlSeconds()

  // کد دموی ثابت یا کد تصادفی واقعی
  const demoCode = getDemoOtpCode()
  const code = demoCode ?? randomInt(10000, 100000).toString() // ۵ رقم: 10000..99999
  // در حالت دمو مهلت بیشتری برای راحتی تست
  const ttlSeconds =
    demoCode !== null ? Math.max(ttlSecondsBase, 300) : ttlSecondsBase
  const expiresAt = new Date(now.getTime() + ttlSeconds * 1000)

  // نوشتن رکورد در DB — در حالت دمو «به‌افسانه»؛ در حالت واقعی خطا\میدهد چون
  // بدون رکورد، تأیید ممکن نیست. (روی ورسل هر لامبدا /tmp خودش را دارد و
  // رکورد در لامبدای «تأیید» پیدا نیست — برای همین تأییدِ دمو stateless است.)
  try {
    // پاکسازی فرصت‌طلبانهٔ کدهای منقضی‌شده
    await db.otpCode.deleteMany({ where: { expiresAt: { lt: now } } })

    // باطل‌سازی کدهای مصرف‌نشدهٔ قبلی همان شماره و هدف — فقط یک کد فعال
    await db.otpCode.deleteMany({
      where: { phone, purpose, consumedAt: null },
    })

    await db.otpCode.create({
      data: { phone, codeHash: hashCode(phone, code), purpose, expiresAt },
    })
  } catch (error) {
    if (demoCode === null) throw error
    console.warn(
      '[otp] نوشتن کد دمو در DB ناموفق بود (نادیده گرفته می‌شود؛ تأیید دمو stateless است):',
      error,
    )
  }

  // ارسال با درایور SMS — شکستِ ارسال یعنی کد در DB می‌ماند ولی کاربر خبر ندارد؛
  // کد مصرف‌شده/mark نمی‌شود تا اگر پیامک واقعاً رسیده بود، قابل تأیید بماند.
  try {
    const driver = getSmsDriver()
    const result = await driver.sendOtp(phone, code, ttlSeconds)
    if (!result.ok) {
      console.error(
        `[otp] ارسال پیامک ناموفق بود (درایور: ${driver.name}): ${result.message ?? 'بدون پیام خطا'}`,
      )
    }
  } catch (error) {
    console.error('[otp] خطای غیرمنتظره در ارسال پیامک:', error)
  }

  return {
    ok: true,
    expiresInSeconds: ttlSeconds,
    // در حالت توسعه یا دمو، کد در خروجی هم برگردانده می‌شود تا فلو بدون پیامک واقعی تست شود
    ...(isDevMode() || demoCode !== null ? { devCode: code } : {}),
  }
}

/**
 * تأیید کد یک‌بارمصرف.
 *
 * حالت دمو (کد ثابت، فاز تست): کد دمو بدون رکورد DB هم پذیرفته می‌شود.
 * دلیل: روی ورسل هر Route Handler یک لامبدای جدا با /tmp جدا است؛ کدی که
 * لامبدای «درخواست» ذخیره کرده در لامبدای «تأیید» هرگز دیده نمی‌شود و
 * کاربر خطای «کدی ثبت نشده» می‌گرفت (باگ گزارش‌شده). کد دمو از پیش معلوم
 * است، پس نیازی به state مشترک ندارد. با OTP_DEMO_MODE=false کاملاً غیرفعال
 * می‌شود و مسیر امنِ رکورد-محور برمی‌گردد.
 *
 * حالت واقعی: «مصرف کد» فقط در دو حالت رخ می‌دهد: تأیید موفق، یا قفل شدن
 * به‌خاطر تلاش‌های ناموفق زیاد (≥۵).
 */
export async function verifyOtp(
  phone: string,
  code: string,
  purpose: OtpPurpose,
): Promise<OtpVerifyResult> {
  // ── شورت‌کات دمو ──
  const demoCode = getDemoOtpCode()
  if (demoCode !== null && code === demoCode) {
    // اگر رکورد فعالی موجود بود (همان لامبدا/نود)، مصرفش می‌کنیم تا تمیز بماند
    try {
      await db.otpCode.updateMany({
        where: { phone, purpose, consumedAt: null },
        data: { consumedAt: new Date() },
      })
    } catch {
      // نبود رکورد یا DB در دسترس نیست — در حالت دمو اشکالی ندارد
    }
    console.info(`[otp] ورود با کد دمو برای ${phone} (${purpose}) تأیید شد.`)
    return { ok: true }
  }

  const record = await db.otpCode.findFirst({
    where: { phone, purpose, consumedAt: null },
    orderBy: { createdAt: 'desc' },
  })

  if (record === null) {
    return {
      ok: false,
      status: 400,
      message: 'کدی برای این شماره ثبت نشده است؛ ابتدا کد دریافت کنید.',
    }
  }

  const now = new Date()

  if (record.expiresAt.getTime() <= now.getTime()) {
    return {
      ok: false,
      status: 400,
      message: 'مدت اعتبار کد به پایان رسیده است؛ دوباره کد دریافت کنید.',
    }
  }

  if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
    // کد قفل‌شده — مصرف می‌شود تا برای تلاش‌های بعدی به‌عنوان «کد فعال» برنگردد
    await db.otpCode.update({
      where: { id: record.id },
      data: { consumedAt: now },
    })
    return {
      ok: false,
      status: 429,
      message: 'تلاش‌های ناموفق زیاد بوده؛ کد باطل شد. ۱۵ دقیقه دیگر دوباره تلاش کنید.',
    }
  }

  if (record.codeHash !== hashCode(phone, code)) {
    const attempts = record.attempts + 1
    const locked = attempts >= MAX_VERIFY_ATTEMPTS
    await db.otpCode.update({
      where: { id: record.id },
      data: { attempts, ...(locked ? { consumedAt: now } : {}) },
    })

    if (locked) {
      return {
        ok: false,
        status: 429,
        message: 'تلاش‌های ناموفق زیاد بوده؛ کد باطل شد. ۱۵ دقیقه دیگر دوباره تلاش کنید.',
      }
    }

    return {
      ok: false,
      status: 400,
      message: `کد وارد‌شده درست نیست؛ ${toFa(MAX_VERIFY_ATTEMPTS - attempts)} تلاش باقی مانده.`,
    }
  }

  // تأیید موفق — کد مصرف شد
  await db.otpCode.update({
    where: { id: record.id },
    data: { consumedAt: now },
  })
  return { ok: true }
}
