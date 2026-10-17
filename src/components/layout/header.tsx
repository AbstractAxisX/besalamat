"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BadgePercent,
  ChevronDown,
  Headset,
  LayoutGrid,
  Menu,
  Phone,
  Search,
  ShoppingBag,
  UserRound,
} from "lucide-react";

import { Logo, Pattern } from "@/components/shared/brand-assets";
import { CategoryIcon } from "@/components/shared/category-icon";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { brand } from "@/config/brand";
import { formatPhoneFa, toFa } from "@/lib/format";
import { PREVIEW_CATEGORIES } from "@/lib/preview-data";
import { cn } from "@/lib/utils";
import { cartCount, useCartStore } from "@/store/cart";

const NAV_LINKS = [
  { href: "/products", label: "فروشگاه" },
  { href: "/blog", label: "مجلهٔ سلامت" },
  { href: "/about", label: "دربارهٔ ما" },
  { href: "/contact", label: "تماس" },
] as const;

/* الگوی mounted — بدون setState در effect و بدون mismatch هایدریشن */
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
        "relative py-1 text-[13px] font-medium transition-colors",
        "after:absolute after:-bottom-0.5 after:start-0 after:h-0.5 after:rounded-full after:bg-gold after:transition-all after:duration-300",
        active
          ? "text-primary after:w-full"
          : "text-muted-foreground after:w-0 hover:text-foreground hover:after:w-full",
      )}
    >
      {label}
    </Link>
  );
}

/* ═══════════ پنل مگامنوی دسته‌ها ═══════════ */

