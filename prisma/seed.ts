/**
 * Seed کامل «بسلامت» — Idempotent
 * ────────────────────────────────
 * اجرا:  bun prisma/seed.ts   (اسکریپت npm: db:seed)
 *
 * ✔ دوبار اجرا هیچ خطا یا تکراری ایجاد نمی‌کند:
 *   - رکوردهای دارای کلید یونیک (slug/key/term) با upsert
 *   - جدول‌های بدون کلید یونیک (Slide/Banner/Faq) با deleteMany + create
 *   - فرزندان Product (تصاویر/مشخصات/تنوع‌ها) در مسیر update با deleteMany + create بازسازی می‌شوند
 */
import { PrismaClient, type Brand, type Category } from "@prisma/client";

/* ── PrismaClient اختصاصی seed با global guard (همان الگوی src/lib/db.ts) ── */
const globalForSeed = globalThis as unknown as { prismaSeed?: PrismaClient };

const prisma =
  globalForSeed.prismaSeed ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForSeed.prismaSeed = prisma;

/* ══════════════════════════ ابزارها ══════════════════════════ */

/** نرمال‌سازی متن جست‌وجو: ي/ك عربی→فارسی، حذف نیم‌فاصله‌های تکراری، lower-case انگلیسی، فشرده‌سازی فاصله‌ها */
function normalizeSearchText(s: string): string {
  return s
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\u200C+/g, "\u200C")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

const DAY_MS = 86_400_000;
const now = Date.now();

/** createdAt محصولات: پخش خطی روی ۶۰ روز اخیر (ایندکس ۰ → ۶۰ روز پیش، ایندکس ۱۴ → امروز) */
function productCreatedAt(index: number): Date {
  return new Date(now - (60 - (index * 60) / 14) * DAY_MS);
}

function daysAgo(days: number): Date {
  return new Date(now - days * DAY_MS);
}

/* ══════════════════════════ دسته‌بندی‌ها (درخت ۹ والد + ۳۳ فرزند) ══════════════════════════ */

interface CategoryChildSeed {
  slug: string;
  title: string;
}

interface CategorySeed {
  slug: string;
  title: string;
  iconKey: string;
  seoDescription: string;
  children: CategoryChildSeed[];
}

const CATEGORIES: CategorySeed[] = [
  {
    slug: "blood-pressure",
    title: "فشارسنج",
    iconKey: "blood-pressure",
    seoDescription:
      "فشارسنج‌های بازویی، مچی و عقربه‌ای از برندهای معتبر جهانی همراه با ضمانت اصالت کالا و مشاورهٔ تخصصی.",
    children: [
      { slug: "bp-arm", title: "بازویی" },
      { slug: "bp-wrist", title: "مچی" },
      { slug: "bp-aneroid", title: "عقربه‌ای" },
      { slug: "bp-accessories", title: "لوازم جانبی" },
    ],
  },
  {
    slug: "glucose",
    title: "قندسنج و دیابت",
    iconKey: "glucose",
    seoDescription:
      "قندسنج، نوار و لانست و لوازم جانبی دیابت از برندهای معتبر با قیمت منصفانه و ارسال سریع به سراسر کشور.",
    children: [
      { slug: "glucose-meter", title: "قندسنج" },
      { slug: "glucose-strips", title: "نوار و لانست" },
      { slug: "glucose-accessories", title: "کیف و لوازم جانبی" },
    ],
  },
  {
    slug: "thermometer",
    title: "دماسنج",
    iconKey: "thermometer",
    seoDescription:
      "دماسنج‌های دیجیتال، بدون‌تماس و گوشی برای پایش دمای همهٔ اعضای خانواده با کیفیت مطمئن.",
    children: [
      { slug: "therm-contactless", title: "بدون‌تماس" },
      { slug: "therm-digital", title: "دیجیتال" },
      { slug: "therm-ear", title: "گوشی و پیشانی" },
    ],
  },
  {
    slug: "respiratory",
    title: "تنفسی و اکسیژن",
    iconKey: "respiratory",
    seoDescription:
      "پالس اکسیمتر، بخور و نبولایزر، اسپایرومتر و ماسک اکسیژن برای مراقبت تنفسی در خانه.",
    children: [
      { slug: "pulse-oximeter", title: "پالس اکسیمتر" },
      { slug: "nebulizer", title: "بخور و نبولایزر" },
      { slug: "spirometer", title: "اسپایرومتر" },
      { slug: "oxygen-mask", title: "ماسک اکسیژن" },
    ],
  },
  {
    slug: "wheelchair",
    title: "ویلچر و سه‌چرخه",
    iconKey: "wheelchair",
    seoDescription:
      "ویلچر تاشار و کلاسیک، سه‌چرخه و لوازم یدک متناسب با نیاز کاربر همراه با مشاورهٔ رایگان کارشناسان.",
    children: [
      { slug: "wheelchair-folding", title: "ویلچر تاشار" },
      { slug: "wheelchair-standard", title: "ویلچر کلاسیک" },
      { slug: "tricycle", title: "سه‌چرخه" },
      { slug: "wheelchair-parts", title: "لوازم یدک" },
    ],
  },
  {
    slug: "beds",
    title: "تخت و بستری",
    iconKey: "beds",
    seoDescription:
      "تخت برقی و دستی بیمارستانی، تشک ضدزخم و لوازم بستری برای مراقحت راحت‌تر و ایمن‌تر در خانه.",
    children: [
      { slug: "bed-electric", title: "تخت برقی" },
      { slug: "bed-manual", title: "تخت دستی" },
      { slug: "anti-bedsore-mattress", title: "تشک ضدزخم" },
      { slug: "bed-accessories", title: "لوازم بستری" },
    ],
  },
  {
    slug: "orthopedic",
    title: "ارتوپدی و حمایت",
    iconKey: "orthopedic",
    seoDescription:
      "کمربند طبی، طوق گردنی، مچ‌بند و زانوبند برای حمایت و بازتوانی در زندگی روزمره.",
    children: [
      { slug: "lumbar-belt", title: "کمربند طبی" },
      { slug: "cervical-collar", title: "طوق گردنی" },
      { slug: "wrist-brace", title: "مچ‌بند" },
      { slug: "knee-brace", title: "زانوبند" },
    ],
  },
  {
    slug: "masks",
    title: "ماسک و مصرفی",
    iconKey: "masks",
    seoDescription:
      "ماسک جراحی و N95، دستکش یکبارمصرف و آنتی‌سپتیک‌ها با کیفیت مطمئن و قیمت مناسب.",
    children: [
      { slug: "mask-surgical", title: "ماسک جراحی" },
      { slug: "mask-n95", title: "ماسک N95" },
      { slug: "gloves", title: "دستکش یکبارمصرف" },
      { slug: "antiseptic", title: "آنتی‌سپتیک و ضدعفونی" },
    ],
  },
  {
    slug: "scales",
    title: "ترازو و سلامت خانگی",
    iconKey: "scales",
    seoDescription:
      "ترازوی دیجیتال و آنالیزاتور بدن برای پایش روزانهٔ وزن و شاخص‌های سلامت در خانه.",
    children: [
      { slug: "scale-digital", title: "ترازوی دیجیتال" },
      { slug: "scale-body-analyzer", title: "آنالیزاتور بدن" },
      { slug: "scale-accessories", title: "لوازم جانبی" },
    ],
  },
];

