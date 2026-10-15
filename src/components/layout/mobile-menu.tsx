"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  CircleHelp,
  Home,
  Info,
  Newspaper,
  Phone,
  Search,
  Store,
  UserRound,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Logo } from "@/components/shared/brand-assets";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PREVIEW_CATEGORIES } from "@/lib/preview-data";

interface MainLinkItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const MAIN_LINKS: MainLinkItem[] = [
  { href: "/", label: "صفحهٔ اصلی", icon: Home },
  { href: "/products", label: "فروشگاه", icon: Store },
  { href: "/blog", label: "وبلاگ", icon: Newspaper },
  { href: "/about", label: "دربارهٔ ما", icon: Info },
  { href: "/contact", label: "تماس", icon: Phone },
  { href: "/faq", label: "پرسش‌های متداول", icon: CircleHelp },
];

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
          <div className="flex items-center justify-between border-b border-border/60 p-4">
            <Link
              href="/"
              onClick={onClose}
              className="rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <Logo />
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9"
              onClick={onClose}
              aria-label="بستن منو"
            >
              <X className="size-5" aria-hidden="true" />
            </Button>
          </div>

          {/* جستجو */}
          <form
            action="/search"
            method="get"
            role="search"
            className="relative m-4 mb-2"
          >
            <Search
              className="pointer-events-none absolute start-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              name="q"
              placeholder="جستجوی محصول، دسته یا برند…"
              aria-label="جستجو در فروشگاه"
              className="h-11 rounded-full border-input/70 bg-card ps-11 shadow-none"
            />
          </form>

          {/* بدنهٔ اسکرول‌شونده */}
          <div className="flex-1 overflow-y-auto px-4 pb-6">
            <nav className="py-2" aria-label="ناوبری موبایل">
              <ul className="space-y-1">
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
                        className="flex h-11 items-center gap-3 rounded-xl px-3 text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      >
                        <item.icon
                          className="size-5 text-muted-foreground"
                          aria-hidden="true"
                        />
                        {item.label}
                      </Link>
                    </motion.div>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-3 border-t border-border/60 pt-3">
              <p className="px-3 pb-1 pt-2 text-xs font-medium text-muted-foreground">
                دسته‌بندی کالاها
              </p>
              <Accordion type="single" collapsible>
                {PREVIEW_CATEGORIES.map((category) => (
                  <AccordionItem key={category.id} value={category.slug}>
                    <AccordionTrigger className="py-3 text-start text-sm font-medium text-foreground hover:no-underline hover:text-gold">
                      {category.title}
                    </AccordionTrigger>
                    <AccordionContent className="pb-3">
                      {category.children.map((child) => (
                        <Link
                          key={child.id}
                          href={`/products?category=${child.slug}`}
                          onClick={onClose}
                          className="block py-2 ps-4 text-sm text-muted-foreground transition-colors hover:text-gold"
                        >
                          {child.title}
                        </Link>
                      ))}
                      <Link
                        href={`/products?category=${category.slug}`}
                        onClick={onClose}
                        className="block py-2 ps-4 text-sm font-medium text-foreground transition-colors hover:text-gold"
                      >
                        همهٔ {category.title}
                      </Link>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* نوار پایین */}
          <div className="flex items-center justify-between gap-3 border-t border-border/60 p-4">
            <ThemeToggle />
            <Button asChild variant="outline" className="h-11 flex-1 rounded-xl">
              <Link href="/login" onClick={onClose}>
                <UserRound className="size-5" aria-hidden="true" />
                ورود / حساب من
              </Link>
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
