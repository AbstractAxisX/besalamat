/**
 * منتخب کارشناس سلامت — گرید چهارتایی محصولات شاخص
 * ─────────────────────────────
 * Server Component؛ باند سبزفام برای شکستن ریتم صفحه.
 * کارت محصول نسخهٔ ۲۰۲۶ (تصویر مربع ۱:۱، هاور فقط بوردر).
 */

import { ProductCard } from "@/components/product/product-card";
import { StaggerItem, StaggerList } from "@/components/shared/motion";
import { SectionHeading } from "@/components/shared/section-heading";
import type { ProductSummary } from "@/types/shop";

interface ExpertPicksProps {
  title: string;
  subtitle: string | null;
  products: ProductSummary[];
}

export function ExpertPicks({ title, subtitle, products }: ExpertPicksProps) {
  if (products.length === 0) return null;

  return (
    <section
      className="mask-fade-y bg-surface-alt py-16 md:py-24"
      aria-label={title}
    >
      <div className="shell">
        <SectionHeading
          eyebrow="انتخاب کارشناس"
          title={title}
          subtitle={subtitle ?? undefined}
          href="/products"
          hrefLabel="مشاهدهٔ فروشگاه"
        />

        <StaggerList
          className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4"
          step={0.08}
        >
          {products.map((product) => (
            <StaggerItem key={product.id} className="h-full">
              <ProductCard product={product} className="h-full" />
            </StaggerItem>
          ))}
        </StaggerList>
      </div>
    </section>
  );
}
