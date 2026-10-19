"use client";

/**
 * دارایی‌های برند «بسلامت» — نشان، لوگو، واترمارک، جداکنندهٔ سبز
 * ─────────────────────────────
 * تنها جای مجاز رنگ‌های hex خارج از توکن‌ها، SVG لوگو است.
 * فایل به‌خاطر useId کلاینت است؛ در کامپوننت‌های سروری (فوتر)
 * بدون مشکل مصرف می‌شود.
 */

import { useId } from "react";

import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";

/* رنگ‌های نشان — سبز عمیق + سبز تازه */
const FRESH = "#1E9E6A";
const PINE = "#0B4634";

/* هندسهٔ درخت سرو (viewBox 40×40) — مشترک بین LogoMark و Watermark:
   سه لایهٔ شاخهٔ chevronی بالارونده + تنهٔ کوتاه؛ نوک سبز تازه */
const PINE_TIP = "M20 8.6L24.6 14.4L22.2 14.4L20 11.3L17.8 14.4L15.4 14.4Z";
const PINE_MID = "M20 15.6L27.2 21.6L24.2 21.6L20 18.2L15.8 21.6L12.8 21.6Z";
const PINE_LOW = "M20 22.8L30 29.2L26.4 29.2L20 25.4L13.6 29.2L10 29.2Z";

/** نشان — حلقهٔ سبز ظریف + درخت سرو هندسی */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn("size-10 shrink-0", className)}
    >
      <circle cx="20" cy="20" r="18.6" stroke={FRESH} strokeWidth="1.3" />
      <path d={PINE_TIP} fill={FRESH} />
      <path d={PINE_MID} fill={PINE} />
      <path d={PINE_LOW} fill={PINE} />
      <rect x="18.75" y="29.2" width="2.5" height="3.4" rx="0.55" fill={PINE} />
    </svg>
  );
}

/** لوگوی کامل — نشان + وردمارک؛ light برای سطوح سبز عمیق */
export function Logo({
  className,
  light,
}: {
  className?: string;
  light?: boolean;
}) {
  return (
    <span className={cn("inline-flex select-none items-center gap-2.5", className)}>
      <LogoMark />
      <span
        className={cn(
          "text-2xl font-black leading-none",
          light ? "text-on-metallic" : "text-foreground",
        )}
      >
        {brand.name}
      </span>
    </span>
  );
}

/** واترمارک — نشانِ غول‌پیکرِ خطی (outline) برای سطوح سبز عمیق؛
 *  جای‌گذاری و شفافیت را مصرف‌کننده با className می‌دهد.
 *  مصرف: <Watermark className="end-[-4rem] top-1/2 size-[26rem] -translate-y-1/2 text-fresh/10" /> */
export function Watermark({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute select-none", className)}
    >
      <svg viewBox="0 0 40 40" fill="none" className="h-full w-full">
        <circle cx="20" cy="20" r="18.6" stroke="currentColor" strokeWidth="0.6" />
        <path d={PINE_TIP} stroke="currentColor" strokeWidth="0.6" />
        <path d={PINE_MID} stroke="currentColor" strokeWidth="0.6" />
        <path d={PINE_LOW} stroke="currentColor" strokeWidth="0.6" />
        <rect
          x="18.75"
          y="29.2"
          width="2.5"
          height="3.4"
          rx="0.55"
          stroke="currentColor"
          strokeWidth="0.6"
        />
      </svg>
    </div>
  );
}

/** جداکنندهٔ افقی — دو گرادیان محوشونده + نقطهٔ سبز کوچک */
export function GoldDivider({ className }: { className?: string }) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={cn("flex w-full items-center gap-3", className)}
    >
      <span className="h-px flex-1 bg-gradient-to-r from-fresh/50 to-transparent" />
      <span className="size-1.5 rounded-full bg-fresh/70" />
      <span className="h-px flex-1 bg-gradient-to-l from-fresh/50 to-transparent" />
    </div>
  );
}

/** شناسهٔ یکتا برای گرادیان لوگوی متنی — چند نمونه در یک صفحه */
export function BrandGradientText({ className }: { className?: string }) {
  const id = useId();
  return (
    <span
      className={cn("bg-clip-text text-transparent", className)}
      style={{
        backgroundImage: `linear-gradient(120deg, ${PINE} 20%, ${FRESH} 55%, ${PINE} 90%)`,
      }}
      aria-hidden="true"
      data-gradient-id={id}
    />
  );
}
