/**
 * دادهٔ پیش‌نمایش ایستا (فاز ۱) — ساختار عیناً هم‌شکل خروجی فاز ۳ از دیتابیس است؛
 * در فاز ۳، این فایل با دادهٔ زندهٔ API جایگزین می‌شود.
 *
 * ⚠️ این فایل DATA خالص است — هیچ JSX/کامپوننتی اینجا نوشته نمی‌شود.
 */

import type {
  AdGridDTO,
  AdLayoutSpecDTO,
  ArticleDetail,
  ArticleSummary,
  BrandSummary,
  CategoryNode,
  HomeSectionDTO,
  HomeSlideDTO,
  NeedCardDTO,
  ProductDetail,
  ProductSpecDTO,
  ProductSummary,
} from "@/types/shop";
import { discountPercent } from "@/lib/format";

/* ── درخت دسته‌بندی‌ها (۹ دستهٔ اصلی + فرزندان) ── */
export const PREVIEW_CATEGORIES: CategoryNode[] = [
  {
    id: "c-bp",
    title: "فشارسنج",
    slug: "blood-pressure",
    iconKey: "blood-pressure",
    children: [
      { id: "c-bp-arm", title: "بازویی", slug: "bp-arm", iconKey: null, children: [] },
      { id: "c-bp-wrist", title: "مچی", slug: "bp-wrist", iconKey: null, children: [] },
      { id: "c-bp-aneroid", title: "عقربه‌ای", slug: "bp-aneroid", iconKey: null, children: [] },
      { id: "c-bp-acc", title: "لوازم جانبی", slug: "bp-accessories", iconKey: null, children: [] },
    ],
  },
  {
    id: "c-glucose",
    title: "قندسنج و دیابت",
    slug: "glucose",
    iconKey: "glucose",
    children: [
      { id: "c-gl-meter", title: "قندسنج", slug: "glucose-meter", iconKey: null, children: [] },
      { id: "c-gl-strips", title: "نوار و لانست", slug: "glucose-strips", iconKey: null, children: [] },
      { id: "c-gl-acc", title: "کیف و لوازم جانبی", slug: "glucose-accessories", iconKey: null, children: [] },
    ],
  },
  {
    id: "c-therm",
    title: "دماسنج",
    slug: "thermometer",
    iconKey: "thermometer",
    children: [
      { id: "c-therm-ir", title: "بدون‌تماس", slug: "therm-contactless", iconKey: null, children: [] },
      { id: "c-therm-dig", title: "دیجیتال", slug: "therm-digital", iconKey: null, children: [] },
      { id: "c-therm-ear", title: "گوشی و پیشانی", slug: "therm-ear", iconKey: null, children: [] },
    ],
  },
  {
    id: "c-resp",
    title: "تنفسی و اکسیژن",
    slug: "respiratory",
    iconKey: "respiratory",
    children: [
      { id: "c-resp-ox", title: "پالس اکسیمتر", slug: "pulse-oximeter", iconKey: null, children: [] },
      { id: "c-resp-neb", title: "بخور و نبولایزر", slug: "nebulizer", iconKey: null, children: [] },
      { id: "c-resp-spiro", title: "اسپایرومتر", slug: "spirometer", iconKey: null, children: [] },
      { id: "c-resp-mask", title: "ماسک اکسیژن", slug: "oxygen-mask", iconKey: null, children: [] },
    ],
  },
  {
    id: "c-wheel",
    title: "ویلچر و سه‌چرخه",
    slug: "wheelchair",
    iconKey: "wheelchair",
    children: [
      { id: "c-wheel-fold", title: "ویلچر تاشار", slug: "wheelchair-folding", iconKey: null, children: [] },
      { id: "c-wheel-std", title: "ویلچر کلاسیک", slug: "wheelchair-standard", iconKey: null, children: [] },
      { id: "c-wheel-tri", title: "سه‌چرخه", slug: "tricycle", iconKey: null, children: [] },
      { id: "c-wheel-parts", title: "لوازم یدک", slug: "wheelchair-parts", iconKey: null, children: [] },
    ],
  },
  {
    id: "c-bed",
    title: "تخت و بستری",
    slug: "beds",
    iconKey: "beds",
    children: [
      { id: "c-bed-el", title: "تخت برقی", slug: "bed-electric", iconKey: null, children: [] },
      { id: "c-bed-man", title: "تخت دستی", slug: "bed-manual", iconKey: null, children: [] },
      { id: "c-bed-mattress", title: "تشک ضدزخم", slug: "anti-bedsore-mattress", iconKey: null, children: [] },
      { id: "c-bed-acc", title: "لوازم بستری", slug: "bed-accessories", iconKey: null, children: [] },
    ],
  },
  {
    id: "c-ortho",
    title: "ارتوپدی و حمایت",
    slug: "orthopedic",
    iconKey: "orthopedic",
    children: [
      { id: "c-ortho-lumbar", title: "کمربند طبی", slug: "lumbar-belt", iconKey: null, children: [] },
      { id: "c-ortho-cervical", title: "طوق گردنی", slug: "cervical-collar", iconKey: null, children: [] },
      { id: "c-ortho-wrist", title: "مچ‌بند", slug: "wrist-brace", iconKey: null, children: [] },
      { id: "c-ortho-knee", title: "زانوبند", slug: "knee-brace", iconKey: null, children: [] },
    ],
  },
  {
    id: "c-mask",
    title: "ماسک و مصرفی",
    slug: "masks",
    iconKey: "masks",
    children: [
      { id: "c-mask-surgical", title: "ماسک جراحی", slug: "mask-surgical", iconKey: null, children: [] },
      { id: "c-mask-n95", title: "ماسک N95", slug: "mask-n95", iconKey: null, children: [] },
      { id: "c-mask-gloves", title: "دستکش یکبارمصرف", slug: "gloves", iconKey: null, children: [] },
      { id: "c-mask-antiseptic", title: "آنتی‌سپتیک و ضدعفونی", slug: "antiseptic", iconKey: null, children: [] },
    ],
  },
  {
    id: "c-scale",
    title: "ترازو و سلامت خانگی",
    slug: "scales",
    iconKey: "scales",
    children: [
      { id: "c-scale-dig", title: "ترازوی دیجیتال", slug: "scale-digital", iconKey: null, children: [] },
      { id: "c-scale-body", title: "آنالیزاتور بدن", slug: "scale-body-analyzer", iconKey: null, children: [] },
      { id: "c-scale-acc", title: "لوازم جانبی", slug: "scale-accessories", iconKey: null, children: [] },
    ],
  },
];

