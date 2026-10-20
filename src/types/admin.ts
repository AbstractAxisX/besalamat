/**
 * تایپ‌های DTO پنل ادمین — مطابق خروجی APIهای /api/admin/*
 * (همان قراردادی که Task 8-c مستند کرده: لیست‌ها {items:[...]}،
 * قیمت‌ها Int تومان، تاریخ‌ها ISO، وضعیت سفارش رشتهٔ enum)
 */

import type { OrderStatusDTO } from "./shop";

/* ── محصولات ── */

export interface AdminProductRow {
  id: string;
  title: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  isActive: boolean;
  isNew: boolean;
  isFeatured: boolean;
  brandId: string | null;
  brandTitle: string | null;
  categoryId: string | null;
  categoryTitle: string | null;
  images: string[];
  imageCount: number;
  variantCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProductImage {
  id?: string;
  url: string;
  alt: string | null;
  sortOrder: number;
}

export interface AdminProductVariant {
  id?: string;
  title: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  isDefault: boolean;
  sku: string | null;
  sortOrder: number;
}

export interface AdminProductSpec {
  id?: string;
  key: string;
  value: string;
  sortOrder: number;
}

/** خروجی GET /api/admin/products/[id] — ردیف کامل با فرزندان */
export interface AdminProductDetail {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  categoryId: string | null;
  brandId: string | null;
  price: number;
  comparePrice: number | null;
  stock: number;
  isActive: boolean;
  isNew: boolean;
  isFeatured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
  images: AdminProductImage[];
  variants: AdminProductVariant[];
  specs: AdminProductSpec[];
}

/* ── سفارش‌ها ── */

export type AdminShippingMethod = "POST" | "PICKUP";

export interface AdminOrderRow {
  id: string;
  orderNumber: string;
  status: OrderStatusDTO;
  shippingMethod: AdminShippingMethod;
  shippingCost: number;
  subtotal: number;
  total: number;
  receiverName: string;
  receiverPhone: string;
  province: string;
  city: string;
  itemsCount: number;
  userPhone: string;
  userFullName: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface AdminOrderItem {
  id: string;
  productId: string | null;
  variantId: string | null;
  titleSnapshot: string;
  variantSnapshot: string | null;
  imageSnapshot: string | null;
  unitPrice: number;
  comparePriceSnapshot: number | null;
  quantity: number;
  lineTotal: number;
}

export interface AdminStatusLog {
  id: string;
  fromStatus: OrderStatusDTO | null;
  toStatus: OrderStatusDTO;
  note: string | null;
  /** مثل «admin:09120000000» یا «system» */
  actor: string | null;
  createdAt: string;
}

/** خروجی GET /api/admin/orders/[id] */
export interface AdminOrderDetail extends AdminOrderRow {
  addressLine: string;
  postalCode: string | null;
  note: string | null;
  postalTrackingCode: string | null;
  canceledAt: string | null;
  discountTotal: number;
  user: { id: string; phone: string; fullName: string | null; email: string | null };
  items: AdminOrderItem[];
  statusLogs: AdminStatusLog[];
}

/* ── کاربران ── */

export interface AdminUserRow {
  id: string;
  phone: string;
  fullName: string | null;
  email: string | null;
  role: "USER" | "ADMIN";
  isBlocked: boolean;
  orderCount: number;
  lastLoginAt: string | null;
  createdAt: string;
}

/* ── دسته‌ها و برندها (برای فرم محصول) ── */

export interface AdminCategoryNode {
  id: string;
  parentId: string | null;
  title: string;
  slug: string;
  iconKey: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
  children: AdminCategoryNode[];
}

export interface AdminBrandRow {
  id: string;
  title: string;
  slug: string;
  logoUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
}

/** خروجی GET /api/admin/categories/[id] — ردیف کامل با سئو */
export interface AdminCategoryDetailRow {
  id: string;
  parentId: string | null;
  title: string;
  slug: string;
  iconKey: string | null;
  sortOrder: number;
  isActive: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
}

/* ── صفحهٔ اصلی فروشگاه ── */

export interface AdminHomeSectionRow {
  key: string;
  title: string | null;
  subtitle: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface AdminSlideRow {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  mobileImageUrl: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface AdminBannerRow {
  id: string;
  slot: number;
  imageUrl: string;
  href: string | null;
  isActive: boolean;
  title: string | null;
  subtitle: string | null;
}

export interface AdminNeedRow {
  id: string;
  title: string;
  description: string;
  href: string;
  sortOrder: number;
  isActive: boolean;
}

export interface AdminPopularTermRow {
  id: string;
  term: string;
  weight: number;
  isActive: boolean;
}

/* ── مقاله‌ها ── */

export interface AdminArticleCategoryRow {
  id: string;
  title: string;
}

export interface AdminArticleRow {
  id: string;
  title: string;
  slug: string;
  coverUrl: string;
  excerpt: string;
  categoryId: string | null;
  categoryTitle: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  updatedAt: string;
}

/** خروجی GET /api/admin/articles/[id] — ردیف کامل + دسته */
export interface AdminArticleDetailRow {
  id: string;
  title: string;
  slug: string;
  coverUrl: string;
  excerpt: string;
  contentHtml: string;
  categoryId: string | null;
  category: { id: string; title: string; slug: string } | null;
  seoTitle: string | null;
  seoDescription: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/* ── پرسش‌های متداول ── */

export interface AdminFaqRow {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
}

/* ── پیام‌های تماس ── */

export interface AdminMessageRow {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  subject: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

/* ── تنظیمات فروشگاه ── */

export interface AdminSettingsSocial {
  key: string;
  label: string;
  /** مقدار مؤثر (پیش‌فرض برند یا بازنویسی ذخیره‌شده) — "" یعنی مخفی */
  defaultHref: string;
}

/** خروجی GET /api/admin/settings — خام + overlay تایپ‌شده */
export interface AdminSettingsResponse {
  raw: Record<string, string>;
  store: {
    name: string;
    tagline: string;
    phone: string;
    phoneAlt: string;
    email: string;
    address: string;
    hours: { days: string; time: string }[];
    mapEmbedUrl: string;
    socials: AdminSettingsSocial[];
    aboutShort: string;
    shippingNote: string;
    twitter: string;
  };
}

/* ── پاسخ‌های استاندارد ── */

export interface AdminProductListResponse {
  items: AdminProductRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface AdminUserMeResponse {
  user: {
    userId: string;
    phone: string;
    fullName: string | null;
    role: "USER" | "ADMIN";
  };
}
