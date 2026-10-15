"use client";

/**
 * دارایی‌های برند «بسلامت» — نشان، لوگو، پترن، واترمارک، جداکنندهٔ طلایی
 * ─────────────────────────────
 * تنها جای مجاز رنگ‌های hex خارج از توکن‌ها، SVG لوگو/پترن است.
 * فایل به‌خاطر useId در Pattern کلاینت است؛ در کامپوننت‌های سروری (فوتر)
 * بدون مشکل مصرف می‌شود.
 */

import { useId } from "react";

import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";

/* رنگ‌های نشان — سبز کاجی + طلایی */
const GOLD = "#C9A24B";
const PINE = "#0C3B2E";

/* هندسهٔ درخت سرو (viewBox 40×40) — مشترک بین LogoMark و Watermark:
   سه لایهٔ شاخهٔ chevronی بالارونده + تنهٔ کوتاه؛ نوک طلایی */
const PINE_TIP = "M20 8.6L24.6 14.4L22.2 14.4L20 11.3L17.8 14.4L15.4 14.4Z";
const PINE_MID = "M20 15.6L27.2 21.6L24.2 21.6L20 18.2L15.8 21.6L12.8 21.6Z";
const PINE_LOW = "M20 22.8L30 29.2L26.4 29.2L20 25.4L13.6 29.2L10 29.2Z";

/** نشان — حلقهٔ طلایی ظریف + درخت سرو هندسی */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn("size-10 shrink-0", className)}
    >
      <circle cx="20" cy="20" r="18.6" stroke={GOLD} strokeWidth="1.3" />
      <path d={PINE_TIP} fill={GOLD} />
      <path d={PINE_MID} fill={PINE} />
      <path d={PINE_LOW} fill={PINE} />
      <rect x="18.75" y="29.2" width="2.5" height="3.4" rx="0.55" fill={PINE} />
    </svg>
  );
}

/** لوگوی کامل — نشان + وردمارک؛ light برای سطوح متالیک تیره */
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

/** پترن تکرارشوندهٔ لطیف — تایل ۹۶×۹۶: ستارهٔ هشت‌پر + ربع‌دایرهٔ گوشه‌ها + نقطه‌های ریز
 *  مصرف: <Pattern className="text-pine opacity-[0.04] dark:text-gold dark:opacity-[0.05]" /> */
export function Pattern({ className }: { className?: string }) {
  const patternId = useId();

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      <svg className="h-full w-full">
        <defs>
          <pattern
            id={patternId}
            width="96"
            height="96"
            patternUnits="userSpaceOnUse"
          >
            <g fill="none" stroke="currentColor" strokeWidth="1">
              {/* ستارهٔ هشت‌پر: دو مربع ۲۸×۲۸ — یکی چرخیدهٔ ۴۵ درجه */}
              <rect x="34" y="34" width="28" height="28" />
              <rect
                x="34"
                y="34"
                width="28"
                height="28"
                transform="rotate(45 48 48)"
              />
              {/* ربع‌دایره‌های ظریف در چهار گوشهٔ تایل */}
              <path d="M12 0A12 12 0 0 1 0 12" />
              <path d="M84 0A12 12 0 0 0 96 12" />
              <path d="M0 84A12 12 0 0 1 12 96" />
              <path d="M96 84A12 12 0 0 0 84 96" />
              {/* چهار نقطهٔ ریز قطری */}
              <circle cx="24" cy="24" r="1" fill="currentColor" stroke="none" />
              <circle cx="72" cy="24" r="1" fill="currentColor" stroke="none" />
              <circle cx="24" cy="72" r="1" fill="currentColor" stroke="none" />
              <circle cx="72" cy="72" r="1" fill="currentColor" stroke="none" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}

/** واترمارک — نشانِ غول‌پیکرِ خطی (outline) برای سطوح متالیک؛
 *  جای‌گذاری و شفافیت را مصرف‌کننده با className می‌دهد */
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

/** جداکنندهٔ افقی لوکس — دو گرادیان محوشونده + لوزی طلایی کوچک */
export function GoldDivider({ className }: { className?: string }) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={cn("flex w-full items-center gap-3", className)}
    >
      <span className="h-px flex-1 bg-gradient-to-r from-gold/60 to-transparent" />
      <span className="size-1.5 rotate-45 border border-gold" />
      <span className="h-px flex-1 bg-gradient-to-l from-gold/60 to-transparent" />
    </div>
  );
}