/* ── برندها ── */
export const PREVIEW_BRANDS: BrandSummary[] = [
  { id: "b-omron", title: "اومرون", slug: "omron" },
  { id: "b-beurer", title: "بویرون", slug: "beurer" },
  { id: "b-microlife", title: "مایکرولایف", slug: "microlife" },
  { id: "b-rossmax", title: "راسمکس", slug: "rossmax" },
  { id: "b-medisana", title: "مدیسانا", slug: "medisana" },
  { id: "b-salamat", title: "سلامت‌سازان", slug: "salamat-sazan" },
];

/* ── واژه‌های پرجستجو (فاز ۳: از ادمین) ── */
export const PREVIEW_POPULAR_SEARCHES: string[] = [
  "فشارسنج",
  "ماسک",
  "قندسنج",
  "پالس اکسیمتر",
  "ترازو",
  "ویلچر",
];

/* ══════════════════════════ محصولات (۱۵) — آینهٔ عین prisma/seed.ts ══════════════════════════ */

/**
 * دادهٔ زیر عیناً از seed آمده است (عنوان/قیمت/موجودی/تخفیف/تنوع/specs/توضیحات HTML).
 * تصویر هر محصول از جایگاهش در seed می‌آید: /placeholders/product-{n}-{a,b}.svg
 */

