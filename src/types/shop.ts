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
  | "trust"
  | "categories"
  | "deal"
  | "bestsellers"
  | "expertPicks"
  | "banners"
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

export interface HomeBannerDTO {
  id: string;
  title: string | null;
  imageUrl: string;
  href: string | null;
  slot: number;
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
