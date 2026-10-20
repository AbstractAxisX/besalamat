/**
 * سرویس دادهٔ فروشگاه — DB-first با fallback امن
 * ═══════════════════════════════════════════════
 * همهٔ خواندن‌های عمومی سایت از این لایه می‌گذرد:
 *  - خروجی همیشه عین DTOهای src/types/shop.ts است (کامپوننت‌ها بی‌خبر از DB می‌مانند).
 *  - هر getter با React cache() دودوپلیکت می‌شود تا در یک درخواست فقط یک کوئری اجرا شود.
 *  - خطای DB (مثلاً cold start ورسل: P1003/P1001) یا جدولِ کاملاً خالی →
 *    بازگشت به ثابت PREVIEW_* مربوطه؛ سایت هرگز کرش نمی‌کند.
 *  - «جدول خالی» یعنی صفر رکوردِ هر-حال؛ اگر ادمین همه را غیرفعال کرده باشد
 *    (رکورد هست ولی isActive=false) عمداً خالی برمی‌گردد و fallback نمی‌خورد.
 */

import { cache } from "react";
import type { Prisma } from "@prisma/client";

import type { AdLayoutKey, AdGridDTO, AdTileDTO } from "@/types/shop";
import {
  BESTSELLER_SLUGS,
  PREVIEW_ADS,
  PREVIEW_ARTICLES,
  PREVIEW_ARTICLE_DETAILS,
  PREVIEW_BRANDS,
  PREVIEW_CATEGORIES,
  PREVIEW_FAQS,
  PREVIEW_HOME_SECTIONS,
  PREVIEW_NEEDS,
  PREVIEW_POPULAR_SEARCHES,
  PREVIEW_PRODUCTS,
  PREVIEW_PRODUCT_DETAILS,
  PREVIEW_SLIDES,
  PRODUCT_TABS,
  type FaqDTO,
  type ProductTabKey,
} from "@/lib/preview-data";
import { db } from "@/lib/db";
import { brand, type SocialConfig, type StoreHoursEntry } from "@/config/brand";
import { getSetting, getSettingsByPrefix } from "@/server/settings";
import { discountPercent } from "@/lib/format";
import type {
  ArticleDetail,
  ArticleSummary,
  BrandSummary,
  CategoryNode,
  HomeSectionDTO,
  HomeSectionKey,
  HomeSlideDTO,
  NeedCardDTO,
  ProductDetail,
  ProductSummary,
} from "@/types/shop";

/* ══════════════════════════ ابزارهای مشترک ══════════════════════════ */

/** کلیدهای مجاز بخش‌های خانه — کلیدهای ناشناس از خروجی حذف می‌شوند */
const HOME_SECTION_KEYS: ReadonlySet<string> = new Set([
  "hero",
  "needs",
  "ads",
  "productRail",
  "expertPicks",
  "brands",
  "articles",
  "aboutStore",
]);

const AD_LAYOUT_KEYS: ReadonlySet<string> = new Set(["bento", "duo", "trio"]);

/**
 * تصمیمِ fallback برای لیست‌ها:
 *  - ردیفِ فعال داریم → همان ردیف‌ها.
 *  - ردیف فعالی نیست ولی جدول رکورد دارد → عمداً خالی (ادمین غیرفعال کرده).
 *  - جدول کاملاً خالی است (cold start) → ثابت پیش‌نمایش.
 */
function resolveList<T>(activeRows: T[], totalCount: number, fallback: T[]): T[] {
  if (activeRows.length > 0) return activeRows;
  return totalCount === 0 ? fallback : [];
}

/** نرمال‌سازی جست‌وجو — عین قاعدهٔ seed (ي/ك عربی→فارسی، فشرده‌سازی فاصله‌ها، lower) */
export function normalizeSearchText(value: string): string {
  return value
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\u200C+/g, "\u200C")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

/** استخراج اسلاگ دسته از href کارت نیاز (مثل /products?category=blood-pressure) */
function categorySlugFromHref(href: string): string {
  const match = /[?&]category=([^&]+)/.exec(href);
  return match?.[1] ?? "";
}