interface PreviewVariantRow {
  title: string;
  price: number;
  stock: number;
  isDefault: boolean;
}

interface PreviewProductRow {
  slug: string;
  title: string;
  brandTitle: string;
  price: number;
  comparePrice: number | null;
  /** موجودی کل: محصول ساده = stock؛ تنوع‌دار = مجموع موجودی تنوع‌ها (همان قاعدهٔ seed) */
  totalStock: number;
  isNew: boolean;
  isFeatured: boolean;
  categoryTitle: string;
  categorySlug: string;
  categoryParentTitle: string;
  shortDescription: string;
  description: string;
  specs: ProductSpecDTO[];
  variants: PreviewVariantRow[];
}

const PREVIEW_PRODUCT_ROWS: PreviewProductRow[] = [
  {
    slug: "omron-m2-blood-pressure",
    title: "فشارسنج بازویی اومرون M2",
    brandTitle: "اومرون",
    price: 2850000,
    comparePrice: 3200000,
    totalStock: 12,
    isNew: false,
    isFeatured: true,
    categoryTitle: "بازویی",
    categorySlug: "bp-arm",
    categoryParentTitle: "فشارسنج",
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
    variants: [],
  },
  {
    slug: "beurer-bm19",
    title: "فشارسنج مچی بویرون BM 19",
    brandTitle: "بویرون",
    price: 1950000,
    comparePrice: 2200000,
    totalStock: 8,
    isNew: false,
    isFeatured: false,
    categoryTitle: "مچی",
    categorySlug: "bp-wrist",
    categoryParentTitle: "فشارسنج",
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
    variants: [],
  },
  {
    slug: "rossmax-tg300",
    title: "قندسنج راسمکس TG 300",
    brandTitle: "راسمکس",
    price: 1680000,
    comparePrice: null,
    totalStock: 10,
    isNew: false,
    isFeatured: false,
    categoryTitle: "قندسنج",
    categorySlug: "glucose-meter",
    categoryParentTitle: "قندسنج و دیابت",
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
      { title: "بدون نوار", price: 1680000, stock: 5, isDefault: true },
      { title: "همراه ۵۰ نوار", price: 2150000, stock: 3, isDefault: false },
      { title: "همراه ۱۰۰ نوار", price: 2490000, stock: 2, isDefault: false },
    ],
  },
  {
    slug: "beurer-gl50-strips",
    title: "نوار قند بویرون بستهٔ ۵۰ عددی",
    brandTitle: "بویرون",
    price: 690000,
    comparePrice: null,
    totalStock: 40,
    isNew: false,
    isFeatured: false,
    categoryTitle: "نوار و لانست",
    categorySlug: "glucose-strips",
    categoryParentTitle: "قندسنج و دیابت",
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
    variants: [],
  },
  {
    slug: "beurer-ft90",
    title: "دماسنج بدون‌تماس بویرون FT 90",
    brandTitle: "بویرون",
    price: 1150000,
    comparePrice: 1390000,
    totalStock: 15,
    isNew: true,
    isFeatured: true,
    categoryTitle: "بدون‌تماس",
    categorySlug: "therm-contactless",
    categoryParentTitle: "دماسنج",
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
    variants: [],
  },
  {
    slug: "omron-mc245",
    title: "دماسنج دیجیتال اومرون MC-245",
    brandTitle: "اومرون",
    price: 420000,
    comparePrice: null,
    totalStock: 25,
    isNew: false,
    isFeatured: false,
    categoryTitle: "دیجیتال",
    categorySlug: "therm-digital",
    categoryParentTitle: "دماسنج",
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
    variants: [],
  },
  {
    slug: "rossmax-sb210",
    title: "پالس اکسیمتر انگشتی راسمکس SB210",
    brandTitle: "راسمکس",
    price: 1890000,
    comparePrice: null,
    totalStock: 0,
    isNew: false,
    isFeatured: false,
    categoryTitle: "پالس اکسیمتر",
    categorySlug: "pulse-oximeter",
    categoryParentTitle: "تنفسی و اکسیژن",
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
    variants: [],
  },
  {
    slug: "medisana-uhw",
    title: "بخور سرد خانگی مدیسانا UHW",
    brandTitle: "مدیسانا",
    price: 890000,
    comparePrice: null,
    totalStock: 10,
    isNew: false,
    isFeatured: false,
    categoryTitle: "بخور و نبولایزر",
    categorySlug: "nebulizer",
    categoryParentTitle: "تنفسی و اکسیژن",
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
    variants: [],
  },
  {
    slug: "tri-ball-spirometer",
    title: "اسپایرومتر سه‌گلوله (تری‌فلو)",
    brandTitle: "سلامت‌سازان",
    price: 350000,
    comparePrice: null,
    totalStock: 18,
    isNew: false,
    isFeatured: false,
    categoryTitle: "اسپایرومتر",
    categorySlug: "spirometer",
    categoryParentTitle: "تنفسی و اکسیژن",
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
    variants: [],
  },
  {
    slug: "salamat-folding-wheelchair",
    title: "ویلچر تاشار سلامت‌سازان",
    brandTitle: "سلامت‌سازان",
    price: 8900000,
    comparePrice: null,
    totalStock: 5,
    isNew: false,
    isFeatured: true,
    categoryTitle: "ویلچر تاشار",
    categorySlug: "wheelchair-folding",
    categoryParentTitle: "ویلچر و سه‌چرخه",
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
      { title: "۱۶ اینچ", price: 8900000, stock: 2, isDefault: true },
      { title: "۱۸ اینچ", price: 9400000, stock: 2, isDefault: false },
      { title: "۲۰ اینچ", price: 9900000, stock: 1, isDefault: false },
    ],
  },
  {
    slug: "electric-hospital-bed",
    title: "تخت بیمارستانی برقی دو موتوره",
    brandTitle: "سلامت‌سازان",
    price: 28500000,
    comparePrice: null,
    totalStock: 1,
    isNew: false,
    isFeatured: false,
    categoryTitle: "تخت برقی",
    categorySlug: "bed-electric",
    categoryParentTitle: "تخت و بستری",
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
    variants: [],
  },
  {
    slug: "lumbar-support-belt",
    title: "کمربند طبی مهره‌دار",
    brandTitle: "سلامت‌سازان",
    price: 780000,
    comparePrice: null,
    totalStock: 18,
    isNew: false,
    isFeatured: false,
    categoryTitle: "کمربند طبی",
    categorySlug: "lumbar-belt",
    categoryParentTitle: "ارتوپدی و حمایت",
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
      { title: "S", price: 780000, stock: 6, isDefault: false },
      { title: "M", price: 780000, stock: 5, isDefault: true },
      { title: "L", price: 780000, stock: 4, isDefault: false },
      { title: "XL", price: 780000, stock: 3, isDefault: false },
    ],
  },
  {
    slug: "surgical-mask-50",
    title: "ماسک جراحی سه‌لایه بستهٔ ۵۰ عددی",
    brandTitle: "سلامت‌سازان",
    price: 195000,
    comparePrice: 250000,
    totalStock: 100,
    isNew: false,
    isFeatured: false,
    categoryTitle: "ماسک جراحی",
    categorySlug: "mask-surgical",
    categoryParentTitle: "ماسک و مصرفی",
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
    variants: [],
  },
  {
    slug: "beurer-gs27",
    title: "ترازوی دیجیتال بویرون GS 27",
    brandTitle: "بویرون",
    price: 1290000,
    comparePrice: null,
    totalStock: 9,
    isNew: false,
    isFeatured: false,
    categoryTitle: "ترازوی دیجیتال",
    categorySlug: "scale-digital",
    categoryParentTitle: "ترازو و سلامت خانگی",
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
    variants: [],
  },
  {
    slug: "medisana-bs430",
    title: "ترازوی آنالیزاتور بدن مدیسانا BS 430",
    brandTitle: "مدیسانا",
    price: 2150000,
    comparePrice: 2480000,
    totalStock: 7,
    isNew: true,
    isFeatured: true,
    categoryTitle: "آنالیزاتور بدن",
    categorySlug: "scale-body-analyzer",
    categoryParentTitle: "ترازو و سلامت خانگی",
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
    variants: [],
  },
];

