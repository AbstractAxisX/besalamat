"use client";

import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * تعویض پوستهٔ روشن/تیره — دکمهٔ دایره‌ای ghost
 * آیکون‌ها با CSS سوییچ می‌شوند (بدون mismatch هایدریشن)؛
 * چرخش ظریف framer فقط هنگام تعویض اجرا می‌شود.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-9 rounded-full"
      aria-label="تغییر پوسته روشن/تیره"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <motion.span
        key={resolvedTheme ?? "init"}
        className="flex"
        initial={{ rotate: -30, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <Sun className="size-5 dark:hidden" aria-hidden="true" />
        <Moon className="hidden size-5 dark:flex" aria-hidden="true" />
      </motion.span>
    </Button>
  );
}
