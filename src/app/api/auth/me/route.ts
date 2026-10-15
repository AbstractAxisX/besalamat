/**
 * GET /api/auth/me — کاربر جاری از روی سشن (کوکی httpOnly)
 * 401 اگر ورود نکرده/سشن منقضی/ابطال/مسدود باشد.
 */

import { NextResponse } from 'next/server'
import { getSessionUser } from '@/server/session'

export async function GET() {
  try {
    const user = await getSessionUser()
    if (user === null) {
      return NextResponse.json({ message: 'وارد نشده‌اید.' }, { status: 401 })
    }
    return NextResponse.json({ user })
  } catch (error) {
    console.error('[api/auth/me] خطای غیرمنتظره:', error)
    return NextResponse.json(
      { message: 'خطای غیرمنتظره‌ای رخ داد؛ لطفاً دوباره تلاش کنید.' },
      { status: 500 },
    )
  }
}