/** ساخت ProductSummary از ردیف seed (id ها slug-محور: p-<slug>) */
function toProductSummary(row: PreviewProductRow, index: number): ProductSummary {
  return {
    id: `p-${row.slug}`,
    slug: row.slug,
    title: row.title,
    image: `/placeholders/product-${index + 1}-a.svg`,
    price: row.price,
    comparePrice: row.comparePrice,
    inStock: row.totalStock > 0,
    brandTitle: row.brandTitle,
    isNew: row.isNew,
    isFeatured: row.isFeatured,
    categorySlug: row.categorySlug,
  } satisfies ProductSummary;
}

export const PREVIEW_PRODUCTS: ProductSummary[] = PREVIEW_PRODUCT_ROWS.map(toProductSummary);

export const PREVIEW_PRODUCT_DETAILS: Record<string, ProductDetail> = Object.fromEntries(
  PREVIEW_PRODUCT_ROWS.map((row, index) => {
    const summary = toProductSummary(row, index);
    return [
      row.slug,
      {
        ...summary,
        shortDescription: row.shortDescription,
        description: row.description,
        images: [
          { url: `/placeholders/product-${index + 1}-a.svg`, alt: row.title },
          { url: `/placeholders/product-${index + 1}-b.svg`, alt: row.title },
        ],
        variants: row.variants.map((variant, variantIndex) => ({
          id: `pv-${row.slug}-${variantIndex + 1}`,
          title: variant.title,
          price: variant.price,
          comparePrice: null,
          stock: variant.stock,
          isDefault: variant.isDefault,
        })),
        specs: row.specs,
        categoryTitle: row.categoryTitle,
        categorySlug: row.categorySlug,
        categoryParentTitle: row.categoryParentTitle,
        totalStock: row.totalStock,
      } satisfies ProductDetail,
    ];
  }),
);

