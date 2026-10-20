/**
 * سشن سرور-سازگار (serverless-safe) — کوکی امضاشده + غنی‌سازی از DB
 * ─────────────────────────────────────────────────────────────────
 * فرمت کوکی: `payloadB64.hmacB64`
 *  - payload = {v, uid, phone, name, role, sid, exp} — نقش و هویت داخل توکن.
 *  - امضا = HMAC-SHA256(payload, SESSION_SECRET) — قابل جعل نیست.
 *
 * چرا stateless؟ روی ورسل هر Route Handler یک لامبدای جدا با /tmp جدا است؛
 * سشنِ نوشته‌شده در لامبدای «ورود» در لامبدای «صفحهٔ بعد» دیده نمی‌شد و کاربر
 * بلافاصله لاگ‌اوت می‌شد. با کوکی امضاشده، اعتبارسنجی بدون state مشترک انجام
 * می‌شود و در عین حال:
 *  - رکورد DB همچنان (بهترین‌تلاش) نوشته می‌شود؛ روی استقرار تک‌نودی/DB واقعی،
 *    ابطال (revoke) و مسدودی کاربر همان لحظه اعمال می‌شود.
 *  - روی ورسلِ دمو، نبودِ رکورد/کاربر در DB این لامبدا خطا نیست — به payload
 *    امضاشده اعتماد می‌شود (محدودیت دمو؛ با DB میزبانی‌شده مثل Neon/Turso
 *    این حالت خودبه‌خود برطرف می‌شود).
 *
 * TTL: ۳۰ روز کاربر عادی، ۱۲ ساعت ادمین.
 * کوکی‌های قدیمی (توکن خامِ پیش از این نسخه) از مسیر DB قبلی خوانده می‌شوند.
 */

import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'

export interface SessionUser {
  userId: string
  phone: string
  fullName: string | null
  role: 'USER' | 'ADMIN'
  sessionId: string
}

export const SESSION_COOKIE = 'bs_session'

const USER_TTL_SEC = 30 * 24 * 60 * 60 // ۳۰ روز
const ADMIN_TTL_SEC = 12 * 60 * 60 // ۱۲ ساعت

interface SessionPayload {
  v: 1
  /** شناسهٔ کاربر (cuid) */
  uid: string
  phone: string
  name: string | null
  role: 'USER' | 'ADMIN'
  /** شناسهٔ یکتای این سشن — برای ردیابی/ابطال روی استقرار تک‌نودی */
  sid: string
  /** انقضا به ثانیهٔ اپوک */
  exp: number
}

// هشدارِ «SECRET تنظیم نشده» فقط یک‌بار در طول عمر پروسه چاپ شود
const secretGuard = globalThis as unknown as { __bsSessionSecretWarned?: boolean }

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET
  if (secret !== undefined && secret.length > 0) return secret
  if (secretGuard.__bsSessionSecretWarned !== true) {
    console.warn(
      '[session] SESSION_SECRET در متغیرهای محیطی تنظیم نشده؛ از کلید توسعه‌ای استفاده می‌شود. برای محیط تولید حتماً مقدار تصادفی تنظیم کنید.',
    )
    secretGuard.__bsSessionSecretWarned = true
  }
  return 'bsalam-dev-session-secret'
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function sign(body: string): string {
  return createHmac('sha256', getSessionSecret()).update(body).digest('base64url')
}

/** ساخت مقدار کوکی: payloadBase64url.signatureBase64url */
function signPayload(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  return `${body}.${sign(body)}`
}

/** اعتبارسنجی امضا و ساختار payload — null یعنی نامعتبر/منقضی */
function verifyToken(token: string): SessionPayload | null {
  const dotIndex = token.lastIndexOf('.')
  if (dotIndex <= 0 || dotIndex === token.length - 1) return null

  const body = token.slice(0, dotIndex)
  const signature = token.slice(dotIndex + 1)
  const expected = sign(body)

  // مقایسهٔ زمان-ثابت در برابر حملات timing
  const given = Buffer.from(signature, 'utf8')
  const wanted = Buffer.from(expected, 'utf8')
  if (given.length !== wanted.length || !timingSafeEqual(given, wanted)) return null

  try {
    const payload = JSON.parse(
      Buffer.from(body, 'base64url').toString('utf8'),
    ) as SessionPayload
    if (
      payload.v !== 1 ||
      typeof payload.uid !== 'string' ||
      payload.uid.length === 0 ||
      typeof payload.phone !== 'string' ||
      (payload.role !== 'USER' && payload.role !== 'ADMIN') ||
      typeof payload.exp !== 'number'
    ) {
      return null
    }
    if (payload.exp * 1000 <= Date.now()) return null
    return payload
  } catch {
    return null
  }
}

/**
 * ساخت سشن جدید برای کاربر و ست‌کردن کوکی httpOnly.
 * رکورد DB بهترین‌تلاش نوشته می‌شود (برای ابطال/حسابرسی روی استقرار تک‌نودی)؛
 * شکستِ آن جلوی ورود را نمی‌گیرد چون اعتبارسنجی stateless است.
 * فقط در Route Handler یا Server Action قابل فراخوانی است (چون کوکی ست می‌کند).
 */
