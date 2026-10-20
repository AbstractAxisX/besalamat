"use client";

import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { IconMoonStars, IconSun } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";

/**
 * تعویض پوستهٔ روشن/تیره — دکمهٔ دایره‌ای ghost با آیکون‌های تبلر.
 * آیکون‌ها با CSS سوییچ می‌شوند (بدون mismatch هایدریشن)؛
 * چرخش + مقیاس ظریف framer فقط هنگام تعویض اجرا می‌شود.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-9 rounded-full md:size-10"
      aria-label="تغییر پوستهٔ روشن/تیره"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <motion.span
        key={resolvedTheme ?? "init"}
        className="flex"
        initial={{ rotate: -60, opacity: 0, scale: 0.6 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <IconSun className="size-5 dark:hidden" stroke={1.75} aria-hidden="true" />
        <IconMoonStars
          className="hidden size-5 dark:flex"
          stroke={1.75}
          aria-hidden="true"
        />
      </motion.span>
    </Button>
  );
}
