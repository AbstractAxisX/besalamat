"use client";

/**
 * ریل محصولات — «محبوب‌ترین‌ها» با تب‌های پیل‌دار و اندیکاتور لغزان
 * ─────────────────────────────
 *  - تب‌های سفارشی (پرفروش/جدید/تخفیف‌دار) با motion layoutId —
 *    پیل فعال با فنر به جای جدید می‌لغزد.
 *  - ریل embla — درگ با ماوس در دسکتاپ و لمس در موبایل؛
 *    فلش‌های دسکتاپ RTL-safe + نوار پیشرفت ظریف.
 *  - تعویض تب: fade کوتاه + remount ایمبرا.
 */

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { AnimatePresence, motion } from "framer-motion";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";

import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { cn } from "@/lib/utils";
import type { ProductSummary } from "@/types/shop";

export interface RailTab {
  key: string;
  label: string;
  products: ProductSummary[];
}

interface ProductRailProps {
  title: string;
  subtitle?: string;
  tabs: RailTab[];
}

export function ProductRail({ title, subtitle, tabs }: ProductRailProps) {
  const [activeKey, setActiveKey] = useState(tabs[0]?.key ?? "");
  const [progress, setProgress] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const active = tabs.find((tab) => tab.key === activeKey) ?? tabs[0];
  const products = active?.products ?? [];

  /* ریل embla — درگ ماوس/لمس؛ direction RTL */
  const [emblaRef, emblaApi] = useEmblaCarousel({
    direction: "rtl",
    containScroll: "trimSnaps",
  });

  const syncState = useCallback(() => {
    if (!emblaApi) return;
    setProgress(Math.min(100, Math.max(0, emblaApi.scrollProgress() * 100)));
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", syncState);
    emblaApi.on("scroll", syncState);
    emblaApi.on("reInit", syncState);
    // همگام‌سازی اولیه — خارج از بدنهٔ effect تا قاعدهٔ set-state-in-effect نقض نشود
    const raf = requestAnimationFrame(syncState);
    return () => {
      cancelAnimationFrame(raf);
      emblaApi.off("select", syncState);
      emblaApi.off("scroll", syncState);
      emblaApi.off("reInit", syncState);
    };
  }, [emblaApi, syncState]);

  if (!active || products.length === 0) return null;

  return (
    <section className="shell py-14 md:py-20" aria-label={title}>
      {/* سرِ بخش + فلش‌های دسکتاپ */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 md:mb-8">
        <SectionHeading
          eyebrow="ویترین فروشگاه"
          title={title}
          subtitle={subtitle}
          className="mb-0"
        />
        <div className="hidden shrink-0 gap-2 md:flex">
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canPrev}
            aria-label="اسکرول به عقب"
            className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-soft transition-all duration-300 outline-none hover:border-fresh/60 hover:text-fresh-strong focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-35"
          >
            <IconArrowRight className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canNext}
            aria-label="اسکرول به جلو"
            className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-soft transition-all duration-300 outline-none hover:border-fresh/60 hover:text-fresh-strong focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-35"
          >
            <IconArrowLeft className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* تب‌های پیل‌دار — اندیکاتور لغزان */}
      <div
        role="tablist"
        aria-label="گروه‌بندی محصولات ویترین"
        className="relative z-10 mb-6 inline-flex items-center gap-1 rounded-full bg-muted/70 p-1 md:mb-8"
      >
        {tabs.map((tab) => {
          const isActive = tab.key === active.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveKey(tab.key)}
              className="relative rounded-full px-4 py-2 text-xs font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring md:px-5 md:text-[13px]"
            >
              {isActive ? (
                <motion.span
                  layoutId="home-rail-tab"
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-card shadow-soft"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.55 }}
                />
              ) : null}
              <span
                className={cn(
                  "relative z-10 transition-colors duration-300",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ریل — تعویض تب با fade کوتاه؛ درگ با ماوس/لمس */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={active.key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <div
            ref={emblaRef}
            role="region"
            aria-roledescription="carousel"
            aria-label={active.label}
            className="mask-fade-x cursor-grab overflow-hidden select-none active:cursor-grabbing"
          >
            <div className="flex gap-3 pb-2 md:gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="shrink-0 grow-0 basis-[66%] sm:basis-[44%] md:basis-[32%] lg:basis-[25.5%] xl:basis-[21%]"
                >
                  <ProductCard product={product} className="h-full" />
                </div>
              ))}
            </div>
          </div>

          {/* نوار پیشرفت — جایگزین اسکرول‌بار مخفی */}
          <div
            aria-hidden="true"
            className="ms-1 mt-3 h-1 w-40 overflow-hidden rounded-full bg-border/70"
          >
            <div
              className="h-full rounded-full bg-fresh transition-[width] duration-150 ease-out"
              style={{ width: `${Math.max(12, progress)}%` }}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