/* ══════════════════════════ برندها (۶) ══════════════════════════ */

const BRANDS: { slug: string; title: string }[] = [
  { slug: "omron", title: "اومرون" },
  { slug: "beurer", title: "بویرون" },
  { slug: "microlife", title: "مایکرولایف" },
  { slug: "rossmax", title: "راسمکس" },
  { slug: "medisana", title: "مدیسانا" },
  { slug: "salamat-sazan", title: "سلامت‌سازان" },
];

/* ══════════════════════════ محصولات (۱۵) ══════════════════════════ */

interface VariantSeed {
  title: string;
  price: number;
  stock: number;
  isDefault: boolean;
  sortOrder: number;
}

interface ProductSeed {
  title: string;
  slug: string;
  categorySlug: string;
  brandSlug: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  isNew: boolean;
  isFeatured: boolean;
  shortDescription: string;
  description: string;
  specs: { key: string; value: string }[];
  variants?: VariantSeed[];
}

const PRODUCTS: ProductSeed[] = [
  /* ۱ ─ فشارسنج بازویی اومرون M2 */
  {
    title: "فشارسنج بازویی اومرون M2",
    slug: "omron-m2-blood-pressure",
    categorySlug: "bp-arm",
    brandSlug: "omron",
    price: 2850000,
    comparePrice: 3200000,
    stock: 12,
    isNew: false,
    isFeatured: true,
    shortDescription:
      "فشارسنج بازویی اومرون M2 با نمایشگر بزرگ و تشخیص ضربان نامنظم قلب؛ انتخابی مطمئن برای پایش فشار خون در خانه.",
    description:
      "<p>فشارسنج بازویی اومرون M2 با الگوریتم اندازه‌گیری پایدار، دقت قابل اعتمادی برای پایش روزانهٔ فشار خون در خانه فراهم می‌کند و نمایشگر بزرگ آن، خواندن اعداد را حتی برای چشم‌های خسته آسان می‌کند.</p>" +
      "<p>این مدل هنگام اندازه‌گیری، ضربان نامنظم قلب را تشخیص می‌دهد و در صورت بروز آن با نشانگر خاصی به شما اطلاع می‌دهد. کاف استاندارد آن برای دور بازوی بیشتر بزرگسالان مناسب است.</p>" +
      "<p>کار با M2 ساده است: کاف را روی بازو بگذارید، بنشینید و با فشردن یک دکمه نتیجه را در چند لحظه ببینید. برای نتیجهٔ مطمئن‌تر، پنج دقیقه استراحت و قرار دادن بازو در سطح قلب توصیه می‌شود.</p>",
    specs: [
      { key: "برند", value: "اومرون ژاپن" },
      { key: "گارانتی", value: "۱۸ ماه" },
      { key: "نوع", value: "بازویی دیجیتال" },
      { key: "نمایشگر", value: "LCD بزرگ" },
    ],
  },
  /* ۲ ─ فشارسنج مچی بویرون BM 19 */
  {
    title: "فشارسنج مچی بویرون BM 19",
    slug: "beurer-bm19",
    categorySlug: "bp-wrist",
    brandSlug: "beurer",
    price: 1950000,
    comparePrice: 2200000,
    stock: 8,
    isNew: false,
    isFeatured: false,
    shortDescription:
      "فشارسنج مچی سبک و کم‌حجم بویرون BM 19 برای اندازه‌گیری سریع فشار خون در خانه، محل کار و سفر.",
    description:
      "<p>فشارسنج مچی بویرون BM 19 برای کسانی طراحی شده که به اندازه‌گیری سریع و کم‌دردسر در سفر، محل کار یا خانه نیاز دارند. وزن سبک و ابعاد جمع‌وجور آن، جاگیری در کیف دستی را آسان می‌کند.</p>" +
      "<p>صفحه‌نمایش روشن، اعداد فشار خون و ضربان قلب را با خوانایی بالا نشان می‌دهد. برای اندازه‌گیری دقیق‌تر، مچ را در ارتفاع قلب و با کف دست رو به بالا قرار دهید.</p>",
    specs: [
      { key: "برند", value: "بویرون" },
      { key: "کشور سازنده", value: "آلمان" },
      { key: "نوع", value: "مچی دیجیتال" },
      { key: "گارانتی", value: "۱۲ ماه" },
    ],
  },
  /* ۳ ─ قندسنج راسمکس TG 300 (تنوع‌دار) */
  {
    title: "قندسنج راسمکس TG 300",
    slug: "rossmax-tg300",
    categorySlug: "glucose-meter",
    brandSlug: "rossmax",
    price: 1680000,
    comparePrice: null,
    stock: 10,
    isNew: false,
    isFeatured: false,
    shortDescription:
      "قندسنج راسمکس TG 300 با نیاز به قطرهٔ خون کوچک و نمایشگر روشن؛ در سه نسخهٔ بدون نوار و همراه نوار.",
    description:
      "<p>قندسنج راسمکس TG 300 با یک قطرهٔ کوچک خون، نتیجهٔ اندازه‌گیری را روی نمایشگر روشن نشان می‌دهد و برای پایش روزانهٔ قند خون در خانه مناسب است.</p>" +
      "<p>این محصول در سه نسخهٔ «بدون نوار»، «همراه ۵۰ نوار» و «همراه ۱۰۰ نوار» عرضه می‌شود تا بسته با مصرف خود، اقتصادی‌ترین انتخاب را داشته باشید. نوارهای همراه، نوارهای استاندارد سازگار با همین مدل هستند.</p>" +
      "<p>برای نتیجهٔ دقیق‌تر، دست‌ها را گرم کنید، اولین قطرهٔ خون را پاک کرده و از قطرهٔ دوم استفاده کنید؛ این نکتهٔ کوچک تفاوت محسوسی در عدد نهایی ایجاد می‌کند.</p>",
    specs: [
      { key: "برند", value: "راسمکس" },
      { key: "کشور سازنده", value: "سوئیس" },
      { key: "نوع", value: "قندسنج انگشتی" },
      { key: "گارانتی", value: "۱۲ ماه" },
    ],
    variants: [
      { title: "بدون نوار", price: 1680000, stock: 5, isDefault: true, sortOrder: 0 },
      { title: "همراه ۵۰ نوار", price: 2150000, stock: 3, isDefault: false, sortOrder: 1 },
      { title: "همراه ۱۰۰ نوار", price: 2490000, stock: 2, isDefault: false, sortOrder: 2 },
    ],
  },
  /* ۴ ─ نوار قند بویرون */
  {
    title: "نوار قند بویرون بستهٔ ۵۰ عددی",
    slug: "beurer-gl50-strips",
    categorySlug: "glucose-strips",
    brandSlug: "beurer",
    price: 690000,
    comparePrice: null,
    stock: 40,
    isNew: false,
    isFeatured: false,
    shortDescription:
      "نوارهای تست قند بویرون بستهٔ ۵۰ عددی؛ سازگار با قندسنج‌های بویرون با کدگذاری خودکار.",
    description:
      "<p>نوارهای تست قند بویرون برای استفاده با قندسنج‌های بویرون طراحی شده‌اند و با کدگذاری خودکار، نیاز به ورود دستی کد را از بین می‌برند.</p>" +
      "<p>برای حفظ دقت اندازه‌گیری، نوارها را در دمای اتاق و دور از رطوبت نگه دارید و درب بسته را بلافاصله پس از برداشتن هر نوار ببندید. هر بسته حاوی ۵۰ نوار است.</p>",
    specs: [
      { key: "برند", value: "بویرون" },
      { key: "تعداد در بسته", value: "۵۰ عدد" },
      { key: "نوع", value: "نوار تست قند خون" },
      { key: "سازگاری", value: "قندسنج‌های بویرون" },
    ],
  },
  /* ۵ ─ دماسنج بدون‌تماس بویرون FT 90 */
  {
    title: "دماسنج بدون‌تماس بویرون FT 90",
    slug: "beurer-ft90",
    categorySlug: "therm-contactless",
    brandSlug: "beurer",
    price: 1150000,
    comparePrice: 1390000,
    stock: 15,
    isNew: true,
    isFeatured: false,
    shortDescription:
      "دماسنج بدون‌تماس بویرون FT 90 با اندازه‌گیری سریع دما از فاصلهٔ چند سانتی‌متری؛ مناسب کودکان و استفادهٔ روزمرهٔ خانواده.",
    description:
      "<p>دماسنج بدون‌تماس بویرون FT 90 با فناوری مادون قرمز، دمای بدن را از فاصلهٔ چند سانتی‌متری و در چند ثانیه می‌سنجد؛ بدون تماس با پوست و بدون ناراحت کردن کودک خواب.</p>" +
      "<p>نمایشگر روشن آن همراه با نشانگر تب، وضعیت دما را در یک نگاه مشخص می‌کند و بدنهٔ سبک آن استفادهٔ مکرر در طول شبانه‌روز را آسان می‌کند.</p>" +
      "<p>برای نتیجهٔ مطمئن‌تر، فاصلهٔ سنسور را طبق راهنمای دستگاه رعایت کنید و پیش از اندازه‌گیری، عرق یا موی پیشانی را کنار بزنید.</p>",
    specs: [
      { key: "برند", value: "بویرون" },
      { key: "کشور سازنده", value: "آلمان" },
      { key: "نوع", value: "بدون‌تماس مادون قرمز" },
      { key: "گارانتی", value: "۱۲ ماه" },
    ],
  },
  /* ۶ ─ دماسنج دیجیتال اومرون MC-245 */
  {
    title: "دماسنج دیجیتال اومرون MC-245",
    slug: "omron-mc245",
    categorySlug: "therm-digital",
    brandSlug: "omron",
    price: 420000,
    comparePrice: null,
    stock: 25,
    isNew: false,
    isFeatured: false,
    shortDescription:
      "دماسنج دیجیتال اومرون MC-245 با نوک انعطاف‌پذیر و اندازه‌گیری سریع؛ انتخابی مطمئن برای جعبهٔ کمک‌های اولیهٔ خانه.",
    description:
      "<p>دماسنج دیجیتال اومرون MC-245 با نوک انعطاف‌پذیر و اندازه‌گیری سریع، انتخابی مطمئن برای جعبهٔ کمک‌های اولیهٔ خانه است و برای کودکان و بزرگسالان قابل استفاده است.</p>" +
      "<p>بدنهٔ ضدآب، ضدعفونی آسان را ممکن می‌کند و بوق پایان اندازه‌گیری، منتظر ماندن را راحت می‌کند.</p>",
    specs: [
      { key: "برند", value: "اومرون" },
      { key: "کشور سازنده", value: "ژاپن" },
      { key: "نوع", value: "دیجیتال با نوک انعطاف‌پذیر" },
      { key: "گارانتی", value: "۱۲ ماه" },
    ],
  },
  /* ۷ ─ پالس اکسیمتر راسمکس SB210 (ناموجود) */
  {
    title: "پالس اکسیمتر انگشتی راسمکس SB210",
    slug: "rossmax-sb210",
    categorySlug: "pulse-oximeter",
    brandSlug: "rossmax",
    price: 1890000,
    comparePrice: null,
    stock: 0,
    isNew: false,
    isFeatured: false,
    shortDescription:
      "پالس اکسیمتر انگشتی راسمکس SB210 برای پایش ضربان قلب و اکسیژن خون؛ به‌زودی موجود می‌شود.",
    description:
      "<p>پالس اکسیمتر انگشتی راسمکس SB210 ضربان قلب و درصد اشباع اکسیژن خون را در چند ثانیه نمایش می‌دهد و برای پایش تنفسی در خانه کاربردی است.</p>" +
      "<p>این محصول در حال حاضر ناموجود است و به‌زودی موجود می‌شود. می‌توانید از طریق دکمهٔ «خبرم کن»، به محض شارژ موجودی پیام اطلاع‌رسانی دریافت کنید.</p>",
    specs: [
      { key: "برند", value: "راسمکس" },
      { key: "نوع", value: "پالس اکسیمتر انگشتی" },
      { key: "گارانتی", value: "۱۲ ماه" },
      { key: "وضعیت موجودی", value: "به‌زودی موجود می‌شود" },
    ],
  },
  /* ۸ ─ بخور سرد مدیسانا UHW */
  {
    title: "بخور سرد خانگی مدیسانا UHW",
    slug: "medisana-uhw",
    categorySlug: "nebulizer",
    brandSlug: "medisana",
    price: 890000,
    comparePrice: null,
    stock: 10,
    isNew: false,
    isFeatured: false,
    shortDescription:
      "دستگاه بخور سرد خانگی مدیسانا UHW با کارکرد کم‌صدا و قطعات قابل شست‌وشو؛ مناسب استفادهٔ روزمره در خانه.",
    description:
      "<p>بخور سرد خانگی مدیسانا UHW با کارکرد کم‌صدا برای استفادهٔ مداوم در اتاق خواب یا کنار کودک مناسب است و محلول را به‌صورت ذرات ریز بخار سرد منتقل می‌کند.</p>" +
      "<p>قطعات قابل جداشدن، شست‌وشو و ضدعفونی را ساده می‌کنند و حجم مناسب مخزن، پوشش اتاق‌های کوچک تا متوسط را می‌دهد.</p>" +
      "<p>پیش از هر بار استفاده، مخزن را با آب تمیز پر کنید و پس از پایان کار، باقی‌ماندهٔ محلول را دور بریزید تا از رسوب و رشد میکروب جلوگیری شود.</p>",
    specs: [
      { key: "برند", value: "مدیسانا" },
      { key: "کشور سازنده", value: "آلمان" },
      { key: "نوع", value: "بخور سرد خانگی" },
      { key: "گارانتی", value: "۱۲ ماه" },
    ],
  },
  /* ۹ ─ اسپایرومتر سه‌گلوله */
  {
    title: "اسپایرومتر سه‌گلوله (تری‌فلو)",
    slug: "tri-ball-spirometer",
    categorySlug: "spirometer",
    brandSlug: "salamat-sazan",
    price: 350000,
    comparePrice: null,
    stock: 18,
    isNew: false,
    isFeatured: false,
    shortDescription:
      "اسپایرومتر سه‌گلولهٔ تری‌فلو برای تمرین تنفس و بازتوانی ریه؛ سبک، ساده و قابل حمل.",
    description:
      "<p>اسپایرومتر سه‌گلولهٔ تری‌فلو ابزاری ساده برای تمرین تنفس و بازتوانی ریه است؛ سه گلولهٔ آن با بالا آمدن، میزان جریان دم را به‌صورت دیداری نشان می‌دهند.</p>" +
      "<p>این وسیله برای دورهٔ نقاهت پس از جراحی، مشکلات تنفسی مزمن یا تمرین‌های منظم تنفس توصیه می‌شود و سبکی آن استفاده در خانه و سفر را آسان می‌کند.</p>",
    specs: [
      { key: "برند", value: "سلامت‌سازان" },
      { key: "کشور سازنده", value: "ایران" },
      { key: "نوع", value: "اسپایرومتر تشویقی" },
      { key: "کاربرد", value: "تمرین تنفس و بازتوانی" },
    ],
  },
  /* ۱۰ ─ ویلچر تاشار سلامت‌سازان (تنوع سایز) */
  {
    title: "ویلچر تاشار سلامت‌سازان",
    slug: "salamat-folding-wheelchair",
    categorySlug: "wheelchair-folding",
    brandSlug: "salamat-sazan",
    price: 8900000,
    comparePrice: null,
    stock: 5,
    isNew: false,
    isFeatured: true,
    shortDescription:
      "ویلچر تاشار سلامت‌سازان با بدنهٔ سبک و جمع‌شدن آسان؛ در سه سایز ۱۶، ۱۸ و ۲۰ اینچ.",
    description:
      "<p>ویلچر تاشار سلامت‌سازان با بدنهٔ سبک و مکانیزم تاشار، در صندوق عقب بیشتر خودروها جا می‌شود و برای جابه‌جایی‌های شهری و سفر انتخابی کاربردی است.</p>" +
      "<p>این مدل در سه سایز ۱۶، ۱۸ و ۲۰ اینچ عرضه می‌شود؛ سایز مناسب به دور لگن کاربر و میزان استفادهٔ روزانه بستگی دارد و کارشناسان ما در انتخاب، رایگان همراه شما هستند.</p>" +
      "<p>تاش کردن و باز کردن ویلچر بدون ابزار انجام می‌شود و ترمز دستی دوطرفه، ایمنی توقف در شیب را افزایش می‌دهد.</p>",
    specs: [
      { key: "برند", value: "سلامت‌سازان" },
      { key: "کشور سازنده", value: "ایران" },
      { key: "نوع", value: "تاشار" },
      { key: "سایزها", value: "۱۶، ۱۸ و ۲۰ اینچ" },
      { key: "گارانتی", value: "۶ ماه" },
    ],
    variants: [
      { title: "۱۶ اینچ", price: 8900000, stock: 2, isDefault: true, sortOrder: 0 },
      { title: "۱۸ اینچ", price: 9400000, stock: 2, isDefault: false, sortOrder: 1 },
      { title: "۲۰ اینچ", price: 9900000, stock: 1, isDefault: false, sortOrder: 2 },
    ],
  },
  /* ۱۱ ─ تخت بیمارستانی برقی */
  {
    title: "تخت بیمارستانی برقی دو موتوره",
    slug: "electric-hospital-bed",
    categorySlug: "bed-electric",
    brandSlug: "salamat-sazan",
    price: 28500000,
    comparePrice: null,
    stock: 1,
    isNew: false,
    isFeatured: false,
    shortDescription:
      "تخت بیمارستانی برقی دو موتوره با تنظیم زاویهٔ پشت و پا از راه دور؛ برای مراقحت طولانی‌مدت در خانه.",
    description:
      "<p>تخت بیمارستانی برقی دو موتوره با ریموت، زاویهٔ پشت و پا را به‌صورت نرم و کم‌صدا تنظیم می‌کند و برای مراقبت طولانی‌مدت در خانه، بخش زیادی از فشار جسمی را از روی مراقب برمی‌دارد.</p>" +
      "<p>ریل‌های کناری جداشدنی ایمنی بیمار را تأمین می‌کنند و چرخ‌های دارای ترمز، جابه‌جایی تخت در اتاق را آسان می‌کنند.</p>" +
      "<p>به دلیل ابعاد و وزن این محصول، ارسال آن با هماهنگی تلفنی انجام می‌شود؛ پیش از ثبت سفارش با پشتیبانی تماس بگیرید تا زمان‌بندی ارسال دقیق شود.</p>",
    specs: [
      { key: "برند", value: "سلامت‌سازان" },
      { key: "کشور سازنده", value: "ایران" },
      { key: "نوع", value: "برقی دو موتوره" },
      { key: "گارانتی", value: "۱۲ ماه" },
    ],
  },
  /* ۱۲ ─ کمربند طبی مهره‌دار (تنوع سایز) */
  {
    title: "کمربند طبی مهره‌دار",
    slug: "lumbar-support-belt",
    categorySlug: "lumbar-belt",
    brandSlug: "salamat-sazan",
    price: 780000,
    comparePrice: null,
    stock: 18,
    isNew: false,
    isFeatured: false,
    shortDescription:
      "کمربند طبی مهره‌دار برای حمایت از کمر در فعالیت‌های روزمره؛ در چهار سایز از S تا XL.",
    description:
      "<p>کمربند طبی مهره‌دار با مهره‌های چهارگانهٔ انعطاف‌پذیر، از کمر در فعالیت‌های روزمره، بلند کردن وسایل و ایستادن‌های طولانی حمایت می‌کند.</p>" +
      "<p>پارچهٔ مشبک تنفس‌پذیر تعریق را کاهش می‌دهد و بندهای چسبی قابل تنظیم، فشار را متناسب با راحتی شما تنظیم می‌کنند.</p>" +
      "<p>برای انتخاب سایز، دور کمر را اندازه بگیرید؛ در صورت تردید بین دو سایز، سایز بزرگ‌تر را انتخاب کنید. استفادهٔ مداوم و طولانی‌مدت باید با توصیهٔ پزشک باشد.</p>",
    specs: [
      { key: "برند", value: "سلامت‌سازان" },
      { key: "کشور سازنده", value: "ایران" },
      { key: "سایزبندی", value: "از S تا XL" },
      { key: "جنس", value: "پارچهٔ مشبک تنفس‌پذیر" },
    ],
    variants: [
      { title: "S", price: 780000, stock: 6, isDefault: false, sortOrder: 0 },
      { title: "M", price: 780000, stock: 5, isDefault: true, sortOrder: 1 },
      { title: "L", price: 780000, stock: 4, isDefault: false, sortOrder: 2 },
      { title: "XL", price: 780000, stock: 3, isDefault: false, sortOrder: 3 },
    ],
  },
  /* ۱۳ ─ ماسک جراحی سه‌لایه */
  {
    title: "ماسک جراحی سه‌لایه بستهٔ ۵۰ عددی",
    slug: "surgical-mask-50",
    categorySlug: "mask-surgical",
    brandSlug: "salamat-sazan",
    price: 195000,
    comparePrice: 250000,
    stock: 100,
    isNew: false,
    isFeatured: false,
    shortDescription:
      "ماسک جراحی سه‌لایه با فیلتراسیون مناسب و نفس‌گیری راحت؛ بستهٔ ۵۰ عددی برای استفادهٔ روزمره.",
    description:
      "<p>ماسک جراحی سه‌لایه با لایهٔ میانی فیلتر، برای استفادهٔ روزمره در اماکن عمومی، محل کار و سفر مناسب است و نفس‌گیری راحت را حفظ می‌کند.</p>" +
      "<p>بندهای لاستیکی، تنظیم سریع را ممکن می‌کنند و هر بسته حاوی ۵۰ ماسک است؛ برای بهداشت خانواده در فصل سرماخوردگی انتخابی اقتصادی است.</p>",
    specs: [
      { key: "برند", value: "سلامت‌سازان" },
      { key: "تعداد در بسته", value: "۵۰ عدد" },
      { key: "لایه", value: "سه‌لایه" },
      { key: "کاربرد", value: "استفادهٔ روزمرهٔ بهداشتی" },
    ],
  },
  /* ۱۴ ─ ترازوی دیجیتال بویرون GS 27 */
  {
    title: "ترازوی دیجیتال بویرون GS 27",
    slug: "beurer-gs27",
    categorySlug: "scale-digital",
    brandSlug: "beurer",
    price: 1290000,
    comparePrice: null,
    stock: 9,
    isNew: false,
    isFeatured: false,
    shortDescription:
      "ترازوی دیجیتال بویرون GS 27 با صفحهٔ شیشه‌ای و نمایشگر روشن؛ ظاهری تمیز و جمع‌وجور برای خانه.",
    description:
      "<p>ترازوی دیجیتال بویرون GS 27 با صفحهٔ شیشه‌ای و سکوی پهن، ظاهری تمیز و مدرن در حمام یا اتاق خواب ایجاد می‌کند.</p>" +
      "<p>نمایشگر روشن اعداد را در یک نگاه می‌خواند و دستگاه با فشردن پا روشن می‌شود؛ بدون نیاز به دکمه. دقت اندازه‌گیری برای پایش روزانهٔ وزن کافی است.</p>",
    specs: [
      { key: "برند", value: "بویرون" },
      { key: "کشور سازنده", value: "آلمان" },
      { key: "نوع", value: "ترازوی دیجیتال شخصی" },
      { key: "گارانتی", value: "۱۲ ماه" },
    ],
  },
  /* ۱۵ ─ ترازوی آنالیزاتور بدن مدیسانا BS 430 */
  {
    title: "ترازوی آنالیزاتور بدن مدیسانا BS 430",
    slug: "medisana-bs430",
    categorySlug: "scale-body-analyzer",
    brandSlug: "medisana",
    price: 2150000,
    comparePrice: 2480000,
    stock: 7,
    isNew: true,
    isFeatured: true,
    shortDescription:
      "ترازوی آنالیزاتور بدن مدیسانا BS 430 برای پایش وزن، چربی و آب بدن؛ همراه مسیر سلامت شما.",
    description:
      "<p>ترازوی آنالیزاتور بدن مدیسانا BS 430 علاوه بر وزن، شاخص‌های ترکیب بدن مانند درصد چربی و آب بدن را تخمین می‌زند و تصویری کامل‌تر از روند سلامت شما می‌دهد.</p>" +
      "<p>حافظهٔ چندکاربره به هر عضو خانواده اجازه می‌دهد روند خود را جداگانه دنبال کند و نمایشگر روشن، خواندن اعداد را آسان می‌کند.</p>" +
      "<p>برای نتیجهٔ پایدارتر، همیشه صبح ناشتا و در شرایط یکسان اندازه‌گیری کنید. داده‌های آنالیز بدن برای آگاهی و پیگیری است و جایگزین تشخیص پزشک نیست.</p>",
    specs: [
      { key: "برند", value: "مدیسانا" },
      { key: "کشور سازنده", value: "آلمان" },
      { key: "نوع", value: "آنالیزاتور بدن" },
      { key: "گارانتی", value: "۱۲ ماه" },
    ],
  },
];

