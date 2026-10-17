"use client";

/**
 * پیشنهاد ویژهٔ امروز — باند متالیک با شمارش معکوس تا نیمه‌شب
 * ─────────────────────────────
 * روانشناسی فروش: کمیابی زمان‌مندی (پایان امروز) + بج درصد تخفیف +
 * «سود شما» با عدد درشت. شمارش بعد از mount آغاز می‌شود (بدون mismatch).
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Flame } from "lucide-react";

import { Pattern, Watermark } from "@/components/shared/brand-assets";
import { discountPercent, formatTomanPlain, toFa } from "@/lib/format";
import type { ProductSummary } from "@/types/shop";

interface CountdownParts {
  h: string;
  m: string;
  s: string;
}

/** باقی‌مانده تا نیمه‌شب — فقط سمت کلاینت، هر ثانیه */
function useMidnightCountdown(): CountdownParts {
  const [parts, setParts] = useState<CountdownParts>({
    h: "00",
    m: "00",
    s: "00",
  });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const diff = Math.max(0, end.getTime() - now.getTime());
      setParts({
        h: String(Math.floor(diff / 3_600_000)).padStart(2, "0"),
        m: String(Math.floor((diff % 3_600_000) / 60_000)).padStart(2, "0"),
        s: String(Math.floor((diff % 60_000) / 1000)).padStart(2, "0"),
      });
    };
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, []);

  return parts;
}

function TimeBox({ value, label }: { value: string; label: string }) {
  return (
    <span className="flex w-16 flex-col items-center rounded-xl border border-gold/30 bg-white/[0.07] py-2 backdrop-blur-sm">
      <span
        className="text-xl font-black tabular-nums text-on-metallic"
        dir="ltr"
        aria-label={`${label}: ${toFa(value)}`}
      >
        {toFa(value)}
      </span>
      <span className="mt-0.5 text-[10px] text-on-metallic-muted">{label}</span>
    </span>
  );
}

interface DealBannerProps {
  product: ProductSummary;
}

export function DealBanner({ product }: DealBannerProps) {
  const { h, m, s } = useMidnightCountdown();
  const discount = discountPercent(product.price, product.comparePrice);
  const savings =
    product.comparePrice != null && product.comparePrice > product.price
      ? product.comparePrice - product.price
      : null;

  return (
    <section
      className="relative overflow-hidden bg-metallic"
      aria-label="پیشنهاد ویژهٔ امروز"
    >
      <Pattern className="text-gold opacity-[0.05]" />
      <Watermark className="end-[-5rem] top-1/2 size-[24rem] -translate-y-1/2 text-on-metallic opacity-[0.04] md:size-[30rem]" />

      <div className="shell relative grid items-center gap-10 py-10 md:py-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
        {/* ── محتوا — راست ── */}
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3.5 py-1.5 text-[11px] font-black text-gold-foreground">
            <Flame className="size-3.5" aria-hidden="true" />
            پیشنهاد ویژهٔ امروز
          </span>

          <h3 className="mt-4 text-2xl leading-[1.4] font-black text-on-metallic md:text-[2rem]">
            <Link
              href={`/products/${product.slug}`}
              className="transition-colors hover:text-gold"
            >
              {product.title}
            </Link>
          </h3>

          {savings != null ? (
            <p className="mt-3 text-sm text-on-metallic-muted">
              سود شما از این خرید:{" "}
              <span className="font-black text-gold">
                {formatTomanPlain(savings)} تومان
              </span>
            </p>
          ) : null}

          {/* قیمت */}
          <div className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-2">
            {product.comparePrice != null ? (
              <span className="text-base text-on-metallic-muted line-through decoration-gold/60">
                {formatTomanPlain(product.comparePrice)}
              </span>
            ) : null}
            <span className="text-3xl font-black text-on-metallic md:text-4xl">
              {formatTomanPlain(product.price)}{" "}
              <span className="text-sm font-normal text-on-metallic-muted">
                تومان
              </span>
            </span>
          </div>

          {/* شمارش معکوس */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <span className="text-xs text-on-metallic-muted">
              پایان پیشنهاد تا
            </span>
            <div className="flex items-center gap-2" dir="ltr" aria-hidden="true">
              <TimeBox value={h} label="ساعت" />
              <span className="text-lg font-black text-gold">:</span>
              <TimeBox value={m} label="دقیقه" />
              <span className="text-lg font-black text-gold">:</span>
              <TimeBox value={s} label="ثانیه" />
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-gold px-8 text-sm font-black text-gold-foreground transition-all duration-300 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-pine"
            >
              مشاهده و خرید
              <ArrowLeft className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/products?discount=1"
              className="text-sm font-medium text-gold transition-colors hover:text-gold-strong"
            >
              همهٔ تخفیف‌دارها
            </Link>
          </div>
        </div>

        {/* ── تصویر — چپ ── */}
        <Link
          href={`/products/${product.slug}`}
          className="relative mx-auto w-full max-w-[280px] md:max-w-[320px]"
        >
          <div className="relative aspect-square rounded-[2.5rem] bg-card p-8 md:p-10">
            <Image
              src={product.image}
              alt={product.title}
              fill
              sizes="(max-width: 1024px) 70vw, 320px"
              className="object-contain drop-shadow-xl"
            />
            {discount != null ? (
              <span className="absolute top-4 start-4 flex size-12 items-center justify-center rounded-full bg-gold text-center text-sm font-black leading-none text-gold-foreground">
                ٪{toFa(discount)}
              </span>
            ) : null}
          </div>
          <span
            className="absolute -bottom-3 -end-2 hidden rounded-full border border-gold/40 bg-pine px-4 py-2 text-[11px] font-bold text-on-metallic md:block"
            aria-hidden="true"
          >
            فقط تا امروز
          </span>
        </Link>
      </div>
    </section>
  );
}