/* ══════════════════════════ اسلایدهای هیرو (۳) ══════════════════════════ */

export const PREVIEW_SLIDES: HomeSlideDTO[] = [
  {
    id: "slide-1",
    title: "تجهیزات پزشکی اصل، با خیال راحت",
    subtitle: "بیش از ۸۰ برند معتبر جهانی — اومرون، بویرون، مدیسانا و…",
    imageUrl: "/placeholders/slide-1.svg",
    ctaLabel: "دیدن محصولات",
    ctaHref: "/products",
  },
  {
    id: "slide-2",
    title: "برای هر خانه، یک دستگاه سلامت",
    subtitle: "از فشارسنج و قندسنج تا بخور و ترازوی هوشمند",
    imageUrl: "/placeholders/slide-2.svg",
    ctaLabel: "خرید بر اساس نیاز",
    ctaHref: "/products",
  },
  {
    id: "slide-3",
    title: "قبل از خرید، با کارشناس مشورت کنید",
    subtitle: "مشاورهٔ تخصصی رایگان — انتخاب درست، هزینهٔ کمتر",
    imageUrl: "/placeholders/slide-3.svg",
    ctaLabel: "تماس با کارشناس",
    ctaHref: "/contact",
  },
];

/* ══════════════════════════ خرید بر اساس نیاز (۶) ══════════════════════════ */

