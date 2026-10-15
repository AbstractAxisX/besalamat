/**
 * POST /api/auth/logout — خروج
 * سشن فعلی ابطال (revoke) و کوکی حذف می‌شود؛ حتی اگر سشنی وجود نداشت،
 * پاسخ موفق است تا کلاینت همیشه بتواند به حالت «خارج‌شده» برسد.
 */

import { NextResponse } from 'next/server'
import { revokeCurrentSession } from '@/server/session'

export async function POST() {
  try {
    await revokeCurrentSession()
    return NextResponse.json({ message: 'با موفقیت خارج شدید.' })
  } catch (error) {
    console.error('[api/auth/logout] خطای غیرمنتظره:', error)
    return NextResponse.json(
      { message: 'خطای غیرمنتظره‌ای رخ داد؛ لطفاً دوباره تلاش کنید.' },
      { status: 500 },
    )
  }
}
