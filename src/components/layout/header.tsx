"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  LayoutGrid,
  Menu,
  Phone,
  Search,
  ShoppingBag,
  UserRound,
} from "lucide-react";

import { Logo } from "@/components/shared/brand-assets";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { brand } from "@/config/brand";
import { formatPhoneFa, toFa } from "@/lib/format";
import { PREVIEW_CATEGORIES } from "@/lib/preview-data";
import { cn } from "@/lib/utils";
import { cartCount, useCartStore } from "@/store/cart";

const NAV_LINKS = [
  { href: "/products", label: "فروشگاه" },
  { href: "/blog", label: "وبلاگ" },
  { href: "/about", label: "دربارهٔ ما" },
  { href: "/contact", label: "تماس" },
] as const;

/* الگوی mounted — بدون setState در effect و بدون mismatch هایدریشن:
   در رندر سرور/هایدریشن false و پس از commit کلاینت true */
const emptySubscribe = () => () => {};

function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

function HeaderLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "text-sm transition-colors",
        active
          ? "font-medium text-primary"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const lines = useCartStore((state) => state.lines);
  const lastAddedAt = useCartStore((state) => state.lastAddedAt);
  const mounted = useMounted();

  const count = mounted ? cartCount(lines) : 0;
  const hours = brand.contact.hours[0];

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      {/* سطر ۱ — نوار اعلان و تماس (دسکتاپ) */}
      <div className="hidden border-b border-border/50 md:block">
        <div className="shell flex items-center justify-between gap-4 py-1.5 text-xs text-muted-foreground">
          {brand.announcementBar && <p>{brand.announcementBar}</p>}
          <div className="ms-auto flex items-center gap-4">
            {hours && (
              <span className="hidden lg:inline">
                {hours.days} {hours.time}
              </span>
            )}
            <a
              href={`tel:${brand.contact.phone}`}
              className="flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <Phone className="size-3.5" aria-hidden="true" />
              <span dir="ltr">{formatPhoneFa(brand.contact.phone)}</span>
            </a>
          </div>
        </div>
      </div>

      {/* سطر ۲ — هویت، جستجو، اکشن‌ها */}
      <div className="shell flex items-center gap-3 py-3 md:gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11 md:hidden"
          aria-label="باز کردن منو"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="size-5" aria-hidden="true" />
        </Button>

        <Link
          href="/"
          className="shrink-0 rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <Logo />
        </Link>

        <form
          action="/search"
          method="get"
          role="search"
          className="relative hidden max-w-xl flex-1 md:block"
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

        <div className="ms-auto flex items-center gap-1 md:gap-2">
          <ThemeToggle />

          <Button
            variant="ghost"
            size="icon"
            asChild
            className="rounded-full text-foreground hover:text-gold"
          >
            <Link href="/login" aria-label="حساب کاربری">
              <UserRound className="size-5" aria-hidden="true" />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            asChild
            className="relative rounded-full text-foreground hover:text-gold"
          >
            <Link href="/cart" aria-label="سبد خرید">
              <ShoppingBag className="size-5" aria-hidden="true" />
              {count > 0 && (
                <motion.span
                  key={lastAddedAt ?? "cart"}
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="absolute -top-1 -end-1 flex size-5 items-center justify-center rounded-full bg-gold text-[11px] font-bold text-gold-foreground"
                >
                  {toFa(count)}
                </motion.span>
              )}
            </Link>
          </Button>
        </div>
      </div>

      {/* سطر ۳ — ناوبری و مگامنو دسته‌ها (دسکتاپ) */}
      <div className="hidden border-t border-border/50 md:block">
        <div className="shell flex h-12 items-center gap-6">
          <NavigationMenu
            dir="rtl"
            viewport={false}
            aria-label="دسته‌بندی کالاها"
            className="flex-none justify-start"
          >
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="gap-2 rounded-lg bg-transparent px-3 text-foreground hover:bg-accent [&>svg:last-of-type]:size-3.5">
                  <LayoutGrid className="size-4" aria-hidden="true" />
                  دسته‌بندی کالاها
                </NavigationMenuTrigger>
                <NavigationMenuContent className="start-0 left-auto top-full mt-1.5 w-[37.5rem] max-w-[calc(100vw-2rem)] rounded-b-xl! border-border/70 p-0 pr-0 shadow-pop! md:w-[37.5rem] lg:w-[43rem]">
                  <div className="relative grid grid-cols-3 gap-x-8 gap-y-6 p-6">
                    <span
                      className="gold-hairline absolute inset-x-0 top-0"
                      aria-hidden="true"
                    />
                    {PREVIEW_CATEGORIES.map((category) => (
                      <div key={category.id} className="space-y-2.5">
                        <Link
                          href={`/products?category=${category.slug}`}
                          className="text-sm font-bold text-primary transition-colors hover:text-gold"
                        >
                          {category.title}
                        </Link>
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                          {category.children.map((child) => (
                            <Link
                              key={child.id}
                              href={`/products?category=${child.slug}`}
                              className="text-sm text-muted-foreground transition-colors hover:text-gold"
                            >
                              {child.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="col-span-3 border-t border-border/60 pt-4">
                      <Link
                        href="/products"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-gold transition-colors hover:text-gold-strong"
                      >
                        مشاهدهٔ همهٔ محصولات
                        <ArrowLeft className="size-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <nav className="flex items-center gap-6" aria-label="ناوبری اصلی">
            {NAV_LINKS.map((link) => (
              <HeaderLink key={link.href} href={link.href} label={link.label} />
            ))}
          </nav>
        </div>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
