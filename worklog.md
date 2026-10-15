# Worklog — پروژه «بسلامت» (White-label Shop)

---
Task ID: 0
Agent: orchestrator (main)
Task: گیت تحلیل استراتژیک (بخش ۳ مشخصات) — ارائه Prisma Schema + تصمیم‌های ۳.۴ + توقف برای تأیید کاربر، پیش از نوشتن هر خط کد در پروژه

Work Log:
- اکتشاف محیط: Next.js 16.1.1 + React 19 + TS5 + Tailwind4 + ۴۸ کامپوننت shadcn/ui؛ نصب‌شده: dnd-kit، vaul، cmdk، input-otp، sonner، recharts، TanStack Table، embla، framer-motion، rhf، zod4، next-themes، zustand، react-query، sharp؛ dev server فعال روی 3000 (HTTP 200)؛ Prisma 6.11 + SQLite؛ .env.example وجود ندارد
- طراحی Schema کامل ۲۵ مدل (۲۱ مدل مطابق فهرست کاربر + ۴ افزودنی: Session، PaymentTransaction، ProductSpec، MessageOutbox)
- پروب اعتبارسنجی Schema در سندباکس دورانداخت (/home/z/.probe-sandbox) با `prisma db push` → موفق کامل (enum روی SQLite پشتیبانی می‌شود) → سندباکس پاک شد؛ پروژه دست‌نخورده ماند
- تحلیل چهار تصمیم ۳.۴ (سشن، ذخیره OTP، کتابخانه جلالی، گالری زوم) با معیارهای هفت‌گانه
- طراحی جریان‌های کلیدی (قیف خرید، OTP، خبرم‌کن، ایمیل)، گلوگاه‌ها و ۹ سناریوی فروپاشی با پیام‌های فارسی

Stage Summary:
- خروجی گیت تحلیل در پاسخ چت ارائه شد؛ منتظر تأیید کاربر برای شروع فاز ۱ (Design System + اسکلت)
- تصمیم‌های پیشنهادی برای تأیید: سشن=DB+کوکی httpOnly | OTP=جدول DB با hash+pepper | تاریخ=date-fns-jalali | گالری=yet-another-react-lightbox | موجودی=رزرو اتمیک هنگام ثبت سفارش + انقضای ۳۰ دقیقه‌ای + بازگردانی | درایور ترب با حالت sandbox برای تست پذیرش + TODO کلید واقعی (مطابق فرض ۳ کاربر) | SQLite اینجا، پرتابل خالص به PG/MySQL
- کتابخانه‌های نیازمند نصب در فازهای بعد: date-fns-jalali، yet-another-react-lightbox، react-dropzone، @tiptap/core+extensions+react، nodemailer
- هیچ کد پروژه‌ای نوشته نشده است؛ dev server روی 3000 فعال است
