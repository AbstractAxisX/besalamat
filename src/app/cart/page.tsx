/**
 * صفحهٔ سبد خرید — Server Component
 * ─────────────────────────────
 * کامپوز: CartView (کلاینت تعاملی) + ریل «مکمل خرید شما» (سروری).
 */

import type { Metadata } from "next";

import { CartView } from "@/components/cart/cart-view";
import { ProductGrid } from "@/components/product/product-grid";
import { SectionHeading } from "@/components/shared/section-heading";
import { getPreviewProductsByTab } from "@/lib/preview-data";

export const metadata: Metadata = {
  title: "سبد خرید",
  description: "بازبینی اقلام سبد خرید و ثبت سفارش",
  robots: { index: false },
};

/** چهار پیشنهاد تکمیلی از پرفروش‌ها (بدون تکرار نگرانی — سبد خودش فیلتر می‌کند) */
const SUGGESTIONS = getPreviewProductsByTab("bestseller").slice(0, 4);

export default function CartPage() {
  return (
    <div className="shell py-6 md:py-10">
      <CartView />

      {/* مکمل خرید شما — زیر سبد در هر حالت (خالی/پر) */}
      <section className="mt-14 md:mt-20">
        <SectionHeading
          eyebrow="پیشنهاد ویژه"
          title="مکمل خرید شما"
          subtitle="پرفروش‌هایی که مشتریان معمولاً همراه سفارش خود می‌گیرند"
          href="/products"
          hrefLabel="مشاهدهٔ همه"
        />
        <ProductGrid products={SUGGESTIONS} />
      </section>
    </div>
  );
}