/** موجودی کل: محصول تنوع‌دار = مجموع تنوع‌ها؛ ساده = ستون stock (همان قاعدهٔ seed) */
function totalStockOf(product: {
  stock: number;
  variants: { stock: number }[];
}): number {
  return product.variants.length > 0
    ? product.variants.reduce((total, variant) => total + variant.stock, 0)
    : product.stock;
}

/* ══════════════════════════ بخش‌های صفحهٔ خانه ══════════════════════════ */

export const getHomeSections = cache(async (): Promise<HomeSectionDTO[]> => {
  try {
    const rows = await db.homePageSection.findMany({
      orderBy: { sortOrder: "asc" },
    });
    if (rows.length === 0) return PREVIEW_HOME_SECTIONS;
    const mapped = rows
      .filter((row) => HOME_SECTION_KEYS.has(row.key))
      .map((row) => ({
        key: row.key as HomeSectionKey,
        title: row.title,
        subtitle: row.subtitle,
        sortOrder: row.sortOrder,
        isActive: row.isActive,
      }));
    return mapped.length > 0 ? mapped : PREVIEW_HOME_SECTIONS;
  } catch {
    return PREVIEW_HOME_SECTIONS;
  }
});

/* ══════════════════════════ اسلایدهای هیرو ══════════════════════════ */

export const getSlides = cache(async (): Promise<HomeSlideDTO[]> => {
  try {
    const [rows, total] = await Promise.all([
      db.slide.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      db.slide.count(),
    ]);
    return resolveList(
      rows.map((row) => ({
        id: row.id,
        title: row.title,
        subtitle: row.subtitle,
        imageUrl: row.imageUrl,
        ctaLabel: row.ctaLabel,
        ctaHref: row.ctaHref,
      })),
      total,
      PREVIEW_SLIDES,
    );
  } catch {
    return PREVIEW_SLIDES;
  }
});

/* ══════════════════════════ درخت دسته‌بندی‌ها (دو سطح) ══════════════════════════ */

export const getCategoriesTree = cache(async (): Promise<CategoryNode[]> => {
  try {
    const [parents, children, total] = await Promise.all([
      db.category.findMany({
        where: { isActive: true, parentId: null },
        orderBy: { sortOrder: "asc" },
      }),
      db.category.findMany({
        where: { isActive: true, parentId: { not: null } },
        orderBy: { sortOrder: "asc" },
      }),
      db.category.count(),
    ]);

    const byParent = new Map<string, CategoryNode[]>();
    for (const child of children) {
      if (child.parentId === null) continue;
      const list = byParent.get(child.parentId) ?? [];
      list.push({
        id: child.id,
        title: child.title,
        slug: child.slug,
        iconKey: child.iconKey,
        children: [],
      });
      byParent.set(child.parentId, list);
    }

    return resolveList(
      parents.map((parent) => ({
        id: parent.id,
        title: parent.title,
        slug: parent.slug,
        iconKey: parent.iconKey,
        children: byParent.get(parent.id) ?? [],
      })),
      total,
      PREVIEW_CATEGORIES,
    );
  } catch {
    return PREVIEW_CATEGORIES;
  }
});

/* ══════════════════════════ برندها ══════════════════════════ */

export const getBrands = cache(async (): Promise<BrandSummary[]> => {
  try {
    const [rows, total] = await Promise.all([
      db.brand.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      db.brand.count(),
    ]);
    return resolveList(
      rows.map((row) => ({ id: row.id, title: row.title, slug: row.slug })),
      total,
      PREVIEW_BRANDS,
    );
  } catch {
    return PREVIEW_BRANDS;
  }
});

/* ══════════════════════════ کارت‌های «خرید بر اساس نیاز» ══════════════════════════ */

export const getNeeds = cache(async (): Promise<NeedCardDTO[]> => {
  try {
    const [rows, total] = await Promise.all([
      db.needCard.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      db.needCard.count(),
    ]);
    return resolveList(
      rows.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        /* iconKey در DB ذخیره نمی‌شود — از پارامتر category داخل href استخراج می‌شود */
        iconKey: categorySlugFromHref(row.href),
        href: row.href,
        isActive: row.isActive,
        sortOrder: row.sortOrder,
      })),
      total,
      PREVIEW_NEEDS,
    );
  } catch {
    return PREVIEW_NEEDS;
  }
});

