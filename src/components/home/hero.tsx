"use client";

/**
 * هیروی ۲۰۲۶ — ترکیب لایه‌ای: متن فروش‌محور + کارت تصویری embla
 * ─────────────────────────────
 *  - embla (RTL + loop) فقط برای کارت تصویری؛ متن با AnimatePresence
 *    هم‌گام با اسلاید انتخاب‌شده عوض می‌شود (اتوپلی ۶ ثانیه).
 *  - جستجوی واقعی (دیالوگ سراسری)، چیپ‌های پرجستجو، آمار CountUp.
 *  - عمق = قاب هندسی چرخیده + هاله‌های glow (بدون پترن/مش).
 *  - ورود اولیه: پلکانی (eyebrow → تیتر → جستجو → چیپ → CTA → آمار).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  IconArrowLeft,
  IconArrowRight,
  IconPhone,
  IconPointFilled,
  IconSearch,
} from "@tabler/icons-react";

import { CategoryIcon } from "@/components/shared/category-icon";
import { CountUp } from "@/components/shared/motion";
import { brand } from "@/config/brand";
import { formatTomanPlain, toFa } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useSearchDialogStore } from "@/store/search";
import type { HomeSlideDTO, ProductSummary } from "@/types/shop";

const AUTOPLAY_DELAY_MS = 6_000;

/** عبارتِ مارکرشدهٔ هر اسلاید — کلید = slide.id */
const SLIDE_HIGHLIGHT: Record<string, string> = {
  "slide-1": "تجهیزات پزشکی اصل",
  "slide-2": "دستگاه سلامت",
  "slide-3": "کارشناس",
};

const HERO_STATS = [
  { value: 120, prefix: "+", suffix: "", label: "برند جهانی" },
  { value: 8_500, prefix: "+", suffix: "", label: "کد کالا" },
  { value: 98, prefix: "", suffix: "٪", label: "رضایت خریداران" },
] as const;

/* ── ورود پلکانی اولیه ── */
const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const staggerChild: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.21, 0.65, 0.36, 1] },
  },
};

/** شکستن تیتر به [قبل، عبارتِ هایلایت، بعد] */
function splitByHighlight(title: string, phrase: string | undefined) {
  if (!phrase || !title.includes(phrase)) {
    return { before: title, marked: null as string | null, after: "" };
  }
  const start = title.indexOf(phrase);
  return {
    before: title.slice(0, start),
    marked: phrase,
    after: title.slice(start + phrase.length),
  };
}

interface HeroProps {
  slides: HomeSlideDTO[];
  /** کارت محصول شناور روی قاب (اولین/شاخص‌ترین محصول) */
  spotlight?: ProductSummary;
  /** تعداد کالا — برای متن جستجو */
  productCount: number;
  /** واژه‌های پیشنهادی زیر جستجو */
  popularSearches: string[];
}

