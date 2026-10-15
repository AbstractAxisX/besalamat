import { NextRequest, NextResponse } from 'next/server'

// فارسی — این لایه فقط «گارد اولیهٔ وجود کوکی سشن» است، نه بیش از آن:
// اگر کوکی bs_session وجود نداشت، صفحات و APIهای ادمین اصلاً وارد روتینگ نمی‌شوند.
// middleware روی Edge اجرا می‌شود؛ به همین دلیل عمداً هیچ import از db یا crypto
// در این فایل نیست. نقش ADMIN به‌صورت عمیق در لایهٔ سرور (layout و route handlerهای
// ادمین — فاز ۶) با getSessionUser و چک role بررسی می‌شود.
const SESSION_COOKIE = 'bs_session'

export function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  if (token !== undefined && token.length > 0) {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl

  // APIهای ادمین: پاسخ JSON با 401 (بدون ریدایرکت — کلاینت خودش تصمیم می‌گیرد)
  if (pathname === '/api/admin' || pathname.startsWith('/api/admin/')) {
    return NextResponse.json({ message: 'دسترسی غیرمجاز' }, { status: 401 })
  }

  // صفحات ادمین: هدایت به ورود با نشانهٔ admin و مسیر مقصد برای بازگشت
  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('admin', '1')
  loginUrl.searchParams.set('next', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