/* ══════════════════════════ گرید تبلیغات (بنرها + قالب از Setting) ══════════════════════════ */

/**
 * قرارداد ذخیرهٔ بنر (عین seed): عنوان و زیرعنوان با «\n» در ستون title
 * کنار هم می‌نشینند؛ slot = جایگاه کاشی در گرید (۰ مبنا).
 * قالب گرید از Setting «ads.layout» خوانده می‌شود (پیش‌فرض bento).
 */
export const getAds = cache(async (): Promise<AdGridDTO> => {
  try {
    const [rows, total, layout] = await Promise.all([
      db.banner.findMany({ where: { isActive: true }, orderBy: { slot: "asc" } }),
      db.banner.count(),
      getSetting<string>("ads.layout", "bento"),
    ]);
    const layoutKey: AdLayoutKey = AD_LAYOUT_KEYS.has(layout)
      ? (layout as AdLayoutKey)
      : "bento";

    const tiles: AdTileDTO[] = rows.map((row) => {
      /* قرارداد ذخیره: «عنوان\nزیرعنوان» — عنوانِ خالی → null (بدون متن روی کاشی) */
      const [title, subtitle] = (row.title ?? "").split("\n", 2);
      return {
        id: row.id,
        slotIndex: row.slot,
        imageUrl: row.imageUrl,
        title: title !== undefined && title.length > 0 ? title : null,
        subtitle: subtitle ?? null,
        href: row.href ?? "/products",
        isActive: row.isActive,
        sortOrder: row.slot + 1,
      };
    });

    if (tiles.length === 0 && total === 0) return PREVIEW_ADS;
    return { layout: layoutKey, tiles };
  } catch {
    return PREVIEW_ADS;
  }
});

/* ══════════════════════════ واژه‌های پرجستجو ══════════════════════════ */

export const getPopularSearches = cache(async (): Promise<string[]> => {
  try {
    const [rows, total] = await Promise.all([
      db.popularSearchTerm.findMany({
        where: { isActive: true },
        orderBy: { weight: "desc" },
        take: 6,
      }),
      db.popularSearchTerm.count(),
    ]);
    return resolveList(
      rows.map((row) => row.term),
      total,
      PREVIEW_POPULAR_SEARCHES,
    );
  } catch {
    return PREVIEW_POPULAR_SEARCHES;
  }
});

/* ══════════════════════════ محصولات ══════════════════════════ */

/** شکل کوئری مشترک خواندن محصول + پیوندها (تصویر اول + تنوع‌ها) */
const PRODUCT_INCLUDE = {
  brand: true,
  category: { include: { parent: true } },
  images: { orderBy: { sortOrder: "asc" }, take: 1 },
  variants: { orderBy: { sortOrder: "asc" }, select: { stock: true } },
} as const;

type ProductRow = Prisma.ProductGetPayload<{ include: typeof PRODUCT_INCLUDE }>;

/** تبدیل ردیف DB به ProductSummary (عین قرارداد PREVIEW_PRODUCTS) */
function toProductSummary(row: ProductRow): ProductSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    image: row.images[0]?.url ?? "/placeholders/og-default.svg",
    price: row.price,
    comparePrice: row.comparePrice,
    inStock: totalStockOf(row) > 0,
    brandTitle: row.brand?.title ?? null,
    isNew: row.isNew,
    isFeatured: row.isFeatured,
    categorySlug: row.category?.slug ?? null,
  };
}

export const getProductSummaries = cache(async (): Promise<ProductSummary[]> => {
  try {
    /* ترتیب createdAt صعودی = همان ترتیب seed/preview (ایندکس بالا = جدیدتر) */
    const [rows, total] = await Promise.all([
      db.product.findMany({
        where: { isActive: true },
        include: PRODUCT_INCLUDE,
        orderBy: { createdAt: "asc" },
      }),
      db.product.count(),
    ]);
    return resolveList(rows.map(toProductSummary), total, PREVIEW_PRODUCTS);
  } catch {
    return PREVIEW_PRODUCTS;
  }
});

