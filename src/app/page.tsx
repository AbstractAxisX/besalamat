import type { Metadata } from "next";
import { brand } from "@/config/brand";
import {
  PREVIEW_ARTICLES,
  PREVIEW_BANNERS,
  PREVIEW_BRANDS,
  PREVIEW_CATEGORIES,
  PREVIEW_HOME_SECTIONS,
  PREVIEW_SLIDES,
  PRODUCT_TABS,
  getPreviewProductsByTab,
} from "@/lib/preview-data";
import type { HomeSectionKey } from "@/types/shop";
import { HeroSlider } from "@/components/home/hero-slider";
import { TrustBar } from "@/components/home/trust-bar";
import { CategoryCards } from "@/components/home/category-cards";
import { ProductTabs } from "@/components/home/product-tabs";
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

/** دادهٔ تب‌های محصول — یک‌بار برای همهٔ تب‌ها */
const productsByTab = Object.fromEntries(
  PRODUCT_TABS.map((tab) => [tab.key, getPreviewProductsByTab(tab.key)]),
);

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
          <CategoryCards
            key={key}
            categories={PREVIEW_CATEGORIES}
            title={section.title ?? "دسته‌بندی محصولات"}
            subtitle={section.subtitle}
          />
        );
      case "productTabs":
        return (
          <ProductTabs
            key={key}
            title={section.title ?? "انتخاب هوشمندانه"}
            subtitle={section.subtitle}
            tabs={PRODUCT_TABS}
            productsByTab={productsByTab}
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