/* ══════════════════════════ اسلایدها (۳) ══════════════════════════ */

const SLIDES: {
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaLabel: string;
  ctaHref: string;
  sortOrder: number;
}[] = [
  {
    title: "سلامتی خانواده، با خیال راحت",
    subtitle: "تجهیزات پزشکی اورجینال با ضمانت اصالت کالا",
    imageUrl: "/placeholders/slide-1.svg",
    ctaLabel: "مشاهده محصولات",
    ctaHref: "/products",
    sortOrder: 0,
  },
  {
    title: "برندهای معتبر جهانی",
    subtitle: "اومرون، بویرون، مدیسانا و…",
    imageUrl: "/placeholders/slide-2.svg",
    ctaLabel: "مشاهدهٔ فروشگاه",
    ctaHref: "/products",
    sortOrder: 1,
  },
  {
    title: "مشاورهٔ تخصصی رایگان",
    subtitle: "کارشناسان ما در انتخاب همراه شما هستند",
    imageUrl: "/placeholders/slide-3.svg",
    ctaLabel: "تماس با ما",
    ctaHref: "/contact",
    sortOrder: 2,
  },
];

/* ══════════════════════════ بنرها (۲) ══════════════════════════ */

const BANNERS: { title: string; imageUrl: string; href: string; slot: number }[] = [
  { title: "اقلام مصرفی بهداشتی", imageUrl: "/placeholders/banner-1.svg", href: "/products?category=masks", slot: 1 },
  { title: "حمایت و ارتوپدی", imageUrl: "/placeholders/banner-2.svg", href: "/products?category=orthopedic", slot: 2 },
];