/**
 * تب‌های ریل محصولات صفحهٔ خانه — عین منطق getPreviewProductsByTab:
 *  - bestseller: ترتیب دستی منطقی ۸تایی (BESTSELLER_SLUGS — همان خروجی فعلی سایت)
 *  - new: isNewها اول، سپس تازه‌ترین createdAt، تا ۸ مورد
 *  - discount: فقط comparePrice معتبر (بالاتر از قیمت)، مرتب بر اساس درصد تخفیف (نزولی)
 */
export const getProductTabs = cache(
  async (): Promise<{ key: ProductTabKey; label: string; products: ProductSummary[] }[]> => {
    const products = await getProductSummaries();
    return PRODUCT_TABS.map((tab) => {
      let list: ProductSummary[];
      switch (tab.key) {
        case "bestseller": {
          const bySlug = new Map(products.map((product) => [product.slug, product]));
          list = BESTSELLER_SLUGS.map((slug) => bySlug.get(slug)).filter(
            (product): product is ProductSummary => product != null,
          );
          break;
        }
        case "new": {
          list = products
            .map((product, index) => ({ product, index }))
            .sort((a, b) => {
              if (a.product.isNew !== b.product.isNew) return a.product.isNew ? -1 : 1;
              /* ترتیب آرایه = createdAt صعودی؛ جدیدتر (ایندکس بالاتر) اول */
              return b.index - a.index;
            })
            .slice(0, 8)
            .map((row) => row.product);
          break;
        }
        case "discount": {
          list = products
            .map((product) => ({
              product,
              percent: discountPercent(product.price, product.comparePrice),
            }))
            .filter((row) => row.percent != null)
            .sort((a, b) => (b.percent ?? 0) - (a.percent ?? 0))
            .map((row) => row.product);
          break;
        }
      }
      return { key: tab.key, label: tab.label, products: list.slice(0, 8) };
    });
  },
);

/* ══════════════════════════ جزئیات محصول ══════════════════════════ */

const DETAIL_INCLUDE = {
  brand: true,
  category: { include: { parent: true } },
  images: { orderBy: { sortOrder: "asc" } },
  variants: { orderBy: { sortOrder: "asc" } },
  specs: { orderBy: { sortOrder: "asc" } },
} as const;

type DetailRow = Prisma.ProductGetPayload<{ include: typeof DETAIL_INCLUDE }>;

function toProductDetail(row: DetailRow): ProductDetail {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    image: row.images[0]?.url ?? "/placeholders/og-default.svg",
    price: row.price,
    comparePrice: row.comparePrice,
    inStock: totalStockOf(row) > 0,
    brandTitle: row.brand?.title ?? null,
    isNew: row.isNew,
    isFeatured: row.isFeatured,
    categorySlug: row.category?.slug ?? null,
    shortDescription: row.shortDescription,
    description: row.description,
    images: row.images.map((image) => ({ url: image.url, alt: image.alt })),
    variants: row.variants.map((variant) => ({
      id: variant.id,
      title: variant.title,
      price: variant.price,
      comparePrice: variant.comparePrice,
      stock: variant.stock,
      isDefault: variant.isDefault,
    })),
    specs: row.specs.map((spec) => ({ key: spec.key, value: spec.value })),
    categoryTitle: row.category?.title ?? null,
    categoryParentTitle: row.category?.parent?.title ?? null,
    totalStock: totalStockOf(row),
  };
}

export const getProductDetailBySlug = cache(
  async (slug: string): Promise<ProductDetail | null> => {
    try {
      const row = await db.product.findUnique({ where: { slug }, include: DETAIL_INCLUDE });
      if (row !== null) {
        /* غیرفعال‌سازی عمدی توسط ادمین → ۴۰۴ (fallback نمی‌خورد) */
        return row.isActive ? toProductDetail(row) : null;
      }
      /* رکورد نیست: اگر جدول کاملاً خالی است (cold start) → پیش‌نمایش */
      const total = await db.product.count();
      if (total === 0) return PREVIEW_PRODUCT_DETAILS[slug] ?? null;
      return null;
    } catch {
      return PREVIEW_PRODUCT_DETAILS[slug] ?? null;
    }
  },
);