export const PREVIEW_NEEDS: NeedCardDTO[] = [
  {
    id: "need-bp",
    title: "کنترل فشار خون",
    description: "فشارسنج‌های بازویی و مچی با دقت بالینیک",
    iconKey: "blood-pressure",
    href: "/products?category=blood-pressure",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "need-glucose",
    title: "مدیریت دیابت",
    description: "قندسنج، نوار و لانست برای پایش روزانه",
    iconKey: "glucose",
    href: "/products?category=glucose",
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "need-resp",
    title: "سلامت تنفس",
    description: "بخور، پالس‌اکسیمتر و ماسک اکسیژن",
    iconKey: "respiratory",
    href: "/products?category=respiratory",
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "need-bed",
    title: "مراقبت از بیمار",
    description: "تخت برقی، تشک ضدزخم و لوازم بستری",
    iconKey: "beds",
    href: "/products?category=beds",
    isActive: true,
    sortOrder: 4,
  },
  {
    id: "need-ortho",
    title: "توان‌بخشی و ارتوپدی",
    description: "کمربند طبی، زانوبند و طوق گردنی",
    iconKey: "orthopedic",
    href: "/products?category=orthopedic",
    isActive: true,
    sortOrder: 5,
  },
  {
    id: "need-mask",
    title: "بهداشت و مصرفی",
    description: "ماسک، دستکش و اقلام ضدعفونی",
    iconKey: "masks",
    href: "/products?category=masks",
    isActive: true,
    sortOrder: 6,
  },
];

/* ══════════════════════════ گرید تبلیغات عکسی ══════════════════════════
 *
 * ادمین: چیدمان (layout) را انتخاب می‌کند، برای هر اسلات تصویر آپلود می‌کند،
 * مقصد کلیک را تعیین می‌کند و هر کاشی را جداگانه فعال/غیرفعال می‌کند.
 * AD_LAYOUT_SPECS ابعاد دقیق هر اسلات را به طراح نشان می‌دهد (پیکسل @۲x).
 */

export const AD_LAYOUT_SPECS: Record<AdLayoutSpecDTO["key"], AdLayoutSpecDTO> = {
  bento: {
    key: "bento",
    title: "بنتو — مربع بزرگ + مستطیل + دو مربع",
    slots: [
      { name: "مربع بزرگ (چپ)", ratio: "۱:۱", sizeHint: "۱۴۴۰×۱۴۴۰ پیکسل" },
      { name: "مستطیل عریض (بالا-راست)", ratio: "۲:۱", sizeHint: "۱۴۴۰×۷۲۰ پیکسل" },
      { name: "مربع کوچک (پایین-راست ۱)", ratio: "۱:۱", sizeHint: "۷۲۰×۷۲۰ پیکسل" },
      { name: "مربع کوچک (پایین-راست ۲)", ratio: "۱:۱", sizeHint: "۷۲۰×۷۲۰ پیکسل" },
    ],
  },
  duo: {
    key: "duo",
    title: "جفت — دو مستطیل عریض",
    slots: [
      { name: "مستطیل ۱", ratio: "۱۲:۵", sizeHint: "۱۶۸۰×۷۰۰ پیکسل" },
      { name: "مستطیل ۲", ratio: "۱۲:۵", sizeHint: "۱۶۸۰×۷۰۰ پیکسل" },
    ],
  },
  trio: {
    key: "trio",
    title: "سه‌تایی — سه مربع",
    slots: [
      { name: "مربع ۱", ratio: "۱:۱", sizeHint: "۱۰۰۰×۱۰۰۰ پیکسل" },
      { name: "مربع ۲", ratio: "۱:۱", sizeHint: "۱۰۰۰×۱۰۰۰ پیکسل" },
      { name: "مربع ۳", ratio: "۱:۱", sizeHint: "۱۰۰۰×۱۰۰۰ پیکسل" },
    ],
  },
};

