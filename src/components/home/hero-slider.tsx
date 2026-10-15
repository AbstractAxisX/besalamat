"use client";

/**
 * اسلایدر هیرو — سطح متالیک تمام‌عرض با پترن طلایی و واترمارک برند
 * ─────────────────────────────
 * embla (RTL + loop) با اتوپلی ۶ ثانیه؛ در hover مکث و پس از تعامل ادامه.
 * متن هر اسلاید فقط در حالتِ انتخاب رندر می‌شود و تعویض آن با framer
 * (فقط opacity/transform) نرم است؛ تصویر همیشه در جای خودش می‌ماند.
 * عنوان اسلاید نخست h1 است (سرفصل صفحهٔ هوم) و بقیه h2.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

import { Pattern, Watermark } from "@/components/shared/brand-assets";
import { toFa } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { HomeSlideDTO } from "@/types/shop";

const AUTOPLAY_DELAY_MS = 6_000;

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
  const goTo = (index: number) => emblaApi?.scrollTo(index);

  return (
    <section
      className="relative overflow-hidden bg-metallic"
      role="region"
      aria-roledescription="carousel"
      aria-label="اسلایدر هیرو"
    >
      <Pattern className="text-gold opacity-[0.05]" />
      {/* واترمارک بزرگ برند — سمت چپِ قاب، پشت ستون تصویر */}
      <Watermark className="end-[-3rem] top-1/2 size-[26rem] -translate-y-1/2 text-on-metallic opacity-[0.05] md:end-[-4rem] md:size-[34rem]" />

      {/* درِ اسلایدها */}
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
                <div className="shell grid min-h-[440px] grid-cols-1 items-center gap-8 pb-16 pt-10 md:min-h-[540px] md:grid-cols-2 md:pb-12 md:pt-12">
                  {/* ستون متن — راست در RTL */}
                  <div className="relative">
                    <AnimatePresence mode="wait">
                      {isSelected ? (
                        <motion.div
                          key={slide.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                          <Heading className="text-3xl leading-[1.25] font-black text-on-metallic md:text-5xl">
                            {slide.title}
                          </Heading>
                          {slide.subtitle ? (
                            <p className="mt-4 text-base leading-8 text-on-metallic-muted md:text-lg">
                              {slide.subtitle}
                            </p>
                          ) : null}
                          <Link
                            href={slide.ctaHref ?? "/products"}
                            className="btn-metallic mt-8 inline-flex h-12 items-center gap-2 rounded-full px-8 font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-pine"
                          >
                            {slide.ctaLabel ?? "مشاهده محصولات"}
                            <ArrowLeft className="size-4" aria-hidden="true" />
                          </Link>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>

                  {/* ستون تصویر — چپ در RTL */}
                  <div className="relative mx-auto aspect-square max-h-[420px] w-full max-w-[420px] rounded-3xl bg-white/5 p-4 ring-1 ring-gold/25">
                    <div className="relative h-full w-full">
                      <Image
                        src={slide.imageUrl}
                        alt={slide.title}
                        fill
                        priority={index === 0}
                        sizes="(max-width: 768px) 100vw, 420px"
                        className="object-contain drop-shadow-2xl"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showControls ? (
        <>
          {/* قبلی — سمت راست در RTL */}
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="اسلاید قبلی"
            className="absolute start-4 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-on-metallic backdrop-blur transition-colors outline-none hover:bg-gold/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-pine"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
          {/* بعدی — سمت چپ در RTL */}
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            aria-label="اسلاید بعدی"
            className="absolute end-4 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-on-metallic backdrop-blur transition-colors outline-none hover:bg-gold/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-pine"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>

          {/* نقاط پیشرفت */}
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1">
            {slides.map((slide, index) => {
              const isActive = index === selected;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`نمایش اسلاید ${toFa(index + 1)}`}
                  aria-current={isActive}
                  className="flex h-11 w-11 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-pine"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "block h-1.5 rounded-full transition-all",
                      isActive
                        ? "w-8 bg-gold"
                        : "w-1.5 bg-white/30 hover:bg-white/60",
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
