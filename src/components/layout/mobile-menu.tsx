"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Phone,
  Search,
  UserRound,
  X,
} from "lucide-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Logo } from "@/components/shared/brand-assets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { brand } from "@/config/brand";
import { formatPhoneFa, toFa } from "@/lib/format";
import { PREVIEW_CATEGORIES } from "@/lib/preview-data";

const MAIN_LINKS = [
  { href: "/", label: "صفحهٔ اصلی" },
  { href: "/products", label: "همهٔ محصولات" },
  { href: "/blog", label: "مجلهٔ سلامت" },
  { href: "/about", label: "دربارهٔ ما" },
  { href: "/contact", label: "تماس با ما" },
  { href: "/faq", label: "پرسش‌های متداول" },
] as const;

export function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  /* قفل اسکرول بدن + بستن با Escape */
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="منوی اصلی"
          className="fixed inset-0 z-[60] flex h-dvh flex-col bg-background"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          {/* هدر منو */}
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <Link
              href="/"
              onClick={onClose}
              className="rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <Logo />
            </Link>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-11"
                onClick={onClose}
                aria-label="بستن منو"
              >
                <X className="size-5" aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/* جستجو */}
          <form
            action="/search"
            method="get"
            role="search"
            className="relative px-4 pt-4"
          >
            <Search
              className="pointer-events-none absolute start-7 top-1/2 size-4.5 translate-y-[3px] text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              name="q"
              placeholder="جستجوی محصول، دسته یا برند…"
              aria-label="جستجو در فروشگاه"
              className="h-12 rounded-full border-transparent bg-muted/70 ps-11 shadow-none"
            />
          </form>

          {/* بدنهٔ اسکرول‌شونده */}
          <div className="flex-1 overflow-y-auto px-4 pb-6">
            {/* لینک‌های اصلی */}
            <nav className="py-4" aria-label="ناوبری موبایل">
              <ul className="grid grid-cols-2 gap-2">
                {MAIN_LINKS.map((item, index) => (
                  <li key={item.href}>
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: index * 0.04,
                        duration: 0.22,
                        ease: "easeOut",
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="flex h-12 items-center rounded-xl bg-muted/50 px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  </li>
                ))}
              </ul>
            </nav>

            <span className="gold-hairline my-2 block" aria-hidden="true" />

            {/* دسته‌ها — ایندکس شماره‌دار */}
            <p className="px-1 pb-2 pt-4 text-xs font-bold text-gold">
              دسته‌بندی کالاها
            </p>
            <ul>
              {PREVIEW_CATEGORIES.map((category, index) => (
                <li
                  key={category.id}
                  className="border-b border-border/50 last:border-b-0"
                >
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center gap-3 py-4 outline-none [&::-webkit-details-marker]:hidden">
                      <span className="w-6 text-xs font-black text-gold/70">
                        {toFa(String(index + 1).padStart(2, "0"))}
                      </span>
                      <Link
                        href={`/products?category=${category.slug}`}
                        onClick={onClose}
                        className="flex-1 text-[15px] font-bold text-foreground transition-colors hover:text-primary"
                      >
                        {category.title}
                      </Link>
                      <ChevronDown
                        className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-180"
                        aria-hidden="true"
                      />
                    </summary>
                    <div className="flex flex-wrap gap-2 pb-4 ps-9">
                      {category.children.map((child) => (
                        <Link
                          key={child.id}
                          href={`/products?category=${child.slug}`}
                          onClick={onClose}
                          className="rounded-full bg-muted/60 px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </div>

          {/* نوار پایین */}
          <div className="border-t border-border/60 p-4">
            <div className="flex items-center gap-3">
              <Button
                asChild
                className="h-12 flex-1 rounded-xl text-sm font-bold"
              >
                <Link href="/login" onClick={onClose}>
                  <UserRound className="size-5" aria-hidden="true" />
                  ورود / حساب من
                </Link>
              </Button>
              <a
                href={`tel:${brand.contact.phone}`}
                className="flex size-12 items-center justify-center rounded-xl border border-border/80 text-primary transition-colors hover:bg-accent"
                aria-label="تماس با فروشگاه"
              >
                <Phone className="size-5" aria-hidden="true" />
              </a>
            </div>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              پشتیبانی:{" "}
              <a
                href={`tel:${brand.contact.phone}`}
                dir="ltr"
                className="font-medium text-primary"
              >
                {formatPhoneFa(brand.contact.phone)}
              </a>
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