/* ══════════════════════════ محصولات مرتبط ══════════════════════════ */

/** والدِ دستهٔ محصول (خودِ پدر یا پدرِ فرزند) — برای هم‌خانواده‌ها */
async function findParentCategoryId(
  categorySlug: string | null,
): Promise<string | null> {
  if (categorySlug === null) return null;
  const category = await db.category.findUnique({
    where: { slug: categorySlug },
    select: { id: true, parentId: true },
  });
  if (category === null) return null;
  return category.parentId ?? category.id;
}

/** تا ۴ محصول هم‌والد (بدون خود کالا) — همان قرارداد صفحهٔ محصول */
export async function getRelatedProducts(
  slug: string,
  categorySlug: string | null,
): Promise<ProductSummary[]> {
  try {
    const parentId = await findParentCategoryId(categorySlug);
    if (parentId === null) return [];
    const family = await db.category.findMany({
      where: { OR: [{ id: parentId }, { parentId }] },
      select: { id: true },
    });
    const rows = await db.product.findMany({
      where: {
        isActive: true,
        slug: { not: slug },
        categoryId: { in: family.map((row) => row.id) },
      },
      include: PRODUCT_INCLUDE,
      orderBy: { createdAt: "asc" },
      take: 4,
    });
    return rows.map(toProductSummary);
  } catch {
    /* fallback: همان محاسبه روی دادهٔ پیش‌نمایش */
    const parent =
      PREVIEW_CATEGORIES.find(
        (item) =>
          item.slug === categorySlug ||
          item.children.some((child) => child.slug === categorySlug),
      ) ?? null;
    if (parent === null) return [];
    const slugs = new Set<string>([parent.slug, ...parent.children.map((child) => child.slug)]);
    return PREVIEW_PRODUCTS.filter(
      (product) =>
        product.slug !== slug && product.categorySlug != null && slugs.has(product.categorySlug),
    ).slice(0, 4);
  }
}

/* ══════════════════════════ مجلهٔ سلامت ══════════════════════════ */

export const getArticles = cache(async (): Promise<ArticleSummary[]> => {
  try {
    const [rows, total] = await Promise.all([
      db.article.findMany({
        where: { isPublished: true, publishedAt: { not: null } },
        include: { category: true },
        orderBy: { publishedAt: "desc" },
      }),
      db.article.count(),
    ]);
    return resolveList(
      rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt,
        coverUrl: row.coverUrl,
        publishedAt: (row.publishedAt ?? row.createdAt).toISOString(),
        categoryTitle: row.category?.title ?? null,
      })),
      total,
      PREVIEW_ARTICLES,
    );
  } catch {
    return PREVIEW_ARTICLES;
  }
});

export const getArticleBySlug = cache(async (slug: string): Promise<ArticleDetail | null> => {
  try {
    const row = await db.article.findUnique({
      where: { slug },
      include: { category: true },
    });
    if (row !== null) {
      if (!row.isPublished || row.publishedAt === null) return null;
      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt,
        coverUrl: row.coverUrl,
        publishedAt: row.publishedAt.toISOString(),
        categoryTitle: row.category?.title ?? null,
        contentHtml: row.contentHtml,
      };
    }
    const total = await db.article.count();
    if (total === 0) return PREVIEW_ARTICLE_DETAILS[slug] ?? null;
    return null;
  } catch {
    return PREVIEW_ARTICLE_DETAILS[slug] ?? null;
  }
});

/* ══════════════════════════ پرسش‌های متداول ══════════════════════════ */

export const getFaqList = cache(async (): Promise<FaqDTO[]> => {
  try {
    const [rows, total] = await Promise.all([
      db.faq.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      db.faq.count(),
    ]);
    return resolveList(
      rows.map((row) => ({ id: row.id, question: row.question, answer: row.answer })),
      total,
      PREVIEW_FAQS,
    );
  } catch {
    return PREVIEW_FAQS;
  }
});

