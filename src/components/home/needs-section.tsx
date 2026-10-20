"use client";

/**
 * «خرید بر اساس نیاز» — فهرست ادیتوریالِ تعاملی
 * ─────────────────────────────
 * بدون هیچ آیکون آماده‌ای: تایپوگرافی درشت، شماره‌های فارسی و تصاویرِ
 * واقعیِ محصولاتِ هر نیاز.
 *  - دسکتاپ: هاور/فوکوس روی هر ردیف، پنلِ پیش‌نمایشِ چسبانِ سبز عمیق را
 *    با انیمیشن محو-لغزش عوض می‌کند (الگوی سایت‌های برندهٔ جایزه).
 *  - موبایل: همان ردیف‌های ظریف + بندانگشتیِ محصول؛ لمس → مستقیم به فیلتر.
 *  - ورود پلکانی ردیف‌ها با StaggerList.
 */

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { IconArrowLeft } from "@tabler/icons-react";

import { Watermark } from "@/components/shared/brand-assets";
import { StaggerItem, StaggerList } from "@/components/shared/motion";
import { SectionHeading } from "@/components/shared/section-heading";
import { toFa } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { NeedCardDTO, ProductSummary } from "@/types/shop";

/** پیش‌نمایش یک نیاز — ۳ کالای شاخص + شمار کامل کالای مرتبط */
export interface NeedPreview {
  products: ProductSummary[];
  count: number;
}

interface NeedsSectionProps {
  title: string;
  subtitle?: string;
  needs: NeedCardDTO[];
  /** کلید = need.id */
  previews: Record<string, NeedPreview>;
}

