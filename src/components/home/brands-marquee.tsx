/**
 * نوار برندها — مارکی نرم وردمارک‌های تایپی
 * ─────────────────────────────
 * Server Component؛ Marquee خودش محتوا را دوبل می‌کند (حلقهٔ بی‌درز)
 * و با هاور متوقف می‌شود. لینک هر برند → فیلتر فروشگاه.
 */

import Link from "next/link";

import { Marquee } from "@/components/shared/marquee";
import type { BrandSummary } from "@/types/shop";

interface BrandsMarqueeProps {
  title: string;
  brands: BrandSummary[];
}

export function BrandsMarquee({ title, brands }: BrandsMarqueeProps) {
  if (brands.length === 0) return null;

  return (
    <section className="py-10 md:py-12" aria-label={title}>
      <div className="shell">
        {/* سرِنوار — خطوط محوشوندهٔ سبز دو طرف عنوان */}
        <div className="flex items-center justify-center gap-3">
          <span
            aria-hidden="true"
            className="h-px w-10 bg-gradient-to-l from-fresh/50 to-transparent md:w-16"
          />
          <h2 className="text-sm font-black text-muted-foreground">{title}</h2>
          <span
            aria-hidden="true"
            className="h-px w-10 bg-gradient-to-r from-fresh/50 to-transparent md:w-16"
          />
        </div>

        <div className="mt-7 mask-fade-x md:mt-8">
          <Marquee duration={36}>
            {brands.map((brandItem) => (
              <Link
                key={brandItem.id}
                href={`/products?brand=${brandItem.slug}`}
                className="mx-3 inline-flex h-16 items-center rounded-2xl border border-border/60 bg-card px-8 text-lg font-black text-muted-foreground transition-colors duration-300 outline-none hover:border-fresh/50 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
              >
                {brandItem.title}
              </Link>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}
