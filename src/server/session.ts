/**
 * سشن سرور-محور — رکورد DB + کوکی httpOnly که فقط توکن خام را دارد.
 *
 * سرور sha256(token) را در جدول Session نگه می‌دارد؛ کوکی هرگز هش نیست،
 * پس ابطال فوری (revoke) با یک UPDATE ممکن است و کوکی کاربر لازم نیست پاک شود.
 *
 * TTL سشن: ۳۰ روز برای کاربر عادی، ۱۲ ساعت برای ادمین.
 */

import { createHash, randomBytes } from 'node:crypto'
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

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

/**
 * ساخت سشن جدید برای کاربر و ست‌کردن کوکی httpOnly.
 * فقط در Route Handler یا Server Action قابل فراخوانی است (چون کوکی ست می‌کند).
 */
export async function createSession(
  userId: string,
  opts: { isAdmin: boolean; userAgent?: string; ip?: string },
): Promise<void> {
  const ttlSec = opts.isAdmin ? ADMIN_TTL_SEC : USER_TTL_SEC
  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + ttlSec * 1000)

  await db.session.create({
    data: {
      tokenHash: sha256(token),
      userId,
      userAgent: opts.userAgent ?? null,
      // IP فقط به‌صورت هش ذخیره می‌شود (لازم نیست خود IP را نگه داریم)
      ipHash: opts.ip !== undefined && opts.ip.length > 0 ? sha256(opts.ip) : null,
      expiresAt,
    },
  })

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
 * (layout + page + route) فقط یک‌بار به DB برود.
 * کوکی → sha256 → رکورد سشن → اعتبارسنجی (ابطال/انقضا/مسدودی) → نقش.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (token === undefined || token.length === 0) return null

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
})

/** ابطال سشن فعلی (بر اساس کوکی موجود) + حذف کوکی — حتی بدون سشن هم بی‌خطاست. */
export async function revokeCurrentSession(): Promise<void> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (token !== undefined && token.length > 0) {
    await db.session.updateMany({
      where: { tokenHash: sha256(token), revokedAt: null },
      data: { revokedAt: new Date() },
    })
  }
  store.delete(SESSION_COOKIE)
}

/** ابطال همهٔ سشن‌های فعال یک کاربر (مثلاً بعد از تغییر نقش یا مسدودی). */
export async function revokeAllUserSessions(userId: string): Promise<void> {
  await db.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  })
}
