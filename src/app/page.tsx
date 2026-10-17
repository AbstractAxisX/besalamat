import type { Metadata } from "next";
import { brand } from "@/config/brand";
import {
  PREVIEW_ARTICLES,
  PREVIEW_BANNERS,
  PREVIEW_BRANDS,
  PREVIEW_CATEGORIES,
  PREVIEW_HOME_SECTIONS,
  PREVIEW_PRODUCTS,
  PREVIEW_SLIDES,
  getPreviewProductsByTab,
} from "@/lib/preview-data";
import type { HomeSectionKey } from "@/types/shop";
import { HeroSlider } from "@/components/home/hero-slider";
import { TrustBar } from "@/components/home/trust-bar";
import { CategoryIndex } from "@/components/home/category-index";
import { DealBanner } from "@/components/home/deal-banner";
import { BestsellerRail } from "@/components/home/bestseller-rail";
import { ExpertPicks } from "@/components/home/expert-picks";
import { HomeBanners } from "@/components/home/home-banners";
import { BrandsStrip } from "@/components/home/brands-strip";
import { ArticlesTeaser } from "@/components/home/articles-teaser";
import { AboutStore } from "@/components/home/about-store";

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

/** دادهٔ مشتق — یک‌بار در سطح ماژول */
const DEAL_PRODUCT = getPreviewProductsByTab("discount")[0] ?? null;
const BESTSELLERS = getPreviewProductsByTab("bestseller");
const EXPERT_PICKS = PREVIEW_PRODUCTS.filter((product) => product.isFeatured);

/**
 * فاز ۱: دادهٔ ایستا از preview-data.
 * TODO(فاز ۳): همین کامپوز، با دادهٔ زنده از دیتابیس تغذیه می‌شود
 * (Slides/Banners/HomePageSections از DB + محصولات از سرویس).
 */
export default function HomePage() {
  const sections = [...PREVIEW_HOME_SECTIONS]
    .filter((section) => section.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const renderSection = (key: HomeSectionKey) => {
    const section = sections.find((item) => item.key === key);
    if (!section) return null;

    switch (key) {
      case "hero":
        return <HeroSlider key={key} slides={PREVIEW_SLIDES} />;
      case "trust":
        return <TrustBar key={key} />;
      case "categories":
        return (
          <CategoryIndex
            key={key}
            categories={PREVIEW_CATEGORIES}
            title={section.title ?? "دسته‌بندی محصولات"}
            subtitle={section.subtitle}
          />
        );
      case "deal":
        return DEAL_PRODUCT ? (
          <DealBanner key={key} product={DEAL_PRODUCT} />
        ) : null;
      case "bestsellers":
        return (
          <BestsellerRail
            key={key}
            title={section.title ?? "پرفروش‌های این هفته"}
            subtitle={section.subtitle}
            products={BESTSELLERS}
          />
        );
      case "expertPicks":
        return (
          <ExpertPicks
            key={key}
            title={section.title ?? "منتخب کارشناس سلامت"}
            subtitle={section.subtitle}
            products={EXPERT_PICKS}
          />
        );
      case "banners":
        return <HomeBanners key={key} banners={PREVIEW_BANNERS} />;
      case "brands":
        return <BrandsStrip key={key} brands={PREVIEW_BRANDS} />;
      case "articles":
        return (
          <ArticlesTeaser
            key={key}
            title={section.title ?? "مجلهٔ سلامت"}
            subtitle={section.subtitle}
            articles={PREVIEW_ARTICLES}
          />
        );
      case "aboutStore":
        return <AboutStore key={key} title={section.title ?? "دربارهٔ ما"} />;
      default:
        return null;
    }
  };

  return <>{sections.map((section) => renderSection(section.key))}</>;
}