export function NeedsSection({
  title,
  subtitle,
  needs,
  previews,
}: NeedsSectionProps) {
  const activeNeeds = needs
    .filter((need) => need.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const [activeId, setActiveId] = useState<string>(
    activeNeeds[0]?.id ?? "",
  );

  if (activeNeeds.length === 0) return null;

  const activeIndex = Math.max(
    0,
    activeNeeds.findIndex((need) => need.id === activeId),
  );
  const activeNeed = activeNeeds[activeIndex] ?? activeNeeds[0];
  const activePreview = activeNeed ? previews[activeNeed.id] : undefined;

  return (
    <section className="shell py-14 md:py-20" aria-label={title}>
      <SectionHeading
        eyebrow="راهنمای خرید"
        title={title}
        subtitle={subtitle}
      />

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-12 xl:gap-16">
        {/* ══ فهرست نیازها — راست در RTL ══ */}
        <StaggerList className="min-w-0" step={0.07}>
          {activeNeeds.map((need, index) => {
            const isActive = need.id === activeId;
            const preview = previews[need.id];
            const firstImage = preview?.products[0]?.image;

            return (
              <StaggerItem key={need.id} className="h-full">
                <Link
                  href={need.href}
                  onMouseEnter={() => setActiveId(need.id)}
                  onFocus={() => setActiveId(need.id)}
                  className={cn(
                    "group relative flex min-h-[4.5rem] items-center gap-3 rounded-2xl px-2.5 py-4 outline-none transition-colors duration-300 md:gap-5 md:px-4 md:py-5 focus-visible:ring-2 focus-visible:ring-ring",
                    isActive
                      ? "bg-secondary/80"
                      : "hover:bg-secondary/45",
                  )}
                >
                  {/* شمارهٔ فارسی — لنگرِ بصری ردیف */}
                  <span
                    className={cn(
                      "w-7 shrink-0 text-center text-sm font-black tabular-nums transition-colors duration-300",
                      isActive
                        ? "text-fresh-strong dark:text-fresh"
                        : "text-muted-foreground/50",
                    )}
                    aria-hidden="true"
                  >
                    {toFa(String(index + 1).padStart(2, "0"))}
                  </span>

                  {/* عنوان و توضیح */}
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block truncate text-[15px] font-black transition-colors duration-300 md:text-lg",
                        isActive ? "text-primary" : "text-foreground",
                      )}
                    >
                      {need.title}
                    </span>
                    <span className="mt-1 hidden text-[13px] leading-6 text-muted-foreground sm:block">
                      {need.description}
                    </span>
                  </span>

                  {/* بندانگشتی محصولات — دایره‌های روی‌هم‌افتاده، فقط دسکتاپ */}
                  {preview && preview.products.length > 0 ? (
                    <span
                      className="hidden shrink-0 items-center md:flex"
                      aria-hidden="true"
                    >
                      {preview.products.slice(0, 3).map((product, i) => (
                        <span
                          key={product.id}
                          style={{ zIndex: 3 - i }}
                          className="img-canvas relative size-11 -ms-3 overflow-hidden rounded-full border-2 border-card shadow-soft first:ms-0"
                        >
                          <Image
                            src={product.image}
                            alt=""
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        </span>
                      ))}
                    </span>
                  ) : null}

                  {/* بندانگشتی موبایل — دایرهٔ پرشده، داخل خود ردیف */}
                  {firstImage ? (
                    <span
                      className="img-canvas relative block size-12 shrink-0 overflow-hidden rounded-full shadow-soft md:hidden"
                      aria-hidden="true"
                    >
                      <Image
                        src={firstImage}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </span>
                  ) : null}

                  {/* شمار کالا + فلش */}
                  <span className="flex shrink-0 items-center gap-2.5">
                    {preview && preview.count > 0 ? (
                      <span className="hidden rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold text-primary xl:block">
                        {toFa(preview.count)} کالا
                      </span>
                    ) : null}
                    <IconArrowLeft
                      className={cn(
                        "size-4 transition-all duration-300",
                        isActive
                          ? "-translate-x-1 text-fresh-strong dark:text-fresh"
                          : "text-muted-foreground/40 group-hover:-translate-x-1 group-hover:text-fresh-strong",
                      )}
                      aria-hidden="true"
                    />
                  </span>
                </Link>

                {/* جداکنندهٔ مویی بین ردیف‌ها */}
                {index < activeNeeds.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="mx-2.5 block h-px bg-gradient-to-l from-transparent via-border to-transparent md:mx-4"
                  />
                ) : null}
              </StaggerItem>
            );
          })}
        </StaggerList>

        {/* ══ پنل پیش‌نمایش چسبان — چپ در RTL، فقط دسکتاپ ══ */}
        {activeNeed ? (
          <div className="sticky top-[184px] hidden lg:block">
            <div className="relative h-[30rem] overflow-hidden rounded-[2rem] bg-metallic shadow-lift">
              {/* عمق — واترمارک + هالهٔ راننده */}
              <Watermark className="end-[-4.5rem] -top-8 size-80 rotate-12 text-on-metallic opacity-[0.07]" />
              <div
                aria-hidden="true"
                className="glow animate-drift -start-16 -top-24 size-80 bg-fresh/20"
              />
              <div
                aria-hidden="true"
                className="glow animate-drift-slow -end-20 -bottom-28 size-72 bg-fresh/10"
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeNeed.id}
                  initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -14, filter: "blur(6px)" }}
                  transition={{ duration: 0.38, ease: [0.21, 0.65, 0.36, 1] }}
                  className="relative flex h-full flex-col justify-end p-8"
                >
                  {/* شمارهٔ غول‌پیکر واترمارکی */}
                  <span
                    aria-hidden="true"
                    className="absolute end-5 top-2 text-[8rem] font-black leading-none text-on-metallic/10 tabular-nums"
                  >
                    {toFa(String(activeIndex + 1).padStart(2, "0"))}
                  </span>

                  <p className="text-[11px] font-bold tracking-wide text-fresh">
                    نیاز شمارهٔ {toFa(activeIndex + 1)}
                  </p>
                  <h3 className="mt-2 text-[1.65rem] font-black text-on-metallic">
                    {activeNeed.title}
                  </h3>
                  <p className="mt-3 max-w-sm text-[13px] leading-7 text-on-metallic-muted">
                    {activeNeed.description}
                  </p>

                  {/* کالاهای شاخص این نیاز — دایره‌های پرشده */}
                  {activePreview && activePreview.products.length > 0 ? (
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      {activePreview.products.map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.slug}`}
                          aria-label={product.title}
                          className="img-canvas relative size-16 overflow-hidden rounded-full shadow-soft outline-none ring-white/30 transition-all duration-300 hover:-translate-y-1 hover:ring-2 focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <Image
                            src={product.image}
                            alt=""
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </Link>
                      ))}
                      {activePreview.count > 0 ? (
                        <span className="text-[11px] font-medium text-on-metallic-muted">
                          {toFa(activePreview.count)} کالای مرتبط
                        </span>
                      ) : null}
                    </div>
                  ) : null}

                  <Link
                    href={activeNeed.href}
                    className="mt-7 inline-flex h-11 w-fit items-center gap-2 rounded-full border border-white/25 px-6 text-sm font-bold text-on-metallic transition-colors duration-300 outline-none hover:border-fresh/60 hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    مشاهدهٔ محصولات
                    <IconArrowLeft className="size-4" aria-hidden="true" />
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