/* ══════════════════════════ بخش‌های صفحهٔ خانه (۸) ══════════════════════════ */

const HOME_SECTIONS: { key: string; sortOrder: number; title: string | null; subtitle: string | null }[] = [
  { key: "hero", sortOrder: 0, title: null, subtitle: null },
  { key: "trust", sortOrder: 1, title: null, subtitle: null },
  { key: "categories", sortOrder: 2, title: "دسته‌بندی محصولات", subtitle: null },
  { key: "productTabs", sortOrder: 3, title: "انتخاب هوشمندانه", subtitle: "محبوب‌ترین‌ها، تازه‌ها و پیشنهادهای ویژه" },
  { key: "banners", sortOrder: 4, title: null, subtitle: null },
  { key: "brands", sortOrder: 5, title: "برندهای همراه ما", subtitle: null },
  { key: "articles", sortOrder: 6, title: "مجلهٔ سلامت", subtitle: "خواندنی‌های کاربردی برای سلامتی خانواده" },
  { key: "aboutStore", sortOrder: 7, title: "دربارهٔ بسلامت", subtitle: null },
];

/* ══════════════════════════ مجله (۲ دسته + ۳ مقاله) ══════════════════════════ */

const ARTICLE_CATEGORIES: { slug: string; title: string }[] = [
  { slug: "buying-guide", title: "راهنمای خرید" },
  { slug: "home-health", title: "سلامت خانگی" },
];

