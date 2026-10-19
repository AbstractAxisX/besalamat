"use client";

/**
 * ریل محصولات — «محبوب‌ترین‌ها» با تب‌های پیل‌دار و اندیکاتور لغزان
 * ─────────────────────────────
 *  - تب‌های سفارشی (پرفروش/جدید/تخفیف‌دار) با motion layoutId —
 *    پیل فعال با فنر به جای جدید می‌لغزد.
 *  - ریل اسکرول افقی snap با لبه‌های محو؛ فلش‌های دسکتاپ RTL-safe.
 *  - تعویض تب: fade کوتاه روی کل ریل.
 */

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";

import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { cn } from "@/lib/utils";
import type { ProductSummary } from "@/types/shop";

/** گام اسکرول فلش‌ها (px) — حدود دو کارت دسکتاپ */
const SCROLL_STEP = 560;

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
  const railRef = useRef<HTMLDivElement>(null);

  const active = tabs.find((tab) => tab.key === activeKey) ?? tabs[0];
  if (!active || active.products.length === 0) return null;

  /**
   * در RTL اسکرول به جلو (چپ) یعنی scrollLeft منفی‌تر می‌شود؛
   * جهت +۱ = عقب (راست)، جهت -۱ = جلو (چپ).
   */
  const scrollRail = (direction: 1 | -1) => {
    railRef.current?.scrollBy({
      left: direction * SCROLL_STEP,
      behavior: "smooth",
    });
  };

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
            onClick={() => scrollRail(1)}
            aria-label="اسکرول به عقب"
            className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-soft transition-colors duration-300 outline-none hover:border-fresh/60 hover:text-fresh-strong focus-visible:ring-2 focus-visible:ring-ring"
          >
            <IconArrowRight className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollRail(-1)}
            aria-label="اسکرول به جلو"
            className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-soft transition-colors duration-300 outline-none hover:border-fresh/60 hover:text-fresh-strong focus-visible:ring-2 focus-visible:ring-ring"
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

      {/* ریل — تعویض تب با fade کوتاه */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={active.key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <div
            ref={railRef}
            role="region"
            aria-label={active.label}
            className="mask-fade-x scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 md:gap-4"
          >
            {active.products.map((product) => (
              <div
                key={product.id}
                className="w-[min(70vw,240px)] shrink-0 snap-start md:w-[min(40vw,260px)]"
              >
                <ProductCard product={product} className="h-full" />
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
