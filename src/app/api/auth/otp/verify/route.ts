/**
 * POST /api/auth/otp/verify — تأیید کد، ورود/ثبت‌نام و ساخت سشن
 *
 * مسیر: zod (کد بعد از toEnDigits باید ۵ رقم باشد) → normalizePhone → verifyOtp
 * → upsert کاربر (ترفیع امن به ADMIN فقط با whitelist) → گارد مسدودی
 * → lastLoginAt + createSession (کوکی httpOnly در پاسخ ست می‌شود)
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { normalizePhone, toEnDigits } from '@/lib/format'
import { getAdminPhoneWhitelist, verifyOtp } from '@/server/otp'
import { clientIp } from '@/server/rate-limit'
import { createSession } from '@/server/session'

const INVALID_PHONE_MESSAGE = 'شمارهٔ موبایل معتبر نیست. نمونهٔ صحیح: ۰۹۱۲۳۴۵۶۷۸۹'
const INVALID_CODE_MESSAGE = 'کد تأیید باید دقیقاً ۵ رقم باشد؛ کد پیامک‌شده را کامل وارد کنید.'

const bodySchema = z.object({
  phone: z
    .string()
    .min(8, { message: INVALID_PHONE_MESSAGE })
    .max(20, { message: INVALID_PHONE_MESSAGE }),
  // ارقام فارسی/عربی قبل از اعتبارسنجی به لاتین تبدیل می‌شوند
  code: z
    .string()
    .transform(toEnDigits)
    .pipe(z.string().regex(/^\d{5}$/, { message: INVALID_CODE_MESSAGE })),
  purpose: z.enum(['LOGIN', 'CHECKOUT', 'ADMIN']).default('LOGIN'),
})

export async function POST(request: NextRequest) {
  try {
    let raw: unknown
    try {
      raw = await request.json()
    } catch {
      return NextResponse.json(
        { message: 'داده‌های ارسالی قابل خواندن نیست؛ لطفاً فرم را دوباره ارسال کنید.' },
        { status: 400 },
      )
    }

    const parsed = bodySchema.safeParse(raw)
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message
      return NextResponse.json(
        { message: firstIssue ?? 'اطلاعات ارسالی معتبر نیست؛ لطفاً دوباره تلاش کنید.' },
        { status: 400 },
      )
    }

    const phone = normalizePhone(parsed.data.phone)
    if (phone === null) {
      return NextResponse.json({ message: INVALID_PHONE_MESSAGE }, { status: 400 })
    }

    const purpose = parsed.data.purpose
    const verify = await verifyOtp(phone, parsed.data.code, purpose)
    if (!verify.ok) {
      return NextResponse.json({ message: verify.message }, { status: verify.status })
    }

    // نقش ADMIN فقط اگر purpose=ADMIN باشد و شماره در whitelist باشد
    const adminAllowed =
      purpose === 'ADMIN' && getAdminPhoneWhitelist().includes(phone)

    let user = await db.user.findUnique({ where: { phone } })
    const isNewUser = user === null

    if (user === null) {
      user = await db.user.create({
        data: { phone, role: adminAllowed ? 'ADMIN' : 'USER' },
      })
    }

    // کاربر مسدود هرگز سشن نمی‌گیرد (کد OTP طبق قرارداد در تأیید موفق مصرف شده است)
    if (user.isBlocked) {
      return NextResponse.json(
        { message: 'حساب شما موقتاً مسدود شده است؛ با پشتیبانی تماس بگیرید.' },
        { status: 403 },
      )
    }

    // ترفیع امن: کاربر موجودِ whitelist که با purpose=ADMIN وارد شده است
    const promoteToAdmin = adminAllowed && user.role === 'USER'

    user = await db.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        ...(promoteToAdmin ? { role: 'ADMIN' as const } : {}),
      },
    })

    await createSession({
      userId: user.id,
      phone: user.phone,
      fullName: user.fullName,
      isAdmin: user.role === 'ADMIN',
      userAgent: request.headers.get('user-agent') ?? undefined,
      ip: clientIp(request.headers),
    })

    return NextResponse.json({
      user: { phone: user.phone, fullName: user.fullName, role: user.role },
      isNewUser,
    })
  } catch (error) {
    console.error('[api/auth/otp/verify] خطای غیرمنتظره:', error)
    return NextResponse.json(
      { message: 'خطای غیرمنتظره‌ای رخ داد؛ لطفاً دوباره تلاش کنید.' },
      { status: 500 },
    )
  }
}