const ARTICLES: {
  title: string;
  slug: string;
  categorySlug: string;
  coverUrl: string;
  excerpt: string;
  contentHtml: string;
  publishedDaysAgo: number;
}[] = [
  {
    title: "راهنمای انتخاب فشارسنج خانگی؛ بازویی یا مچی؟",
    slug: "choosing-home-blood-pressure-monitor",
    categorySlug: "buying-guide",
    coverUrl: "/placeholders/article-1.svg",
    excerpt: "تفاوت‌های فشارسنج بازویی و مچی و نکاتی که پیش از خرید باید بدانید.",
    contentHtml:
      "<p>پایش منظم فشار خون در خانه، بخشی مهم از مدیریت سلامت است؛ اما پیش از خرید فشارسنج باید بدانید کدام نوع به نیاز شما نزدیک‌تر است.</p>" +
      "<h2>تفاوت فشارسنج بازویی و مچی چیست؟</h2>" +
      "<p>در مدل‌های بازویی، کاف روی بازو باد می‌کند و اندازه‌گیری معمولاً دقیق‌تر و پایدارتر انجام می‌شود؛ مدل‌های مچی سبک‌تر و جمع‌وجورترند و برای سفر مناسب‌اند، اما به جای‌گذاری درست مچ در سطح قلب حساس‌ترند.</p>" +
      "<ul>" +
      "<li>برای استفادهٔ روزمرهٔ خانگی و نیاز به پایش دقیق، مدل بازویی پیشنهاد می‌شود.</li>" +
      "<li>برای سفر و اندازه‌گیری‌های گاه‌به‌گاه، مدل مچی راحت‌تر است.</li>" +
      "<li>دور بازوی شما باید با محدودهٔ کاف دستگاه سازگار باشد؛ برای بازوهای درشت، کاف بزرگ‌تر لازم است.</li>" +
      "<li>قابلیت تشخیص ضربان نامنظم برای افراد مسن و بیماران قلبی مفید است.</li>" +
      "</ul>" +
      "<p>صحت‌سنجی دستگاه را فراموش نکنید: فشارسنج را سالی یک بار با دستگاه استاندارد مطب یا داروخانه مقایسه کنید و در صورت اختلاف محسوس، آن را کالیبره کنید.</p>" +
      "<p>پیش از خرید، گارانتی و خدمات پس از فروش را بررسی کنید و از فروشندهٔ معتبر خرید کنید؛ چند اندازه‌گیری اول را با نشستن صحیح و پنج دقیقه استراحت قبلی تکرار کنید تا به عدد مطمئن برسید.</p>",
    publishedDaysAgo: 20,
  },
  {
    title: "۷ نکتهٔ مهم در نگهداری قندسنج",
    slug: "glucometer-care-tips",
    categorySlug: "buying-guide",
    coverUrl: "/placeholders/article-2.svg",
    excerpt: "با این هفت نکتهٔ ساده، قندسنج شما دقیق‌تر کار می‌کند و عمر دستگاه طولانی‌تر می‌شود.",
    contentHtml:
      "<p>قندسنج از آن دسته دستگاه‌هایی است که با کمی مراقبت، سال‌ها همراه شما می‌ماند و نتایج قابل اتکایی می‌دهد؛ این هفت نکته را جدی بگیرید.</p>" +
      "<h2>کارهای ساده‌ای که عمر دستگاه را زیاد می‌کند</h2>" +
      "<ul>" +
      "<li>دستگاه را در جای خشک و خنک نگه دارید؛ رطوبت دشمن اصلی برد الکترونیکی است.</li>" +
      "<li>نوارها را دربسته و در دمای اتاق نگه دارید و هرگز آن‌ها را در یخچال نگذارید.</li>" +
      "<li>سنسور دستگاه را فقط با پارچهٔ نرم و کمی الکل تمیز کنید و فشار نیاورید.</li>" +
      "<li>لانست‌ها یکبارمصرف‌اند؛ تکرار استفاده هم دردناک است و هم نمونهٔ خون را آلوده می‌کند.</li>" +
      "<li>پیش از اندازه‌گیری دست‌ها را گرم کنید و از قطرهٔ دوم خون استفاده کنید.</li>" +
      "<li>دستگاه را در معرض تابش مستقیم آفتاب و کنار وسایل گرم قرار ندهید.</li>" +
      "<li>با شروع هر بستهٔ نو، کد نوارها را مطابق راهنمای دستگاه وارد یا کالیبره کنید.</li>" +
      "</ul>" +
      "<p>اگر اعداد به‌طور مداوم با احساس شما نمی‌خواند، پیش از تعویض دستگاه، با نوار تازه و بررسی نحوهٔ نمونه‌گیری مشکل را ردیابی کنید؛ در بیشتر موارد، مشکل از نوار یا نمونه‌گیری است نه خود دستگاه.</p>",
    publishedDaysAgo: 12,
  },
  {
    title: "استفادهٔ درست از دماسنج بدون‌تماس",
    slug: "contactless-thermometer-guide",
    categorySlug: "home-health",
    coverUrl: "/placeholders/article-3.svg",
    excerpt: "فاصلهٔ درست، پیشانی تمیز و چند اندازه‌گیری مقایسه‌ای؛ کلید گرفتن عدد قابل اعتماد از دماسنج بدون‌تماس.",
    contentHtml:
      "<p>دماسنج بدون‌تماس وقتی درست استفاده شود، یکی از راحت‌ترین ابزارهای پایش دما در خانه است؛ اما چند اشتباه رایج، اعداد را چند درجه جابه‌جا می‌کند.</p>" +
      "<h2>پیش از اندازه‌گیری</h2>" +
      "<ul>" +
      "<li>دستگاه را چند دقیقه پیش از استفاده در دمای اتاق قرار دهید.</li>" +
      "<li>عرق، مو یا کلاه را از پیشانی کنار بزنید؛ سنسور باید مسیر آزاد ببیند.</li>" +
      "<li>فاصلهٔ پیشنهادی سازنده (معمولاً سه تا پنج سانتی‌متر) را رعایت کنید.</li>" +
      "</ul>" +
      "<h2>هنگام و پس از اندازه‌گیری</h2>" +
      "<p>دماسنج را موازی پیشانی، از میانه به سمت شقیقه حرکت دهید و چند اندازه‌گیری پشت‌سرهم را با هم مقایسه کنید؛ عدد بالاتر را مبنا قرار دهید.</p>" +
      "<p>دما را در ساعات ثابتی از روز ثبت کنید تا روند واقعی مشخص شود و اگر عدد با علائم بدن نمی‌خواند، یک اندازه‌گیری مکمل هم انجام دهید. دماسنج را تمیز و دور از نور مستقیم نگه دارید.</p>",
    publishedDaysAgo: 5,
  },
];

