"use client";

/**
 * هیروی ادیتوریال — «طاق فارسی» روی بوم سفید-سبز
 * ─────────────────────────────
 * امضای بصری: قاب طاقی‌شکل (rounded-t-full) با هالهٔ طلایی هندسی؛
 * ستون متن با چیدمان فروش‌محور (تیتر درشت، دو CTA، سه چیپ اعتماد).
 * embla (RTL + loop) با اتوپلی ۶ ثانیه؛ متنِ اسلاید فقط در حالتِ انتخاب.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  LockKeyhole,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { toFa } from "@/lib/format";
import { cn } from "@/lib/utils";
import { brand } from "@/config/brand";
import type { HomeSlideDTO } from "@/types/shop";

const AUTOPLAY_DELAY_MS = 6_000;

const TRUST_CHIPS = [
  { icon: ShieldCheck, label: "ضمانت اصالت کالا" },
  { icon: Truck, label: "ارسال سریع به سراسر کشور" },
  { icon: LockKeyhole, label: "پرداخت امن" },
] as const;

interface HeroSliderProps {
  slides: HomeSlideDTO[];
}

export function HeroSlider({ slides }: HeroSliderProps) {
  /** plugin یک‌بار ساخته می‌شود تا reInit بی‌دلیل اتفاق نیفتد */
  const plugins = useMemo(
    () => [
      Autoplay({
        delay: AUTOPLAY_DELAY_MS,
        stopOnMouseEnter: true,
        stopOnInteraction: false,
      }),
    ],
    [],
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, direction: "rtl" },
    plugins,
  );
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (slides.length === 0) return null;

  const showControls = slides.length > 1;

  return (
    <section
      className="bg-surface-alt relative overflow-hidden"
      role="region"
      aria-roledescription="carousel"
      aria-label="اسلایدر هیرو"
    >
      {/* هالهٔ سبز بسیار ملایم — عمق بدون شلوغی */}
      <div
        className="pointer-events-none absolute -top-40 start-[-8rem] size-[36rem] rounded-full bg-primary/[0.05] blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-52 end-[-10rem] size-[34rem] rounded-full bg-gold/[0.06] blur-3xl"
        aria-hidden="true"
      />

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, index) => {
            const isSelected = index === selected;
            const Heading = index === 0 ? "h1" : "h2";
            return (
              <div
                key={slide.id}
                className="min-w-0 shrink-0 grow-0 basis-full"
                role="group"
                aria-roledescription="slide"
                aria-label={`اسلاید ${toFa(index + 1)} از ${toFa(slides.length)}`}
              >
                <div className="shell grid items-center gap-10 pb-14 pt-10 md:min-h-[560px] md:grid-cols-[1.05fr_0.95fr] md:gap-14 md:pb-20 md:pt-14">
                  {/* ── ستون متن — راست در RTL ── */}
                  <div className="relative order-1">
                    <AnimatePresence mode="wait">
                      {isSelected ? (
                        <motion.div
                          key={slide.id}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                        >
                          {/* سردر */}
                          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold-soft/25 px-3.5 py-1.5 text-[11px] font-bold text-gold-strong dark:text-gold">
                            <span
                              className="size-1.5 rounded-full bg-gold"
                              aria-hidden="true"
                            />
                            سلامت خانواده، سرمایهٔ اصلی شماست
                          </span>

                          <Heading className="mt-5 text-[1.75rem] leading-[1.35] font-black text-foreground md:text-[2.6rem] md:leading-[1.3]">
                            {slide.title}
                          </Heading>

                          <span
                            className="gold-hairline mt-5 block w-24"
                            aria-hidden="true"
                          />

                          {slide.subtitle ? (
                            <p className="mt-5 max-w-xl text-sm leading-8 text-muted-foreground md:text-base md:leading-9">
                              {slide.subtitle}
                            </p>
                          ) : null}

                          {/* CTAها */}
                          <div className="mt-8 flex flex-wrap items-center gap-4">
                            <Link
                              href={slide.ctaHref ?? "/products"}
                              className="inline-flex h-12 items-center gap-2 rounded-full px-8 text-sm font-bold outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                              style={{ backgroundColor: "var(--primary)" }}
                            >
                              <span className="text-primary-foreground">
                                {slide.ctaLabel ?? "مشاهدهٔ محصولات"}
                              </span>
                              <ArrowLeft
                                className="size-4 text-primary-foreground"
                                aria-hidden="true"
                              />
                            </Link>
                            <a
                              href={`tel:${brand.contact.phone}`}
                              className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-medium text-foreground transition-colors duration-300 hover:border-gold/50 hover:text-gold-strong"
                            >
                              <Phone className="size-4" aria-hidden="true" />
                              مشاورهٔ رایگان قبل از خرید
                            </a>
                          </div>

                          {/* چیپ‌های اعتماد */}
                          <ul className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
                            {TRUST_CHIPS.map(({ icon: Icon, label }) => (
                              <li
                                key={label}
                                className="flex items-center gap-2 text-xs text-muted-foreground"
                              >
                                <Icon
                                  className="size-4 text-success"
                                  aria-hidden="true"
                                />
                                {label}
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>

                  {/* ── ستون تصویر — طاق فارسی ── */}
                  <div className="relative order-2 mx-auto w-full max-w-[440px] md:max-w-[480px]">
                    {/* هالهٔ طلایی هندسی — قابِ جابه‌جاشده پشت طاق */}
                    <div
                      className="absolute -inset-3 rounded-b-[2.5rem] rounded-t-[999px] border border-gold/45 md:-inset-4"
                      aria-hidden="true"
                    />
                    <div
                      className="absolute -inset-3 translate-y-3 rounded-b-[2.5rem] rounded-t-[999px] bg-primary/[0.04] md:-inset-4"
                      aria-hidden="true"
                    />

                    <div className="bg-metallic relative aspect-[4/5] overflow-hidden rounded-b-[2rem] rounded-t-[999px] p-8 md:p-10">
                      <Image
                        src={slide.imageUrl}
                        alt={slide.title}
                        fill
                        priority={index === 0}
                        sizes="(max-width: 768px) 90vw, 480px"
                        className="object-contain drop-shadow-2xl transition-transform duration-500"
                      />
                    </div>

                    {/* کارت شناور ارسال — داخل قاب طاق */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25, duration: 0.4 }}
                      className="absolute bottom-5 start-5 z-10 flex items-center gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-lift"
                    >
                      <span className="flex size-10 items-center justify-center rounded-full bg-gold-soft/40 text-gold-strong dark:bg-gold-soft/15 dark:text-gold">
                        <Truck className="size-5" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block text-xs font-bold text-foreground">
                          ارسال همان روز در تهران
                        </span>
                        <span className="mt-0.5 block text-[11px] text-muted-foreground">
                          برای سفارش‌های تا ساعت ۱۳
                        </span>
                      </span>
                    </motion.div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showControls ? (
        <>
          {/* فلش‌ها — سفید با حاشیه، محو در موبایل */}
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="اسلاید قبلی"
            className="absolute end-5 top-1/2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-card text-foreground shadow-card transition-all duration-300 hover:border-gold/60 hover:text-gold-strong focus-visible:ring-2 focus-visible:ring-ring md:flex"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            aria-label="اسلاید بعدی"
            className="absolute start-5 top-1/2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-card text-foreground shadow-card transition-all duration-300 hover:border-gold/60 hover:text-gold-strong focus-visible:ring-2 focus-visible:ring-ring md:flex"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>

          {/* میله‌های پیشرفت — موبایل: مرکز؛ دسکتاپ: زیر ستون متن */}
          <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 md:left-auto md:right-1/4 md:translate-x-1/2">
            {slides.map((slide, index) => {
              const isActive = index === selected;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => emblaApi?.scrollTo(index)}
                  aria-label={`نمایش اسلاید ${toFa(index + 1)}`}
                  aria-current={isActive}
                  className="flex h-11 items-center justify-center rounded-full px-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "block h-1.5 rounded-full transition-all duration-300",
                      isActive
                        ? "w-10 bg-gold"
                        : "w-4 bg-border hover:bg-gold/50",
                    )}
                  />
                </button>
              );
            })}
          </div>
        </>
      ) : null}
    </section>
  );
}