export const PREVIEW_ADS: AdGridDTO = {
  layout: "bento",
  tiles: [
    {
      id: "ad-1",
      slotIndex: 0,
      imageUrl: "/placeholders/ad-big-1.svg",
      title: "فشارسنج‌های دیجیتال",
      subtitle: "دقت بالینیک، دو سال گارانتی",
      href: "/products?category=blood-pressure",
      isActive: true,
      sortOrder: 1,
    },
    {
      id: "ad-2",
      slotIndex: 1,
      imageUrl: "/placeholders/ad-wide-1.svg",
      title: "اقلام مصرفی اورجینال",
      subtitle: "نوار قند، لانست و ماسک",
      href: "/products?category=masks",
      isActive: true,
      sortOrder: 2,
    },
    {
      id: "ad-3",
      slotIndex: 2,
      imageUrl: "/placeholders/ad-square-1.svg",
      title: "بخور و نبولایزر",
      subtitle: null,
      href: "/products?category=nebulizer",
      isActive: true,
      sortOrder: 3,
    },
    {
      id: "ad-4",
      slotIndex: 3,
      imageUrl: "/placeholders/ad-square-2.svg",
      title: "تشک ضدزخم",
      subtitle: null,
      href: "/products?category=anti-bedsore-mattress",
      isActive: true,
      sortOrder: 4,
    },
  ],
};

/* ══════════════════════════ بخش‌های صفحهٔ خانه (۸) ══════════════════════════ */

export const PREVIEW_HOME_SECTIONS: HomeSectionDTO[] = [
  { key: "hero", title: null, subtitle: null, sortOrder: 0, isActive: true },
  {
    key: "needs",
    title: "خرید بر اساس نیاز",
    subtitle: "به جای جست‌وجوی دسته‌ها، بگویید دغدغه‌تان چیست",
    sortOrder: 1,
    isActive: true,
  },
  { key: "ads", title: null, subtitle: null, sortOrder: 2, isActive: true },
  {
    key: "productRail",
    title: "محبوب‌ترین‌ها",
    subtitle: "انتخاب واقعی مشتریان، به‌روزرسانی هفتگی",
    sortOrder: 3,
    isActive: true,
  },
  {
    key: "expertPicks",
    title: "منتخب کارشناس سلامت",
    subtitle: "تیم کارشناسی ما این قلم‌ها را با وسواس انتخاب کرده است",
    sortOrder: 4,
    isActive: true,
  },
  { key: "brands", title: "برندهای همراه ما", subtitle: null, sortOrder: 5, isActive: true },
  {
    key: "articles",
    title: "مجلهٔ سلامت",
    subtitle: "خواندنی‌های کاربردی برای سلامتی خانواده",
    sortOrder: 6,
    isActive: true,
  },
  { key: "aboutStore", title: "دربارهٔ بسلامت", subtitle: null, sortOrder: 7, isActive: true },
];

/* ══════════════════════════ مجلهٔ سلامت (۲ دسته + ۳ مقاله) ══════════════════════════ */

const DAY_MS = 86_400_000;

/** ISO نسبت به «اکنونِ» بارگذاری ماژول — آینهٔ قاعدهٔ seed (۲۰/۱۲/۵ روز پیش) */
function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * DAY_MS).toISOString();
}

interface PreviewArticleRow {
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string;
  categoryTitle: string;
  publishedDaysAgo: number;
  contentHtml: string;
}

const PREVIEW_ARTICLE_ROWS: PreviewArticleRow[] = [
  {
    slug: "choosing-home-blood-pressure-monitor",
    title: "راهنمای انتخاب فشارسنج خانگی؛ بازویی یا مچی؟",
    excerpt: "تفاوت‌های فشارسنج بازویی و مچی و نکاتی که پیش از خرید باید بدانید.",
    coverUrl: "/placeholders/article-1.svg",
    categoryTitle: "راهنمای خرید",
    publishedDaysAgo: 20,
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
  },
  {
    slug: "glucometer-care-tips",
    title: "۷ نکتهٔ مهم در نگهداری قندسنج",
    excerpt: "با این هفت نکتهٔ ساده، قندسنج شما دقیق‌تر کار می‌کند و عمر دستگاه طولانی‌تر می‌شود.",
    coverUrl: "/placeholders/article-2.svg",
    categoryTitle: "راهنمای خرید",
    publishedDaysAgo: 12,
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
  },
  {
    slug: "contactless-thermometer-guide",
    title: "استفادهٔ درست از دماسنج بدون‌تماس",
    excerpt:
      "فاصلهٔ درست، پیشانی تمیز و چند اندازه‌گیری مقایسه‌ای؛ کلید گرفتن عدد قابل اعتماد از دماسنج بدون‌تماس.",
    coverUrl: "/placeholders/article-3.svg",
    categoryTitle: "سلامت خانگی",
    publishedDaysAgo: 5,
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
  },
];