/* ══════════════════════════ سوالات متداول (۶) ══════════════════════════ */

const FAQS: { question: string; answer: string }[] = [
  {
    question: "هزینهٔ ارسال چقدر است؟",
    answer:
      "ارسال با پست به سراسر کشور مبلغ ثابت ۴۵٬۰۰۰ تومان است؛ تحویل حضوری از فروشگاه رایگان است.",
  },
  {
    question: "آیا تحویل حضوری دارید؟",
    answer: "بله؛ در ساعات کاری می‌توانید سفارش خود را از آدرس فروشگاه تحویل بگیرید.",
  },
  {
    question: "اصالت کالاها چطور تضمین می‌شود؟",
    answer:
      "همهٔ کالاها از نمایندگی‌های رسمی تأمین می‌شوند و همراه با گارانتی معتبر و فاکتور رسمی ارسال می‌گردند.",
  },
  {
    question: "سفارشم را چطور پیگیری کنم؟",
    answer:
      "با شمارهٔ سفارش، از پنل کاربری یا تماس با پشتیبانی می‌توانید وضعیت سفارش خود را پیگیری کنید.",
  },
  {
    question: "روش‌های پرداخت چیست؟",
    answer: "پرداخت آنلاین امن از طریق درگاه بانکی انجام می‌شود.",
  },
  {
    question: "آیا امکان بازگشت کالا وجود دارد؟",
    answer:
      "بله؛ تا ۷ روز پس از دریافت، در صورت پلمب بودن و رعایت شرایط بهداشتی، امکان بازگشت کالا وجود دارد.",
  },
];

