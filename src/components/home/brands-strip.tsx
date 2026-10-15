/**
 * نوار برندها — marquee بی‌نهایت با لبه‌های محو
 * ─────────────────────────────
 * Server Component؛ آیتم‌ها دقیقاً دوبار رندر می‌شوند تا حلقهٔ انیمیشن بی‌درز باشد.
 *
 * جهت حرکت (تست ذهنی): در RTL، ردیفِ w-max از لبهٔ راستِ ظرف سرریز می‌کند و
 * کی‌فریم globals (translateX 0→٪50) نوار را به «راست» می‌برد (ورود آیتم‌ها از چپ).
 * با [animation-direction:reverse] پخش از ٪50→0 انجام می‌شود و نوار به «چپ»
 * می‌رود — ورود برندها از لبهٔ راست (آغاز خواندن) و حرکت کلاسیک به چپ؛
 * مطابق بریف. حلقه بی‌درز است چون نسخهٔ دوم عین نسخهٔ اول است.
 */

import { Fragment } from "react";

import type { BrandSummary } from "@/types/shop";

interface BrandsStripProps {
  brands: BrandSummary[];
}

export function BrandsStrip({ brands }: BrandsStripProps) {
  /* تکثیر برای حلقهٔ بی‌نهایت — نسخهٔ دوم برای صفحه‌خوان‌ها مخفی است */
  const loopBrands = [...brands, ...brands];

  return (
    <section className="shell py-10 md:py-14">
      <h2 className="text-center text-sm font-semibold tracking-wide text-muted-foreground">
        برندهای همراه ما
      </h2>
      <div className="gold-hairline mx-auto mt-3 w-24" aria-hidden="true" />

      <div
        role="group"
        aria-label="برندهای همراه فروشگاه"
        className="group mt-8 overflow-hidden mask-fade-x"
      >
        <div className="flex w-max animate-marquee items-center gap-12 [animation-direction:reverse] group-hover:[animation-play-state:paused]">
          {loopBrands.map((brandItem, index) => (
            <Fragment key={`${brandItem.id}-${index}`}>
              <span
                aria-hidden={index >= brands.length || undefined}
                className="cursor-default whitespace-nowrap text-lg font-black text-muted-foreground/50 transition-colors hover:text-primary md:text-xl"
              >
                {brandItem.title}
              </span>
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 rotate-45 bg-gold/50"
              />
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
