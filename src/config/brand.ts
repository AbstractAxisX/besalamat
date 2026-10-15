/**
 * پیکربندی برند — «بسلامت»
 * ───────────────────────────
 * تنها مرجع هویت فروشگاه. برای راه‌اندازی فروشگاه دوم (white-label)
 * فقط همین فایل + متغیرهای محیطی + رنگ‌های globals.css را تغییر دهید.
 * مقادیر «پیش‌فرض» هستند؛ ادمین می‌تواند موارد مشخص را از پنل بازنویسی کند.
 */

export const SOCIAL_KEYS = [
  "telegram",
  "whatsapp",
  "instagram",
  "bale",
  "eitaa",
  "rubika",
] as const;

export type SocialKey = (typeof SOCIAL_KEYS)[number];

export interface SocialConfig {
  key: SocialKey;
  label: string;
  /** مقدار پیش‌فرض (href) — رشتهٔ خالی یعنی به‌صورت پیش‌فرض غیرفعال */
  defaultHref: string;
}

export interface StoreHoursEntry {
  days: string;
  time: string;
}

export interface BrandContactConfig {
  phone: string;
  phoneAlt: string;
  email: string;
  address: string;
  hours: StoreHoursEntry[];
  /** iframe نقشه (گوگل‌مپ یا نشان) — از ادمین قابل تغییر */
  mapEmbedUrl: string;
}

export interface BrandConfig {
  /** نام فروشگاه */
  name: string;
  /** نام لاتین (استفاده در شماره سفارش و متا) */
  latinName: string;
  tagline: string;
  description: string;
  domain: string;

  /** پیشوند و پایهٔ شماره سفارش خوانا — پیش‌فرض BS-10234 */
  orderNumberPrefix: string;
  orderNumberBase: number;

  contact: BrandContactConfig;
  socials: SocialConfig[];

  currencyLabel: string;

  /** متن نوار اعلان بالای هدر — null یعنی مخفی */
  announcementBar: string | null;

  meta: {
    titleTemplate: string;
    defaultTitle: string;
    defaultDescription: string;
    ogImage: string;
  };
}

export const brand: BrandConfig = {
  name: "بسلامت",
  latinName: "Besalamat",
  tagline: "همراهِ مطمئنِ سلامتی خانواده",
  description:
    "فروشگاه تخصصی لوازم و تجهیزات پزشکی؛ ضمانت اصالت کالا، ارسال سریع و مشاورهٔ تخصصی.",
  domain: "https://besalamat.example.com",

  orderNumberPrefix: "BS",
  orderNumberBase: 10234,

  contact: {
    phone: "021-91008000",
    phoneAlt: "0912-000-0000",
    email: "info@besalamat.example.com",
    address: "تهران، خیابان ولیعصر، بالاتر از پارک ساعی، پلاک ۲۴۸۰، طبقهٔ اول",
    hours: [
      { days: "شنبه تا پنجشنبه", time: "۹ الی ۱۸" },
      { days: "جمعه", time: "تعطیل" },
    ],
    mapEmbedUrl: "https://maps.google.com/maps?q=Tehran%20Valiasr&output=embed",
  },

  socials: [
    { key: "telegram", label: "تلگرام", defaultHref: "#" },
    { key: "whatsapp", label: "واتساپ", defaultHref: "#" },
    { key: "instagram", label: "اینستاگرام", defaultHref: "#" },
    { key: "bale", label: "بله", defaultHref: "" },
    { key: "eitaa", label: "ایتا", defaultHref: "" },
    { key: "rubika", label: "روبیکا", defaultHref: "" },
  ],

  currencyLabel: "تومان",

  announcementBar: "ارسال به سراسر کشور؛ تحویل حضوری از فروشگاه رایگان است.",

  meta: {
    titleTemplate: "%s | بسلامت",
    defaultTitle: "بسلامت | فروشگاه تخصصی لوازم پزشکی و سلامت",
    defaultDescription:
      "خرید آنلاین لوازم و تجهیزات پزشکی با ضمانت اصالت کالا، قیمت منصفانه و ارسال سریع به سراسر کشور.",
    ogImage: "/placeholders/og-default.svg",
  },
};

/** برچسب فارسی شبکه‌های اجتماعی */
export const SOCIAL_LABELS: Record<SocialKey, string> = {
  telegram: "تلگرام",
  whatsapp: "واتساپ",
  instagram: "اینستاگرام",
  bale: "بله",
  eitaa: "ایتا",
  rubika: "روبیکا",
};