function MegaPanel({ onClose }: { onClose: () => void }) {
  return (
    <>
      {/* پردهٔ محو زیر پنل — زیر هدر (z-40) قرار می‌گیرد */}
      <div
        className="fixed inset-0 z-40 bg-foreground/25 backdrop-blur-[2px]"
        aria-hidden="true"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        role="region"
        aria-label="دسته‌بندی کالاها"
        className="absolute inset-x-0 top-full z-50 border-b border-border/80 bg-card shadow-pop"
      >
        <span className="gold-hairline absolute inset-x-0 top-0" aria-hidden="true" />
        <div className="shell grid gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
          {/* شبکهٔ دسته‌ها */}
          <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2 xl:grid-cols-3">
            {PREVIEW_CATEGORIES.map((category) => (
              <div key={category.id} className="group py-3">
                <Link
                  href={`/products?category=${category.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <CategoryIcon iconKey={category.iconKey} className="size-5" />
                  </span>
                  <span className="flex-1 text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                    {category.title}
                  </span>
                  <ArrowLeft
                    className="size-4 -translate-x-1 text-gold opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </Link>
                {category.children.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 ps-[3.25rem]">
                    {category.children.map((child) => (
                      <Link
                        key={child.id}
                        href={`/products?category=${child.slug}`}
                        onClick={onClose}
                        className="text-xs text-muted-foreground transition-colors hover:text-primary"
                      >
                        {child.title}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {/* ستون تزئینی — مشاوره و میان‌بر */}
          <aside className="flex flex-col gap-4">
            <div className="bg-metallic relative flex-1 overflow-hidden rounded-2xl p-6 text-on-metallic">
              <Pattern className="text-gold opacity-[0.06]" />
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gold">
                <Headset className="size-3.5" aria-hidden="true" />
                مشاورهٔ تخصصی خرید
              </span>
              <p className="mt-3 text-lg leading-8 font-black">
                در انتخاب محصول مطمئن نیستید؟
              </p>
              <p className="mt-2 text-xs leading-6 text-on-metallic-muted">
                کارشناسان {brand.name} همراه شما هستند — قبل از خرید با ما
                مشورت کنید.
              </p>
              <a
                href={`tel:${brand.contact.phone}`}
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-full border border-gold/50 bg-gold/10 px-4 text-sm font-bold text-gold transition-colors hover:bg-gold hover:text-gold-foreground"
              >
                <Phone className="size-4" aria-hidden="true" />
                <span dir="ltr">{formatPhoneFa(brand.contact.phone)}</span>
              </a>
            </div>
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-xl border-border/80 font-medium"
            >
              <Link href="/products" onClick={onClose}>
                مشاهدهٔ همهٔ محصولات
                <ArrowLeft className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </aside>
        </div>
      </motion.div>
    </>
  );
}

/* ═══════════ هدر ═══════════ */

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const lines = useCartStore((state) => state.lines);
  const lastAddedAt = useCartStore((state) => state.lastAddedAt);
  const mounted = useMounted();

  const count = mounted ? cartCount(lines) : 0;
  const hours = brand.contact.hours[0];

  /* بستن مگا با تغییر مسیر — الگوی تنظیم state در رندر (بدون effect) */
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMegaOpen(false);
  }

  useEffect(() => {
    if (!megaOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMegaOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [megaOpen]);

  /* hover با تأخیر بسته‌شدن تا لرزش نداشته باشد */
  const openMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };
  const scheduleCloseMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMegaOpen(false), 120);
  };
  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-md">
      {/* ── سطر ۱ — نوار اعلان (سبز کاجی) ── */}
      <div className="hidden bg-pine text-on-metallic md:block">
        <div className="shell flex h-9 items-center justify-between text-[11px]">
          <p className="flex items-center gap-2">
            <span className="size-1 rounded-full bg-gold" aria-hidden="true" />
            {brand.announcementBar}
          </p>
          <div className="flex items-center gap-5 text-on-metallic-muted">
            {hours ? (
              <span className="hidden lg:inline">
                {hours.days} {hours.time}
              </span>
            ) : null}
            <a
              href={`tel:${brand.contact.phone}`}
              className="flex items-center gap-1.5 transition-colors hover:text-gold"
            >
              <Phone className="size-3.5" aria-hidden="true" />
              <span dir="ltr">{formatPhoneFa(brand.contact.phone)}</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── سطر ۲ — هویت، جستجو، اکشن‌ها ── */}
      <div className="shell flex items-center gap-3 py-3 md:h-[76px] md:py-0">
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

        {/* جستجو — دکمهٔ جستجوی داخلی برای برجستگی */}
        <form
          action="/search"
          method="get"
          role="search"
          className="group relative mx-auto hidden w-full max-w-2xl md:block"
        >
          <Search
            className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
            aria-hidden="true"
          />
          <Input
            type="search"
            name="q"
            placeholder="دنبال چه محصولی هستید؟ مثلاً فشارسنج…"
            aria-label="جستجو در فروشگاه"
            className="h-12 rounded-full border-transparent bg-muted/70 ps-12 pe-28 text-sm shadow-none transition-all duration-300 focus-visible:border-gold/50 focus-visible:bg-card focus-visible:ring-[3px] focus-visible:ring-gold/20"
          />
          <Button
            type="submit"
            className="absolute end-1.5 top-1.5 h-9 rounded-full px-6 text-xs font-bold"
          >
            جستجو
          </Button>
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

      {/* ── سطر ۳ — ناوبری + مگامنو (دسکتاپ) ── */}
      <div
        className="relative hidden border-t border-border/60 md:block"
        onMouseEnter={openMega}
        onMouseLeave={scheduleCloseMega}
      >
        <div className="shell flex h-12 items-center gap-7">
          <button
            type="button"
            aria-expanded={megaOpen}
            aria-haspopup="true"
            onClick={() => setMegaOpen(true)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] font-bold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
              megaOpen
                ? "text-primary"
                : "text-foreground hover:text-primary",
            )}
          >
            <LayoutGrid className="size-4" aria-hidden="true" />
            دسته‌بندی کالاها
            <ChevronDown
              className={cn(
                "size-3.5 text-muted-foreground transition-transform duration-300",
                megaOpen && "rotate-180",
              )}
              aria-hidden="true"
            />
          </button>

          <span
            className="h-5 w-px bg-border"
            aria-hidden="true"
          />

          <nav
            className="flex items-center gap-7"
            aria-label="ناوبری اصلی"
          >
            {NAV_LINKS.map((link) => (
              <HeaderLink key={link.href} href={link.href} label={link.label} />
            ))}
          </nav>

          <Link
            href="/products?discount=1"
            className="ms-auto flex items-center gap-1.5 text-[13px] font-bold text-gold transition-colors hover:text-gold-strong"
          >
            <BadgePercent className="size-4" aria-hidden="true" />
            تخفیف‌دارها
          </Link>
        </div>

        <AnimatePresence>
          {megaOpen ? <MegaPanel onClose={() => setMegaOpen(false)} /> : null}
        </AnimatePresence>
      </div>

      {/* ── جستجوی موبایل — لمس‌پذیر به‌شکل ورودی ── */}
      <div className="px-4 pb-3 md:hidden">
        <Link
          href="/search"
          className="flex h-11 items-center gap-2.5 rounded-full bg-muted/70 px-4 text-sm text-muted-foreground transition-colors active:bg-muted"
        >
          <Search className="size-4.5" aria-hidden="true" />
          جستجو در فروشگاه…
        </Link>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
