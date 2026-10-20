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

---
Task ID: 1-base
Agent: orchestrator (main)
Task: فاز ۱ — پایه Design System (توکن‌ها، برند، تایپ‌ها، ابزارها) پیش از واگذاری به ایجنت‌ها

Work Log:
- نصب: vazirmatn + date-fns-jalali + nodemailer + @types/nodemailer + embla-carousel-autoplay
- فونت Vazirmatn متغیر (۱۰۸KB) self-host در public/fonts/Vazirmatn-Variable.woff2 + لایسنس OFL
- globals.css بازنویسی کامل: دو تم روشن/تیره (سبز کاجی #0C3B2E→#14532D متالیک، طلایی #C9A24B، عاجی #F7F6F1؛ تیره: #0D1B16/#12241D/#E9EFEA/طلایی #D9B45F) + توکن‌های برند (gold/pine/success/warning/on-metallic) + یوتیلیتی‌ها: .shell .bg-metallic .gold-hairline .btn-metallic .card-luxe .card-lift .text-gold-gradient .scrollbar-none .mask-fade-x .pb-safe-nav + سایه‌های card/lift/pop + انیمیشن marquee + اسکرول‌بار نازک + color-scheme + prefers-reduced-motion
- src/config/brand.ts: پیکربندی کامل white-label (نام، تگ‌لاین، تماس، ساعت کاری، mapEmbedUrl، ۶ شبکه اجتماعی با SocialKey، orderNumberPrefix=BS، orderNumberBase=10234، متا)
- src/types/shop.ts: تمام DTOهای کلاینت (CategoryNode، ProductSummary/Detail، CartLine، HomeSection/Slide/Banner، Article، OrderStatus+LABELS+FLOW، SocialLink)
- src/lib/format.ts: toFa/toEnDigits/formatNumber(با ٬ فارسی)/formatToman/discountPercent/normalizePhone(+98, 0098, ارقام فارسی)/formatPhoneFa/formatOrderNumber(Fa) — تست‌شده با bun ✅
- src/lib/jalali.ts: faDate/faDateShort/faDateTime/faTime/faDateTick/faRelative روی date-fns-jalali با locale faIR — تست‌شده ✅ (تاریخ سیستم ۲۰۲۶-۱۰-۱۵ → ۲۳ مهر ۱۴۰۵ صحیح)
- src/lib/preview-data.ts (اولیه): ۹ دستهٔ اصلی با فرزندان (slugs)، ۶ برند، ۶ واژهٔ پرجستجو
- next.config.ts: dangerouslyAllowSVG برای پلیس‌هولدرهای SVG + حذف ignoreBuildErrors
- .env: OTP_PEPPER(تولید تصادفی)/OTP_TTL_SECONDS/ADMIN_PHONES/SMS_DRIVER=console/SMS_DEV_MODE=true/TOROB_MODE=sandbox/UPLOAD_DRIVER=local/SMTP_*
- db.ts: لاگ Prisma از query → error,warn
- برند: تلگرام/واتساپ/اینستاگرام با href پیش‌فرض '#' (نمایش اسکلت فاز ۱؛ ادمین بعداً بازنویسی می‌کند)

Stage Summary:
- پایه دیزاین‌سیستم آماده؛ همهٔ ایجنت‌های بعدی باید فقط از همین توکن‌ها/یوتیلیتی‌ها استفاده کنند (لیست کامل در بریف هر ایجنت)
- مسیر فایل‌های مرجع: src/app/globals.css، src/config/brand.ts، src/types/shop.ts، src/lib/format.ts، src/lib/jalali.ts، src/lib/preview-data.ts
- آیتم‌های تحویل فعلی: فونت، توکن‌ها، brand، تایپ‌ها، ابزارها — هنوز هیچ کامپوننتی ساخته نشده

---
Task ID: 2-b
Agent: frontend-styling-expert
Task: قاب سایت «بسلامت» (Layout Chrome) — هدر سه‌سطری با مگامنو، فوتر متالیک، منوی تمام‌صفحهٔ موبایل، ناوبری پایین، دارایی‌های برند، استور سبد خرید و بازنویسی layout.tsx
Work Log:
- src/store/cart.ts: zustand+persist (bs-cart) با addLine (merge+clamp به maxQty)/setQty/removeLine/clear + partialize فقط lines؛ هلپرهای خالص cartCount و cartSubtotal؛ بدون «use client»
- src/components/shared/brand-assets.tsx: LogoMark (حلقهٔ طلایی stroke 1.3 + درخت سرو سه‌لایهٔ chevron با نوک طلایی، هندسهٔ مشترک با Watermark)، Logo (light برای فوتر)، Pattern (تایل ۹۶×۹۶ با useId)، Watermark (outline strokeWidth 0.6)، GoldDivider (دو گرادیان محوشونده + لوزی ۶px) — فایل کلاینت شد به‌خاطر useId در Pattern؛ در فوترِ سروری بدون مشکل مصرف می‌شود
- src/components/layout/theme-toggle.tsx: dark:hidden/hidden dark:flex (بدون mismatch) + چرخش ظریف framer با key=resolvedTheme
- src/components/layout/header.tsx: سه سطر (اعلان+تلفن/هویت+جستجو pill+اکشن‌ها/مگامنو+لینک‌ها)؛ مگامنو NavigationMenu با viewport=false و لنگر منطقی start-0 (RTL) + عرض ۳۷.۵→۴۳rem + rounded-b-xl!/shadow-pop! برای غلبه به استایل variant شادکن؛ hairline طلایی بالای پنل؛ Badge سبد با bump فریمری (scale 1→1.25→1, key=lastAddedAt) فقط بعد از mount
- src/components/layout/mobile-menu.tsx: AnimatePresence ورود از راست (x:100%→0, 0.28s)، قفل اسکرول، Escape، لینک‌های staggered (delay i×0.04)، Accordion دسته‌ها با «همهٔ {title}»
- src/components/layout/bottom-nav.tsx: گرید ۴ ستونه h-16 + نشانگر طلایی مشترک layoutId="bottom-nav-active" (spring) + aria-current و Badge فارسی سبد بعد از mount
- src/components/layout/footer.tsx (Server): bg-metallic + Pattern طلایی ۵٪ + gold-hairline؛ ۴ ستون (برند+شبکه‌ها/دسترسی سریع/دسته‌های پرطرفدار/اطلاعات فروشگاه)؛ نوار پایین با © سالِ toFa(getFullYear())
- src/app/layout.tsx: حذف Geist، html lang=fa dir=rtl، preload فونت وزیرمتن در head، فاویکون /logo.svg، ThemeProvider(class/light/enableSystem=false)، skip-link، ساختار flex min-h-dvh + جای‌گذار h-16 موبایل، Toaster sonner (position top-center, dir rtl, richColors, closeButton) — sonner.tsx بدون تغییر (props را spread می‌کند)
- public/logo.svg: با نشان درخت سروِ برند بازنویسی شد (فایل قبلی لوگوی Z.ai اسکفولد بود و به‌عنوان فاویکون «بسلامت» خطای بصری محسوب می‌شد) — همان مسیر /logo.svg مطابق بریف
- رفع خطای react-hooks/set-state-in-effect: الگوی mounted با useSyncExternalStore (سرور/هایدریشن false، بعد از commit true) در هدر و ناوبری پایین
- ESLint: پاک (exit 0)؛ tsc: فقط examples/ و skills/ (اسکفولد غیرپروژه‌ای) خطا دارند — دست نخورده؛ dev.log: بدون خطای کامپایل، GET / 200؛ مسیرهای /products و /cart و… هنوز 404 (وظیفهٔ فازهای بعد)

Stage Summary:
- تصمیم بصری ۱ — نشان برند: حلقهٔ طلایی ظریف + سه شاخهٔ chevron بالارونده با نوک طلایی روی سبز کاجی؛ هندسهٔ یکجا در LogoMark/Watermark/فاویکون تا هویت در هر مقیاس (۴۰px تا واترمارک غول‌پیکر) یکسان بماند
- تصمیم بصری ۲ — مگامنو: به‌جای viewport رادیکسی (که در RTL به لبهٔ فیزیکی چپ لنگر می‌شود و از صفحه بیرون می‌زند)، پنل استاتیک با لنگر منطقی start-0 + max-w محافظ؛ سایه/گردایی با importantهای Tailwind v4 (rounded-b-xl!/shadow-pop!) روی استایل‌های variant کتابخانه‌ای چفت شد
- تصمیم بصری ۳ — فوتر متالیک با پترن طلایی ۵٪ (دو مربع چرخیده + ربع‌دایره‌های گوشه) و hairline طلایی؛ متن‌ها on-metallic-muted و تنها سرستون‌ها/آیکون‌ها طلایی — حس رولکسی با whitespace سخاوتمندانه py-14
- فایل‌ها: store/cart.ts، shared/brand-assets.tsx، layout/{theme-toggle,header,mobile-menu,bottom-nav,footer}.tsx، app/layout.tsx، public/logo.svg — همهٔ رنگ‌ها توکنی، اعداد فارسی، بدون any
- وضعیت lint: پاک؛ dev.log: پاک؛ آماده برای فاز بعد (صفحات اصلی)

---
Task ID: 3-a
Agent: full-stack-developer
Task: فاز ۲ — زیرساخت داده: Prisma نهایی (۲۵ مدل + ۷ enum) و Seed کامل «بسلامت» + سرویس تنظیمات + استان‌ها + پلیس‌هولدرهای SVG

Work Log:
- `prisma/schema.prisma` عیناً مطابق گیت نوشته شد (۲۵ مدل، ۷ enum) → `bun run db:push` موفق؛ کلاینت Prisma regenerate شد؛ ۲۵ جدول در `db/custom.db` ساخته شد (پشتیبانی enum روی SQLite عملاً تأیید شد)
- `scripts/gen-placeholders.ts` (bun، بدون وابستگی) → ۳۹ SVG لوکسِ **بدون متن** در `public/placeholders/`: product-1..15-{a,b}.svg (۸۰۰×۸۰۰؛ گرادیان عاجی #F7F6F1→سبز روشن #E9F3EC، پترن ستارهٔ هشت‌پر opacity 0.03، حلقهٔ طلایی r≈250، ۹ گلیف خطی دسته با stroke #0C3B2E و سو۳، لوزی طلایی گوشه؛ نسخهٔ b با آفست/چرخش/گرادیان آینه‌ای)، slide-1..3.svg (۱۶۰۰×۷۲۰ متالیک #0C3B2E→#14532D، قوس/حلقهٔ نیمه‌شفاف + شاخهٔ سرو خطی + هالهٔ نور سمت چپ — نیمهٔ راست برای متن خالی)، banner-1..2.svg (۹۶۰×۴۰۰ تناژ روشن + گلیف ماسک/ارتوپدی)، article-1..3.svg (۱۲۰۰×۸۰۰ گلیف بزرگ کم‌رنگ + پترن)، og-default.svg (درخت سرو مینیمال داخل حلقهٔ طلایی) — همه با xmlns، shape-rendering=geometricPrecision و pattern تایل در defs؛ سه ترکیب‌بندی متفاوت برای اسلایدها
- `prisma/seed.ts`: PrismaClient اختصاصی با global guard (log: error,warn)؛ `normalizeSearchText` (ي/ك→ی/ک، فشرده‌سازی نیم‌فاصله‌های تکراری و فاصله‌ها، lowercase) → searchText هر محصول = normalize(عنوان + برند)
- دادهٔ seed: درخت ۹ دستهٔ والد (seoTitle=«خرید {عنوان} | قیمت و انواع» + seoDescription اختصاصی هرکدام) + ۳۳ فرزند = ۴۲؛ ۶ برند؛ ۱۵ محصول دقیقاً طبق بریف (TG300/ویلچر/کمربند تنوع‌دار = ۱۰ variant با پیش‌فرض درست، stock محصول = مجموع تنوع‌ها؛ هر محصول ۲ تصویر a/b + ۳-۵ spec؛ createdAt پخش خطی از ۶۰ روز پیش تا امروز؛ SB210 ناموجود با «به‌زودی موجود می‌شود»؛ isNew برای FT90/BS430 و isFeatured برای M2/ویلچر/BS430)؛ ۳ اسلاید + ۲ بنر + ۸ بخش هوم؛ ۲ دستهٔ مقاله + ۳ مقالهٔ منتشرشده با محتوای فارسی واقعی (h2 + ul/li، publishedAt = ۲۰/۱۲/۵ روز پیش)؛ ۶ سوال متداول؛ ۳ تنظیم JSON (order.sequence=10234، shipping.cost=45000، store.mapEmbedUrl همان brand.ts)؛ ۶ واژهٔ پرجستجو
- idempotency اثبات شد: دو اجرای متوالی بدون خطا و شمارش یکسان — upsert روی slug/key/term؛ deleteMany+create برای Slide/Banner/Faq (بدون کلید یونیک) و فرزندان Product (تصاویر/مشخصات/تنوع‌ها)
- `src/server/settings.ts`: getSetting<T> (JSON.parse با try/catch→fallback؛ کش Map+TTL 60s شامل عدم-وجود)، getSettingsByPrefix (مقدار خام بدون parse)، setSetting (upsert + JSON.stringify + بی‌اعتبارسازی همان کلید و کش‌های پیشوندی)، invalidateSettingsCache — تست runtime کامل پاس شد (fallback / JSON خراب / خواندن پس از نوشتن)
- `src/lib/provinces.ts`: هر ۳۱ استان بدون تکرار (شامل خراسان شمالی/جنوبی که در فهرست نمونهٔ بریف جا افتاده بود) با شهرهای واقعی (۸-۱۲ شهر؛ قم ۶ شهر واقعی) + PROVINCE_NAMES — با اسکریپت validate شد (۳۱/بدون تکرار/بدون شهر خالی)
- `package.json`: فقط دو اسکریپت اضافه شد: `db:seed` و `assets:generate`
- اصلاح جزئی gen-placeholders: import.meta.dir → process.cwd (سازگاری tsc)؛ regeneration مجدد ۳۹ فایل

Stage Summary:
- فایل‌ها: prisma/schema.prisma، prisma/seed.ts، src/server/settings.ts، src/lib/provinces.ts، scripts/gen-placeholders.ts، public/placeholders/ (۳۹ SVG)، package.json (۲ اسکریپت)
- وضعیت اجراها: db:push ✅ (۲۵ جدول) | assets:generate ✅ (۳۹ SVG، اعتبارسنجی ساختاری همه پاس) | db:seed ✅ دوبار (idempotent) | lint ✅ بدون خطا/هشدار | tsc ✅ فقط خطاهای ازپیش‌موجود examples/ و skills/ (خارج از این فاز) | dev.log سالم — ۴۰۴های /products، /cart، /login و… طبیعی است چون routeها در فاز ۳ ساخته می‌شوند
- شمارش seed: دسته ۴۲ (۹+۳۳) | برند ۶ | محصول ۱۵ | تنوع ۱۰ | تصویر ۳۰ | مشخصات ۶۱ | اسلاید ۳ | بنر ۲ | بخش هوم ۸ | دستهٔ مقاله ۲ | مقاله ۳ | سوال متداول ۶ | تنظیمات ۳ | واژهٔ پرجستجو ۶ | جداول عملیاتی (user/session/order/payment و…) ۰
- نکته برای فاز ۳: مقدار Settingها رشتهٔ JSON خام است (باید parse شود یا از src/server/settings.ts استفاده شود)؛ product.stock محصولات تنوع‌دار = مجموع موجودی variantها؛ URL تصاویر DB همگی در /placeholders/*.svg موجود و با next.config فعلی (dangerouslyAllowSVG) قابل استفاده‌اند

---
Task ID: 2-c1
Agent: frontend-styling-expert
Task: فاز ۱ پایهٔ صفحات هوم — دادهٔ پیش‌نمایش (آینهٔ seed) + SectionHeading + ProductCard/Skeleton + ProductGrid

Work Log:
- خواندن کامل worklog و منابع پایه (globals.css، brand.ts، shop.ts، format.ts، brand-assets.tsx، seed.ts با ۱۰۹۹ خط، header.tsx برای قرارداد کد)
- src/lib/preview-data.ts — فقط افزودن (۹ دسته/۶ برند/۶ پرجستجو دست‌نخورده): واردات DTO جدید + discountPercent؛ ۱۵ ردیف محصول عیناً از seed (قیمت/comparePrice/totalStock/تنوع‌ها/specs/shortDescription/description HTML/دستهٔ فرزند+والد)؛ id ها slug-محور (p-<slug>، pv-<slug>-n، a-<slug>)؛ تصویر از جایگاه seed: product-{1..15}-{a,b}.svg؛ toProductSummary هلپر → PREVIEW_PRODUCTS (15) و PREVIEW_PRODUCT_DETAILS (Record بر ۱۵ اسلاگ، با satisfies ProductDetail)؛ PREVIEW_SLIDES (3) / PREVIEW_BANNERS (2، href=?category=) / PREVIEW_HOME_SECTIONS (8) / PREVIEW_ARTICLES (3، publishedAt با daysAgoIso در زمان ماژول: ۲۰/۱۲/۵ روز پیش) / PREVIEW_ARTICLE_DETAILS (3)؛ PRODUCT_TABS + ProductTabKey + getPreviewProductsByTab — bestseller ترتیب دستی ۸تایی بریف، new با isNew اول (FT90/BS430) سپس تازه‌ترین createdAt (ایندکس بالاتر = جدیدتر، آینهٔ پخش خطی seed) تا ۸تا، discount فقط comparePrice!=null مرتب نزولی بر اساس درصد تخفیف — فقط ۵ مورد (seed بیش از این ندارد؛ تب عین داده است)
- src/components/shared/section-heading.tsx (Server): h2 font-black + subtitle + Link «مشاهدهٔ همه» (hrefLabel اختیاری، پیش‌فرض «مشاهدهٔ همه») با ArrowLeft size-4 text-gold→gold-strong + .gold-hairline mt-5 + mb-8 md:mb-10
- src/components/product/product-card.tsx (Server، بدون state): کل کارت Link به /products/{slug} با card-luxe card-lift + رینگ طلایی focus-visible (توکن ring) + بوم تصویر bg-white با Image fill/object-contain/zoom 1.04 در 300ms؛ بج‌ها (٪تخفیف طلایی/جدید/ناموجود) در top-3 start-3؛ ناموجود: تصویر opacity-40 grayscale + بج secondary + «به‌زودی موجود می‌شود» text-warning؛ قیمت‌ها formatTomanPlain با خط‌خوردگی destructive/60 روی comparePrice؛ ProductCardSkeleton هم‌ساختار (Skeleton aspect-square rounded-t-2xl + بدنه)
- src/components/product/product-grid.tsx (Server): grid-cols-2 → md:3 → xl:4؛ سه حالت: کارت‌ها / loading (skeletonCount پیش‌فرض ۸) / خالی (col-span-full + آیکون Search opacity-40 + «محصولی یافت نشد»)
- اعتبارسنجی: bun runtime روی ماژول داده (۱۵/۱۵، اسلاگ‌ها، تنوع‌ها، totalStock=مجموع، تب‌ها) + اسموک‌تست موقت با route واقعی در dev server (curl HTTP 200): بج‌های ٪۱۱/٪۲۲/٪۱۷، قیمت‌های فارسی، خط‌خوردگی، empty-state، اسکلت‌ها؛ route آزمایشی حذف شد (نکته: پوشه‌های با پیشوند _ در App Router خصوصی‌اند و route نمی‌شوند — با نام smoke-check تست شد)
- ESLint: exit 0 بدون خطا/هشدار؛ tsc: فقط examples/ و skills/ (ازپیش‌موجود، خارج از پروژه)؛ dev.log: پاک (۴۰۴های موقت __smoke ناشی از پوشهٔ خصوصی آزمایشی بود)

Stage Summary:
- تصمیم بصری ۱ — کارت محصول: بوم تصویر bg-white جدا از بدنه (الگوی لوکس فروشگاه‌های تجهیزات پزشکی؛ خوانایی SVG روی سفید در هر دو تم) + تنها لمسهٔ طلایی، بج درصد تخفیف ٪نفرسِ округل؛ قیمت درشت extrabold سبز کاجی و واژهٔ «تومان» ریز خاموش — اعداد همیشه فارسی (formatTomanPlain/toFa) و عنوان min-h-12 line-clamp-2 تا ارتفاع کارت‌ها در گرید یکنواخت بماند
- تصمیم بصری ۲ — سرِ بخش: مینیمال بدون overline؛ عنوان font-black + زیرعنوان خاموش + لینک «مشاهدهٔ همه» طلایی (تنها المان رنگی) و hairline طلایی محوشونده در دو طرف زیر کل سِت — ریتم طلایی حداکثر ۳ لمسه در viewport (بج تخفیف + لینک + hairline)
- تصمیم بصری ۳ — تب‌ها: new = پرچم‌داران isNew (FT90/BS430) اول و بعد تازه‌ترین‌ها (آینهٔ createdAt خطی seed)؛ discount = مرتب نزولی بر اساس درصد تخفیف (٪۲۲ ماسک صدرنشین) — مستند در JSData؛ تب discount عیناً ۵ محصول دارد چون seed فقط ۵ comparePrice دارد (درج دادهٔ صوری ممنوع)
- فایل‌ها: src/lib/preview-data.ts (گسترش)، src/components/shared/section-heading.tsx، src/components/product/product-card.tsx، src/components/product/product-grid.tsx — همه Server Component، بدون any، رنگ فقط توکنی، transition 200-300ms، alt فارسی، اعداد فارسی
- وضعیت lint: پاک (exit 0) | tsc: پاک به‌جز examples/ و skills/ ازپیش‌موجود | dev.log: سالم
- آماده برای 2-c2 (صفحهٔ هوم): مصرف مستقیم PREVIEW_HOME_SECTIONS برای ترتیب ردیف‌ها + SectionHeading/ProductGrid/getPreviewProductsByTab؛ جزئیات محصول/مقاله با PREVIEW_PRODUCT_DETAILS[slug] / PREVIEW_ARTICLE_DETAILS[slug]

---
Task ID: 3-c
Agent: full-stack-developer
Task: فاز ۲ — درایورهای پیامک (console/kavenegar/smsir/mellipayamak) و درایور پرداخت ترب (sandbox/live) با قرارداد ثابت برای ایجنت 3-b

Work Log:
- `src/server/drivers/sms/types.ts`: SmsSendResult/SmsDriver عیناً مطابق قرارداد بریف — قاعدهٔ طلایی در سرآیند: هیچ درایوری throw نمی‌کند
- `sms/console.ts`: ConsoleSmsDriver — لاگ خوانا `[SMS] to=... text=...`، همیشه ok:true؛ sendOtp با متن «کد تأیید شما: {code} — اعتبار {ttl} ثانیه»
- `sms/kavenegar.ts`: send → POST sms/send.json (فرم receptor+message)؛ sendOtp → POST verify/lookup.json (فرم receptor+token+template=env KAVENEGAR_OTP_TEMPLATE)؛ پاسخ {return:{status,message},entries:[{messageid}]} با status===200؛ بدون کلید → ok:false «کلید کاوه‌نگار تنظیم نشده است» (بدون throw)؛ TODO فارسی روشن برای کلید/قالب از پنل؛ TTL در قالبِ پنل مدیریت می‌شود
- `sms/smsir.ts`: send → POST v1/send/bulk (lineNumber/messageText/mobiles)؛ sendOtp → POST v1/send/verify (mobile/templateId عددی/parameters با CODE)؛ هدر Authorization: Bearer env SMSIR_API_KEY؛ پاسخ status===1 → موفق، data[0].id → providerId؛ envها: SMSIR_API_KEY/SMSIR_OTP_TEMPLATE_ID/SMSIR_LINE_NUMBER؛ بدون کلید → ok:false
- `sms/mellipayamak.ts`: POST rest.payamak-panel.com/api/SendSMS/SendSMS (فرم username/password/to/from/text)؛ RetStatus===1 → موفق، Value → providerId؛ sendOtp با متن استاندارد OTP + TODO برای سرویس کد تأیید اختصاصی پنل؛ envها: MELLIPAYAMAK_USERNAME/PASSWORD/FROM؛ بدون اطلاعات → ok:false
- `sms/index.ts`: getSmsDriver() بر اساس env SMS_DRIVER (case-insensitive/trim): 'kavenegar'|'smsir'|'mellipayamak' → همان؛ پیش‌فرض/هر چیز دیگر → ConsoleSmsDriver؛ re-export typeها
- `payment/types.ts`: پنج تایپ قرارداد (CreatePaymentInput/Result، VerifyPaymentInput، VerifyPaymentOutcome، PaymentDriver) عین بریف — نکته: بریف ۹ فایل را فهرست کرده بود ولی سرآیند قرارداد payment/types.ts را هم صراحتاً مسیردهی می‌کرد و 3-b از همین مسیر import می‌کند؛ فایل ساخته شد (مجموع ۱۰ فایل)
- `payment/torob.ts`: TorobPaymentDriver — SANDBOX (پیش‌فرض، TOROB_MODE≠live): create → authority='sbx_'+randomUUID() و redirectUrl=/payment/sandbox?authority=…&order=… (قرارداد صفحهٔ شبیه‌ساز فاز ۴ در کامنت مستند شد)؛ verify stateless → شامل '_fail' → FAILED «پرداخت از سوی شبیه‌ساز لغو شد»؛ وگرنه VERIFIED با refId=`SBX-${Date.now().toString(36).toUpperCase()}` (انگلیسی) و cardPan='6037-99**-****-1234' و raw={sandbox:true} — LIVE: create/verify با fetch به TOROB_CREATE_URL/TOROB_VERIFY_URL (پیش‌فرض api.torob.com/v1/payment/…) با هدر Bearer TOROB_API_KEY + X-Merchant-Id؛ verify محافظه‌کارانه (فقط با علامت موفقیت صریح OK/SUCCESS/VERIFIED/200 → در غیر این صورت FAILED)؛ خطای شبکه → reason «ارتباط با درگاه برقرار نشد»؛ خطای create در live → authority/redirectUrl خالی + console.error (قرارداد برای فراخواننده مستند شد)؛ uuid از import { randomUUID } from 'crypto'
- `payment/index.ts`: getPaymentDriver() فعلاً همیشه TorobPaymentDriver (کامنت: درایورهای آینده با env PAYMENT_DRIVER)؛ re-export همهٔ typeها
- `payment/README-drivers.md`: راهنمای فارسی — قاعدهٔ no-throw، جریان create→callback→verify، قرارداد sandbox و نحوهٔ تست _fail، جدول envهای live ترب + قراردادهای خطا، چک‌لیست ۶ موردی اتصال واقعی ترب (TODOها)، جدول envهای سه درایور پیامک، اسنیپت تست سریع bun
- همهٔ fetchها: AbortSignal.timeout(10_000) + try/catch، پاسخ خام unknown (بدون any/as any — پیمایش با type guard محلی asRecord/readString در هر فایل)، ابزارک‌ها در همان فایل (بدون فایل اشتراکی اضافی خارج فهرست تحویل)
- تست runtime با bun -e (خروجی واقعی): console sendOtp → لاگ `[SMS] to=09121234567 text=کد تأیید شما: 482913 — اعتبار 120 ثانیه` + ok:true | kavenegar بدون کلید → ok:false «کلید کاوه‌نگار تنظیم نشده است» | sandbox create → {authority:'sbx_a135e50b-…', redirectUrl:'/payment/sandbox?authority=…&order=BS10234'} | verify موفق → VERIFIED refId='SBX-MV9IR2TI' cardPan='6037-99**-****-1234' raw={sandbox:true} | verify با _fail → FAILED «پرداخت از سوی شبیه‌ساز لغو شد»

Stage Summary:
- فایل‌ها (۱۰): src/server/drivers/sms/{types,console,kavenegar,smsir,mellipayamak,index}.ts + src/server/drivers/payment/{types,torob,index}.ts + payment/README-drivers.md
- وضعیت: lint ✅ exit 0 بدون خطا/هشدار | tsc ✅ فقط خطاهای ازپیش‌موجود examples/ و skills/ | dev.log ✅ بدون خطا — و 3-b هم‌اکنون در حال مصرف درایورهاست (POST /api/auth/otp/request و /verify هر دو 200 با لاگ [SMS] فرمت قرارداد)
- قرارداد ثابت برای 3-b: getSmsDriver()/getPaymentDriver() از index هر پوشه؛ typeها هم از types.ts هم از index قابل import؛ هیچ متدی هرگز throw نمی‌کند؛ sandbox: redirectUrl='/payment/sandbox?authority=…&order=…' و _fail = سناریوی شکست؛ live create ناموفق → authority خالی (خروجی را قبل از redirect بررسی کنید)
- TODOهای باقی (فارسی، داخل کد + README): کلیدهای واقعی کاوه‌نگار/پیام‌رسان/ملی‌پیامک از پنل؛ آدرس/بدنه/هدر/فیلدهای endpointهای زندهٔ ترب طبق مستندات؛ صفحهٔ شبیه‌ساز /payment/sandbox در فاز ۴ ساخته می‌شود

---
Task ID: 3-b
Agent: full-stack-developer
Task: فاز ۲ — هستهٔ احراز هویت: OTP (هش+pepper+TTL+سقف تلاش)، سشن DB با کوکی httpOnly، چهار API احراز هویت و گارد اولیهٔ ادمین (middleware)
Work Log:
- `src/server/rate-limit.ts`: fixed-window در-حافظه با Map روی globalThis (مقاوم به هات‌ریلود)؛ rateLimit(key, limit, windowMs) → {allowed, retryAfterSec}؛ سویپ تنبل وقتی Map > 5000 (حذف منقضی‌ها)؛ clientIp → اولین IP از x-forwarded-for وگرنه 'unknown' — تست واحد پاس: مجاز/رد/انقضای پنجره/سه‌IP
- `src/server/otp.ts`: requestOtp با سه سقف (۳ در ۱۰ دقیقه و ۵ در ساعت برای phone، ۱۰ در دقیقه برای IP) و پیام واحد محدودیت + retryAfterSec؛ کد ۵ رقمی randomInt، ذخیره فقط sha256(`${phone}:${code}:${PEPPER}`) — pepper از env OTP_PEPPER با fallback dev + console.warn یک‌بار (گارد globalThis)؛ TTL از OTP_TTL_SECONDS (fallback 120)؛ deleteMany کدهای منقضی (پاکسازی فرصت‌طلبانه) + deleteMany کدهای مصرف‌نشدهٔ قبلی همان phone+purpose (همیشه فقط یک کد فعال)؛ ارسال با getSmsDriver().sendOtp از '@/server/drivers/sms' (درایور T3-c آماده بود — اینترفیس عیناً مطابق قرارداد)؛ شکست ارسال → console.error فقط، خروجی ok:true می‌ماند و در dev (SMS_DEV_MODE=true) devCode برگردانده می‌شود؛ verifyOtp: آخرین کد فعال → غیبت (400)/انقضا (400)/attempts>=5 (429 + مصرف کد)/هش غلط (attempts++ و شمارش فارسی باقی‌مانده با toFa؛ رسیدن به ۵ = همان پیام قفل + مصرف)/درست (مصرف + ok)
- `src/server/session.ts`: token=randomBytes(32).base64url فقط در کوکی httpOnly (sameSite=lax, secure در production, path=/)؛ DB فقط sha256(token) با TTL ۳۰ روز کاربر / ۱۲ ساعت ادمین + userAgent + ipHash=sha256(ip)؛ getSessionUser با React cache() دودوپلیکت (کوکی→هش→findUnique include user→چک revokedAt/expiresAt/isBlocked→SessionUser)؛ revokeCurrentSession (updateMany revokedAt + حذف کوکی)؛ revokeAllUserSessions برای فازهای بعد
- APIها (همه zod + try/catch + پیام فارسی، خطای خام هرگز به کاربر نمی‌رسد): POST /api/auth/otp/request (نرمال‌سازی → گارد ADMIN با ADMIN_PHONES → 403 «این شماره به پنل مدیریت دسترسی ندارد.» → requestOtp → 200 «کد تأیید پیامک شد» با expiresInSeconds/devMode/devCode یا 429 با Retry-After header)؛ POST /api/auth/otp/verify (کد بعد از toEnDigits باید ^\d{5}$ → verifyOtp → upsert کاربر؛ کاربر جدید: role=ADMIN فقط با purpose=ADMIN+whitelist؛ کاربر موجود: ترفیع امن USER→ADMIN فقط با whitelist؛ isBlocked → 403 بدون سشن؛ lastLoginAt + createSession؛ خروجی {user{phone,fullName,role}, isNewUser})؛ POST /api/auth/logout (revokeCurrentSession → همیشه 200)؛ GET /api/auth/me (401 «وارد نشده‌اید.» یا {user} کامل با sessionId)
- `src/middleware.ts`: Edge-safe بدون db/crypto؛ matcher ['/admin/:path*', '/api/admin/:path*']؛ نبودِ کوکی bs_session → مسیر API: 401 JSON «دسترسی غیرمجاز»، مسیر صفحه: ریدایرکت /login?admin=1&next=<encoded>؛ کامنت فارسی: این فقط گارد اولیهٔ وجود کوکی است — چک عمیق نقش ADMIN در فاز ۶ (layout/handlerهای ادمین) با getSessionUser
- تست curl کامل (devMode فعال): request 09121112233 → 200 {devCode:90821, expiresInSeconds:120, devMode:true} | verify با 90821 → 200 {user:{phone,role:USER}, isNewUser:true} + Set-Cookie bs_session httpOnly | me → 200 با userId/role/sessionId | logout → 200 و me بعدش → 401 (ابطال فوری) | me بدون کوکی → 401 | شمارهٔ فارسی ۰۹۱۲۱۱۱۲۲۴۴ → نرمال شد و کد آمد | کد فارسی ۸۲۱۰۴ → تأیید شد (toEnDigits) | کد اشتباه → «…۴ تلاش باقی مانده.» | ۵ تلاش اشتباه → 429 قفل + مصرف (کد درست بعدش → «کدی ثبت نشده») | کد منقضی بعد از ۱۳۰ ثانیه → «مدت اعتبار کد به پایان رسیده…» | ۴ درخواست در ۱۰ دقیقه → 429 با retryAfterSec:600 + header retry-after | purpose=ADMIN بدون whitelist → 403 | با whitelist موقت (تست و بازگردانی env) → کاربر جدید ADMIN با سشن ۱۲ ساعته + ترفیع امن USER→ADMIN موجود (تأیید TTL در DB: 720h/12h) | میدل‌ور: /admin و /admin/orders → 307 به /login?admin=1&next=%2Fadmin… ، /api/admin/stats → 401 JSON، با کوکی → عبور از گارد (404 چون صفحات ادمین فاز ۶ است)
- پاکسازی: همهٔ کاربران/سشن‌ها/کدهای تست حذف شدند (DB like seed: 0 user/session/otp)؛ .env به ADMIN_PHONES= بازگشت؛ env هات‌ریلود Next dev («Reload env: .env») برای تست whitelist موقت استفاده شد
- نکتهٔ Next 16: dev.log هشدار «"middleware" file convention is deprecated. Please use "proxy" instead» — middleware.ts هنوز کاملاً کار می‌کند (تست‌ها پاس)؛ مهاجرت به src/proxy.ts (همان کد با export function proxy) هر زمان در فاز بعدی بدون تغییر رفتار ممکن است

Stage Summary:
- فایل‌ها: src/server/rate-limit.ts، src/server/otp.ts، src/server/session.ts، src/app/api/auth/otp/request/route.ts، src/app/api/auth/otp/verify/route.ts، src/app/api/auth/logout/route.ts، src/app/api/auth/me/route.ts، src/middleware.ts
- وضعیت: lint ✅ exit 0 | tsc ✅ بدون خطا در فایل‌های پروژه | dev.log بدون خطا (فقط هشدار deprecation میدل‌ور — به‌عمد طبق بریف نگه داشته شد) | کل فلو request→verify→me→logout و همهٔ مسیرهای خطا با curl اثبات شد
- قراردادها برای فازهای بعد: getSessionUser از '@/server/session' برای هر لایهٔ سرور (با cache دودوپلیکت)؛ createSession فقط در route handler/server action؛ SESSION_COOKIE='bs_session'؛ گارد عمیق ADMIN در فاز ۶ با user.role==='ADMIN'؛ کوکی سشن ادمین ۱۲ ساعته است و role هر ورود از DB خوانده می‌شود
- وابستگی T3-c: درایور SMS در لحظهٔ تست آماده بود (console/kavenegar/smsir/mellipayamak) — اینترفیس عیناً مطابق قرارداد مشترک؛ هیچ فایلی از آن‌ها دست نخورد

---
Task ID: 2-c2
Agent: frontend-styling-expert
Task: بخش‌های میانی هوم — CategoryIcon مشترک، اسلایدر هیرو (embla+autoplay)، نوار اعتماد، کارت دسته‌ها، تب محصولات، بنرهای میانی
Work Log:
- خواندن worklog کامل + منابع: globals.css (توکن‌ها)، carousel.tsx (الگوی embla)، tabs/button، shop.ts، preview-data.ts، product-card/grid، section-heading، brand-assets (فقط import)، format.ts، کد منبع embla-carousel-autoplay (تأیید: stopOnMouseEnter+stopOnInteraction:false = مکث در hover و ادامه پس از ترک/تعامل؛ مقایسهٔ pluginها آپشن‌محور است نه instance) و embla (direction: 'rtl'|'ltr' باید صریح داده شود)
- src/components/shared/category-icon.tsx (Server): CATEGORY_ICON_MAP صادرشده (۹ مپ blood-pressure→HeartPulse … scales→Scale) + CategoryIcon با fallback CircleEllipsis و aria-hidden
- src/components/home/hero-slider.tsx ('use client'): embla {loop, direction:'rtl'} + Autoplay ۶ث (useMemo تا reInit نکند)؛ select/reInit→selectedScrollSnap؛ متنِ هر اسلاید فقط در حالت انتخاب رندر می‌شود (AnimatePresence per-slide mode=wait: ورود opacity/y12→0 در 0.3s، خروج آینه‌ای 0.2s)؛ عنوان اسلاید نخست h1 و بقیه h2 (تنها h1 اولیهٔ صفحه)؛ CTA فالبک «مشاهده محصولات» → /products؛ قاب تصویر aspect-square max-w/max-h-420 rounded-3xl ring-gold/25 bg-white/5 p-4 با لایهٔ داخلی relative h-full (چون fill نسبت به padding box قفل می‌شود) + priority اسلاید اول + drop-shadow-2xl؛ Watermark بزرگ سمت چپ end-[-3rem] size 26→34rem + Pattern طلایی ۵٪؛ کنترل‌ها فقط وقتی >۱ اسلاید: prev=ChevronRight در start، next=ChevronLeft در end (سایز ۴۰، bg-white/10 blur، hover:bg-gold/30)، نقاط پایین‌وسط با ناحیهٔ لمسی 44px و قرص فعال w-8 bg-gold؛ rounded-none تمام‌عرض؛ aria-roledescription carousel/slide + برچسب فارسی
- src/components/home/trust-bar.tsx (Server): ۴ آیتم (Truck/ShieldCheck/Headset/LockKeyhole) با دایرهٔ bg-gold-soft/40 (تیره: /15 + text-gold)؛ grid-cols-2 lg:grid-cols-4 بدون جداکننده
- src/components/home/category-cards.tsx (Server): props {categories,title,subtitle} + SectionHeading با href=/products؛ یک مارک‌آپ واحد: موبایل flex snap-x snap-mandatory با min-w-[104px] و خونریزی لبهٔ -mx/px هم‌تراز padding شل در هر بریک‌پوینت + scrollbar-none → md:grid grid-cols-5 lg:grid-cols-9؛ کارت card-luxe card-lift group با آیکون دایره‌ای bg-accent text-primary و hover طلایی (border-gold/40 + text-gold-strong/gold)؛ ul/li معنایی
- src/components/home/product-tabs.tsx ('use client'): Tabs شادکن با dir=rtl (جهت کلیدهای جهت‌دار رادیکس)؛ TabsList کپسولی وسط‌چین h-auto rounded-full p-1 + تریگر px-5 rounded-full با active bg-card/shadow-card (تدارک dark: bg-card)؛ پنل بیرون از TabsContent با role=tabpanel/aria-labelledby و AnimatePresence mode=wait (y8، 0.25s) → ProductGrid؛ دکمهٔ ghost وسط «مشاهدهٔ همهٔ محصولات» h-11
- src/components/home/home-banners.tsx (Server): grid md:grid-cols-2، h-44 md:h-52، Image fill object-cover + group-hover:scale 1.03 در 500ms، اورلی bg-gradient-to-l از black/55 (تیره در راست)، متن در start (راست) با ps-6/8، عنوان font-black سفید + CTA «مشاهده» طلایی با فاصله‌جمع‌شونده hover
- اسموک‌تست واقعی با route موقت /smoke-c2 (سپس حذف؛ 404 تأیید شد): curl (۲۰۰ + همهٔ نشانگرها؛ h1 فقط ۱؛ ۸ کارت تب اول) + agent-browser نشست ایزوله — تعامل: «اسلاید بعدی» و نقطهٔ ۳ کار می‌کند، اتوپلی پس از ۷ ثانیه پیش می‌رود، loop از ۳→۱ می‌پیچد، تعویض تب به «تخفیف‌دار» ۵ کارت با صدرنشینی ٪۲۲، ۹ کارت دسته در یک ردیف دسکتاپ، ارقام فارسی (٪۲۲/۲۵۰٬۰۰۰)؛ بررسی تصویری VLM دسکتاپ 1440 و موبایل 390 full-page: هیرو متن-راست/قاب-طلایی-چپ، اعتماد 4/2×2، دسته‌ها اسکرول snap، محصول 4/2 ستونه، بنرها گرادیان-راست/گلیف-چپ، بدون بریدگی/هم‌پوشانی/اسکرول ناخواسته — امتیاز لوکس ۹/۱۰
- هم‌زمانی: ایجنت 2-c3 (about-store/articles-teaser/brands-strip + compose) موازی کار می‌کرد؛ سرور dev مشترک دو بار در اثر ری‌استارت‌های مسابقه‌ای قطع/وصل شد (EADDRINUSE در لاگ از تلاش دومی است) — در پایان سرور بالا (GET / 200) و dev.log بدون خطا؛ فایل‌های 2-c3 دست نخورد
- ESLint: exit 0 بدون خطا/هشدار؛ tsc: فقط examples/ و skills/ ازپیش‌موجود

Stage Summary:
- تصمیم بصری ۱ — بنرها: بریف متن را end-0/pe-6 خواسته بود اما گرادیان to-l خودش از راست تیره می‌شود و گلیف پلیس‌هولدرهای banner-1/2 در چپ کامپوز شده‌اند؛ متن سفید باید روی سمت تیره (راست/آغازِ RTL) بنشیند → متن در start-0 با ps-6؛ در تست تصویری خوانایی تأیید شد
- تصمیم بصری ۲ — هیرو: متنِ اسلاید به‌جای حضور دائمی در همهٔ اسلایدها فقط در اسلایدِ انتخاب‌شده رندر می‌شود و با AnimatePresence هر اسلاید (خروج محو/ورود y12→0) تعویض نرم دارد؛ عنوان اسلاید نخست h1 است تا صفحهٔ هوم سرفصل درست بگیرد (compose نیازی به h1 جداگانه ندارد)؛ قاب تصویر با لایهٔ داخلی relative، مشکل fill-نسبت-به-padding-box را حل می‌کند تا p-4 فاصلهٔ واقعی از حلقهٔ طلایی بدهد
- تصمیم بصری ۳ — ریتم طلایی در viewport کنترل شد: در هیرو فقط نقطهٔ فعال + حلقهٔ ظریف قاب + لبهٔ دکمهٔ متالیک؛ در تب‌ها فقط سایهٔ کپسول فعال و hairline سرِ بخش؛ در بنرها فقط CTA «مشاهده» — هیچ لمسهٔ طلایی اضافه‌ای وارد نشد
- فایل‌ها (۶): src/components/shared/category-icon.tsx + src/components/home/{hero-slider,trust-bar,category-cards,product-tabs,home-banners}.tsx — بدون any، رنگ فقط توکنی، transition 200–300ms (بنر 500ms zoom)، اعداد فارسی (toFa)، aria فارسی و ناحیهٔ لمسی 44px
- وضعیت: lint ✅ exit 0 | tsc ✅ فقط examples/skills | dev server بالا و dev.log سالم | /smoke-c2 حذف شد (404)
- برای compose: قراردادها — CategoryCards{categories,title,subtitle}، ProductTabs{title,subtitle,tabs,productsByTab}، HeroSlider{slides}، TrustBar{}، HomeBanners{banners}؛ عنوان/زیرعنوان از PREVIEW_HOME_SECTIONS؛ productsByTab با Object.fromEntries(PRODUCT_TABS.map(t=>[t.key,getPreviewProductsByTab(t.key)]))

---
Task ID: 3-d
Agent: full-stack-developer
Task: فاز ۲ — ایمیل‌های RTL + صف ارسال (Outbox) با retry/backoff + آداپتر آپلود (لوکال + stub آروان)

Work Log:
- `src/server/email/templates.ts`: ۴ قالب ایمیل RTL جدول‌محور (table/presentation + استایل کاملاً inline، بدون فایل خارجی) با قاب مشترک `emailShell(title, body, cta?)` — هدر سبز کاجی #0C3B2E با لوگوی متنی brand.name + تگ‌لاین طلایی، خط طلایی نازک ۳px #C9A24B زیر هدر، کارت سفید گوشه‌گرد روی بدنهٔ عاجی #F7F6F1، فوتر با متن کوچک + لینک فروشگاه (relative «/») + تلفن پشتیبانی فارسی؛ فونت Tahoma/'Segoe UI' (ایمیل‌کلاینت‌ها Vazirmatn ندارند)؛ preheader مخفی + dir=rtl/lang=fa روی html/body/tdهای کلیدی؛ helperهای خصوصی escapeHtml (مقادیر کاربر)، ctaButton (دکمهٔ سبز/حاشیهٔ طلایی)، statusBadge (قرص سبز+حلقهٔ طلایی)، itemsTableHtml (عنوان/تعداد/مبلغ + سطر جمع کل formatToman)، h1/p؛ subjectها عین بریف؛ همهٔ hrefها همان مسیر relative می‌مانند با کامنت «TODO فاز ۷: APP_URL از env برای لینک مطلق»؛ بریف می‌گفت در متن SMS موجود‌شدن کالا «در بسلامت» — از brand.name ساخته شد تا white-label بماند
- `src/server/email/send.ts`: sendEmail هرگز throw نمی‌کند — بدون SMTP_HOST → console.warn «[SMTP] تنظیم نشده — ایمیل ارسال نشد» + {ok:false, message:'سرویس ایمیل تنظیم نشده است'}؛ createTransport (secure=465، auth اختیاری، connectionTimeout/greetingTimeout/socketTimeout ۱۰ث) با کش ترنسپورتر روی globalThis (کلید=host:port:user؛ مقاوم به هات‌ریلود)؛ from=SMTP_FROM||SMTP_USER||no-reply؛ خطای ارسال → console.error جزئیات + {ok:false, message:'ارسال ایمیل ناموفق بود'}
- `src/server/outbox.ts`: enqueueOutbox (create با payloadJson=JSON.stringify، channel/template/target عین امضا) + processOutbox(limit=20) — findMany({status:PENDING, availableAt<=now, take, orderBy createdAt}) و هر رکورد در try/catch مستقل؛ attempts+=1 → رندر → SMS: getSmsDriver().send / EMAIL: sendEmail → ok یعنی SENT+sentAt؛ fail و attempts>=5 → FAILED نهایی؛ fail و <5 → availableAt=now+backoff [۱دق، ۵دق، ۳۰دق، ۳۰دق] + lastError؛ خروجی typed {processed,sent,failed,retried}؛ registry داخلی TemplateDef عین بریف با ۴ کلید؛ payload خام با type guardهای getString/getNumber/getOrderItems امن parse می‌شود (بدون any — هر عضو items هم اعتبارسنجی می‌شود)؛ نبود فیلد/JSON خراب → IncompletePayloadError «payload ناقص» → همان مسیر fail+retry (throw فقط درون try/catch خود processOutbox؛ هرگز به route نمی‌رسد)؛ SMS قالب order.status هر دو نام statusLabel/newStatusLabel را می‌پذیرد (بریف در SMS و EMAIL نام‌های متفاوت داشت)؛ contact.ack فقط renderEmail دارد → enqueue SMS آن = خطای «قالب پیامک برای این پیام تعریف نشده است» در lastError؛ کامنت «فراخوانی فرصت‌طلبانه: هر درخواست سفارش/اقدام ادمین + پنل ادمین فاز ۶ دکمهٔ پردازش صف»
- `src/server/upload.ts`: UploadAdapter عین بریف + UPLOAD_MAX_BYTES=5MB + UPLOAD_ALLOWED_MIME_TYPES (png/jpeg/webp) as const؛ LocalUploadAdapter (پیش‌فرض UPLOAD_DRIVER=local): validate با خطاهای فارسی «فرمت فایل مجاز نیست (PNG/JPG/WebP)» / «حجم فایل بیشتر از ۵ مگابایت است» / «فایل خالی است» → نام sha256(buffer).{png|jpg|webp} → public/uploads/{yyyy}/ با mkdir recursive (node:fs/promises) → url «/uploads/{yyyy}/{hash}.{ext}»؛ remove با unlink بی‌صدا + قفل path-traversal (resolve داخل public/uploads)؛ S3ArvanAdapter: stub کامل با TODO «فاز آینده: کلیدهای آروان S3 — env ARVAN_ACCESS_KEY/SECRET/BUCKET/ENDPOINT؛ با fetch امضاشده یا SDK» و put/remove با Error فارسی «آپلود ابری در این نسخه فعال نیست»؛ getUploadAdapter: 's3'|'arvan'|'s3-arvan' → آروان، پیش‌فرض local؛ کامنت: فقط سمت سرور import می‌شود ('server-only' لازم نیست)
- `public/uploads/.gitkeep` ساخته شد (مسیر آپلود موجود)
- تست اجباری (bun -e، خروجی واقعی): ۱) هر ۴ قالب رندر شد — order.placed «سفارش شما با شمارهٔ BS-10234 ثبت شد» html=۵۱۳۱ | order.status «وضعیت سفارش BS-10234 به‌روزرسانی شد» html=۳۲۵۶ | stock.available «ویلچر تاشو فیزیو دوباره موجود شد» html=۲۸۲۹ | contact.ack «پیام شما دریافت شد» html=۲۵۶۹ ۲) EMAIL order.placed کامل → processOutbox → {processed:1,sent:0,failed:1,retried:1} + لاگ [SMTP] «تنظیم نشده — ایمیل ارسال نشد» → رکورد: PENDING، attempts=1، lastError «سرویس ایمیل تنظیم نشده است»، availableIn≈۶۰ث ۳) SMS order.placed → لاگ «[SMS] to=09121112233 text=سفارش BS-10235 با موفقیت ثبت شد. مبلغ: ۴۵۰٬۰۰۰ تومان» → {processed:1,sent:1} و رکورد SENT با sentAt و lastError=null ۴) SMS order.status بدون statusLabel → رکورد PENDING، attempts=1، lastError «payload ناقص»، retryIn≈۶۰ث ۵) آپلود: put PNG → /uploads/2026/{sha256-64hex}.png و remove بی‌صدا؛ text/plain → «فرمت فایل مجاز نیست (PNG/JPG/WebP)»؛ >۵MB → «حجم فایل بیشتر از ۵ مگابایت است»؛ env=s3 → «آپلود ابری در این نسخه فعال نیست»؛ پس از تست‌ها deleteMany روی MessageOutbox (۳ رکورد) و فایل/پوشهٔ تستی آپلود پاک شد

Stage Summary:
- فایل‌ها (۵): src/server/email/templates.ts، src/server/email/send.ts، src/server/outbox.ts، src/server/upload.ts، public/uploads/.gitkeep
- وضعیت: lint ✅ بدون خطا (تنها warning ازپیش‌موجود checkout/page.tsx از ایجنت موازی — فایل‌های این فاز صفر خطا/هشدار) | tsc ✅ فقط examples/ و skills/ (ازپیش‌موجود) | dev.log بدون خطای جدید (EADDRINUSE ابتدای فایل فقط تلاش دوم init است؛ سرور اصلی سالم GET / 200)
- قراردادها برای فازهای بعد: enqueueOutbox({channel,template,target,payload:Record<string,unknown>}) → بی‌درنگ PENDING با attempts=0؛ processOutbox را فرصت‌طلبانه بعد از ثبت سفارش/اقدام ادمین صدا بزنید (fail-safe: هرگز throw نمی‌کند)؛ کلیدهای payload هر قالب: order.placed={customerName,orderNumber,total,itemsCount,items[{title,qty,lineTotal}],trackUrl} — برای SMS فقط orderNumber+total لازم است؛ order.status={customerName,orderNumber,newStatusLabel,note?,trackUrl} — SMS: orderNumber+statusLabel|newStatusLabel؛ stock.available={productName,productUrl,storeName}؛ contact.ack={name,subject} فقط EMAIL؛ آپلود: getUploadAdapter().put(File) → {url} با خطاهای فارسی (route باید catch و به پاسخ 400 تبدیل کند)؛ TODO فاز ۷: APP_URL برای لینک‌های مطلق ایمیل

---
Task ID: 2-e
Agent: frontend-styling-expert
Task: اسکلت خرید فاز ۱ — سبد، تسویهٔ تک‌صفحه‌ای، ورود OTP واقعی، حساب کاربری، جزئیات سفارش و نتیجهٔ پرداخت (۸ فایل)

Work Log:
- ۸ فایل تحویلی: src/app/cart/page.tsx، src/app/checkout/page.tsx، src/app/login/page.tsx، src/app/account/page.tsx، src/lib/preview-orders.ts، src/app/account/orders/[orderNumber]/page.tsx، src/components/account/order-timeline.tsx، src/app/payment/result/page.tsx — هیچ فایل دیگری ویرایش نشد
- cart: کلاینت با الگوی mounted (useSyncExternalStore مطابق header) — تا commit فقط Skeleton؛ هر خط card-luxe با بوم تصویر bg-white (الگوی کارت محصول) + استپر pill (minus/qty/plus؛ plus در maxQty غیرفعال، minus در ۱) + حذف ghost با aria-label «حذف {title}» + جمع خط w-28 text-end فقط sm به بالا؛ جمع‌بندی lg:w-96 sticky top-24 با ردیف تعداد/جمع کل/سود تخفیف (text-success فقط اگر >0) + Separator + یادداشت ارسال + CTA «ادامهٔ ثبت سفارش» btn-metallic h-12 + «خالی کردن سبد» با AlertDialog تأیید destructive
- checkout: RHF+zod، هر سه بخش شماره‌دار با دایرهٔ طلایی (bg-gold-soft/40 dark:bg-gold-soft/15 + toFa ایندکس)؛ موبایل dir=ltr text-center با refine روی normalizePhone؛ جعبهٔ OTP خط‌چین با ShieldCheck طلایی و کامنت «فاز ۴: OTP درجا با purpose=CHECKOUT»؛ شهر وابسته به استان (بدون استان → disabled + «ابتدا استان را انتخاب کنید» + ریست شهر با تغییر استان)؛ کدپستی اختیاری با toEnDigits + /^\d{10}$/؛ روش ارسال RadioGroup کارتی (انتخاب: border-gold bg-gold-soft/15) — «حضوری» بخش آدرس را آنی جمع و آدرس/ساعت فروشگاه brand.contact را نشان می‌دهد و در superRefine از الزام آدرس معاف می‌شود؛ SHIPPING_COST=45000 با TODO «فاز ۴: از تنظیمات»؛ onSubmit معتبر → toast.info اتصال درگاه فاز ۴ + TODO «ثبت سفارش اتمیک + driver.createPayment»؛ خلاصهٔ چسبان lg:col-span-1 sticky با اقلام جمع‌وجور (size-12 + ×تعداد فارسی) و «رایگان» text-success برای حضوری؛ سبد خالی → empty state با دو لینک (فروشگاه/بازگشت به سبد) بدون ریدایرکت
- رفع هشدار lint: watch() → useWatch({control}) (react-hooks/incompatible-library با React Compiler)؛ lint نهایی exit 0 بدون هیچ خطا/هشدار
- login: واقعی و متصل — استپ phone → POST /api/auth/otp/request {phone,purpose:'LOGIN'} → استپ code با InputOTP پنج‌خانهٔ dir=ltr (size-11 برای لمس) + تایمر شمارش معکوس از expiresInSeconds (fallback 120) + «ارسال مجدد کد» text-gold پس از صفر + باکس «حالت توسعه: کد شما …» bg-warning/10 فقط وقتی devCode در پاسخ باشد؛ verify → toast «خوش آمدید» + push مقصد امن (فقط مسیر داخلی؛ next یا admin=1→/admin وگرنه /account)؛ چک /api/auth/me هنگام mount → لاگین‌بودگی → replace('/account') و تا تعیین وضعیت فقط اسکلت (بدون فلش فرم)؛ useSearchParams داخل Suspense (سازگار با prerender)؛ خواندن پاسخ‌ها فقط با type guard (بدون any)
- account: mount → /api/auth/me؛ 401/خطا → replace('/login?next=/account')؛ تا ready اسکلت کامل؛ grid lg:grid-cols-4 — سایدبار sticky با آواتار دایرهٔ حرف اول نام/شماره (طلایی روی gold-soft)، formatPhoneFa با dir=ltr، بج «مدیر» bg-gold برای ADMIN، منوی سه‌تب + خروج با AlertDialog؛ تب سفارش‌ها: PREVIEW_ORDERS با بج «نمایشی» bg-muted text-[10px] + توضیح یک‌خطی فاز ۴ + کارت‌ها (شمارهٔ فارسی‌شده، faDateTime، Badge رنگ‌بندی‌شدهٔ وضعیت، جمع formatToman، لینک جزئیات)؛ تب پروفایل: نام/ایمیل defaultValue از /me + موبایل readonly bg-muted + ذخیره → toast فاز ۴ (TODO)؛ تب آدرس‌ها: استور کوچک useSyncExternalStore روی localStorage کلید bs-addresses (getServerSnapshot ثابت خالی → hydration-safe بدون setState در effect) + empty state MapPin + Dialog هم‌ساخت فرم تسویه با اعتبارسنجی دستی + حذف هر آدرس
- preview-orders: دو سفارش تایپ‌دار (BS-10234 DELIVERED پنج‌روز پیش با ۲ قلم M2+ماسک و تایم‌لاین کامل ۵ مرحله + کد رهگیری 24RA8931574؛ BS-10235 PAID دیروز با ترازوی GS27 و تایم‌لاین تا PAID) — قیمت‌ها عین seed (2850000/195000/1290000) و total = اقلام+۴۵٬۰۰۰ ارسال؛ تاریخ‌ها با daysAgoIso نسبت به زمان ماژول (همیشه «تازه»)
- order-timeline (Server): ol/li با aria-current="step"؛ دایره bg-gold (فعلی + ring-4 ring-gold/20) / bg-muted-foreground/25 برای آینده؛ خط اتصال هر مرحله از گامِ بعدی رنگ می‌گیرد (gold/40 یا border) و آخرین مورد بی‌خط؛ مراحل آیندهٔ خاموش از ORDER_STATUS_FLOW بعد از current (فیلتر رخ‌داده‌ها)؛ CANCELED/RETURNED → کل تایم‌لاین destructive (دایره‌ها bg-destructive، خطوط bg-destructive/40، ورودی فعلی text-destructive + ring destructive/20) و بدون مراحل آینده
- orders/[orderNumber] (Server): params await → find در PREVIEW_ORDERS → notFound() (تست BS-99999 → 404)؛ metadata با noindex + title «سفارش {n}»؛ max-w-4xl با grid ۳ ستونه — کارت اقلام (ردیف سبدی) + کارت روند سفارش با ردیف کد رهگیری (Truck + کد dir=ltr) + کارت اطلاعات تحویل (گیرنده/موبایل dir=ltr/نشانی/کدپستی فارسی) + کارت پرداخت (مبلغ کل font-black text-primary) + «بازگشت به سفارش‌ها» ghost
- payment/result (Server): searchParams await؛ success → دایرهٔ bg-success/10 + CheckCircle2 + «پرداخت با موفقیت انجام شد» + جملهٔ شمارهٔ سفارش فارسی‌شده (با حالت بدون order هم پایدار) + «پیگیری سفارش» btn-metallic به /account/orders/{order} + «بازگشت به فروشگاه» ghost؛ failed → destructive/XCircle + جملهٔ ۷۲ ساعت بازگشت + «تلاش مجدد» → /cart + «تماس با پشتیبانی» tel: برند؛ noindex + کامنت «فاز ۴: verify واقعی از درگاه قبل از رندر»
- اعتبارسنجی: lint exit 0 بدون خطا/هشدار | tsc فقط خطاهای ازپیش‌موجود examples/ و skills/ | bun runtime روی preview-orders (total و تایم‌لاین و برچسب‌ها همه ok) | curl از طریق گیت‌وی Caddy (:81): /cart /checkout /login /account /account/orders/BS-10234 /payment/result هر دو حالت → 200 و BS-99999 → 404؛ محتوای فارسی صفحات سروری در HTML تائید شد؛ dev.log بدون خطا (سرور dev در طول تست بالا بود؛ دسترسی مستقیم :3000 در این سندباکس بسته است و از :81 انجام شد)

Stage Summary:
- تصمیم بصری ۱ — ریتم طلایی سبد: در هر خط فقط دکمهٔ حذفِ hover-destructive و جمع خط سبز کاجی رنگ‌دارند؛ جمع خط در w-28 ستون چپِ هم‌ترازِ دسکتاپ (hidden sm:block) تا موبایل جمع‌وجور بماند و استپر pill با اعداد tabular-nums فارسی، غلبهٔ بصری ندارد
- تصمیم بصری ۲ — بخش‌های تسویه با دایرهٔ شمارهٔ طلایی روی gold-soft (سه لمسهٔ طلایی در کل فرم) و روش ارسال به‌صورت کارت‌های انتخابی که حالت انتخاب را با border-gold + bg-gold-soft/15 + آیکون طلایی نشان می‌دهند — کلاس‌بندی «انتخاب‌شده» با input-otp و بج‌های وضعیت هم‌خوان است
- تصمیم بصری ۳ — رنگ‌بندی وضعیت سفارش به‌عنوان قرارداد مشترک دو صفحه: PAID/PROCESSING سبز موفقیت، SHIPPED طلایی (gold-soft با تیره‌ساز)، DELIVERED سبز کاجی، PENDING_PAYMENT هشدار کهربایی، CANCELED/RETURNED سرخ — و تایم‌لاین لغوشده کاملاً سرخ می‌شود تا روایت شکست در یک نگاه دیده شود
- تصمیم بصری ۴ — ورود OTP: خانه‌های کد با استایل پیش‌فرض شادکن اما size-11 (لمس ≥44px) و شمارهٔ موبایل همیشه dir=ltr با ارقام فارسی (الگوی هدر) تا ترتیب ارقام در متن RTL برعکس نشود
- فایل‌ها: ۸ فایل فوق — همه اعداد فارسی، ورودی‌های موبایل/کد/کدپستی dir=ltr، بدون hex/آبی/emoji/any، لمس اصلی ≥44px (h-12)
- وضعیت: lint پاک | tsc پاک (به‌جز examples/skills) | dev.log پاک | آماده برای فاز بعد؛ نکته برای فاز ۴: SHIPPING_COST از Setting، OTP درجا با purpose=CHECKOUT، ثبت سفارش اتمیک + createPayment، سفارش‌های واقعی جای PREVIEW_ORDERS، verify درگاه در payment/result

---
Task ID: 2-c3
Agent: frontend-styling-expert
Task: فاز ۱ — بخش‌های پایانی هوم: نوار برندها (marquee بی‌نهایت)، تیزر مقالات، دربارهٔ فروشگاه

Work Log:
- خواندن worklog کامل + منابع (globals.css، shop.ts، brand.ts، format/jalali، section-heading، brand-assets، product-card برای قرارداد کد، footer برای قرارداد dir=ltr شماره‌ها و لینک /contact)
- src/components/home/brands-strip.tsx (Server): `.shell py-10 md:py-14`؛ سرِ کوچک وسط‌چین «برندهای همراه ما» (text-sm font-semibold muted + tracking-wide) + gold-hairline کوتاه w-24 mx-auto mt-3؛ نوار `mt-8 overflow-hidden mask-fade-x group` با role=group و aria-label «برندهای همراه فروشگاه»؛ تراک `flex w-max items-center gap-12 animate-marquee [animation-direction:reverse] group-hover:[animation-play-state:paused]`؛ آیتم‌ها دوبار (۱۲ span: ۶×۲) + لوزی طلایی ریز `size-1.5 rotate-45 bg-gold/50` بین همهٔ آیتم‌ها (فاصلهٔ درزِ دو کپی هم gap-12 یکسان چون تکثیر در همان flex است)؛ hover آیتم → text-primary و توقف marquee (group-hover pause)؛ کپی دوم aria-hidden تا صفحه‌خوان دو بار نخواند؛ prefers-reduced-motion از globals خودش انیمیشن را خنثی می‌کند
- تست جهت marquee (ذهنی + تجربی): در RTL ردیف w-max از لبهٔ راست ظرف سرریز می‌کند؛ کی‌فریم globals (translateX 0→٪50) نوار را به «راست» می‌برد (ورود از چپ)؛ `[animation-direction:reverse]` پخش را ٪50→0 می‌کند و حرکت به «چپ» می‌رود — ورود برندها از لبهٔ راست (آغاز خواندن در RTL) و خروج از چپ؛ مطابق خواستهٔ بریف «حرکت به سمت چپ»؛ reverse نگه داشته شد. اثبات تجربی در مرورگر: getComputedStyle → animationDirection=reverse/name=marquee/duration=42s و نمونه‌برداری X تراک در ۳ لحظه (108.7→34.0→-41.2) = حرکت پیوسته به چپ با سرعت صحیح (1029px/42s)؛ حلقه بی‌درز چون کپی دوم عین اول است (قفلی بین دو کپی دیده نشد)
- src/components/home/articles-teaser.tsx (Server): `.shell py-12 md:py-16` + SectionHeading (subtitle با ?? undefined چون prop بریف string|null و SectionHeading string می‌پذیرد) + href=/blog hrefLabel=«همهٔ مقالات»؛ گرید `gap-4 md:grid-cols-3`؛ کارت: `group card-luxe card-lift block h-full overflow-hidden` + رینگ focus-visible (قرارداد product-card) → کاور `relative aspect-[16/9]` با Image fill/object-cover/zoom 1.04 در 500ms؛ بدنه p-5: بج دسته bg-accent rounded-full (اگر categoryTitle) + تاریخ `ms-auto` با Calendar size-3.5 و faDate (جلالی فارسی)؛ عنوان `mt-3 line-clamp-2 font-bold leading-7 group-hover:text-primary`؛ چکیده `mt-2 line-clamp-2 text-sm leading-6 muted`؛ «ادامهٔ مطلب» text-gold + ArrowLeft size-3.5 با opacity 60→100 در hover
- src/components/home/about-store.tsx (Server): بخش `relative overflow-hidden bg-metallic-soft` + Pattern برند (`text-pine opacity-[0.04] dark:text-gold`)؛ `.shell relative grid items-center gap-10 py-14 md:py-20 lg:grid-cols-2 lg:gap-16` — متن راست (RTL)، کارت چپ؛ ستون متن: h2 font-black + دو پاراگراف leading-8 (۱: brand.description + جملهٔ سالن نمایش/مشاورهٔ حضوری؛ ۲: تضمین اصالت/فاکتور و گارانتی/پشتیبانی — محترم و بدون اغراق) + CTA «تماس با ما» btn-metallic pill h-11 px-7 با Phone → /contact (هم‌نام لینک فوتر)؛ کارت فروشگاه: card-luxe p-6 md:p-8 با gold-hairline مطلق top-0 (الگوی هدر/فوتر)؛ عنوان `فروشگاه {brand.name}` با MapPin size-5 text-gold؛ ردیف‌های ul با آیکون طلایی size-4 هم‌خط متن (mt-1.5): آدرس، دو تلفن به‌صورت tel: با formatPhoneFa و dir=ltr جداشده با «·» خاموش، ایمیل mailto:، ساعت‌های کاری «{days}: {time}»؛ دکمه «مشاهده روی نقشه» full-width ghost طلایی (border-gold/40، hover bg-gold) با target=_blank rel=noreferrer و ExternalLink
- اسموک‌تست با route موقت /smoke-2c3 (الگوی 2-c1): HTTP 200؛ راستی‌آزمایی HTML رندرشده: ۱۲ span برند + ۱۲ لوزی + aria-hidden فقط روی ۶ تای دوم؛ ۳ کارت مقاله با کاور (/_next/image + srcSet)، بج دسته، تاریخ‌های «۳/۱۱/۱۸ مهر ۱۴۰۵» (آینهٔ ۵/۱۲/۲۰ روز پیشِ seed)؛ کارت فروشگاه با hairline/آدرس/تلفن‌ها «۰۲۱-۹۱۰۰۸۰۰۰» و «۰۹۱۲ ۰۰۰ ۰۰۰۰»/ایمیل/ساعت‌ها/دکمه نقشه؛ صفر رقم لاتین در متن قابل‌مشاهده؛ ruleهای CSS در چانک کامپایل‌شده تأیید شد (animation-direction:reverse و group-hover pause)
- QA بصری با مرورگر headless (سشن جدا برای تداخل با ایجنت موازی) + VLM روی اسکرین‌شات full-page در دو تم: روشن و تیره — هر دو «بدون هم‌پوشانی/به‌هم‌ریختگی RTL/مشکل کنتراست» گزارش شد؛ چیدمان دوستونهٔ درباره (متن راست/کارت چپ)، فاصله‌گذاری سخاوتمندانه و هارمونی سبز-طلایی تأیید شد؛ route آزمایشی و سشن مرورگر پاک شدند
- توجه: مرورگرِ پیش‌فرض agent-browser بین ایجنت‌های موازی مشترک است (ایجنت 2-c2 آن را به /smoke-c2 می‌برد) — برای تست، سشن ایزوله (--session) لازم است

Stage Summary:
- تصمیم بصری ۱ — نوار برندها: تایپوگرافی به‌جای لوگو؛ نام برندها font-black با text-muted-foreground/50 خاموش تا تنها عنصر رنگی نوار، لوزی‌های طلایی ریز و hover سبز کاجی باشد (ریتم طلایی محدود)؛ عنوان ریز وسط‌چین + hairline کوتاه w-24 به‌جای SectionHeading کامل — بخش را به «نفسِ» بین سکشن‌های بزرگ تبدیل می‌کند (py-10/14 در برابر py-12/16 بقیه)
- تصمیم بصری ۲ — جهت marquee: `[animation-direction:reverse]` حفظ شد؛ حرکت به چپ (ورود برندها از راست = آغاز خواندن RTL، خروج از چپ) با توقف در hover؛ اثبات با نمونه‌برداری زمانی موقعیت تراک در مرورگر واقعی + بررسی rule کامپایل‌شده Tailwind؛ حلقه با تکثیر دقیق بی‌درز (بدون جهش در مرز ٪50→0)
- تصمیم بصری ۳ — کارت مقاله: سلسله‌مراتب «بج دسته بی‌رنگ‌ونگ (accent عاجی) + تاریخ ریز muted + عنوان درشت + چکیده + ادامهٔ مطلب طلایی»؛ تنها دو لمسهٔ رنگی: لینک طلایی و hover عنوان به سبز کاجی؛ کاور 16:9 با زوم نرم 500ms (کندتر از کارت محصول 300ms — حس مطبوعاتی‌تر)
- تصمیم بصری ۴ — دربارهٔ فروشگاه: پس‌زمینهٔ bg-metallic-soft با پترن ۴٪ (در تیره طلایی) به‌عنوان «پایان‌بند» صفحه پیش از فوتر متالیک کامل؛ کارت اطلاعات با hairline طلایی لبهٔ بالا و آیکون‌های طلایی ریز — تنها بخش طلاییِ پرتکرار صفحه که به‌عمد در انتهای قیف توجه قرار دارد؛ دکمهٔ نقشه outline طلایی تمام‌عرض (تنها دکمهٔ secondary طلایی) در برابر CTA متالیک pill
- فایل‌ها (۳): src/components/home/{brands-strip,articles-teaser,about-store}.tsx — هر سه Server Component، بدون any، رنگ فقط توکنی، اعداد فارسی (faDate/formatPhoneFa)، transition 200-500ms، بدون hex/آبی/emoji؛ فایل دیگری ویرایش نشد
- وضعیت: lint ✅ exit 0 | tsc ✅ فقط examples/skills ازپیش‌موجود | dev.log سالم (درخواست‌های /smoke-2c3 همه 200) | آمادهٔ مصرف توسط 2-c2: `<BrandsStrip brands={...}>`، `<ArticlesTeaser title subtitle articles>`، `<AboutStore title>` با دادهٔ PREVIEW_BRANDS/PREVIEW_ARTICLES و عنوان‌های HomeSection

---
Task ID: 2-d
Agent: frontend-styling-expert
Task: فاز ۱ — اسکلت کاتالوگ: لیست محصولات، صفحهٔ محصول و جستجو (۶ فایل)

Work Log:
- خواندن worklog (۲-b و ۲-c۱) + منابع: globals.css، types/shop، preview-data، product-card/grid، section-heading، cart store، format، brand، header (الگوی hydration)؛ CategoryIcon هنوز وجود ندارد (۲-c۲ موازی) → بریدکرامب‌ها بدون آیکون طبق بریف
- src/app/products/page.tsx (Server): metadata «فروشگاه | انتخاب محصولات»؛ searchParams (Promise در Next 16) → initialFilters {category, brand[]/string, q, sort, view, page, min, max, inStock, discount} با تجزیهٔ امن (toEnDigits اعداد)؛ breadcrumb خانه/فروشگاه[/والد/فرزند] با ChevronLeft (جهت RTL) و آیتم جاری BreadcrumbPage؛ categoryByProduct (slug→دستهٔ فرزند) از PREVIEW_PRODUCT_DETAILS پاس داده می‌شود چون ProductSummary دسته ندارد
- src/components/catalog/catalog-view.tsx ('use client'): state فیلتر+sort+view+page؛ همگام‌سازی URL با router.replace(pathname+params, {scroll:false}) فقط برای مقادیر غیرپیش‌فرض (q با toEnDigits)؛ فیلتر: دسته = خود+فرزندان (پیمایش درخت PREVIEW_CATEGORIES)، برند = اسلاگ→عنوان، min/max روی price، inStock، discount، q = title شامل با نرمال (toEnDigits+ی/ک+lowercase)؛ سورت: newest=وارونهٔ آرایه (مستند ۲-c۱: ایندکس بالاتر=جدیدتر)، cheapest/expensive=price، popular=ترتیب آرایه؛ PAGE_SIZE=8 + Pagination با ارقام فارسی و دکمه‌های size-11 (touch ۴۴px) و جهت درست RTL (قبلی راست/ChevronRight، بعدی چپ/ChevronLeft)؛ تغییر صفحه scrollTo بدون behavior صریح تا CSS (smooth و reduced-motion) تصمیم بگیرد؛ heading = نام دستهٔ فعال یا «فروشگاه» + «{toFa(n)} کالا»؛ سایدبار sticky top-24 w-64 فقط lg؛ دراور موبایل vaur با rounded-t-3xl! (important برای غلبه به rounded-t-lg.variant) + DrawerDescription sr-only + «مشاهدهٔ نتایج» btn-metallic؛ نمای list = کارت افقی (تصویر size-24/28 bg-white + بج‌ها + قیمت + «مشاهده» ghost h-10)؛ empty-state با «حذف فیلترها» destructive
- src/components/catalog/filter-panel.tsx ('use client', کاملاً کنترل‌شده): دسته‌بندی درختی (فعال: text-gold font-semibold + Check 3.5)؛ قیمت: دو Input محلی با placeholder «مثلاً ۵۰۰٬۰۰۰» + suffix «تومان» ریز، commit روی blur/Enter (فارسی/لاتین با toEnDigits) — همگام‌سازی دو نمونهٔ پنل (سایدبار دسکتاپ + دراور موبایل) با key وابسته به مقدارِ commit شده (remount) بدون هیچ effect و بدون setState در رندر (پرهیز از react-hooks/set-state-in-effect که در ۲-b گره خورده بود)؛ سوییچ موجود/تخفیف‌دار؛ برند Checkbox اسکرولی max-h-48؛ «حذف فیلترها» ghost text-destructive h-9 w-full؛ جداکننده‌های Separator بین بخش‌ها
- src/app/products/[slug]/page.tsx (Server): params Promise → PREVIEW_PRODUCT_DETAILS[slug] → notFound؛ generateMetadata داینامیک (title=عنوان، description=shortDescription ?? چکیدهٔ ۱۶۰کاراکتری HTML، openGraph ساده)؛ breadcrumb خانه/والد/فرزند/عنوان کوتاه‌شده(۴۸)؛ related = هم‌والدِ دسته بدون خودش تا ۴ مورد → زیر ProductDetail با SectionHeading «محصولات مرتبط» + ProductGrid
- src/components/product/product-detail.tsx ('use client'): گرید lg:2col؛ گالری aspect-square bg-white p-8/10 با سوییچ fade (key remount + animate-in) + بج‌ها + thumbnail حلقهٔ طلایی (فعال border-gold ring-gold/30) با aria-label «تصویر ۱ از ۲»؛ قیمت/compare/موجودی «مؤثر» از variant انتخابی (پیش‌فرض isDefault وگرنه اولین موجود؛ تغییر تنوع qty→1)؛ chips تنوع h-10 rounded-full (فعال طلایی؛ stock=0 خط‌خورده opacity-50 + title «ناموجود»)؛ موجودی سه‌حالته (سبز/هشدار «تنها ۲ عدد» برای ≤۲/قرمز)؛ استپر size-11 + btn-metallic h-12 «افزودن به سبد» → cart.addLine (قیمت/compare/image اول/maxQty مؤثر) + toast.success؛ ناموجود → فرم «خبرم کن» با normalizePhone (خطا toast.error / موفق state محلی Check سبز + TODO فاز ۵ API اعلان موجودی)؛ مشخصات کلیدی ۳تایی زیر قیمت؛ تب‌ها: توضیحات (dangerouslySetInnerHTML + prose دستی + TODO sanitize فاز ۶ با Tiptap) و مشخصات فنی (Table زبرا even:bg-muted/40 داخل card-luxe)؛ related در props هست ولی صفحه رندرش می‌کند (طبق بریف)
- src/app/search/page.tsx (Server): robots noindex/follow؛ عنوان «نتایج جستجو برای «{q}»» با q خام کاربر (بدون toFa)؛ چیپ‌های PREVIEW_POPULAR_SEARCHES (bg-accent→hover:bg-gold/20) همیشه زیر عنوان؛ CatalogView با showHeading=false (شمارندهٔ «n کالا» می‌ماند تا h1 دوباره ننشیند)؛ پارامترها کامل پars می‌شوند (نه فقط q) چون CatalogView همهٔ state را در URL می‌نویسد و reload باید حالت را بازسازی کند
- تست curl (همه 200؛ 404 فقط برای slug ساختگی): شمارش‌ها → دستهٔ والد blood-pressure=۲، brand=beurer&discount=۱=۲، inStock+قیمت ۱-۲M=۴، q ترازو=۲، q فشارسنج=۲؛ /products=۱۵ با صفحه‌بندی ۲ صفحه (۱/۲ فارسی + قبلی/بعدی)؛ لیست‌ویو SSR؛ empty-state min=۹۹۹M با «حذف فیلترها»؛ بج ٪۱۱ دوتایی M2 (گالری+ردیف قیمت با «٪۱۱ تخفیف»)؛ تنوع‌های TG300/ویلچر؛ کم‌موجودی «تنها ۲/۱ عدد» (ویلچر/تخت برقی)؛ SB210 ناموجود → خبرم‌کن + «فعلاً ناموجود است»؛ متاها: title محصول با تمپلیت بسلامت + noindex جستجو
- نکته: dev server وسط تست‌ها توسط ایجنت موازی ری‌استارت شد (dev.log چرخید)؛ یک curl لحظه‌ای connection-refused گرفت و بلافاصله 200 شد
- ESLint exit 0 بدون خطا/هشدار؛ tsc: فقط examples/ و skills/ ازپیش‌موجود (خارج از پروژه)؛ dev.log پاک (GET /products و /search و /products/[slug] همه 200)

Stage Summary:
- تصمیم بصری ۱ — یک پنل، دو بوم: FilterPanel کنترل‌شدهٔ واحد هم در سایدبار sticky (lg) و هم در دراور پایین‌کشِ موبایل (rounded-t-3xl! با important برای شکست variant واو) رندر می‌شود؛ ورودی‌های قیمت با «key=مقدارِ commit شده» بین دو نمونه همگام می‌مانند — بدون effect، بدون setState-in-render؛ ریتم بخش‌ها با Separator و عنوان‌های font-bold text-sm
- تصمیم بصری ۲ — نمای فهرستی با هندسینگ RTL: عنوان basis-full در موبایل (بج‌ها زیرش) و sm:flex-1 (بج‌ها هم‌ردیف)؛ بلوک قیمت/«مشاهده» با mt-auto همیشه به لبهٔ پایین کارت چسبیده تا ارتفاع ردیف‌ها یکنواخت بماند؛ تصویر بوم سفید جدا از بدنه (هم‌زبان ProductCard)
- تصمیم بصری ۳ — صفحهٔ محصول با سکوت طلایی: گالری بوم سفید بزرگ p-8/10 + thumbnail انتخابی با حلقهٔ ring-gold/30 (تنها دو لمسهٔ طلایی: بج تخفیف و حلقه)؛ انتخاب تنوع قیمت/موجودی را زنده عوض می‌کند و استپر با maxQty همان تنوع قفل می‌شود؛ تب مشخصات با Table زبرا روی card-luxe
- تصمیم منطقی — سورت newest = وارونهٔ آرایهٔ preview (مستند ۲-c۱: ایندکس بالاتر = جدیدتر) و popular = ترتیب پیش‌فرض آرایه؛ بریدکرامب فروشگاه همیشه حفظ شد (خانه/فروشگاه/[والد/فرزند]) برای ناوبری بهتر (انحراف کوچک از «خانه/دستهٔ فعال»)
- فایل‌ها: src/app/products/page.tsx، src/components/catalog/catalog-view.tsx، src/components/catalog/filter-panel.tsx، src/app/products/[slug]/page.tsx، src/components/product/product-detail.tsx، src/app/search/page.tsx — بدون any، رنگ فقط توکنی، اعداد فارسی، transition 200-300ms، touch≥44 در اکشن‌های اصلی
- وضعیت: lint ✅ exit 0 | tsc ✅ (فقط examples/ و skills/ ازپیش‌موجود) | dev.log ✅ | آماده برای فاز بعد؛ برای ۲-c۲: هیچ فایل مشترکی ویرایش نشد و CategoryIcon هنوز ساخته نشده (بریدکرامب‌ها بدون آیکون طراحی شدند تا اضافه‌شدنش ناقض بریف نشود)

---
Task ID: 2-f
Agent: frontend-styling-expert
Task: فاز ۱ — اسکلت محتوا: وبلاگ (فهرست + جزئیات)، دربارهٔ ما، تماس با ما (+ فرم RHF/zod)، پرسش‌های متداول و ۴۰۴

Work Log:
- خواندن کامل worklog + منابع (globals.css، brand-assets، section-heading، preview-data، jalali/format، brand، shop، header/footer/product-card برای قرارداد کد)؛ هیچ فایل موجودی ویرایش نشد — ۸ فایل همگی جدید
- src/app/blog/page.tsx (Server): metadata title «وبلاگ | مجلهٔ سلامت» (با titleTemplate → «وبلاگ | مجلهٔ سلامت | بسلامت») + PageHero + <BlogIndex articles={PREVIEW_ARTICLES} />
- src/components/blog/blog-index.tsx ('use client'): چیپ‌های دسته («همه» + دسته‌های یکتا با ترتیب ظهور؛ aria-pressed؛ کلیک روی چیپ فعال → بازگشت به «همه») با استایل دقیق بریف (فعال: border-gold + bg-gold-soft/30 dark:/15 + font-semibold)؛ گرید mt-8 md:2/lg:3 با کارت لینک‌دار card-luxe+card-lift (کاور aspect-[16/9] + zoom 1.03 + بج دسته secondary گرد + تاریخ faDate با CalendarDays + عنوان line-clamp-2 hover:text-primary + چکیده line-clamp-3 + «ادامهٔ مطلب» text-gold با ArrowLeft که روی هاور -translate-x-0.5 می‌رود)؛ حالت خالی «مقاله‌ای در این دسته یافت نشد»
- src/app/blog/[slug]/page.tsx (Server): params Promise (Next 16) + generateStaticParams (۳ اسلاگ) + generateMetadata داینامیک (description=excerpt + openGraph type article/publishedTime/images)؛ notFound برای اسلاگ ناشناخته؛ breadcrumb خانه/وبلاگ/عنوان (truncate + aria-current)؛ متا: بج دسته + faDate + زمان مطالعه (کلماتِ بدون تگ ÷ ۲۰۰ → toFa + BookOpen size-3.5)؛ عنوان text-2xl md:text-4xl font-black؛ کاور card-luxe + rounded-2xl + Image fill priority؛ بدنه با سلکتورهای آرگانی بریف + کامنت TODO(فاز ۶) sanitize Tiptap؛ پایان GoldDivider + دکمهٔ ghost «بازگشت به مجله» با ArrowRight وسط
- src/app/about/page.tsx (Server): هیروی وسیع bg-metallic + Pattern طلایی ۵٪ + Watermark بزرگ طلایی ۷٪ سمت چپ + Logo light + h1 «دربارهٔ {brand.name}» (داینامیک/white-label) + tagline؛ «داستان ما» با SectionHeading + گرید lg:2 (سه پاراگراف محترم: تخصص/فروشگاه فیزیکی و مشاورهٔ حضوری/تضمین اصالت) + کارت فروشگاه مستقل (بازسازی نه کپی: ردیف‌های آیکون دایره‌ای accent + نشانی/دو تلفن tel:/رایانامه/ساعت‌ها + «مشاهده روی نقشه» outline طلایی → /contact)؛ «ارزش‌های ما» سه کارت card-lift (ShieldCheck/Users/Headset + دایرهٔ bg-accent size-12)؛ باند پایانی bg-metallic-soft با CTA «تماس با ما» btn-metallic
- src/app/contact/page.tsx (Server): PageHero + گرید lg:grid-cols-5 (فرم col-3 داخل card-luxe p-6 md:p-8 با سرفصل «ارسال پیام»؛ ستون اطلاعات col-2: کارت تماس با همان ردیف‌های آیکون‌دار + کارت نقشه card-luxe overflow-hidden + iframe mapEmbedUrl با title/loading/referrerPolicy طبق بریف)
- src/components/contact/contact-form.tsx ('use client'): RHF + zodResolver (zod 4.3.5 + resolvers 5.2.2)؛ اسکیمای فارسی: name min2 «نام را وارد کنید» / mobile refine normalizePhone «شمارهٔ موبایل معتبر نیست» (dir=ltr + inputMode=tel) / subject از const tuple با پیش‌فرض «سفارش‌ها» (Radix Select با Controller) / message min10 «پیام خود را کامل بنویسید»؛ خطاها role=alert text-destructive text-xs + aria-invalid/aria-describedby؛ Submit با تأخیر شبیه‌سازی ۷۰۰ms → toast.success + reset؛ کامنت TODO(فاز ۵) POST /api/contact؛ دکمه btn-metallic h-12 w-full md:w-auto px-10 + Loader2 + aria-busy؛ noValidate
- src/app/faq/page.tsx (Server): شش سوال محلی const (id سمانتیک) با اعداد فارسی از توابع (formatTomanPlain(45000) → «۴۵٬۰۰۰»، toFa(7))؛ ستون mx-auto max-w-3xl داخل shell (بدون قمار روی کَسکید .shell)؛ Accordion type=single collapsible + آیتم‌های border-border/60 (last:border-b تا قاب بسته شود) + Trigger text-start hover:no-underline؛ کارت CTA «پاسخ‌تان را پیدا نکردید؟» + تماس (btn-metallic) و مجلهٔ سلامت (ghost)
- src/app/not-found.tsx (Server): min-h-[70vh] + Pattern خیلی محو (۳٪/۴٪) + Watermark غول‌پیکر مرکزی (۳۴rem، ۴.۵٪/۶٪) + LogoMark size-16 + «۴۰۴» text-7xl md:text-8xl font-black text-gold-gradient (aria-hidden، پیام در h1) + دو CTA: بازگشت به خانه (btn-metallic h-12 px-8) و جستجو در فروشگاه (ghost → /search)
- تست تعاملی با agent-browser + تحلیل بصری با VLM (دسکتاپ 1440 + موبایل 390): فیلتر دستهٔ وبلاگ (۱↔۳ مقاله) ✓، فرم تماس: ارسال خالی → ۳ خطای فارسی، پرشدن → toast موفق + reset ✓، آکاردئون FAQ باز/بسته + «۴۵٬۰۰۰ تومان ثابت» ✓؛ RTL و چیدمان و ۴۰۴ِ طلایی در هر دو ویوپورت تأیید شد؛ curl: /blog و /blog/{3 اسلاگ} 200، /blog/does-not-exist و مسیر ناموجود 404، titles/OG همه درست
- ESLint کل پروژه exit 0؛ tsc فقط خطاهای ازپیش‌موجود examples/ و skills/؛ dev.log بدون خطا (dev server داخل همین تسک بالا آمد — نمونهٔ قبلی بین‌رunned مرده بود)

Stage Summary:
- تصمیم بصری ۱ — الگوی PageHero یکنواخت: هیرو py-10 md:py-14 «صاحبِ» ریتم بالایی هر صفحه است و shell فقط pb-8 md:pb-12 می‌گیرد تا padding دوبل نشود (۷۲px/104px خیلی هوایی بود)؛ همهٔ صفحات محتوایی دقیقاً همان نشانه‌گذاری را دارند: h1 font-black + زیرعنوان muted mt-2 + GoldDivider mt-6 — ستون فقرات بصری مشترک فاز ۱
- تصمیم بصری ۲ — ریتم طلایی «حداکثر سه لمسه در هر نگاه»: چیپ فعال/ادامهٔ مطلب/ArrowLeft در وبلاگ، دایره‌های accent + دکمهٔ نقشهٔ طلایی در درباره/تماس، و در ۴۰۴ تنها قهرمانِ صفحه عدد ۴۰۴ با text-gold-gradient روی بوم کاملاً خاموش (Pattern ۳٪ + Watermark مرکزی) — هیچ‌جا آبی/هگز؛ همهٔ رنگ‌ها توکنی
- تصمیم بصری ۳ — کارت فروشگاه در about مستقل بازسازی شد (InfoRow محلی با آیکون دایره‌ای bg-accent text-primary) و همان کامپوننتِ ردیف در contact تکرار شد تا هویت «اطلاعات فروشگاه» در دو صفحه یکسان بماند؛ در about واترمارک طلایی ۷٪ سمتِ end و در ۴۰۴ مرکزی — همان هندسهٔ LogoMark در دو مقیاس متفاوت
- نکتهٔ فنی: عنوان صفحهٔ وبلاگ با titleTemplate به «وبلاگ | مجلهٔ سلامت | بسلامت» رندر می‌شود (بریف + برند، بدون absolute)؛ FAQ در max-w-3xl داخلی چیده شد چون .shell در globals بعد از utilityهای هسته تعریف شده و max-w-3xl هم‌سطح با آن برنده نمی‌شد
- فایل‌ها (۸): app/blog/page.tsx، components/blog/blog-index.tsx، app/blog/[slug]/page.tsx، app/about/page.tsx، app/contact/page.tsx، components/contact/contact-form.tsx، app/faq/page.tsx، app/not-found.tsx — بدون any، اعداد فارسی، transition 200-300ms، touch ≥44 (دکمه‌ها h-11/h-12؛ چیپ‌ها مطابق بریف h-9)
- وضعیت: lint ✅ exit 0 | tsc ✅ (فقط examples/skills ازپیش‌موجود) | dev.log ✅ بدون خطا | curl ✅ 200/404 درست | تعاملی ✅ فرم/فیلتر/آکاردئون
- برای فازهای بعد: /api/contact (فاز ۵) جایی که TODO نشانه‌گذاری شد؛ sanitize مقاله (فاز ۶)؛ دادهٔ FAQ از جدول (فاز ۶)؛ لینک «مشاهده روی نقشه» به /contact اشاره می‌کند (نقشهٔ آنجا)

---
Task ID: 1-2-orchestrator-close
Agent: orchestrator (main)
Task: بستن فاز ۱ و ۲ — کامپوز هوم، راستی‌آزمایی مرورگر کامل، .env.example، کامیت گیت

Work Log:
- کامپوز src/app/page.tsx: تمام ۸ بخش هوم از PREVIEW_HOME_SECTIONS (مرتب با sortOrder، احترام به isActive) + metadata برند
- راستی‌آزمایی مرورگر (agent-browser) موفق: هوم هر دو تم (VLM: سالم، کارت‌ها تیره + بوم تصویر روشن = استاندارد)، تاگل دارک persist، مسیر طلایی (محصول → تنوع TG300 با تغییر قیمت زنده ۱٬۶۸۰٬۰۰۰→۲٬۱۵۰٬۰۰۰ → افزودن به سبد → سبد ۲ قلمی با persist)، ورود OTP واقعی (موبایل با ارقام فارسی → devCode ۵۰۷۹۸ → تأیید → /account)، خروج (AlertDialog + پاک شدن کوکی)، منوی موبایل تمام‌صفحه، ناوبری پایین fixed (box: 390×65 @bottom، VLM برش تأیید + بج سبد)، /admin → 307 به login (گارد middleware)، همهٔ صفحات 200، 404 سالم، dev.log صفر خطا، lint exit 0
- .env.example کامل (همهٔ envهای واقعی کد: OTP/SMS سه‌گانه + کلیدها/ترب sandbox+live/SMTP/آپلود/دیتابیس PG-MySQL) + .gitignore برای .verify
- کامیت گیت 92db3f4 با پیام فارسی

Stage Summary:
- فاز ۱ (دیزاین‌سیستم + اسکلت تمام صفحات) و فاز ۲ (Prisma+seed+OTP+درایورها+ایمیل+صف+آپلود) تکمیل و اثبات‌شده
- آماده برای فاز ۳: هوم داینامیک از DB + کاتالوگ سروری + صفحهٔ محصول کامل (زوم YARL) + جستجوی هوشمند — preview-data.ts با کوئری‌های واقعی جایگزین می‌شود
- نکتهٔ مهم برای فاز ۳: searchText نرمال‌شده در DB است (normalizeSearchText در seed.ts)؛ کوئری کاربر هم باید نرمال شود

---
Task ID: R1-redesign
Agent: orchestrator (main) — دیزاینر ارشد
Task: بازطراحی کامل UI/UX پس از انتقاد کاربر — تم سفید-سبز، هیرو، هدر/مگامنو، دسته‌ها، هوم، محصولات، جزئیات محصول، سبد، فوتر و کل رابط موبایل

Work Log:
- تحلیل: اسکرین‌شات قبل/بعد + نقد VLM (قبل: «template-adjacent، placeholder syndrome») — تصاویر در .verify/
- globals.css: پالت روشن از عاجی به سفید-سبز (#ffffff + surface-alt #f3f7f4 سبزفام)؛ border/input/muted همه سبزفام؛ img-canvas جدید؛ bg-surface-alt؛ سایه‌ها دست‌نخورده
- هدر: نوار اعلان bg-pine (باریک‌تر) + سطر اصلی h-76 با جستجوی برجسته (دکمهٔ جستجوی داخلی) + ناوبری با آندرلاین طلایی و لینک «تخفیف‌دارها»؛ مگامنوی سفارشی (hover با تأخیر ۱۲۰ms + پردهٔ dim + Escape + کلیک بیرون) با گرید ۹ دسته (آیکون در مربع سبز، هاور→پر شدن) + ستون مشاورهٔ متالیک؛ جستجوی موبایل لمس‌پذیر زیر هدر
- منوی موبایل: لینک‌های اصلی ۲ستونه + ایندکس دسته‌های شماره‌دار (details/summary بومی) + تم + CTA تماس؛ ناوبری پایین: ۵ اسلات با FAB مرکزی جستجو (bg-metallic + رینگ طلایی)
- هیرو: باند سبزفام روشن + طاق فارسی (rounded-t-[999px]) با قاب طلایی هندسی جابه‌جا + کارت شناور ارسال داخل قاب + دو CTA (اصلی سبز + مشاوره تلفنی) + ۳ چیپ اعتماد؛ نقاط پیشرفت: موبایل مرکز/دسکتاپ زیر ستون متن (right-1/4)
- هوم (۶ بخش جدید): TrustBar (۴ آیکن طلایی + جداکننده عمودی) | CategoryIndex (۹ ردیف شماره‌دار ۰۱-۰۹ با آیکونِ آشکارشونده در هاور + فرزندان) | DealBanner (باند متالیک + شمارش معکوس تا نیمه‌شب + سود شما + بج تخفیف داخل کارت سفید) | BestsellerRail (ریل اسکرول snap با مدال رتبهٔ طلایی + فلش دسکتاپ RTL-safe) | ExpertPicks (کارت شاخص + ۳ ردیف فشرده با چک‌لیست دلایل انتخاب) | AboutStore (باند متالیک + چک‌لیست صداقت + کارت شیشه‌ای فروشگاه حضوری)
- ProductCard: کلاینت (افزودن سریع در هاور دسکتاپ + toast)؛ بج‌ها، رزرو خط قیمت قبلی برای هم‌ترازی، hover -translate-y-1 + سایه
- صفحهٔ محصولات: باند هدر bg-surface-alt با بریدکرامب + H1 + توضیح؛ تولبار شیشه‌ای چسبان (top:159px زیر هدر) با سورت/نما/شمار؛ چیپ‌های فیلتر فعال با حذف یک‌ضربه‌ای + «حذف همه»؛ سایدبار چسبان (top:236px) با پنل فیلتر بازطراحی‌شده؛ دراور موبایل با دکمهٔ «مشاهدهٔ N کالا»؛ حالت خالی جدید
- PDP: گالری زوم دنبال‌کنندهٔ نشانگر (transform-origin + scale-1.7) + thumbnail عمودی؛ برند طلایی، قیمت بزرگ + «سود شما» سبز، تنوع‌ها با قیمت، باکس خرید طلایی (استپر + CTA + میکروکپی)، ردیف اعتماد ۳تایی، آکاردئون (مشخصات کلیدی/ارسال)، مشخصات فنی dl زبرا، نوار خرید چسبان موبایل (bottom-16 بالای ناوبری)
- سبد: CartView جدا از صفحه؛ نوار پیشرفت ارسال رایگان (آستانهٔ brand.shipping.freeThreshold=2M از brand.ts جدید)؛ لیست یک‌کارته با divide؛ جمع‌بندی چسبان + آیکون‌های اعتماد؛ نوار جمع‌بندی چسبان موبایل؛ بخش «مکمل خرید شما» (سروری)؛ checkout از brand.shipping.flatRate تغذیه شد
- فوتر: باند مشاورهٔ طلایی + ۴ ستون (برند/دسترسی/دسته‌ها/تماس) + جوازهای placeholder + فاصله‌گذاری سخاوتمندانه
- types/shop: HomeSectionKey جدید (deal/bestsellers/expertPicks) + preview-data: ft90→featured، بخش‌های ۱۰تایی با عنوان‌های جدید
- راستی‌آزمایی مرورگر (تعاملی): مگامنو (hover+کلیک+بازشدن پنل ✓ بعد از رفع باگ toggle-after-hover)، افزودن سریع + toast ✓، سبد ۲ قلمی + ارسال رایگان (2.15M>2M) ✓، چیپ حذف فیلتر با URL ✓، شمارش معکوس تیک‌ می‌خورد ✓، تم persist ✓، دارک‌مود سالم ✓، دراور فیلتر موبایل + اعمال ✓، منوی موبایل شماره‌دار ✓، تنوع ۲۰ اینچ → قیمت ۹.۹M در نوار چسبان ✓، زوم ✓، اسلایدر ✓، موبایل ۳90px همه صفحات بدون باگ (VLM: NO BUGS)؛ VLM نهایی: 8.5/10
- lint exit 0 | tsc پاک | dev.log بدون خطا

Stage Summary:
- تصیم بصری ۱ — «بوم سفید، سبز به‌عنوان جوهر»: پالت عاجی حذف شد؛ سفید خالص + باند‌های سبزفام متناوب + سبز کاجی فقط برای CTA/سطوح تیره؛ طلایی جواهرِ محدود
- تصمیم بصری ۲ — «ادیتوریال نه کارت‌گرید AI»: ایندکس شماره‌دار، ریل رتبه‌دار، چیدمان مجله‌ای منتخب کارشناس، طاق فارسی امضای بصری
- تصمیم بصری ۳ — «روانشناسی فروش»: شمارش معکوس، مدال رتبه، سود شما، نوار پیشرفت ارسال رایگان، نوارهای چسبان خرید موبایل، چیپ‌های فیلتر فعال
- فایل‌های جدید: category-index، deal-banner، bestseller-rail، expert-picks، cart/cart-view | حذف: category-cards، product-tabs
- همهٔ توکن‌ها توکنی (هیچ هگز خام در کامپوننت‌ها به‌جز img-canvas)، white-label حفظ شد (آستانهٔ ارسال و نرخ از brand.ts)

---
Task ID: 1 (foundation)
Agent: main-orchestrator
Task: بازطراحی کامل — زیرساخت: دیزاین‌سیستم سبز/سفید، تایپ‌ها، داده‌ها، کامپوننت‌های مشترک، سئو

Work Log:
- @tabler/icons-react نصب شد (پکیج آیکون جدید به‌جای lucide برای کدهای جدید)
- globals.css کامل بازنویسی: حذف کامل طلایی/زرد → فقط سبز+سفید؛ --primary #0B4634، --fresh #1E9E6A، پس‌زمینه #F6FAF7؛ shell عریض max-w-[1440px]؛ سایه‌های نرم‌تر؛ انیمیشن‌های keyframes (float/marquee/pulse/shimmer)؛ کلاس‌های glow/glass/mask-fade-b/skeleton-shimmer؛ حذف رفتار translate در card-lift
- scripts/gen-placeholders.ts بازنویسی و ۴۸ SVG بازتولید: پالت سبز جدید، حذف کامل پترن ستاره‌ای مشبک، کاشی‌های تبلیغ جدید (ad-big-1/wide-1/square-1/2/duo-1/2/trio-1/2/3)، اسلایدها ۴:۵ (۱۰۸۰×۱۳۵۰)
- types/shop.ts: HomeSectionKey جدید (hero/needs/ads/productRail/expertPicks/brands/articles/aboutStore)؛ حذف trust/categories/deal/bestsellers/banners؛ DTOهای جدید: NeedCardDTO, AdLayoutKey (bento/duo/trio), AdLayoutSpecDTO, AdSlotSpecDTO, AdTileDTO, AdGridDTO؛ ProductSummary += categorySlug
- preview-data.ts: PREVIEW_NEEDS (۶ نیاز با iconKey و href)؛ AD_LAYOUT_SPECS (ابعاد دقیق px @2x برای طراح) + PREVIEW_ADS (bento، ۴ کاشی فعال)؛ PREVIEW_HOME_SECTIONS جدید؛ متن اسلایدها به‌روز؛ toProductSummary += categorySlug
- کامپوننت‌های مشترک: product-card v2 (مربع ۱:۱، نگهدارنده p-2، عکس rounded-2xl، هاور فقط بوردر ظریف، دکمهٔ + دایره‌ای همیشه‌دیدنی)؛ category-icon → تبلر؛ section-heading v2 (اکسنت fresh)؛ motion.tsx (Reveal/CountUp/StaggerList/StaggerItem)؛ marquee.tsx؛ brand-assets (حذف Pattern، سبز، Watermark حفظ)؛ search-dialog + store/search (cmdk، شورت‌کات Ctrl+K و /، جستجوی لحظه‌ای نرمالایز فارسی، اخیر localStorage، پرطرفدار)
- سئو: layout.tsx (metadata کامل: keywords/OG/Twitter/robots/canonical + viewport themeColor + JsonLd Organization/WebSite در body)؛ lib/jsonld.ts (organization/webSite/product/breadcrumb/article/faq)؛ components/shared/json-ld.tsx؛ app/sitemap.ts؛ app/robots.ts (حذف public/robots.txt)؛ app/manifest.ts؛ Product JSON-LD در products/[slug]؛ Article JSON-LD در blog/[slug]؛ FAQ JSON-LD در faq
- پاکسازی: حذف ۵ کامپوننت منسوخ home (trust-bar/category-index/deal-banner/bestseller-rail/home-banners)؛ حذف Pattern از همهٔ مصرف‌کننده‌ها؛ page.tsx موقت (ایجنت وظیفهٔ ۳ بازنویسی می‌کند)
- tsc پاک (فقط خطاهای ازپیش‌موجود examples/skills)؛ سرور ۲۰۰

Stage Summary:
- فایل‌ها: globals.css، types/shop.ts، lib/preview-data.ts، lib/jsonld.ts، scripts/gen-placeholders.ts، ۴۸ placeholder SVG، components/shared/{product-card در product/, category-icon, section-heading, motion, marquee, brand-assets, search-dialog, json-ld}، store/search.ts، app/{layout, sitemap, robots, manifest}.ts، app/page.tsx (موقت)، JSON-LD در products/[slug] و blog/[slug] و faq
- قراردادهای جدید برای ایجنت‌ها: PREVIEW_NEEDS/PREVIEW_ADS/AD_LAYOUT_SPECS؛ ProductCard v2 (همان export)؛ SearchDialog از store: useSearchDialogStore((s)=>s.openDialog)؛ آیکون فقط @tabler/icons-react؛ ممنوع: کلاس‌های gold، Pattern، پترن مشبک
- ایجنت‌های بعدی: 2=layout shell (header/megamenu/mobile/footer/bottom-nav)، 3=homepage (hero/needs/ads/rail/expert/brands/articles/about)، 4=catalog (header فروشگاه/sidbar درختی/slider قیمت/سرچ/چیپ‌ها)

---
Task ID: 4
Agent: frontend-styling-expert
Task: بازسازی کامل کاتالوگ (/products) + هم‌راستاسازی /search — باند هدر فروشگاهِ چشم‌نواز، سایدبار درختی، اسلایدر قیمت، جستجوی درون‌کاتالوگ، چیپ‌ها، صفحه‌بندی و حالت خالی

Work Log:
- خواندن worklog (بخش Task 1) + کدهای فعلی کاتالوگ/داده/tایپ‌ها + همهٔ primitiveهای ui (slider/collapsible/drawer/pagination/breadcrumb/select/switch/input/separator)؛ راستی‌آزمایی وجود آیکون‌های تبلر (IconPackageOff/IconAdjustmentsHorizontal/IconArrowsSort/IconSparkles/…) در پکیج
- فایل جدید shop-header.tsx: باند bg-metallic full-bleed با border-b border-fresh/20 + Watermark غول‌پیکر (-end-16 -top-16 size-72 md:size-96 rotate-12 text-fresh/10) + دو glow (fresh/15 و primary/40)؛ بریدکرامب روشن text-[11px] (لینک text-on-metallic-muted hover:text-fresh، جاری text-on-metallic، جداکننده IconChevronLeft size-3)؛ h1 دیده‌شو text-2xl md:text-[2rem] font-black text-on-metallic؛ توضیح text-[13px] leading-7 max-w-2xl؛ عنوان با AnimatePresence mode=wait (y 8→0، initial=false) و چیپ شمار با pop کوچک key=count
- تصمیم خوانایی: چیپ شمارِ باند با «glass» خام (سفیدِ ۷۸٪) متنِ text-on-metallic را نامرئی می‌کرد → چیپ شیشه‌ایِ تیره دست‌ساز: border-fresh/25 bg-primary/30 backdrop-blur-sm text-on-metallic (روحِ glass حفظ، کنتراست تضمین)
- catalog-view.tsx بازنویسی کامل با حفظ معماری URL-sync (router.replace بدون اسکرول، مقادیر غیرپیش‌فرض فقط): state فیلتر/سورت/صفحه/نما؛ ساختار جدید ShopHeader → shell → جستجوهای پرطرفدار → تولبار (دکمهٔ فیلتر موبایل + جستجو + سورت + نما + شمار ms-auto) → چیپ‌های فعال → grid lg:grid-cols-[17rem_minmax(0,1fr)] → صفحه‌بندی
- جستجوی درون‌کاتالوگ: ورودی محلی + commit روی Enter/دکمهٔ پاک‌سازی + دیبانس ۴۰۰ms با useEffect timer؛ تغییرات بیرونی (چیپ/ریست) با ref مقایسه و به ورودی برمی‌گردد (بدون踩 کردن تایپِ کاربر)
- چیپ‌های فیلتر فعال: bg-secondary rounded-full text-[11px] با X تبلر و hover:bg-fresh-soft + «حذف همه» text-destructive؛ قیمت به‌صورت یک چیپ ترکیبی «از X تا Y تومان»
- عنوان/توصیح/بریدکرامب باند reactive از state: جستجو → «نتایج جستجو برای «q»»، دسته → نام دسته + «خرید آنلاین … با ضمانت اصالت کالا و ارسال سریع»، پیش‌فرض → shopTitle (پروپ جدید، پیش‌فرض «فروشگاه بسلامت»؛ صفحهٔ جستجو «جستجو در فروشگاه» می‌دهد)
- گرید نتایج: StaggerList/StaggerItem با key=page|sort|view|فیلترها (پخشِ دوبارهٔ نرم در صفحه‌بندی/فیلتر)؛ سایدبار sticky top-[172px] (ارتفاع واقعی هدر ۱۶۰px + ۱۲ حاشیه — به‌جای top-28 نادرستِ سفته) با max-h و اسکرول داخلی
- دراور موبایل: هدر «فیلترها» + شمار، پنل با اسکرول، فوتر دو دکمه [حذف همه outline flex-1][نمایش N کالا flex-2] + pb محیط safe-area
- filter-panel.tsx بازنویسی کامل: درخت دسته‌بندی با Collapsible در هر والد — ردیف = انتخاب دسته (آیکون در size-8 bg-secondary/70 + عنوان + بج شمارش) و شورانِ جدا = باز/بستن (data-[state=open]:rotate-180، aria-expanded خودکار رادیکس)؛ «همهٔ دسته‌ها» با IconLayoutGrid/IconCheck؛ فرزندان با نقطهٔ fresh/60 و شمارش؛ شمارش‌ها از product.categorySlug
- اسلایدر قیمت دومفهومی: PRICE_MAX=ceil(سقف قیمت محصولات به ۱۰۰k)=۲۸٬۵۰۰٬۰۰۰، step ۵۰k، مقدار محلی حین درگ و اعمال فقط با onValueCommit (انتهای مسیر = حذف فیلتر همان طرف)؛ عنوان بخش + div.mt-2 دور اسلایدر (دقیقاً «مارجین تاپ ۲» که مشتری خواست) + خط جمع زندهٔ «X — Y تومان» که حین درگ زنده به‌روز می‌شود؛ ورودی‌های از/تا با همان الگوی مستحکم commit روی blur/Enter
- جایگزینی lint-error: همگام‌سازی اسلایدر با والد از effect به الگوی «تنظیم state حین رندر» (React docs) — بدون effect، بدون cascading render
- product-grid.tsx (فقط restyle): حالت خالی جدید (IconPackageOff در جعبهٔ size-16 rounded-3xl bg-secondary p-4 + «محصولی مطابق فیلترها پیدا نشد» + دکمهٔ h-10 rounded-full bg-primary «حذف فیلترها» با onReset اختیاری)؛ پروپ‌های افزایشی stagger/onReset (پیش‌فرض خاموش — cart و PDP بی‌تفاوت)؛ کلاس‌های گرید دست‌نخورده
- products/page.tsx لاغر شد: متادیتا «فروشگاه تجهیزات پزشکی» (با template → «… | بسلامت»)؛ همان تجزیهٔ امن searchParams؛ باند/بریدکرامب/بریدکرامب JSON-LD به کلاینت سپرده شد (آیتم‌های درخت‌واره client-derived)
- search/page.tsx: همان CatalogView با shopTitle «جستجو در فروشگاه» + popularSearches → ردیف «جستجوهای پرطرفدار:» با IconSparkles و پیل‌های /search?q=… زیر باند؛ robots noindex حفظ شد
- لیست‌ویو (view=list) با نگاشت URL حفظ و کاملاً بازطراحی شد (بدون هیچ کلاس gold: بج تخفیف bg-destructive، جدید bg-primary، بوردر hover primary/35)
- tsc پاک | bun run lint exit 0 | بدون dev server (مجاز نبود؛ سرور هم خاموش بود) — راستی‌آزمایی استاتیک کامل انجام شد

Stage Summary:
- فایل‌ها: NEW src/components/catalog/shop-header.tsx؛ REWRITE catalog-view.tsx، filter-panel.tsx، app/products/page.tsx، app/search/page.tsx؛ RESTYLE product/product-grid.tsx
- قرارداد عمومی حفظ شد: CatalogView/CatalogInitialFilters/CatalogSortKey/CatalogViewMode (کلاس CatalogFilterState هم ماند) + شکل پروپ‌ها؛ فقط پروپ‌های اختیاری اضافه شد (shopTitle، popularSearches؛ stagger/onReset در ProductGrid) — Cart و PDP بدون تغییر کار می‌کنند
- پالت فقط سبز+سفید؛ صفر کلاس gold/lucide در کدهای جدید؛ عمق فقط با Watermark/glow/بوردر/سایه؛ آیکون‌ها همه @tabler/icons-react با stroke 1.75 (IconPackageOff با 1.5)
- نکته برای ایجنت‌های بعدی: هدر چسبان دسکتاپ ۱۶۰px است — فاصلهٔ sticky محتوا زیر آن ۱۷۲px توصیه می‌شود؛ اسلایدر قیمت قرارداد «انتهای مسیر = بدون فیلتر» دارد؛ فیلتر q در URL با toEnDigits ذخیره می‌شود

---
Task ID: 3
Agent: frontend-styling-expert
Task: بازسازی کامل صفحهٔ خانه ۲۰۲۶ — هیرو (embla+framer+جستجو+آمار)، نیازها، گرید تبلیغ بنتو، ریل تب‌دار، منتخب کارشناس، مارکی برندها، مقالات، دربارهٔ فروشگاه + کامپوز سروری page.tsx

Work Log:
- page.tsx: کامپوز سروری از PREVIEW_HOME_SECTIONS (فیلتر isActive + سورت sortOrder) با switch کامل ۸ کلید؛ metadata مثل قبل؛ داده‌ها به‌صورت prop به کلاینت‌ها (bundle سبک: preview-data فقط سمت سرور import شد)؛ RAIL_TABS (هر تب ≤۸)، FEATURED_PRODUCTS (isFeatured)، SPOTLIGHT=PREVIEW_PRODUCTS[0]
- hero.tsx (جدید، کلاینت): معماری «یک گرید ثابت + embla فقط روی کارت تصویری» — متن با AnimatePresence mode="wait" هم‌گام با selectedScrollSnap عوض می‌شود؛ اتوپلی ۶s + loop + direction rtl + stopOnMouseEnter (الگوی hero-slider قدیمی)؛ h1 سئو sr-only، اسلایدها h2؛ مارکر هایلایت زیر عبارت کلیدی هر اسلاید (SLIDE_HIGHLIGHT per-id؛ span isolate تا -z-10 روی پس‌زمینه بخش نیفتد)؛ جستجوی واقعی (openDialog از store/search) + kbd «/» + چیپ‌های PREVIEW_POPULAR_SEARCHES؛ CTA اسلایدی (btn-metallic با fade لیبل keyed) + مشاورهٔ تلفنی tel:؛ آمار CountUp (۱۲۰+/۸۵۰۰+/۹۸٪) divide-x منطقی؛ نقاط میله‌ای (موبایل مرکز/دسکتاپ زیر متن)؛ فلش‌های دسکتاپ داخل کارت (RTL: قبلی=IconArrowRight سمت start/راست)؛ کارت محصول شناور واقعی (animate-float) + چیپ شیشه‌ای «پرفروش‌ترین‌ها» (animate-float-slow)؛ قاب هندسی rotate-3 پشت کارت + دو glow؛ ورود پلکانی variants (staggerChildren 0.08)
- needs-section.tsx (جدید، سرور): ۶ کارت نیاز (فیلتر/سورت از داده) با وارونگی آیکون در هاور (bg-secondary→bg-primary)، فلش لینک لغزان، StaggerList؛ متن‌ها از HomeSectionDTO
- ad-grid.tsx (جدید، سرور): سه قالب bento/duo/trio با SLOT_CLASS/SLOT_SIZES per-slot؛ فیلتر isActive + بُرد slotIndex؛ کامنت فارسی ابعاد طراحی برای طراح (عین AD_LAYOUT_SPECS)؛ زوم آرام 1.04، روکش گرادیانی، CTA گوشه با backdrop-blur؛ bento: slot0=col-span-2+row-span-2، slot1=col-span-2 (2:1)، slot2/3 مربع — RTL: مربع بزرگ راست
- product-rail.tsx (جدید، کلاینت): تب‌های پیل‌دار سفارشی role=tablist + اندیکاتور لغزان motion.span layoutId="home-rail-tab" (spring 0.25)؛ ریل snap-x + mask-fade-x + scrollbar-none، آیتم w-[min(70vw,240px)]/md:w-[min(40vw,260px)]؛ فلش دسکتاپ با scrollBy (جلو در RTL = left منفی)؛ تعویض تب AnimatePresence fade؛ آیتم‌ها ProductCard v2
- expert-picks.tsx (بازنویسی): باند bg-surface-alt + گرید ۲/۴ ستونی محصولات isFeatured (۴ قلم) با StaggerList — حذف چیدمان مجله‌ای قدیمی/طلایی؛ ProductCard استاندارد
- brands-marquee.tsx (جدید): سرِنوار با هیرلاین گرادیانی سبز (بدون کلاس gold) + Marquee مشترک duration=36 داخل mask-fade-x؛ وردمارک‌های تایپی لینک به /products?brand=slug
- articles-teaser.tsx (بازنویسی): کاور ۳:۲ + بج دسته شیشه‌ای start-3، عنوان min-h-11، متا (IconClock + ۵ دقیقه + dot + faDate)؛ آیکون‌ها از lucide به تبلر؛ StaggerList
- about-store.tsx (بازنویسی): پنل bg-metallic rounded-[2rem] با Watermark + دو glow؛ داستان برند (متن قبلی حفظ شد)، ۳ آمار CountUp inline (divide-white/15)، CTA «بیشتر دربارهٔ ما» (border-white/25 hover:border-fresh/60)؛ حذف کارت شیشه‌ای آدرس و Pattern طبق بریف
- حذف: hero-slider.tsx، brands-strip.tsx (جایگزین کامل؛ هیچ ارجاعی باقی نماند)
- قواعد: صفر کلاس gold و صفر lucide در کدهای جدید؛ فقط @tabler/icons-react؛ عمق فقط glow/بوردر/سایه/قاب هندسی/واترمارک (بدون mesh/پترن/طاق)؛ پراپرتی‌های منطقی RTL (start/end)؛ ProductCard v2 همه‌جا

Verification:
- bun run lint → exit 0 | bunx tsc --noEmit → فقط ۴ خطای ازپیش‌موجود examples/skills (فیلتر شده، صفر خطا در پروژه)
- SSR: GET / 200؛ هر ۸ بخش + همه متن‌ها (جستجو بین ۱۵ کالا، آمار، تایل‌ها، مقالات، دربارهٔ ما) در HTML اولیه ✓
- اسکرین‌شات دسکتاپ 1440px (.verify/home-*.png + اسلایس‌ها): بدون خطای کنسول/صفحه؛ نقد VLM → ایرادهای واقعی صفر (ادعاهای RTL مدل بینا غلط بود — با تحلیل پیکسلی sharp تأیید شد ستون متن راست/کارت تصویر چپ، مارکر زیر عبارت، آمار یک‌ردیف، چیپ/کارت شناور بدون کلیپینگ حروف؛ عنوان کارت شناور فقط ellipsis طرح‌داده‌شده)
- نکته: dev server محیطِ ازپیش‌فعل وسط جلسه از دست رفت (پس از ثبت اسکرین‌شات‌ها؛ لاگ مرگ ناگهانی بدون خطای کامپایل) — طبق قید وظیفه restart نشد؛ موبایل با کلاس‌های استاندارد responsive تأمین شده ولی اسکرین‌شات موبایل گرفته نشد

Stage Summary:
- ۹ فایل: hero/needs-section/ad-grid/product-rail/brands-marquee (جدید) + expert-picks/articles-teaser/about-store (بازنویسی) + page.tsx؛ ۲ فایل حذف
- معماری هیرو الگوی مرجع شد: «اسلایدر تصویر embla + متن AnimatePresence هم‌گام» — اسلاید بعدی بدون جابه‌جایی گرید
- CountUp جداکنندهٔ هزارگان ندارد (محدودیت motion.tsx مشترک — دست نخورده)؛ آمار عمداً ۱۲۰/۸۵۰۰/۹۸ انتخاب شد
- برای فاز ۳: همهٔ داده‌ها از page.tsx به‌صورت prop تزریق می‌شود (spotlight/productCount/popularSearches/tabs/products) — با API زنده فقط page.tsx عوض می‌شود
- برای ایجنت‌های بعدی: فلش ریل در RTL = scrollBy منفی برای جلو؛ mask-fade-x دو لبهٔ ریل را محو می‌کند (رفتار طرح‌شده)؛ حذف hero-slider یعنی هیچ مصرف‌کننده‌ای از Autoplay قدیمی نماند

---
Task ID: 2
Agent: frontend-styling-expert (بازسازی توسط هماهنگ‌کننده به دلیل پایان‌مهلت ایجنت — کد ایجنت کامل و سالم بود؛ این رکورد به نمایندگی ثبت شد)
Task: پوستهٔ چیدمان — هدر، مگامنوی سه‌سطحی (فقط هاور روی دکمه)، منوی موبایل، فوتر، ناوبری پایین موبایل

Work Log:
- header.tsx: سه سطر دسکتاپ (نوار اعلان bg-pine + هویت/جستجو/اکشن‌ها + ناوبری)؛ دکمهٔ جستجو به شکل ورودی با kbd ⌘K که دیالوگ سراسری را باز می‌کند؛ جستجوی موبایل = دکمهٔ لمس‌پذیر → دیالوگ؛ نشانگر سبد با انیمیشن bounce و bg-fresh؛ آیکون‌ها همه @tabler/icons-react؛ زیرخط لینک‌ها bg-fresh
- mega-menu.tsx (جدید): رفع باگ اصلی مشتری — هاور فقط روی دکمهٔ «دسته‌بندی کالاها» + خودِ پنل (والد مشترک self-stretch؛ بسته‌شدن تأخیری ۱۵۰ms)؛ سه سطح: ستون دسته‌های اصلی (۹ عدد، آیکون + شمارش فعال) → زیردسته‌های دستهٔ فعال (گرید ۲ستونه با نقطهٔ fresh) → «پیشنهاد این دسته» (تا ۳ مینی‌کارت محصول واقعی از categorySlug)؛ کارت هم‌عرض ظرف max-w-[1440px] (نه تمام‌صفحه)، rounded-b-3xl + border-t-2 border-fresh/70؛ پردهٔ محو با پورتال به body؛ Esc + کلیک بیرون + تغییر مسیر می‌بندد
- mobile-menu.tsx: Sheet با درخت آکاردئونی دسته‌ها + دکمهٔ جستجو (→ دیالوگ) + لینک‌ها + CTA تلفنی btn-metallic
- footer.tsx: bg-metallic + Watermark text-fresh/10؛ ستون‌ها با لینک‌های on-metallic-muted hover:text-fresh؛ آیکون‌های تبلر (IconPhone/IconMapPin/IconMail/IconClock)؛ نوار پایانی کپی‌رایت
- bottom-nav.tsx: پنج اسلات (خانه/دسته‌بندی‌ها→منوی موبایل/جستجو→دیالوگ/سبد/حساب)؛ glass fixed bottom + safe-area؛ حالت فعال text-fresh + نقطهٔ layoutId انیمیشنی؛ بج شمار سبد
- theme-toggle.tsx: IconSun/IconMoonStars با انیمیشن چرخش framer
- حذف Pattern از همهٔ فایل‌ها؛ صفر کلاس gold؛ صفر lucide

Stage Summary:
- فایل‌ها: layout/{header, mega-menu(NEW), mobile-menu, footer, bottom-nav, theme-toggle}.tsx
- راستی‌آزمایی مرورگر (توسط هماهنگ‌کننده): هاور روی لینک سادهٔ ناوبری منو را باز نمی‌کند ✓؛ هاور روی دکمه باز می‌کند ✓؛ کارت پنل ۱۴۴۰px وسط‌چین در ویوپورت ۱۹۲۰ (نه تمام‌صفحه) ✓؛ سه سطح محتوایی ✓؛ موبایل: bottom-nav پنج‌تایی fixed ✓، شیت دسته‌ها آکاردئونی ✓، دکمهٔ جستجوی شیت دیالوگ را باز می‌کند ✓
- tsc/lint پاک

---
Task ID: 5
Agent: main-orchestrator
Task: یکپارچه‌سازی و راستی‌آزمایی E2E کل بازطراحی + رفع اشکال

Work Log:
- ادغام خروجی سه ایجنت موازی + زیرساخت Task 1؛ ایجنت Task 2 با پایان‌مهلت متوقف شد اما همهٔ ۶ فایلش کامل بود — کد بازبینی و راستی‌آزمایی شد؛ رکوردش به نمایندگی ثبت شد
- رفع «فاصله از لبه‌ها»: shell از max-w-7xl به max-w-[1440px]
- مگامنو: سه تلاش برای محدودسازی عرض کارت — نتیجه نهایی ساختار اصلی (wrapper inset-x-0 + کارت داخلی mx-auto max-w-[1440px]) صحیح بود؛ «تمام‌صفحه» در اندازه‌گیری اول عرضِ wrapper نامرئی بود؛ تایید نهایی: کارت ۱۴۴۰px وسط‌چین در ۱۹۲۰
- browser E2E دسکتاپ ۱۴۴۰/۱۹۲۰: هوم (h1 سئو sr-only، ۸ بخش به‌ترتیب، صفر کلاس gold، ۲ JSON-LD)؛ مگامنو (رفع باگ هاور ✓، سه سطح ✓)؛ دیالوگ جستجو (Ctrl+K ✓، نتیجهٔ لحظه‌ای «قندسنج» ✓، چیپ پرطرفدار ۶تایی ✓)؛ کاتالوگ (باند bg-metallic با h1 «فروشگاه بسلامت»، درخت ۹تایی با شمارش، اسلایدر دومفهومی، جستجو، انتخاب دسته → URL ?category=glucose + چیپ)؛ mt-2 روی wrapper اسلایدر قیمت (۸px) ✓؛ کارت محصول (دکمهٔ + → toast + بج ۱)؛ دارک‌مود (bg سبز-مشکی، صفر gold)؛ صفحهٔ محصول (Product+Breadcrumb JSON-LD)؛ همهٔ مسیرها ۲۰۰
- browser E2E موبایل ۳۹۰: بدون سرریز افقی (scrollW=390)؛ bottom-nav پنج‌تایی fixed پایین ✓؛ مگامنو مخفی ✓؛ شیت منو با آکاردئون + جستجو ✓؛ دراور فیلتر با درخت+اسلایدر+دکمهٔ «نمایش N کالا» ✓
- نقد بصری VLM (سه اسکرین‌شات واقعی پس از اسکرول): هیرو ۹/۱۰، گرید تبلیغ ۸.۵/۱۰، ریل محصول ۸/۱۰؛ ایرادهای گزارش‌شده بررسی شد: «فاصلهٔ خالی بزرگ» = آرتیفکت اسکرین‌شات full-page از انیمیشن‌های whileInView (بخش‌ها زیر fold نامرئی) — با اندازه‌گیری DOM رد شد (بخش‌ها پیوسته، بدون گپ)؛ «هم‌پوشانی بج‌ها» = رد شد (تست تقاطع مستطیل‌ها false)؛ فلش‌های ← در RTL درست‌اند
- lint پاک، tsc پاک (فقط examples/skills ازپیش‌موجود)، dev.log بدون خطای جدید

Stage Summary:
- کل بازطراحی سبز/سفید ۲۰۲۶ تحویل شد: هوم ۸ بخشی جدید، هدر+مگامنوی سه‌سطحی رفع‌باگ‌شده، کاتالوگ با باند سبز و سایدبار درختی و اسلایدر قیمت، کارت محصول v2 (مربع/p-2/rounded-2xl/هاور فقط بوردر)، دیالوگ جستجوی سراسری (⌘K و /)، سئو کامل (متادیتا + JSON-LD چهارگانه + sitemap + robots + manifest)، آیکون‌های تبلر، انیمیشن‌های Reveal/CountUp/Stagger/Marquee، پکیج آیکون @tabler/icons-react
- بدهی فاز بعد: پنل ادمین برای مدیریت AdGrid (فعال/غیرفعال + چیدمان + آپلود) — موتور و مدل داده آماده است (AD_LAYOUT_SPECS ابعاد دقیق هر اسلات)

---
Task ID: 6-a
Agent: frontend-styling-expert
Task: بازطراحی کامل صفحات «دربارهٔ ما» و «تماس با ما» — لوکس، شیشه‌ای و متحرک (سبز+سفید، تبلر، RTL)

Work Log:
- خواندن worklog (Task 1-5) + کدهای مرجع (shop-header, hero, about-store, footer, motion, marquee, brand-assets, globals.css, contact-form) و راستی‌آزمایی وجود همهٔ آیکون‌های تبلر در پکیج
- about/page.tsx بازنویسی کامل (سروری، متادیتا حفظ شد): هیرو bg-metallic با بریدکرامب روشن + لایهٔ گرادیان شعاعی نبض‌دار (animate-pulse-soft) + واترمارک rotate-12 + دو glow (یکی animate-float-slow) + چیپ شیشه‌ای «از سال ۱۳۹۱» + h1 بزرگ با مارکر bg-fresh/35 زیر نام برند (الگوی هیروی خانه) + ۳ چیپ آمار شیشه‌ای تیره با CountUp (۱۲+/۸۵۰۰+/۹۸٪ — هم‌ارز خانه)
- نوار اعتماد متحرک (Marquee مشترک + mask-fade-x، ۶ تعهد با IconCircleCheckFilled تازه) به‌عنوان گذار زندهٔ هیرو→محتوا
- داستان دوستونه: متن ادیتوریال (۳ پاراگراف قبلی حفظ شد) + خط امضا «تیم بسلامت»؛ ویژوال = پنل bg-metallic با Watermark/glow + کارت شیشه‌ای اطلاعات فروشگاه (آدرس/تلفن×۲/رایانامه/ساعت‌ها با آیکون‌های تبلر کوچک در دایره‌های bg-white/10) + دو چیپ شناور animate-float/animate-float-slow (سال ۱۳۹۱، ضمانت اصالت) + قاب هندسی چرخیده
- خط زمان ۴ نقطه‌ای (۱۳۹۱/۱۳۹۵/۱۳۹۹/۱۴۰۳) روی باند bg-surface-alt full-bleed: خط عمودی در موبایل/افقی در دسکتاپ با یک div دوجهته، نقاط حلقه‌ای fresh با هاله؛ ورود با StaggerList
- ارزش‌ها به‌شکل ردیف‌های شماره‌دار ادیتوریال (۰۱/۰۲/۰۳ بزرگ text-fresh/30→fresh در هاور + عنوان/متن + آیکون کوچک با وارونگی accent→primary در هاور) داخل کارت یکپارچهٔ گِرد — حذف کلیشهٔ کارت‌های آیکون‌دارِ وسط‌چین
- فراخوان پایانی: پنل گِرد bg-metallic rounded-[2.5rem] با دو واترمارک + glow مرکزی + دکمهٔ bg-fresh-strong «تماس با ما» و دکمهٔ ثانویه به /faq
- contact/page.tsx بازنویسی کامل (سروری، متادیتا حفظ، <ContactForm /> موجود دست‌نخورده): هیرو bg-metallic با بریدکرامب + چیپ «پاسخ‌گوی شما هستیم» + h1 + چیپ بزرگ شیشه‌ای تلفن (tel: با IconPhoneCall + هالهٔ نبض‌دار، عدد درشت dir=ltr) + خط ساعت پاسخ‌گویی
- گرید اصلی lg:grid-cols-5: ستون فرم (glass با هاله‌های glow پشت کارت تا بلور دیده شود + هدر IconSend، فرم flex-1 تا کف ستون) + ستون اطلاعات: کارت glass اطلاعات تماس (۴ InfoRow)، کارت شبکه‌های اجتماعی (فیلتر activeSocials + سوئیچ آیکون تبلر/حرف اول مانند فوتر، دکمه‌های size-11)، کارت نقشه (هدر + قاب border-fresh/25 + iframe؛ در دسکتاپ flex-1 تا با کفِ فرم تراز شود)
- دسترسی سریع پایانی: دو کارت لینک (دربارهٔ ما IconUsers / پرسش‌های متداول IconMessageCircleQuestion) با فلش لغزان در هاور، StaggerList
- تصمیم خوانایی (طبق رزبِ Task 4): چیپ‌های شیشه‌ای روی باند سبز = «شیشهٔ تیره» دست‌ساز (GLASS_DARK: border-white/15 + گرادیان from-white/[0.14] to-white/[0.05] + backdrop-blur-md + هایلایت داخلی) به‌جای glass خام ۷۸٪ سفید که متنِ text-on-metallic را نابود می‌کرد؛ glass-strong هنوز در globals.css نبود (ویرایش موازی هماهنگ‌کننده) → معادل صریح با کلاس‌های Tailwind ساخته شد تا نتیجه مستقل از زمان‌بندیِ آن ویرایش باشد
- رفع باگ ریپنسیو (ملاک DOM): قاب چرخیدهٔ داستان با -inset-3 + rotate در ۳۹۰px اسکرول افقی ۶px می‌ساخت → inset-x-0 -inset-y-3 (بیرون‌زدگی افقی چرخش زیر پدینگ shell می‌ماند؛ scrollW=390 ✓)
- راستی‌آزمایی مرورگر (agent-browser): موبایل ۳۹۰ هر دو صفحه بدون سرریز افقی؛ تراز ستون‌های contact (کف فرم=کف نقشه=۱۵۶۹px)؛ هندسهٔ خط زمان (مرکز نقطه ۳۶۶٫۵ = خط ۳۶۶٫۵)؛ برچسب/placeholder فرم بدون برش؛ دارک‌مود سالم
- نقد VLM سه‌مرحله‌ای (دسکتاپ پس از پخش انیمیشن‌ها ۷٫۵/۱۰، موبایل ۷/۱۰، دارک ۹٫۵ و ۹/۱۰): ایرادهای واقعی گرفته شد (سایهٔ کارت شیشه‌ای، تراز ستون نقشه)؛ ادعاهای ردشده با اندازه‌گیری DOM: نقشهٔ سفید = آرتیفکت شبکهٔ سندباکس (tiles گوگل لود نمی‌شود؛ URL قبلی دست‌نخورده)، بِج «1 Issue» قرمز = dev-tools خود Next.js، ادعاهای برش متن/نقطهٔ خط زمان با اندازه‌گیری رد شد

Stage Summary:
- فایل‌ها: REWRITE src/app/about/page.tsx، REWRITE src/app/contact/page.tsx؛ اسکرین‌شات‌های راستی‌آزمایی در .verify/{about,contact}-{final,mobile-scrolled,dark-full}.png
- صفر کلاس gold و صفر lucide در کدهای جدید؛ فقط @tabler/icons-react با stroke 1.75؛ عمق فقط glow/واترمارک/بوردر/سایه/گرادیان شعاعی (بدون پترن)؛ پراپرتی‌های منطقی RTL؛ اهداف لمسی ≥44px
- tsc پاک (فقط examples/skills ازپیش‌موجود) | bun run lint exit 0 | GET /about و /contact هر دو 200 | بدون تغییر در ContactForm و globals.css و هیچ فایل مشترک دیگر
- نکته برای ایجنت‌های بعدی: الگوی GLASS_DARK (چیپ شیشه‌ای تیره روی باند متالیک) در هر دو صفحه تکرار شد — اگر glass-strong سرانجام به globals.css اضافه شد، این ثابت‌ها می‌توانند به آن مهاجرت کنند؛ متن «تحویل حضوری از فروشگاه» در مارکی عمداً جایگزین هر عبارت ارسال رایگان شد

---
Task ID: 6-b
Agent: main-orchestrator
Task: اصلاحات نکات‌به‌نکتهٔ بازخورد مشتری — مگامنو، مودال سرچ، هیرو، داک موبایل، برندها، سبد، بازطراحی «خرید بر اساس نیاز»، سیستم طراحی شیشه‌ای/گرادیانی

Work Log:
- مگامنو (mega-menu.tsx): رفع باگ «باز ماندن هنگام خروج ماوس از چپ/راست» — ریشه: رپرِ تمام‌عرضِ absolute نامرئی فرزندِ ناحیهٔ هاور بود؛ رپر pointer-events-none و کارت داخلی pointer-events-auto شد → خروج از هر ۴ جهت بلافاصله می‌بندد (تأیید E2E در 1920px: خروج چپ/راست هر دو بستند، ورود مجدد باز می‌کند). پس‌زمینهٔ کارت glass-strong (بلور ۲۴px + اشباع) شد.
- کشف و رفع باگ رندر بلور: نوشتن همزمان backdrop-filter و -webkit-backdrop-filter در globals.css باعث می‌شد Lightning CSS هر دو را به «فقط پیشونددار» ادغام کند که کروم نادیده می‌گیرد → بلورِ .glass قدیمی هرگز رندر نمی‌شد (دلیل اصلی شکایت «نوبار بلور نیست»). حذف خط پیشونددار از .glass و .glass-strong؛ حالا هر دو خاصیت به‌درستی emit می‌شوند (تأیید: computed blur(24px) saturate(1.5)).
- مودال سرچ (search-dialog.tsx): showCloseButton={false} (حذف ضربدر دیالوگ) + حذف دکمهٔ پاک‌کردن ورودی (kbd «/» همیشه نمایان) + بدنهٔ شیشه‌ای bg-popover/90 backdrop-blur-2xl. حذف تک‌تکِ اخیرها (✕ کوچک hover) حفظ شد.
- هیرو (hero.tsx + page.tsx): حذف کامل کارت محصول شناور، چیپ شناور «پرفروش‌ترین‌ها» و قاب هندسی چرخیده دور عکس؛ تصویر تمیز max-w-[480px] فقط با بوردر+سایه. پروپ spotlight و ثابت SPOTLIGHT از page.tsx حذف شد. هاله‌های glow با animate-drift/animate-drift-slow زنده شدند.
- داک موبایل (bottom-nav.tsx): بازنویسی — داک شناور گِرد (rounded-[1.4rem]، mx-3، فاصلهٔ 12px از کف) با glass-strong + بوردر + shadow-lift + هایلایت داخلی لبهٔ شیشه؛ پیل فعال لغزان layoutId بین ۵ اسلات؛ بج سبد با ring-card.
- جاداده‌ها: layout.tsx اسپیسر h-16 → h-[calc(5.75rem+env(safe-area-inset-bottom))]؛ نوارهای چسبان موبایلِ PDP و سبد از bottom-16 → bottom-[calc(5.25rem+env(safe-area-inset-bottom))] تا زیر داک نروند.
- برندها (brands-marquee.tsx): حذف جعبه/بوردر/بک‌گراند؛ وردمارک تایپی خالص کوچک‌تر (text-[15px]/text-base، h-11) با هاور سبز.
- سبد (cart-view.tsx): حذف کامل FreeShippingProgress + ایمپورت‌های مرده (CheckCircle2/Progress/brand)؛ یادداشت «هزینهٔ ارسال در مرحلهٔ بعد» حفظ شد.
- «خرید بر اساس نیاز» (needs-section.tsx بازنویسی کامل + page.tsx): الگوی ادیتوریال تعاملی بدون هیچ آیکونی — ردیف‌های شماره‌دار (۰۱…۰۶ فارسی) با عنوان درشت/توضیح/چیپ شمار/فلش لغزان + استک ۳ بندانگشتی واقعی (md+) یا ۱ بندانگشتی (موبایل)؛ جداکننده‌های مویی گرادیانی؛ پنل پیش‌نمایش چسبان سبز عمیق (bg-metallic + Watermark + شمارهٔ غول‌پیکر واترمارکی + ۲ glow راننده) با AnimatePresence mode=wait (محو+لغزش+بلور) که با هاور/فوکوس ردیف عوض می‌شود + بندانگشتی‌های لینک‌دار + CTA. NEED_PREVIEWS در page.tsx با قرارداد پدر+فرزندان (همان مگامنو) ساخته شد — نکتهٔ مهم: کالاها روی slug فرزند تگ می‌خورند نه پدر.
- globals.css: .glass-strong جدید؛ .mask-fade-y (انتقال نرم باند‌ها)؛ شستِ گرادیانی ثابت body::before (سه radial سبز، z-index:-1، بدون background-attachment:fixed برای سافاری موبایل)؛ keyframes drift + animate-drift/animate-drift-slow؛ pb-safe-nav به 5.75rem.
- انتقال سکشن‌ها: باند «منتخب کارشناس» mask-fade-y + ارتفاع بیشتر (py-16/24) → لبه‌ها در پس‌زمینه محو می‌شوند؛ هدر bg-background/75 backdrop-blur-xl شیشه‌ای‌تر شد.

Stage Summary:
- فایل‌ها: REWRITE needs-section.tsx، bottom-nav.tsx؛ EDIT mega-menu.tsx، search-dialog.tsx، hero.tsx، brands-marquee.tsx، cart-view.tsx، expert-picks.tsx، header.tsx، page.tsx، layout.tsx، product-detail.tsx (فقط bottom-bar)، globals.css
- ریشه‌یابی مهم برای همهٔ ایجنت‌های بعدی: در CSS سفارشی هرگز backdrop-filter و -webkit-backdrop-filter را با هم ننویسید (Lightning CSS ادغام‌به‌پیشونددار می‌کند و کروم بلور را نمی‌کشد) — فقط خاصیت استاندارد
- NEED_PREVIEWS: کالاها با categorySlug فرزند تگ می‌خورند؛ جمع‌آوری نیازها باید پدر+فرزندان را شامل شود
- داک موبایل شناور است: هر المان fixed پایین باید bottom-[calc(5.25rem+env(safe-area-inset-bottom))] یا بیشتر باشد

---
Task ID: 7
Agent: main-orchestrator
Task: راستی‌آزمایی E2E کامل + نقد بصری VLM + جمع‌بندی

Work Log:
- E2E دسکتاپ 1920: هیرو بدون هیچ عنصر شناور/قاب (0 animate-float، 0 rotate-3)؛ مگامنو — باز شدن با هاور دکمه ✓، بلور واقعی blur(24px) saturate(1.5) ✓، باز ماندن داخل پنل ✓، بستن با خروج چپ (x=10) ✓ و راست (x=1910) ✓ و باز شدن مجدد ✓؛ بخش نیازها — ۶ ردیف + پنل sticky، ۱۸ تصویر لودشده، هاور ردیف سوم → پنل «سلامت تنفس» ✓؛ دیالوگ سرچ — Ctrl+K، ۰ دکمهٔ ضربدر، Esc می‌بندد؛ سبد — افزودن کالا از PDP → جمع‌بندی سالم، «ارسال رایگان» غایب، ۰ progressbar، یادداشت ارسال حفظ
- E2E موبایل 390: داک شناور (left=12/right=378/bottom=832، گپ 12px از کف) با بلور ✓؛ ۵ آیتم؛ شیت دسته‌ها با آکاردئون باز می‌شود؛ جستجوی داک دیالوگ را باز می‌کند؛ بدون سرریز افقی (scrollWidth=390)؛ پنل نیازها hidden، بندانگشتی موبایل حاضر؛ کفِ فوتر بالای داک (752 < 766) ✓
- دارک‌مود: داک bg تیره 0.62 + بلور ✓؛ مگامنوی دارک باز و سالم ✓
- نقد VLM: هیرو 9/10، مگامنو 8.5/10 (شیشه واضح)، نیازها 9/10، دارک 9/10 + 9/10، فول‌پیج PASS (انتقال گرادیانی نرم، برندها بدون جعبه، صفر نقص چیدمان)؛ «کارت خالی» در دربارهٔ ما = iframe گوگل‌مپ که tiles آن در سندباکس لود نمی‌شود (آرتیفکت شبکه، نه باگ)
- bun run lint exit 0؛ tsc صفر خطای پروژه (فقط examples/skills ازپیش‌موجود)؛ dev.log بدون خطای جدید؛ مرورگر بسته شد

Stage Summary:
- همهٔ ۱۳ نکتهٔ بازخورد مشتری پیاده و E2E-تأیید شد؛ آمادهٔ نمایش
- بدهی فاز بعد همان پنل ادمین AdGrid (Task 5) باقی است؛ قراردادهای جدید در رکورد 6-b ثبت شد
