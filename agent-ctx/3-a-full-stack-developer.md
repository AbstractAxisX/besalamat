# Task 3-a — full-stack-developer — زیرساخت داده «بسلامت» (فاز ۲)

تاریخ: ۲۰۲۶-۱۰-۱۵ | وضعیت: ✅ کامل و تست‌شده

## خلاصهٔ کار

زیرساخت دادهٔ نهایی پروژه: Prisma Schema (۲۵ مدل + ۷ enum)، Seed کامل idempotent، سرویس تنظیمات با کش، استان‌های ایران و ۳۹ پلیس‌هولدر SVG.

## فایل‌های تحویلی

| فایل | توضیح |
|---|---|
| `prisma/schema.prisma` | عیناً مطابق گیت (۲۵ مدل + ۷ enum: UserRole, OtpPurpose, OrderStatus, ShippingMethod, PayTxStatus, OutboxChannel, OutboxStatus) |
| `prisma/seed.ts` | Seed کامل با PrismaClient اختصاصی (global guard) + `normalizeSearchText` |
| `src/server/settings.ts` | `getSetting<T>` / `getSettingsByPrefix` / `setSetting` / `invalidateSettingsCache` — کش Map + TTL 60s |
| `src/lib/provinces.ts` | ۳۱ استان + شهرهای واقعی + `PROVINCE_NAMES` |
| `scripts/gen-placeholders.ts` | تولید ۳۹ SVG بدون متن (bun run assets:generate) |
| `public/placeholders/*.svg` | product-1..15-{a,b}, slide-1..3, banner-1..2, article-1..3, og-default |
| `package.json` | دو اسکریپت: `db:seed`، `assets:generate` |

## وضعیت اجراها (همه ✅)

- `bun run db:push` → ۲۵ جدول در `db/custom.db`؛ کلاینت regenerate شد. enum روی SQLite کار می‌کند.
- `bun scripts/gen-placeholders.ts` → ۳۹ فایل؛ اعتبارسنجی ساختاری (svg/xmlns/بدون text) پاس.
- `bun run db:seed` × ۲ → idempotent اثبات شد (شمارش یکسان، بدون خطا).
- `bun run lint` → پاک. `tsc --noEmit` → فقط خطاهای ازپیش‌موجود examples/ و skills/ (مال این فاز نیست).

## شمارش رکوردهای seed

دسته ۴۲ (۹ والد + ۳۳ فرزند) | برند ۶ | محصول ۱۵ | تنوع ۱۰ (TG300=۳، ویلچر=۳، کمربند=۴) | تصویر ۳۰ | مشخصات ۶۱ | اسلاید ۳ | بنر ۲ | بخش هوم ۸ | دستهٔ مقاله ۲ | مقاله ۳ | سوال متداول ۶ | تنظیمات ۳ | واژهٔ پرجستجو ۶ | user/session/order/payment و… = ۰

## نکته‌های مهم برای ایجنت‌های بعدی

1. **مقادیر Setting خام JSON هستند** — `Setting.value` مثل `"45000"` یا `"\"https://…\""` است. برای خواندن حتماً `src/server/settings.ts#getSetting` را صدا بزنید یا JSON.parse کنید.
2. **searchText نرمال‌شده است** — ي/ك عربی تبدیل شده و حروف انگلیسی lowercase هستند (مثل `tg 300`). جست‌وجو باید همین نرمال‌سازی را روی query کاربر هم اعمال کند (تابع در `prisma/seed.ts` هست؛ در فاز ۳ به یک lib مشترک منتقل شود).
3. **stock محصول تنوع‌دار = مجموع موجودی variantها** (TG300=10، ویلچر=5، کمربند=18). قیمت product = قیمت variant پیش‌فرض.
4. **createdAt محصولات** پخش خطی روی ۶۰ روز است (محصول ۱۵ = امروز)؛ isNew دستی روی FT90/BS430 ست شده.
5. **گلیف پلیس‌هولدر هر محصول** بر اساس دستهٔ والدش انتخاب شده (نگاشت در `PRODUCT_GLYPHS` داخل gen-placeholders.ts).
6. اسلایدها RTL طراحی شده‌اند — عناصر بصری سمت چپ، فضای متن سمت راست خالی.
7. SB210 (پالس اکسیمتر) عمداً stock=0 و isActive=true است — سناریوی «خبرم‌کن» را با آن تست کنید.
8. برای بازسازی دارایی‌های تصویری: `bun run assets:generate` (idempotent — خروجی deterministic).
9. `PROVINCE_NAMES` برای Select استان و `IRAN_PROVINCES` برای شهرها (فرم ارسال فاز ۴).
10. تنظیمات seed شده فقط ۳ کلید دارد: `order.sequence` (اولین سفارش = BS-10234)، `shipping.cost`، `store.mapEmbedUrl` — بقیهٔ store.* باید از `src/config/brand.ts` fallback شوند.
