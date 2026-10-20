/**
 * اسکیماهای zod مشترک APIهای ادمین — پیام‌های فارسی
 * ─────────────────────────────────────────────────
 * در فایلهای route.ts نمی‌توان مقدار دلخواه export کرد؛
 * اسکیماها اینجا متمرکز می‌شوند تا ساخت/ویرایش از یک منبع تغذیه شوند.
 */

import { z } from "zod";

/* ── محصول ── */

export const productImageSchema = z.object({
  url: z.string().min(1, "نشانی تصویر خالی است"),
  alt: z.string().nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const productVariantSchema = z.object({
  title: z.string().trim().min(1, "عنوان تنوع را وارد کنید"),
  price: z
    .number({ message: "قیمت تنوع باید عدد باشد" })
    .int("قیمت تنوع معتبر نیست")
    .positive("قیمت تنوع معتبر نیست"),
  comparePrice: z.number().int().positive("قیمت قبل از تخفیف معتبر نیست").nullable().optional(),
  stock: z.number().int("موجودی معتبر نیست").min(0, "موجودی نمی‌تواند منفی باشد").default(0),
  isDefault: z.boolean().optional().default(false),
  sku: z.string().nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const productSpecSchema = z.object({
  key: z.string().trim().min(1, "نام مشخصه را وارد کنید"),
  value: z.string().trim().min(1, "مقدار مشخصه را وارد کنید"),
  sortOrder: z.number().int().min(0).optional(),
});

export const productBodySchema = z.object({
  title: z.string().trim().min(2, "عنوان محصول را وارد کنید"),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "اسلاگ فقط حروف کوچک لاتین، عدد و خط تیره"),
  searchText: z.string().optional(),
  shortDescription: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  brandId: z.string().nullable().optional(),
  price: z
    .number({ message: "قیمت باید عدد باشد" })
    .int("قیمت معتبر نیست")
    .positive("قیمت معتبر نیست"),
  comparePrice: z.number().int().positive("قیمت قبل از تخفیف معتبر نیست").nullable().optional(),
  stock: z.number().int("موجودی معتبر نیست").min(0, "موجودی نمی‌تواند منفی باشد").default(0),
  isActive: z.boolean().optional().default(true),
  isNew: z.boolean().optional().default(false),
  isFeatured: z.boolean().optional().default(false),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  images: z.array(productImageSchema).optional().default([]),
  variants: z.array(productVariantSchema).optional().default([]),
  specs: z.array(productSpecSchema).optional().default([]),
});

/* ── دسته‌بندی ── */

export const categoryBodySchema = z.object({
  title: z.string().trim().min(2, "عنوان دسته را وارد کنید"),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "اسلاگ فقط حروف کوچک لاتین، عدد و خط تیره"),
  parentId: z.string().nullable().optional(),
  iconKey: z.string().nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional().default(true),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
});

/* ── برند ── */

export const brandBodySchema = z.object({
  title: z.string().trim().min(2, "عنوان برند را وارد کنید"),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "اسلاگ فقط حروف کوچک لاتین، عدد و خط تیره"),
  logoUrl: z.string().nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional().default(true),
});

/* ── سفارش (ویرایش وضعیت) ── */

export const orderUpdateSchema = z.object({
  status: z
    .enum(["PENDING_PAYMENT", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELED", "RETURNED"], {
      message: "وضعیت سفارش نامعتبر است",
    })
    .optional(),
  postalTrackingCode: z.string().trim().nullable().optional(),
  note: z.string().trim().nullable().optional(),
});

/* ── کاربر ── */

export const userUpdateSchema = z.object({
  isBlocked: z.boolean().optional(),
  fullName: z.string().trim().min(2, "نام را کامل وارد کنید").nullable().optional(),
  role: z.enum(["USER", "ADMIN"], { message: "نقش نامعتبر است" }).optional(),
});

/* ── بخش‌های خانه ── */

export const homeSectionBodySchema = z.object({
  key: z.string().trim().min(1, "کلید بخش را وارد کنید"),
  title: z.string().nullable().optional(),
  subtitle: z.string().nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional().default(true),
});

export const homeSectionsPutSchema = z.array(homeSectionBodySchema).min(1, "فهرست بخش‌ها خالی است");

/* ── اسلاید ── */

export const slideBodySchema = z.object({
  title: z.string().trim().min(2, "عنوان اسلاید را وارد کنید"),
  subtitle: z.string().nullable().optional(),
  imageUrl: z.string().min(1, "نشانی تصویر اسلاید را وارد کنید"),
  mobileImageUrl: z.string().nullable().optional(),
  ctaLabel: z.string().nullable().optional(),
  ctaHref: z.string().nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional().default(true),
});

/* ── بنر (قرارداد ذخیره: عنوان\nزیرعنوان در ستون title) ── */

export const bannerBodySchema = z.object({
  slot: z.number().int("جایگاه بنر باید عدد باشد").min(0, "جایگاه بنر از ۰ شروع می‌شود").max(3, "جایگاه بنر حداکثر ۳ است"),
  imageUrl: z.string().min(1, "نشانی تصویر بنر را وارد کنید"),
  href: z.string().min(1, "مقصد کلیک بنر را وارد کنید"),
  title: z.string().trim().min(1, "عنوان بنر را وارد کنید"),
  subtitle: z.string().trim().nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

/* ── کارت نیاز ── */

export const needBodySchema = z.object({
  title: z.string().trim().min(2, "عنوان نیاز را وارد کنید"),
  description: z.string().trim().min(2, "توضیح نیاز را وارد کنید"),
  href: z.string().min(1, "مقصد کلیک را وارد کنید"),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional().default(true),
});

/* ── واژهٔ پرجستجو ── */

export const popularTermBodySchema = z.object({
  term: z.string().trim().min(2, "واژه را وارد کنید"),
  weight: z.number().int("وزن باید عدد باشد").min(0).optional(),
  isActive: z.boolean().optional().default(true),
});

/* ── مقاله ── */

export const articleBodySchema = z.object({
  title: z.string().trim().min(2, "عنوان مقاله را وارد کنید"),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "اسلاگ فقط حروف کوچک لاتین، عدد و خط تیره"),
  coverUrl: z.string().min(1, "نشانی تصویر جلد را وارد کنید"),
  excerpt: z.string().trim().min(5, "چکیدهٔ مقاله را وارد کنید"),
  contentHtml: z.string().min(10, "متن مقاله را وارد کنید"),
  categoryId: z.string().nullable().optional(),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  isPublished: z.boolean().optional().default(false),
  publishedAt: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), "تاریخ انتشار نامعتبر است")
    .nullable()
    .optional(),
});

/* ── پرسش متداول ── */

export const faqBodySchema = z.object({
  question: z.string().trim().min(5, "پرسش را کامل وارد کنید"),
  answer: z.string().trim().min(5, "پاسخ را کامل وارد کنید"),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional().default(true),
});

/* ── پیام تماس ── */

export const messageUpdateSchema = z.object({
  isRead: z.boolean({ message: "وضعیت خوانده‌شده نامعتبر است" }),
});
