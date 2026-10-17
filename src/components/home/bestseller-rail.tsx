"use client";

/**
 * ریل پرفروش‌ها — اسکرول افقی رتبه‌دار
 * ─────────────────────────────
 * اثبات اجتماعی با اعداد درشت: رتبهٔ هر محصول به‌صورت مدال شماره‌دار
 * روی گوشهٔ تصویر می‌نشیند. فلش‌ها فقط دسکتاپ؛ موبایل با snap لمسی.
 */

import { useRef } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { toFa } from "@/lib/format";
import type { ProductSummary } from "@/types/shop";

interface BestsellerRailProps {
  title: string;
  subtitle: string | null;
  products: ProductSummary[];
}

export function BestsellerRail({
  title,
  subtitle,
  products,
}: BestsellerRailProps) {
  const railRef = useRef<HTMLUListElement>(null);

  if (products.length === 0) return null;

  /** RTL: حرکت به «بعدی» یعنی اسکرول به چپ (مقدار منفی) */
  const scrollRail = (direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({
      left: direction * Math.max(rail.clientWidth * 0.7, 240),
      behavior: "smooth",
    });
  };

  return (
    <section className="shell py-12 md:py-16" aria-label={title}>
      <SectionHeading
        eyebrow="پرفروش‌ها"
        title={title}
        subtitle={subtitle ?? undefined}
        href="/products?sort=popular"
        hrefLabel="مشاهدهٔ همه"
      />

      <div className="relative">
        <ul
          ref={railRef}
          className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0"
        >
          {products.map((product, index) => (
            <li
              key={product.id}
              className="w-[62%] min-[420px]:w-[46%] sm:w-[31%] lg:w-[23%] xl:w-[19%] shrink-0 snap-start"
            >
              <div className="relative h-full">
                {/* مدال رتبه */}
                <span
                  className="absolute -top-0 end-3 z-10 flex size-9 translate-y-1/2 items-center justify-center rounded-full border border-gold/50 bg-card text-sm font-black text-gold-strong shadow-card dark:text-gold"
                  aria-label={`رتبهٔ ${toFa(index + 1)}`}
                >
                  {toFa(index + 1)}
                </span>
                <ProductCard product={product} className="pt-6" />
              </div>
            </li>
          ))}
        </ul>

        {/* فلش‌ها — دسکتاپ */}
        <button
          type="button"
          onClick={() => scrollRail(1)}
          aria-label="اسکرول به قبل"
          className="absolute -start-5 top-1/2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-card text-foreground shadow-lift transition-all duration-300 hover:border-gold/60 hover:text-gold-strong focus-visible:ring-2 focus-visible:ring-ring lg:flex"
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => scrollRail(-1)}
          aria-label="اسکرول به بعد"
          className="absolute -end-5 top-1/2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-card text-foreground shadow-lift transition-all duration-300 hover:border-gold/60 hover:text-gold-strong focus-visible:ring-2 focus-visible:ring-ring lg:flex"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
