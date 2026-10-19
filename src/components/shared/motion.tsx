"use client";

/**
 * پریمیتیوهای حرکت — Reveal / CountUp / StaggerList
 * ─────────────────────────────
 * زبان انیمیشن سایت: ظرافت، نه جلوه‌تیزی.
 *  - Reveal: ظهور نرم هنگام ورود به دید (y + blur خفیف)
 *  - CountUp: شمارش نرم اعداد فارسی هنگام دید
 *  - StaggerList: ورود پلکانی آیتم‌ها
 * همه با احترام به prefers-reduced-motion (framer-motion خودش رعایت می‌کند).
 */

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  type HTMLMotionProps,
} from "framer-motion";

import { toFa } from "@/lib/format";
import { cn } from "@/lib/utils";

/* ── ظهور نرم هنگام اسکرول ── */

interface RevealProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  delay?: number;
  /** جابه‌جایی اولیه برحسب پیکسل */
  y?: number;
  /** جهت ظهور */
  from?: "bottom" | "start" | "end" | "none";
  once?: boolean;
}

const FROM_OFFSET: Record<NonNullable<RevealProps["from"]>, { x?: number; y?: number }> = {
  bottom: { y: 24 },
  start: { x: -24 },
  end: { x: 24 },
  none: {},
};

export function Reveal({
  delay = 0,
  y,
  from = "bottom",
  once = true,
  className,
  children,
  ...props
}: RevealProps) {
  const offset = FROM_OFFSET[from];
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, filter: "blur(6px)", x: offset.x ?? 0, y: y ?? offset.y ?? 0 }}
      whileInView={{ opacity: 1, filter: "blur(0px)", x: 0, y: 0 }}
      viewport={{ once, margin: "-64px" }}
      transition={{ duration: 0.55, delay, ease: [0.21, 0.65, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/* ── شمارش نرم اعداد فارسی ── */

interface CountUpProps {
  value: number;
  /** مدت شمارش (میلی‌ثانیه) */
  duration?: number;
  className?: string;
  /** پسوند — مثلاً «+» */
  suffix?: string;
  /** پیشوند */
  prefix?: string;
}

export function CountUp({
  value,
  duration = 1_600,
  className,
  suffix = "",
  prefix = "",
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration, bounce: 0 });

  useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, mv, value]);

  useEffect(() => spring.on("change", (latest) => setDisplay(Math.round(latest))), [spring]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      {toFa(display)}
      {suffix}
    </span>
  );
}

/* ── ورود پلکانی آیتم‌های فهرست ── */

interface StaggerListProps {
  children: React.ReactNode;
  className?: string;
  /** فاصلهٔ پلکان (ثانیه) */
  step?: number;
  delay?: number;
}

export function StaggerList({ children, className, step = 0.07, delay = 0 }: StaggerListProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-48px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: step, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export const staggerItem = {
  hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.21, 0.65, 0.36, 1] as const },
  },
} as const;

/** آیتم فرزند StaggerList */
export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}
