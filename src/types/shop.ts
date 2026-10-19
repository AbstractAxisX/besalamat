/**
 * تایپ‌های اشتراکی سمت کلاینت (DTO) — آینهٔ مدل‌های Prisma
 * کامپوننت‌های React فقط با همین تایپ‌ها کار می‌کنند؛
 * فاز ۳ به بعد، داده‌ها از API/Server با همین شکل تغذیه می‌شوند.
 */

import type { SocialKey } from "@/config/brand";

/* ── دسته‌بندی ── */
export interface CategoryNode {
  id: string;
  title: string;
  slug: string;
  iconKey: string | null;
  children: CategoryNode[];
}

/* ── برند ── */
export interface BrandSummary {
  id: string;
  title: string;
  slug: string;
}

/* ── محصول ── */
export interface ProductImageDTO {
  url: string;
  alt: string | null;
}

export interface ProductVariantDTO {
  id: string;
  title: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  isDefault: boolean;
}

export interface ProductSpecDTO {
  key: string;
  value: string;
}

/** کارت محصول در لیست‌ها */
export interface ProductSummary {
  id: string;
  slug: string;
  title: string;
  /** نخستین تصویر برای کارت */
  image: string;
  price: number;
  comparePrice: number | null;
  inStock: boolean;
  brandTitle: string | null;
  isNew: boolean;
  isFeatured: boolean;
  /** اسلاگ دستهٔ مستقیم — برای فیلتر سریع (مگامنو، نیازها) */
  categorySlug: string | null;
}

/** صفحهٔ جزئیات محصول */
export interface ProductDetail extends ProductSummary {
  shortDescription: string | null;
  description: string | null;
  images: ProductImageDTO[];
  variants: ProductVariantDTO[];
  specs: ProductSpecDTO[];
  categoryTitle: string | null;
  categorySlug: string | null;
  categoryParentTitle: string | null;
  /** مجموع موجودی (محصول یا همهٔ تنوع‌ها) */
  totalStock: number;
}

/* ── سبد خرید ── */
export interface CartLine {
  productId: string;
  variantId: string | null;
  slug: string;
  title: string;
  variantTitle: string | null;
  image: string;
  unitPrice: number;
  comparePrice: number | null;
  qty: number;
  /** حداکثر قابل افزودن (موجودی) */
  maxQty: number;
}

/* ── هوم داینامیک ── */
export type HomeSectionKey =
  | "hero"
  | "needs"
  | "ads"
  | "productRail"
  | "expertPicks"
  | "brands"
  | "articles"
  | "aboutStore";

export interface HomeSectionDTO {
  key: HomeSectionKey;
  title: string | null;
  subtitle: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface HomeSlideDTO {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  ctaLabel: string | null;
  ctaHref: string | null;
}

/* ── خرید بر اساس نیاز ── */
export interface NeedCardDTO {
  id: string;
  title: string;
  description: string;
  /** آیکون تبلر — کلید نگاشت به کامپوننت */
  iconKey: string;
  /** مقصد کلیک — معمولاً فیلتر دستهٔ مرتبط */
  href: string;
  isActive: boolean;
  sortOrder: number;
}

/* ── گرید تبلیغات عکسی ── */

/** قالب چیدمان — هر قالب اسلات‌های مشخص با نسبت دقیق دارد */
export type AdLayoutKey = "bento" | "duo" | "trio";

export interface AdLayoutSpecDTO {
  key: AdLayoutKey;
  /** عنوان فارسی قالب برای ادمین */
  title: string;
  /** تعداد اسلات‌ها */
  slots: AdSlotSpecDTO[];
}

export interface AdSlotSpecDTO {
  /** نام اسلات برای ادمین/طراح */
  name: string;
  /** نسبت تصویر — مثلاً 1 یعنی مربع */
  ratio: string;
  /** ابعاد پیشنهادی دقیق برای طراح (px @2x) */
  sizeHint: string;
}

export interface AdTileDTO {
  id: string;
  /** اسلات چیدمان: index در آرایهٔ اسلات‌های قالب */
  slotIndex: number;
  imageUrl: string;
  /** متن روی تصویر (اختیاری) */
  title: string | null;
  subtitle: string | null;
  /** مقصد کلیک — محصول/دسته/جستجو/لینک خارجی */
  href: string;
  /** ادمین فعال/غیرفعال می‌کند */
  isActive: boolean;
  sortOrder: number;
}

export interface AdGridDTO {
  layout: AdLayoutKey;
  tiles: AdTileDTO[];
}

/* ── وبلاگ ── */
export interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string;
  /** ISO */
  publishedAt: string;
  categoryTitle: string | null;
}

export interface ArticleDetail extends ArticleSummary {
  contentHtml: string;
}

/* ── سفارش ── */
export type OrderStatusDTO =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELED"
  | "RETURNED";

export const ORDER_STATUS_LABELS: Record<OrderStatusDTO, string> = {
  PENDING_PAYMENT: "در انتظار پرداخت",
  PAID: "پرداخت‌شده",
  PROCESSING: "در حال پردازش",
  SHIPPED: "ارسال‌شده",
  DELIVERED: "تحویل‌شده",
  CANCELED: "لغوشده",
  RETURNED: "مرجوعی",
};

/** ترتیب طبیعی جریان برای تایم‌لاین */
export const ORDER_STATUS_FLOW: OrderStatusDTO[] = [
  "PENDING_PAYMENT",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

export interface OrderTimelineItem {
  status: OrderStatusDTO;
  note: string | null;
  /** ISO */
  createdAt: string;
}

/* ── متفرقه ── */
export interface SocialLink {
  key: SocialKey;
  label: string;
  href: string;
}
