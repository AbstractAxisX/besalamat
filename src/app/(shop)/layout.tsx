/**
 * Layout فروشگاه — کروم عمومی (هدر/فوتر/داک موبایل/دیالوگ جستجو)
 * ─────────────────────────────────────────────────────────────
 * صفحات فروشگاه داخل گروهٔ (shop) هستند؛ پنل ادمین (/admin) کروم
 * خودش را دارد و از این layout رد نمی‌شود.
 */

import { BottomNav } from "@/components/layout/bottom-nav";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { SearchDialog } from "@/components/shared/search-dialog";
import { getCategoriesTree, getProductSummaries, getStoreSettings } from "@/server/shop-data";

export default async function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /* دادهٔ مگامنو/منوی موبایل و فوتر — یک‌بار در سطح layout (کش درخواستی) */
  const [categories, products, store] = await Promise.all([
    getCategoriesTree(),
    getProductSummaries(),
    getStoreSettings(),
  ]);

  return (
    <div className="flex min-h-dvh flex-col">
      <Header categories={categories} products={products} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer store={store} categories={categories} />
      {/* جاداده برای داک شناور موبایل — ارتفاع داک + حاشیه‌ها + ناحیهٔ امن */}
      <div
        className="h-[calc(5.75rem+env(safe-area-inset-bottom))] md:hidden"
        aria-hidden="true"
      />
      <BottomNav categories={categories} />
      <SearchDialog />
    </div>
  );
}
