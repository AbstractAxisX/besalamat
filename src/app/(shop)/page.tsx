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
import {
  getAds,
  getArticles,
  getBrands,
  getCategoriesTree,
  getHomeSections,
  getNeeds,
  getPopularSearches,
  getProductSummaries,
  getProductTabs,
  getSlides,
} from "@/server/shop-data";
import type { HomeSectionDTO, ProductSummary } from "@/types/shop";

/* داده از DB خوانده می‌شود (force-dynamic)؛ fallback امن در shop-data.
 * متادیتا از generateMetadata ریشهٔ layout (آگاه از تنظیمات فروشگاه) می‌آید. */

export const dynamic = "force-dynamic";

/** پیش‌نمایش نیازها — ۳ کالای شاخص + شمار کامل کالای مرتبط هر نیاز.
 *  دستهٔ هر نیاز پدر است؛ کالاها روی دستهٔ فرزند تگ می‌خورند →
 *  پدر + همهٔ فرزندانش جمع می‌شوند (همان قرارداد پیشنهادهای مگامنو). */
function buildNeedPreviews(
  needs: Awaited<ReturnType<typeof getNeeds>>,
  categories: Awaited<ReturnType<typeof getCategoriesTree>>,
  products: ProductSummary[],
): Record<string, { products: ProductSummary[]; count: number }> {
  return Object.fromEntries(
    needs.map((need) => {
      const slug = need.href.split("category=")[1]?.split("&")[0] ?? "";
      const category = categories.find((item) => item.slug === slug);
      const slugs = new Set<string>([
        slug,
        ...(category?.children.map((child) => child.slug) ?? []),
      ]);
      const related = products.filter(
        (product) =>
          product.categorySlug != null && slugs.has(product.categorySlug),
      );
      return [need.id, { products: related.slice(0, 3), count: related.length }];
    }),
  );
}

/**
 * صفحهٔ خانه — کامپوز ۸ بخشی از HomePageSectionهای DB (ترتیب و فعال‌بودن از داده).
 */
export default async function HomePage() {
  const [sections, slides, needs, ads, brands, articles, popularSearches, products, tabs] =
    await Promise.all([
      getHomeSections(),
      getSlides(),
      getNeeds(),
      getAds(),
      getBrands(),
      getArticles(),
      getPopularSearches(),
      getProductSummaries(),
      getProductTabs(),
    ]);

  const categories = await getCategoriesTree();
  const needPreviews = buildNeedPreviews(needs, categories, products);

  /* تب‌های ریل محصولات — حداکثر ۸ قلم در هر تب (مصرف کلاینت سبک می‌ماند) */
  const railTabs: RailTab[] = tabs.map((tab) => ({
    key: tab.key,
    label: tab.label,
    products: tab.products,
  }));

  /* محصولات شاخص برای «منتخب کارشناس سلامت» */
  const featuredProducts = products.filter((product) => product.isFeatured);

  const renderSection = (section: HomeSectionDTO) => {
    switch (section.key) {
      case "hero":
        return (
          <Hero
            key={section.key}
            slides={slides}
            productCount={products.length}
            popularSearches={popularSearches.slice(0, 3)}
          />
        );

      case "needs":
        return (
          <NeedsSection
            key={section.key}
            title={section.title ?? "خرید بر اساس نیاز"}
            subtitle={section.subtitle ?? undefined}
            needs={needs}
            previews={needPreviews}
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
              <AdGrid data={ads} />
            </Reveal>
          </section>
        );

      case "productRail":
        return (
          <ProductRail
            key={section.key}
            title={section.title ?? "محبوب‌ترین‌ها"}
            subtitle={section.subtitle ?? undefined}
            tabs={railTabs}
          />
        );

      case "expertPicks":
        return (
          <ExpertPicks
            key={section.key}
            title={section.title ?? "منتخب کارشناس سلامت"}
            subtitle={section.subtitle}
            products={featuredProducts}
          />
        );

      case "brands":
        return (
          <BrandsMarquee
            key={section.key}
            title={section.title ?? "برندهای همراه ما"}
            brands={brands}
          />
        );

      case "articles":
        return (
          <ArticlesTeaser
            key={section.key}
            title={section.title ?? "مجلهٔ سلامت"}
            subtitle={section.subtitle}
            articles={articles}
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

  return (
    <>
      {sections
        .filter((section) => section.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((section) => renderSection(section))}
    </>
  );
}