/* ══════════════════════════ تنظیمات فروشگاه (overlay روی brand.ts) ══════════════════════════ */

/** خروجی تایپ‌شدهٔ تنظیمات فروشگاه — پیش‌فرض از brand.ts، بازنویسی از Settingهای store.* */
export interface StoreSettings {
  name: string;
  tagline: string;
  phone: string;
  /** تلفن دوم — فقط از brand.ts (کلید Setting ندارد) */
  phoneAlt: string;
  email: string;
  address: string;
  hours: StoreHoursEntry[];
  mapEmbedUrl: string;
  /** شبکه‌های اجتماعی — href هر شبکه از store.<key> بازنویسی می‌شود ("" = غیرفعال) */
  socials: SocialConfig[];
  /** معرفی کوتاه — "" یعنی استفاده از پیش‌فرض brand.description (مصرف فوتر) */
  aboutShort: string;
  /** یادداشت ارسال — "" یعنی پیش‌فرض (مصرف آیندهٔ سبد/تسویه) */
  shippingNote: string;
  /** href توییتر (X) — فقط داده؛ در SOCIAL_KEYS نیست و فعلاً رندر نمی‌شود */
  twitter: string;
}

/** خواندن امن یک کلید JSON از رکوردهای خام Setting */
function readString(
  raw: Record<string, string>,
  key: string,
): string | undefined {
  const value = raw[key];
  if (value === undefined) return undefined;
  try {
    const parsed: unknown = JSON.parse(value);
    return typeof parsed === "string" ? parsed : undefined;
  } catch {
    return undefined;
  }
}

/** اعتبارسنجی شکل ساعات کاری (آرایهٔ {days,time}) */
function readHours(raw: Record<string, string>): StoreHoursEntry[] | undefined {
  const value = raw["store.hours"];
  if (value === undefined) return undefined;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return undefined;
    const hours = parsed.filter(
      (entry): entry is StoreHoursEntry =>
        typeof entry === "object" &&
        entry !== null &&
        typeof (entry as StoreHoursEntry).days === "string" &&
        typeof (entry as StoreHoursEntry).time === "string",
    );
    return hours.length > 0 ? hours : undefined;
  } catch {
    return undefined;
  }
}

export const getStoreSettings = cache(async (): Promise<StoreSettings> => {
  const defaults: StoreSettings = {
    name: brand.name,
    tagline: brand.tagline,
    phone: brand.contact.phone,
    phoneAlt: brand.contact.phoneAlt,
    email: brand.contact.email,
    address: brand.contact.address,
    hours: brand.contact.hours,
    mapEmbedUrl: brand.contact.mapEmbedUrl,
    socials: brand.socials,
    aboutShort: "",
    shippingNote: "",
    twitter: "",
  };

  try {
    const raw = await getSettingsByPrefix("store.");
    if (Object.keys(raw).length === 0) return defaults;

    /* شبکه‌های اجتماعی: override هر کلید (مقدار "" = غیرفعال) */
    const socials = defaults.socials.map((social) => {
      const override = readString(raw, `store.${social.key}`);
      return override === undefined ? social : { ...social, defaultHref: override };
    });

    return {
      name: readString(raw, "store.name") ?? defaults.name,
      tagline: readString(raw, "store.tagline") ?? defaults.tagline,
      phone: readString(raw, "store.phone") ?? defaults.phone,
      phoneAlt: defaults.phoneAlt,
      email: readString(raw, "store.email") ?? defaults.email,
      address: readString(raw, "store.address") ?? defaults.address,
      hours: readHours(raw) ?? defaults.hours,
      mapEmbedUrl: readString(raw, "store.mapEmbedUrl") ?? defaults.mapEmbedUrl,
      socials,
      aboutShort: readString(raw, "store.aboutShort") ?? "",
      shippingNote: readString(raw, "store.shippingNote") ?? "",
      twitter: readString(raw, "store.twitter") ?? "",
    };
  } catch {
    return defaults;
  }
});