/* ══════════════════════════ تنظیمات (JSON در Setting.value) ══════════════════════════ */

const SETTINGS: { key: string; value: unknown }[] = [
  { key: "order.sequence", value: 10234 }, // اولین شمارهٔ سفارش: BS-10234
  { key: "shipping.cost", value: 45000 }, // هزینهٔ ثابت ارسال پستی (تومان)
  { key: "store.mapEmbedUrl", value: "https://maps.google.com/maps?q=Tehran%20Valiasr&output=embed" }, // همان پیش‌فرض brand.ts
];

/* ══════════════════════════ واژه‌های پرجستجو (۶) ══════════════════════════ */

const POPULAR_SEARCH_TERMS: { term: string; weight: number }[] = [
  { term: "فشارسنج", weight: 90 },
  { term: "ماسک", weight: 75 },
  { term: "قندسنج", weight: 70 },
  { term: "پالس اکسیمتر", weight: 55 },
  { term: "ترازو", weight: 45 },
  { term: "ویلچر", weight: 40 },
];

/* ══════════════════════════ توابع seed ══════════════════════════ */

async function seedCategories(): Promise<Map<string, Category>> {
  const map = new Map<string, Category>();

  for (const [parentIndex, parent] of CATEGORIES.entries()) {
    const seoTitle = `خرید ${parent.title} | قیمت و انواع`;
    const parentRow = await prisma.category.upsert({
      where: { slug: parent.slug },
      create: {
        title: parent.title,
        slug: parent.slug,
        iconKey: parent.iconKey,
        sortOrder: parentIndex,
        isActive: true,
        seoTitle,
        seoDescription: parent.seoDescription,
      },
      update: {
        title: parent.title,
        iconKey: parent.iconKey,
        sortOrder: parentIndex,
        isActive: true,
        seoTitle,
        seoDescription: parent.seoDescription,
        parentId: null,
      },
    });
    map.set(parent.slug, parentRow);

    for (const [childIndex, child] of parent.children.entries()) {
      const childRow = await prisma.category.upsert({
        where: { slug: child.slug },
        create: {
          title: child.title,
          slug: child.slug,
          iconKey: null,
          sortOrder: childIndex,
          isActive: true,
          parentId: parentRow.id,
        },
        update: {
          title: child.title,
          iconKey: null,
          sortOrder: childIndex,
          isActive: true,
          parentId: parentRow.id,
        },
      });
      map.set(child.slug, childRow);
    }
  }
  return map;
}

async function seedBrands(): Promise<Map<string, Brand>> {
  const map = new Map<string, Brand>();
  for (const [index, brand] of BRANDS.entries()) {
    const row = await prisma.brand.upsert({
      where: { slug: brand.slug },
      create: { title: brand.title, slug: brand.slug, logoUrl: null, isActive: true, sortOrder: index },
      update: { title: brand.title, logoUrl: null, isActive: true, sortOrder: index },
    });
    map.set(brand.slug, row);
  }
  return map;
}

async function seedProducts(
  categoryMap: Map<string, Category>,
  brandMap: Map<string, Brand>,
): Promise<void> {
  for (const [index, p] of PRODUCTS.entries()) {
    const category = categoryMap.get(p.categorySlug);
    const brand = brandMap.get(p.brandSlug);
    if (!category || !brand) {
      throw new Error(`دسته یا برند برای محصول «${p.slug}» پیدا نشد.`);
    }

    const searchText = normalizeSearchText(`${p.title} ${brand.title}`);
    const createdAt = productCreatedAt(index);
    const images = [
      { url: `/placeholders/product-${index + 1}-a.svg`, alt: p.title, sortOrder: 0 },
      { url: `/placeholders/product-${index + 1}-b.svg`, alt: p.title, sortOrder: 1 },
    ];
    const specs = p.specs.map((s, i) => ({ key: s.key, value: s.value, sortOrder: i }));

    await prisma.product.upsert({
      where: { slug: p.slug },
      create: {
        title: p.title,
        slug: p.slug,
        searchText,
        shortDescription: p.shortDescription,
        description: p.description,
        price: p.price,
        comparePrice: p.comparePrice,
        stock: p.stock,
        isActive: true,
        isNew: p.isNew,
        isFeatured: p.isFeatured,
        createdAt,
        categoryId: category.id,
        brandId: brand.id,
        images: { create: images },
        specs: { create: specs },
        variants: p.variants ? { create: p.variants } : undefined,
      },
      update: {
        title: p.title,
        searchText,
        shortDescription: p.shortDescription,
        description: p.description,
        price: p.price,
        comparePrice: p.comparePrice,
        stock: p.stock,
        isActive: true,
        isNew: p.isNew,
        isFeatured: p.isFeatured,
        createdAt,
        categoryId: category.id,
        brandId: brand.id,
        images: { deleteMany: {}, create: images },
        specs: { deleteMany: {}, create: specs },
        variants: p.variants ? { deleteMany: {}, create: p.variants } : { deleteMany: {} },
      },
    });
  }
}