export async function createSession(opts: {
  userId: string
  phone: string
  fullName: string | null
  isAdmin: boolean
  userAgent?: string
  ip?: string
}): Promise<void> {
  const ttlSec = opts.isAdmin ? ADMIN_TTL_SEC : USER_TTL_SEC
  const payload: SessionPayload = {
    v: 1,
    uid: opts.userId,
    phone: opts.phone,
    name: opts.fullName,
    role: opts.isAdmin ? 'ADMIN' : 'USER',
    sid: randomBytes(9).toString('base64url'),
    exp: Math.floor(Date.now() / 1000) + ttlSec,
  }
  const token = signPayload(payload)

  try {
    await db.session.create({
      data: {
        tokenHash: sha256(token),
        userId: opts.userId,
        userAgent: opts.userAgent ?? null,
        // IP فقط به‌صورت هش ذخیره می‌شود (لازم نیست خود IP را نگه داریم)
        ipHash: opts.ip !== undefined && opts.ip.length > 0 ? sha256(opts.ip) : null,
        expiresAt: new Date(payload.exp * 1000),
      },
    })
  } catch (error) {
    console.warn(
      '[session] نوشتن رکورد سشن در DB ناموفق بود (سشن stateless ادامه می‌یابد):',
      error,
    )
  }

  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ttlSec,
  })
}

/**
 * کاربرِ سشن فعلی — با React cache() دودوپلیکت می‌شود تا در یک درخواست
 * (layout + page + route) فقط یک‌بار محاسبه شود.
 *
 * کوکی امضاشده → اعتبارسنجی HMAC و انقضا → غنی‌سازی از DB (بهترین‌تلاش):
 * نقش تازه، مسدودی و ابطالِ تک‌نودی. نبودِ رکورد در DB (لامبدای دیگر روی
 * ورسل) خطا نیست — payload امضاشده مرجع است.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (token === undefined || token.length === 0) return null

  // ── مسیر جدید: توکن امضاشده ──
  const payload = verifyToken(token)
  if (payload !== null) {
    let role = payload.role
    let phone = payload.phone
    let fullName = payload.name
    try {
      const [user, sessionRecord] = await Promise.all([
        db.user.findUnique({ where: { id: payload.uid } }),
        db.session.findUnique({ where: { tokenHash: sha256(token) } }),
      ])
      // ابطالِ ثبت‌شده روی استقرار تک‌نودی — همان لحظه اعمال می‌شود
      if (sessionRecord !== null && sessionRecord.revokedAt !== null) return null
      if (user !== null) {
        if (user.isBlocked) return null
        // نقش/نام تازه از DB (مثلاً بعد از ترفیع یا ویرایش پروفایل)
        role = user.role
        phone = user.phone
        fullName = user.fullName
      }
      // user === null → روی ورسلِ چندلامبدایی طبیعی است؛ به payload اعتماد می‌کنیم
    } catch {
      // DB در دسترس نیست — سشن امضاشده به‌تنهایی معتبر است
    }
    return {
      userId: payload.uid,
      phone,
      fullName,
      role,
      sessionId: payload.sid,
    }
  }

  // ── مسیر قدیم: توکن خامِ سشن‌های پیش از این نسخه ──
  try {
    const session = await db.session.findUnique({
      where: { tokenHash: sha256(token) },
      include: { user: true },
    })
    if (session === null) return null
    if (session.revokedAt !== null) return null
    if (session.expiresAt.getTime() <= Date.now()) return null
    if (session.user.isBlocked) return null
    return {
      userId: session.userId,
      phone: session.user.phone,
      fullName: session.user.fullName,
      role: session.user.role,
      sessionId: session.id,
    }
  } catch {
    // توکن قدیمی بدون DB قابل اعتبارسنجی نیست — بسته می‌ماند (fail-closed)
    return null
  }
})

/** ابطال سشن فعلی + حذف کوکی — حذف کوکی همان لحظه کاربر را خارج می‌کند. */
export async function revokeCurrentSession(): Promise<void> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (token !== undefined && token.length > 0) {
    try {
      await db.session.updateMany({
        where: { tokenHash: sha256(token), revokedAt: null },
        data: { revokedAt: new Date() },
      })
    } catch {
      // روی ورسل رکورد شاید در همین لامبدا نباشد — حذف کوکی کافی است
    }
  }
  store.delete(SESSION_COOKIE)
}

/**
 * ابطال همهٔ سشن‌های فعال یک کاربر (مثلاً بعد از تغییر نقش یا مسدودی).
 * روی استقرار تک‌نودی/DB واقعی کامل است؛ روی ورسلِ دمو بهترین‌تلاش.
 */
export async function revokeAllUserSessions(userId: string): Promise<void> {
  try {
    await db.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    })
  } catch {
    // DB این لامبدا رکوردی ندارد — نادیده گرفته می‌شود
  }
}