export const PREVIEW_ARTICLES: ArticleSummary[] = PREVIEW_ARTICLE_ROWS.map((row) => ({
  id: `a-${row.slug}`,
  slug: row.slug,
  title: row.title,
  excerpt: row.excerpt,
  coverUrl: row.coverUrl,
  publishedAt: daysAgoIso(row.publishedDaysAgo),
  categoryTitle: row.categoryTitle,
}));

export const PREVIEW_ARTICLE_DETAILS: Record<string, ArticleDetail> = Object.fromEntries(
  PREVIEW_ARTICLES.map((summary, index) => {
    const row = PREVIEW_ARTICLE_ROWS[index];
    if (!row) throw new Error("ناهم‌خوانی PREVIEW_ARTICLE_ROWS با PREVIEW_ARTICLES");
    return [row.slug, { ...summary, contentHtml: row.contentHtml } satisfies ArticleDetail];
  }),
);

/* ══════════════════════════ تب‌های محصولات صفحهٔ خانه ══════════════════════════ */

export type ProductTabKey = "bestseller" | "new" | "discount";

export const PRODUCT_TABS: { key: ProductTabKey; label: string }[] = [
  { key: "bestseller", label: "پرفروش‌ها" },
  { key: "new", label: "جدیدترین‌ها" },
  { key: "discount", label: "تخفیف‌دار" },
];

/** ترتیب دستی پرفروش‌ها — محصولات پرفروش‌تر اول (۸ مورد) */
const BESTSELLER_SLUGS = [
  "omron-m2-blood-pressure", // فشارسنج M2
  "surgical-mask-50", // ماسک جراحی
  "beurer-gl50-strips", // نوار قند
  "beurer-ft90", // دماسنج FT90
  "beurer-gs27", // ترازو GS27
  "rossmax-tg300", // قندسنج TG300
  "medisana-uhw", // بخور
  "medisana-bs430", // آنالیزاتور بدن
] as const;

/**
 * محصول‌های هر تب صفحهٔ خانه:
 * - bestseller: ترتیب دستی منطقی ۸تایی
 * - new: isNewها اول (تازه‌تر از seed اول‌تر)، سپس تازه‌ترین createdAtها تا ۸ مورد
 *   (createdAt آینهٔ seed است: پخش خطی روی ۶۰ روز؛ ایندکس بالاتر = جدیدتر)
 * - discount: فقط comparePrice != null، مرتب بر اساس درصد تخفیف (نزولی)
 *   توجه: در seed فقط ۵ محصول comparePrice دارند؛ تب عین داده است.
 */
export function getPreviewProductsByTab(tab: ProductTabKey): ProductSummary[] {
  switch (tab) {
    case "bestseller": {
      const bySlug = new Map(PREVIEW_PRODUCTS.map((product) => [product.slug, product]));
      return BESTSELLER_SLUGS.map((slug) => bySlug.get(slug)).filter(
        (product): product is ProductSummary => product != null,
      );
    }
    case "new": {
      return [...PREVIEW_PRODUCTS]
        .map((product, index) => ({ product, index }))
        .sort((a, b) => {
          if (a.product.isNew !== b.product.isNew) return a.product.isNew ? -1 : 1;
          return b.index - a.index;
        })
        .slice(0, 8)
        .map((row) => row.product);
    }
    case "discount": {
      return PREVIEW_PRODUCTS.map((product) => ({
        product,
        percent: discountPercent(product.price, product.comparePrice),
      }))
        .filter((row) => row.percent != null)
        .sort((a, b) => (b.percent ?? 0) - (a.percent ?? 0))
        .map((row) => row.product);
    }
  }
}
