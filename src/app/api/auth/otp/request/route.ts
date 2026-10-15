/**
 * POST /api/auth/otp/request — درخواست کد یک‌بارمصرف
 *
 * مسیر: zod → normalizePhone → گارد ADMIN (whitelist) → requestOtp (سقف‌ها)
 * همهٔ خطاها فارسی و راه‌حل‌دار هستند؛ جزئیات فنی فقط در console سرور.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { normalizePhone } from '@/lib/format'
import { getAdminPhoneWhitelist, requestOtp } from '@/server/otp'
import { clientIp } from '@/server/rate-limit'

const INVALID_PHONE_MESSAGE = 'شمارهٔ موبایل معتبر نیست. نمونهٔ صحیح: ۰۹۱۲۳۴۵۶۷۸۹'

const bodySchema = z.object({
  phone: z
    .string()
    .min(8, { message: INVALID_PHONE_MESSAGE })
    .max(20, { message: INVALID_PHONE_MESSAGE }),
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

    // ورود ادمین فقط برای whitelist شماره‌ها؛ بقیه حتی کد ADMIN هم نمی‌گیرند
    if (parsed.data.purpose === 'ADMIN' && !getAdminPhoneWhitelist().includes(phone)) {
      return NextResponse.json(
        { message: 'این شماره به پنل مدیریت دسترسی ندارد.' },
        { status: 403 },
      )
    }

    const result = await requestOtp(phone, parsed.data.purpose, clientIp(request.headers))

    if (!result.ok) {
      return NextResponse.json(
        { message: result.message, retryAfterSec: result.retryAfterSec },
        {
          status: result.status,
          headers: { 'Retry-After': String(result.retryAfterSec) },
        },
      )
    }

    return NextResponse.json({
      message: 'کد تأیید پیامک شد',
      expiresInSeconds: result.expiresInSeconds,
      devMode: process.env.SMS_DEV_MODE === 'true',
      ...(result.devCode !== undefined ? { devCode: result.devCode } : {}),
    })
  } catch (error) {
    console.error('[api/auth/otp/request] خطای غیرمنتظره:', error)
    return NextResponse.json(
      { message: 'خطای غیرمنتظره‌ای رخ داد؛ لطفاً دوباره تلاش کنید.' },
      { status: 500 },
    )
  }
}
