"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  IconCategory2,
  IconChevronDown,
  IconDiscount,
  IconMenu2,
  IconPhone,
  IconSearch,
  IconShoppingBag,
  IconUserCircle,
} from "@tabler/icons-react";

import { Logo } from "@/components/shared/brand-assets";
import { MegaMenu } from "@/components/layout/mega-menu";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { brand } from "@/config/brand";
import { formatPhoneFa, toFa } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useSearchDialogStore } from "@/store/search";
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
        "after:absolute after:-bottom-0.5 after:start-0 after:h-0.5 after:rounded-full after:bg-fresh after:transition-all after:duration-300",
        active
          ? "text-primary after:w-full"
          : "text-muted-foreground after:w-0 hover:text-foreground hover:after:w-full",
      )}
    >
      {label}
    </Link>
  );
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const openDialog = useSearchDialogStore((state) => state.openDialog);
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

  const closeMega = useCallback(() => setMegaOpen(false), []);

  /* Escape */
  useEffect(() => {
    if (!megaOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMegaOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [megaOpen]);

  /* هاور فقط روی دکمهٔ «دسته‌بندی کالاها» و خودِ پنل — نه کل نوار ناوبری.
     والدِ مشترک (div پایین) دکمه و پنل را در بر می‌گیرد؛ بسته‌شدن با تأخیر ۱۵۰ms
     تا عبور ماوس از فاصلهٔ دکمه تا پنل لرزش ایجاد نکند. */
  const openMega = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(true);
  }, []);
  const scheduleCloseMega = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMegaOpen(false), 150);
  }, []);
  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/75 backdrop-blur-xl">
      {/* ── سطر ۱ — نوار اعلان (سبز کاجی، دسکتاپ) ── */}
      <div className="hidden bg-pine text-on-metallic md:block">
        <div className="shell flex h-9 items-center justify-between text-[11px]">
          {brand.announcementBar ? (
            <p className="flex items-center gap-2">
              <span
                className="size-1 animate-pulse-soft rounded-full bg-fresh"
                aria-hidden="true"
              />
              {brand.announcementBar}
            </p>
          ) : (
            <span aria-hidden="true" />
          )}
          <div className="flex items-center gap-5 text-on-metallic-muted">
            {hours ? (
              <span className="hidden lg:inline">
                {hours.days} {hours.time}
              </span>
            ) : null}
            <a
              href={`tel:${brand.contact.phone}`}
              className="flex items-center gap-1.5 transition-colors hover:text-fresh"
            >
              <IconPhone
                className="size-3.5"
                stroke={1.75}
                aria-hidden="true"
              />
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
          <IconMenu2 className="size-5" stroke={1.75} aria-hidden="true" />
        </Button>

        <Link
          href="/"
          className="shrink-0 rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <Logo />
        </Link>

        {/* جستجو — دکمه‌ای به شکل ورودی که دیالوگ سراسری را باز می‌کند */}
        <button
          type="button"
          onClick={openDialog}
          aria-label="جستجو در فروشگاه"
          className="group relative mx-auto hidden h-12 w-full max-w-2xl cursor-text items-center gap-3 rounded-full border border-transparent bg-muted/70 ps-12 pe-4 text-start outline-none transition-colors duration-300 hover:border-fresh/40 focus-visible:border-fresh/40 focus-visible:ring-[3px] focus-visible:ring-ring/30 md:flex"
        >
          <IconSearch
            className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-hover:text-primary"
            stroke={1.75}
            aria-hidden="true"
          />
          <span className="truncate text-sm text-muted-foreground">
            دنبال چه محصولی هستید؟ مثلاً فشارسنج…
          </span>
          <kbd
            dir="ltr"
            className="ms-auto hidden shrink-0 rounded-md border border-border bg-card px-2 py-0.5 font-sans text-[10px] font-medium text-muted-foreground lg:block"
          >
            ⌘K
          </kbd>
        </button>

        <div className="ms-auto flex items-center gap-1 md:gap-2">
          <ThemeToggle />

          <Button
            variant="ghost"
            size="icon"
            asChild
            className="size-10 rounded-full text-foreground hover:text-fresh"
          >
            <Link href="/login" aria-label="حساب کاربری">
              <IconUserCircle
                className="size-5"
                stroke={1.75}
                aria-hidden="true"
              />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            asChild
            className="relative size-10 rounded-full text-foreground hover:text-fresh"
          >
            <Link href="/cart" aria-label="سبد خرید">
              <IconShoppingBag
                className="size-5"
                stroke={1.75}
                aria-hidden="true"
              />
              {count > 0 && (
                <motion.span
                  key={lastAddedAt ?? "cart"}
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="absolute -top-1 -end-1 flex size-5 items-center justify-center rounded-full bg-fresh text-[11px] font-bold text-primary-foreground"
                >
                  {toFa(count)}
                </motion.span>
              )}
            </Link>
          </Button>
        </div>
      </div>

      {/* ── سطر ۳ — ناوبری + مگامنو (دسکتاپ) ── */}
      <div className="relative hidden border-t border-border/60 md:block">
        <div className="shell flex h-12 items-center gap-7">
          {/* ناحیهٔ هاور: فقط دکمهٔ دسته‌ها + خودِ پنل (رفع باگ بازشدن با هاور کل نوار).
              self-stretch ارتفاع ناحیه را تا انتهای سطر می‌کشد تا «ناحیهٔ مردهٔ»
              بین دکمه و پنل وجود نداشته باشد و عبور ماوس به پنل هرگز منو را نبندد. */}
          <div
            className="flex self-stretch items-center"
            onMouseEnter={openMega}
            onMouseLeave={scheduleCloseMega}
          >
            <button
              type="button"
              aria-expanded={megaOpen}
              aria-haspopup="true"
              data-mega-trigger=""
              onClick={() => setMegaOpen(true)}
              onFocus={openMega}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                megaOpen
                  ? "text-primary"
                  : "text-foreground hover:text-primary",
              )}
            >
              <IconCategory2
                className="size-4"
                stroke={1.75}
                aria-hidden="true"
              />
              دسته‌بندی کالاها
              <IconChevronDown
                className={cn(
                  "size-3.5 text-muted-foreground transition-transform duration-300",
                  megaOpen && "rotate-180",
                )}
                stroke={1.75}
                aria-hidden="true"
              />
            </button>

            <MegaMenu open={megaOpen} onClose={closeMega} />
          </div>

          <span className="h-5 w-px bg-border" aria-hidden="true" />

          <nav className="flex items-center gap-7" aria-label="ناوبری اصلی">
            {NAV_LINKS.map((link) => (
              <HeaderLink key={link.href} href={link.href} label={link.label} />
            ))}
          </nav>

          <Link
            href="/products?discount=1"
            className="ms-auto flex items-center gap-1.5 text-[13px] font-bold text-fresh-strong transition-colors hover:text-fresh"
          >
            <IconDiscount
              className="size-4"
              stroke={1.75}
              aria-hidden="true"
            />
            تخفیف‌دارها
          </Link>
        </div>
      </div>

      {/* ── جستجوی موبایل — دکمهٔ لمس‌پذیر به شکل ورودی ── */}
      <div className="px-4 pb-3 md:hidden">
        <button
          type="button"
          onClick={openDialog}
          className="flex h-11 w-full items-center gap-2.5 rounded-full bg-muted/70 px-4 text-start text-sm text-muted-foreground transition-colors active:bg-muted"
        >
          <IconSearch
            className="size-4.5 shrink-0"
            stroke={1.75}
            aria-hidden="true"
          />
          جستجو در فروشگاه…
        </button>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
