import type { Metadata } from "next";

import { AboutStore } from "@/components/home/about-store";
import { AdGrid } from "@/components/home/ad-grid";
import { ArticlesTeaser } from "@/components/home/articles-teaser";
import { BrandsMarquee } from "@/components/home/brands-marquee";
import { ExpertPicks } from "@/components/home/expert-picks";
import { Hero } from "@/components/home/hero";
import { NeedsSection } from "@/components/home/needs-section";
import { ProductRail, type RailTab } from "@/components/home/product-rail";
import { Reveal } from "@/components/shared/motion";
import { SectionHeading } from "@/components/shared/section-heading";
import { brand } from "@/config/brand";
import {
  PREVIEW_ADS,
  PREVIEW_ARTICLES,
  PREVIEW_BRANDS,
  PREVIEW_CATEGORIES,
  PREVIEW_HOME_SECTIONS,
  PREVIEW_NEEDS,
  PREVIEW_POPULAR_SEARCHES,
  PREVIEW_PRODUCTS,
  PREVIEW_SLIDES,
  PRODUCT_TABS,
  getPreviewProductsByTab,
} from "@/lib/preview-data";
import type { HomeSectionDTO, ProductSummary } from "@/types/shop";

export const metadata: Metadata = {
  title: brand.meta.defaultTitle,
  description: brand.meta.defaultDescription,
  openGraph: {
    title: brand.meta.defaultTitle,
    description: brand.meta.defaultDescription,
    type: "website",
    locale: "fa_IR",
    siteName: brand.name,
  },
};

/** تب‌های ریل محصولات — حداکثر ۸ قلم در هر تب (مصرف کلاینت سبک می‌ماند) */
const RAIL_TABS: RailTab[] = PRODUCT_TABS.map((tab) => ({
  key: tab.key,
  label: tab.label,
  products: getPreviewProductsByTab(tab.key).slice(0, 8),
}));

/** محصولات شاخص برای «منتخب کارشناس سلامت» */
const FEATURED_PRODUCTS = PREVIEW_PRODUCTS.filter(
  (product) => product.isFeatured,
);

/** پیش‌نمایش نیازها — ۳ کالای شاخص + شمار کامل کالای مرتبط هر نیاز.
 *  دستهٔ هر نیاز پدر است؛ کالاها روی دستهٔ فرزند تگ می‌خورند →
 *  پدر + همهٔ فرزندانش جمع می‌شوند (همان قرارداد پیشنهادهای مگامنو). */
const NEED_PREVIEWS: Record<
  string,
  { products: ProductSummary[]; count: number }
> = Object.fromEntries(
  PREVIEW_NEEDS.map((need) => {
    const slug = need.href.split("category=")[1]?.split("&")[0] ?? "";
    const category = PREVIEW_CATEGORIES.find(
      (item) => item.slug === slug,
    );
    const slugs = new Set<string>([
      slug,
      ...(category?.children.map((child) => child.slug) ?? []),
    ]);
    const related = PREVIEW_PRODUCTS.filter(
      (product) =>
        product.categorySlug != null && slugs.has(product.categorySlug),
    );
    return [need.id, { products: related.slice(0, 3), count: related.length }];
  }),
);

/**
 * صفحهٔ خانه — کامپوز ۸ بخشی از PREVIEW_HOME_SECTIONS (ترتیب و فعال‌بودن از داده).
 * فاز ۳: همین کامپوز با دادهٔ زندهٔ API تغذیه می‌شود.
 */
export default function HomePage() {
  const sections = [...PREVIEW_HOME_SECTIONS]
    .filter((section) => section.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const renderSection = (section: HomeSectionDTO) => {
    switch (section.key) {
      case "hero":
        return (
          <Hero
            key={section.key}
            slides={PREVIEW_SLIDES}
            productCount={PREVIEW_PRODUCTS.length}
            popularSearches={PREVIEW_POPULAR_SEARCHES.slice(0, 3)}
          />
        );

      case "needs":
        return (
          <NeedsSection
            key={section.key}
            title={section.title ?? "خرید بر اساس نیاز"}
            subtitle={section.subtitle ?? undefined}
            needs={PREVIEW_NEEDS}
            previews={NEED_PREVIEWS}
          />
        );

      case "ads":
        return (
          <section
            key={section.key}
            className="shell py-14 md:py-20"
            aria-label="فرصت‌های خرید"
          >
            <SectionHeading
              eyebrow="تخفیف‌ها و پیشنهادها"
              title="فرصت‌های خرید"
              subtitle="پیشنهادهای منتخب تیم فروشگاه"
            />
            <Reveal>
              <AdGrid data={PREVIEW_ADS} />
            </Reveal>
          </section>
        );

      case "productRail":
        return (
          <ProductRail
            key={section.key}
            title={section.title ?? "محبوب‌ترین‌ها"}
            subtitle={section.subtitle ?? undefined}
            tabs={RAIL_TABS}
          />
        );

      case "expertPicks":
        return (
          <ExpertPicks
            key={section.key}
            title={section.title ?? "منتخب کارشناس سلامت"}
            subtitle={section.subtitle}
            products={FEATURED_PRODUCTS}
          />
        );

      case "brands":
        return (
          <BrandsMarquee
            key={section.key}
            title={section.title ?? "برندهای همراه ما"}
            brands={PREVIEW_BRANDS}
          />
        );

      case "articles":
        return (
          <ArticlesTeaser
            key={section.key}
            title={section.title ?? "مجلهٔ سلامت"}
            subtitle={section.subtitle}
            articles={PREVIEW_ARTICLES}
          />
        );

      case "aboutStore":
        return (
          <AboutStore
            key={section.key}
            title={section.title ?? "دربارهٔ ما"}
          />
        );

      default:
        return null;
    }
  };

  return <>{sections.map((section) => renderSection(section))}</>;
}