async function seedHomeContent(): Promise<void> {
  /* اسلایدها و بنرها و سوالات متداول کلید یونیک ندارند → بازسازی کامل (بدون تکرار) */
  await prisma.slide.deleteMany({});
  for (const s of SLIDES) {
    await prisma.slide.create({ data: s });
  }

  await prisma.banner.deleteMany({});
  for (const b of BANNERS) {
    await prisma.banner.create({ data: b });
  }

  for (const sec of HOME_SECTIONS) {
    await prisma.homePageSection.upsert({
      where: { key: sec.key },
      create: { key: sec.key, sortOrder: sec.sortOrder, title: sec.title, subtitle: sec.subtitle, isActive: true },
      update: { sortOrder: sec.sortOrder, title: sec.title, subtitle: sec.subtitle, isActive: true },
    });
  }
}

async function seedArticles(): Promise<void> {
  const catMap = new Map<string, string>();
  for (const cat of ARTICLE_CATEGORIES) {
    const row = await prisma.articleCategory.upsert({
      where: { slug: cat.slug },
      create: { title: cat.title, slug: cat.slug },
      update: { title: cat.title },
    });
    catMap.set(cat.slug, row.id);
  }

  for (const a of ARTICLES) {
    const categoryId = catMap.get(a.categorySlug);
    if (!categoryId) {
      throw new Error(`دستهٔ مقاله برای «${a.slug}» پیدا نشد.`);
    }
    await prisma.article.upsert({
      where: { slug: a.slug },
      create: {
        title: a.title,
        slug: a.slug,
        coverUrl: a.coverUrl,
        excerpt: a.excerpt,
        contentHtml: a.contentHtml,
        categoryId,
        seoTitle: null,
        seoDescription: null,
        isPublished: true,
        publishedAt: daysAgo(a.publishedDaysAgo),
      },
      update: {
        title: a.title,
        coverUrl: a.coverUrl,
        excerpt: a.excerpt,
        contentHtml: a.contentHtml,
        categoryId,
        seoTitle: null,
        seoDescription: null,
        isPublished: true,
        publishedAt: daysAgo(a.publishedDaysAgo),
      },
    });
  }
}

async function seedFaqs(): Promise<void> {
  await prisma.faq.deleteMany({});
  for (const [index, f] of FAQS.entries()) {
    await prisma.faq.create({ data: { ...f, sortOrder: index, isActive: true } });
  }
}

async function seedSettings(): Promise<void> {
  for (const s of SETTINGS) {
    const value = JSON.stringify(s.value);
    await prisma.setting.upsert({
      where: { key: s.key },
      create: { key: s.key, value },
      update: { value },
    });
  }
}

async function seedPopularSearchTerms(): Promise<void> {
  for (const t of POPULAR_SEARCH_TERMS) {
    await prisma.popularSearchTerm.upsert({
      where: { term: t.term },
      create: { term: t.term, weight: t.weight, isActive: true },
      update: { weight: t.weight, isActive: true },
    });
  }
}

/* ══════════════════════════ شمارش نهایی ══════════════════════════ */

async function logCounts(): Promise<void> {
  const [
    users,
    otpCodes,
    sessions,
    brands,
    categories,
    products,
    variants,
    images,
    specs,
    orders,
    orderItems,
    statusLogs,
    payments,
    addresses,
    slides,
    banners,
    sections,
    articleCats,
    articles,
    faqs,
    contactMessages,
    stockAlerts,
    outbox,
    settings,
    popularTerms,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.otpCode.count(),
    prisma.session.count(),
    prisma.brand.count(),
    prisma.category.count(),
    prisma.product.count(),
    prisma.productVariant.count(),
    prisma.productImage.count(),
    prisma.productSpec.count(),
    prisma.order.count(),
    prisma.orderItem.count(),
    prisma.orderStatusLog.count(),
    prisma.paymentTransaction.count(),
    prisma.address.count(),
    prisma.slide.count(),
    prisma.banner.count(),
    prisma.homePageSection.count(),
    prisma.articleCategory.count(),
    prisma.article.count(),
    prisma.faq.count(),
    prisma.contactMessage.count(),
    prisma.stockAlert.count(),
    prisma.messageOutbox.count(),
    prisma.setting.count(),
    prisma.popularSearchTerm.count(),
  ]);

  console.log("📊 شمارش رکوردها پس از seed:");
  console.log(`   کاربران: ${users} | OTP: ${otpCodes} | نشست‌ها: ${sessions}`);
  console.log(`   دسته‌ها: ${categories} | برندها: ${brands}`);
  console.log(`   محصولات: ${products} | تنوع‌ها: ${variants} | تصاویر: ${images} | مشخصات: ${specs}`);
  console.log(`   اسلایدها: ${slides} | بنرها: ${banners} | بخش‌های خانه: ${sections}`);
  console.log(`   دسته‌های مقاله: ${articleCats} | مقاله‌ها: ${articles} | سوالات متداول: ${faqs}`);
  console.log(`   تنظیمات: ${settings} | واژه‌های پرجستجو: ${popularTerms}`);
  console.log(
    `   سفارش‌ها: ${orders} | آیتم‌ها: ${orderItems} | لاگ وضعیت: ${statusLogs} | تراکنش‌ها: ${payments}`,
  );
  console.log(
    `   نشانی‌ها: ${addresses} | پیام‌ها: ${contactMessages} | هشدار موجودی: ${stockAlerts} | صندوق خروجی: ${outbox}`,
  );
}

/* ══════════════════════════ اجرا ══════════════════════════ */

async function main(): Promise<void> {
  console.log("🌱 شروع seed «بسلامت» (idempotent)…");

  const categoryMap = await seedCategories();
  const brandMap = await seedBrands();
  await seedProducts(categoryMap, brandMap);
  await seedHomeContent();
  await seedArticles();
  await seedFaqs();
  await seedSettings();
  await seedPopularSearchTerms();
  await logCounts();

  console.log("✅ seed کامل شد.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ خطا در seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