export function Hero({
  slides,
  spotlight,
  productCount,
  popularSearches,
}: HeroProps) {
  const openDialog = useSearchDialogStore((state) => state.openDialog);

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

  const slide = slides[selected] ?? slides[0];
  if (!slide) return null;
  const { before, marked, after } = splitByHighlight(
    slide.title,
    SLIDE_HIGHLIGHT[slide.id],
  );
  const showControls = slides.length > 1;

  return (
    <section
      aria-label="معرفی فروشگاه"
      className="relative overflow-hidden bg-gradient-to-b from-secondary/60 via-background to-background"
    >
      {/* هاله‌های نرم — عمق بدون پترن */}
      <div
        aria-hidden="true"
        className="glow size-[36rem] start-[-8rem] -top-40 hidden bg-fresh/10 sm:block"
      />
      <div
        aria-hidden="true"
        className="glow size-[32rem] end-[-10rem] -bottom-48 hidden bg-primary/10 sm:block"
      />

      <div className="shell relative grid items-center gap-12 py-10 md:py-16 lg:grid-cols-[1.05fr_0.95fr]">
        {/* ══ ستون متن — راست در RTL ══ */}
        <div className="order-1">
          {/* h1 سئو — یک‌تا در کل صفحه؛ اسلایدها h2 هستند */}
          <h1 className="sr-only">
            فروشگاه اینترنتی تجهیزات و لوازم پزشکی {brand.name}
          </h1>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {/* چشم‌بند برند */}
            <motion.div variants={staggerChild}>
              <span className="inline-flex items-center gap-2 rounded-full border border-fresh/40 bg-fresh/5 px-4 py-1.5 text-xs font-bold text-fresh-strong dark:text-fresh">
                <span
                  className="size-1.5 animate-pulse-soft rounded-full bg-fresh"
                  aria-hidden="true"
                />
                {brand.tagline}
              </span>
            </motion.div>

            {/* تیتر و زیرعنوان اسلاید — تعویض نرم */}
            <motion.div variants={staggerChild} className="mt-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  <h2 className="text-[1.9rem] leading-[1.25] font-black text-foreground md:text-[3rem]">
                    {before}
                    {marked ? (
                      <span className="relative inline-block isolate">
                        {marked}
                        <span
                          aria-hidden="true"
                          className="absolute inset-x-0 bottom-1 -z-10 h-[0.35em] rounded-sm bg-fresh/25"
                        />
                      </span>
                    ) : null}
                    {after}
                  </h2>
                  {slide.subtitle ? (
                    <p className="mt-4 max-w-xl text-sm leading-8 text-muted-foreground md:text-base">
                      {slide.subtitle}
                    </p>
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* جستجو — کارآمدترین ابزار هیرو */}
            <motion.div variants={staggerChild} className="mt-7">
              <button
                type="button"
                onClick={openDialog}
                aria-label="جستجو در فروشگاه"
                className="flex h-13 w-full max-w-xl items-center gap-3 rounded-full border border-border bg-card px-5 text-start shadow-soft transition-colors duration-300 outline-none hover:border-fresh/50 focus-visible:ring-2 focus-visible:ring-ring md:h-14"
              >
                <IconSearch
                  className="size-5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="flex-1 truncate text-sm text-muted-foreground">
                  جستجو بین {toFa(productCount)} کالای اصل…
                </span>
                <kbd
                  aria-hidden="true"
                  className="hidden rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:block"
                >
                  /
                </kbd>
              </button>

              {/* واژه‌های پرجستجو */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-muted-foreground">
                  پیشنهاد:
                </span>
                {popularSearches.map((term) => (
                  <Link
                    key={term}
                    href={`/search?q=${encodeURIComponent(term)}`}
                    className="rounded-full border border-border bg-card px-3 py-1 text-[11px] text-muted-foreground transition-colors duration-300 outline-none hover:border-fresh/50 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* CTAها — اصلیِ اسلاید + مشاورهٔ تلفنی ثابت */}
            <motion.div
              variants={staggerChild}
              className="mt-7 flex flex-wrap items-center gap-3"
            >
              <Link
                href={slide.ctaHref ?? "/products"}
                className="btn-metallic inline-flex h-12 items-center gap-2 rounded-full px-7 text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <motion.span
                  key={slide.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {slide.ctaLabel ?? "مشاهدهٔ محصولات"}
                </motion.span>
                <IconArrowLeft className="size-4" aria-hidden="true" />
              </Link>
              <a
                href={`tel:${brand.contact.phone}`}
                className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-medium text-foreground transition-colors duration-300 outline-none hover:border-fresh/60 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
              >
                <IconPhone className="size-4" aria-hidden="true" />
                مشاورهٔ رایگان
              </a>
            </motion.div>

            {/* آمار — دسکتاپ */}
            <motion.div
              variants={staggerChild}
              className="mt-10 hidden md:block"
            >
              <div className="flex divide-x divide-border/70">
                {HERO_STATS.map((stat) => (
                  <div
                    key={stat.label}
                    className="px-6 first:ps-0 last:pe-0"
                  >
                    <p className="text-xl font-black text-primary md:text-2xl">
                      <CountUp
                        value={stat.value}
                        prefix={stat.prefix}
                        suffix={stat.suffix}
                      />
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* نقاط پیشرفت — موبایل: مرکز؛ دسکتاپ: زیر ستون متن */}
            {showControls ? (
              <motion.div
                variants={staggerChild}
                className="flex items-center justify-center gap-1.5 lg:justify-start"
              >
                {slides.map((item, index) => {
                  const isActive = index === selected;
                  return (
                    <button
                      key={item.id}
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
                            ? "w-8 bg-fresh"
                            : "w-4 bg-border hover:bg-fresh/50",
                        )}
                      />
                    </button>
                  );
                })}
              </motion.div>
            ) : null}
          </motion.div>
        </div>

        {/* ══ ستون تصویر — چپ در RTL ══ */}
        <motion.div
          className="relative order-2 mt-2 lg:mt-0"
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 110, damping: 18, delay: 0.25 }}
        >
          <div className="relative mx-auto w-full max-w-[460px]">
            {/* قاب هندسی چرخیده — عمق گرافیکی */}
            <div
              aria-hidden="true"
              className="absolute -inset-4 rotate-3 rounded-[2.25rem] border border-fresh/25 bg-fresh/5"
            />

            {/* کارت اصلی — کاروسل تصویر */}
            <div
              ref={emblaRef}
              className="relative aspect-[4/5] touch-pan-y select-none overflow-hidden rounded-[2rem] border border-border/60 shadow-lift"
            >
              <div className="flex h-full">
                {slides.map((item, index) => (
                  <div
                    key={item.id}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`اسلاید ${toFa(index + 1)} از ${toFa(slides.length)}`}
                    className="relative h-full min-w-0 shrink-0 grow-0 basis-full"
                  >
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      priority={index === 0}
                      sizes="(max-width:1024px) 100vw, 460px"
                      draggable={false}
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* فلش‌های دسکتاپ — در RTL: قبلی راست، بعدی چپ */}
              {showControls ? (
                <>
                  <button
                    type="button"
                    onClick={() => emblaApi?.scrollPrev()}
                    aria-label="اسلاید قبلی"
                    className="absolute start-3 top-1/2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-card text-foreground shadow-soft transition-colors duration-300 outline-none hover:border-fresh/60 hover:text-fresh-strong focus-visible:ring-2 focus-visible:ring-ring md:flex"
                  >
                    <IconArrowRight className="size-5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => emblaApi?.scrollNext()}
                    aria-label="اسلاید بعدی"
                    className="absolute end-3 top-1/2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-card text-foreground shadow-soft transition-colors duration-300 outline-none hover:border-fresh/60 hover:text-fresh-strong focus-visible:ring-2 focus-visible:ring-ring md:flex"
                  >
                    <IconArrowLeft className="size-5" aria-hidden="true" />
                  </button>
                </>
              ) : null}
            </div>

            {/* کارت محصول شناور — واقعی، از داده */}
            {spotlight ? (
              <Link
                href={`/products/${spotlight.slug}`}
                aria-label={spotlight.title}
                className="absolute -start-3 bottom-6 z-10 flex w-44 animate-float items-center gap-2.5 rounded-2xl border border-border/70 bg-card p-3 shadow-lift outline-none transition-colors duration-300 hover:border-fresh/60 focus-visible:ring-2 focus-visible:ring-ring md:-start-8 md:bottom-8"
              >
                <span className="img-canvas relative size-14 shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src={spotlight.image}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-contain p-1.5"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11px] font-bold text-foreground">
                    {spotlight.title}
                  </span>
                  <span className="mt-1 block text-xs font-black text-primary">
                    {formatTomanPlain(spotlight.price)}{" "}
                    <span className="text-[9px] font-normal text-muted-foreground">
                      تومان
                    </span>
                  </span>
                  <span className="mt-1 flex items-center gap-1 text-[10px] font-bold text-fresh">
                    <IconPointFilled className="size-3" aria-hidden="true" />
                    موجود
                  </span>
                </span>
              </Link>
            ) : null}

            {/* چیپ دستهٔ شناور — شیشه‌ای */}
            <Link
              href="/products?sort=popular"
              className="absolute -end-3 top-10 z-10 flex animate-float-slow items-center gap-2.5 rounded-2xl border border-border/60 glass px-4 py-3 shadow-soft outline-none transition-colors duration-300 hover:border-fresh/60 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary">
                <CategoryIcon iconKey="blood-pressure" className="size-5" />
              </span>
              <span className="text-xs font-bold text-foreground">
                پرفروش‌ترین‌ها
              </span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
