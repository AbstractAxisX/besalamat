/**
 * مارکی CSS — نوار برندها و نوارهای افقی متحرک
 * ─────────────────────────────
 * RTL-آگاه: با translateX مثبت به سمت چپ می‌رود (مسیر طبیعی RTL).
 * محتوای دوبل + انیمیشن یکنواخت؛ با هاور متوقف می‌شود.
 * Server-safe (بدون "use client").
 */

import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  /** سرعت — مدت یک دور کامل (ثانیه) */
  duration?: number;
  /** توقف با هاور */
  pauseOnHover?: boolean;
}

export function Marquee({
  children,
  className,
  duration = 42,
  pauseOnHover = true,
}: MarqueeProps) {
  return (
    <div
      className={cn(
        "group relative w-full overflow-hidden",
        pauseOnHover && "hover:[&_[data-marquee-track]]:animate-none",
        className,
      )}
    >
      <div
        data-marquee-track
        className="flex w-max animate-marquee items-center"
        style={{ animationDuration: `${duration}s` }}
      >
        {children}
        {/* نسخهٔ دوم برای حلقهٔ بی‌درز — از صفحه‌خوان مخفی */}
        <div aria-hidden="true" className="flex items-center">
          {children}
        </div>
      </div>
    </div>
  );
}
