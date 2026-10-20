"use client";

import { useSyncExternalStore, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  IconCategory2,
  IconHome,
  IconSearch,
  IconShoppingBag,
  IconUser,
} from "@tabler/icons-react";
import type { TablerIcon } from "@tabler/icons-react";

import { MobileMenu } from "@/components/layout/mobile-menu";
import { toFa } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useSearchDialogStore } from "@/store/search";
import { cartCount, useCartStore } from "@/store/cart";

interface BottomNavItem {
  label: string;
  icon: TablerIcon;
  active: boolean;
  /** مسیر لینک — نبودنش یعنی دکمهٔ اکشن است */
  href?: string;
  onClick?: () => void;
  /** نشانگر تعداد (سبد خرید) */
  badge?: number;
}

/* الگوی mounted — بدون setState در effect و بدون mismatch هایدریشن */
const emptySubscribe = () => () => {};

function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

/**
 * داک شناور پایین موبایل — شیشهٔ لوکس
 * ─────────────────────────────
 * به‌جای نوار چسبیدهٔ تمام‌عرض، یک داک شناورِ گِرد با بلور عمیق
 * (glass-strong) که محتوا از زیرش رد می‌شود و لبه‌هایش دیده می‌شود.
 * حالت فعال: پیل سبزفامِ لغزان (layoutId) پشت آیکون + متن سبز تازه.
 */
export function BottomNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const openDialog = useSearchDialogStore((state) => state.openDialog);
  const lines = useCartStore((state) => state.lines);
  const mounted = useMounted();

  const count = mounted ? cartCount(lines) : 0;

  const items: BottomNavItem[] = [
    {
      label: "خانه",
      icon: IconHome,
      active: pathname === "/",
      href: "/",
    },
    {
      label: "دسته‌بندی‌ها",
      icon: IconCategory2,
      active: pathname.startsWith("/products"),
      onClick: () => setMenuOpen(true),
    },
    {
      label: "جستجو",
      icon: IconSearch,
      active: false,
      onClick: openDialog,
    },
    {
      label: "سبد خرید",
      icon: IconShoppingBag,
      active: pathname.startsWith("/cart"),
      href: "/cart",
      badge: count,
    },
    {
      label: "حساب",
      icon: IconUser,
      active:
        pathname.startsWith("/login") || pathname.startsWith("/account"),
      href: "/login",
    },
  ];

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
        <nav
          aria-label="ناوبری پایین"
          className="glass-strong relative overflow-hidden rounded-[1.4rem] border border-border/60 shadow-lift"
        >
          {/* هایلایت داخلی — درخشش لبهٔ شیشه */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-l from-transparent via-white/60 to-transparent dark:via-white/10"
          />

          <div className="grid h-16 grid-cols-5 items-center">
            {items.map((item) => {
              const Icon = item.icon;

              const content = (
                <>
                  {/* پیل فعال — بین آیتم‌ها می‌لغزد */}
                  {item.active ? (
                    <motion.span
                      layoutId="bottom-nav-pill"
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 34,
                      }}
                      className="absolute inset-x-1.5 top-1.5 h-9 rounded-full bg-secondary shadow-soft"
                      aria-hidden="true"
                    />
                  ) : null}

                  <span className="relative flex size-9 items-center justify-center">
                    <Icon
                      className={cn(
                        "size-5 transition-colors duration-300",
                        item.active
                          ? "text-primary"
                          : "text-muted-foreground",
                      )}
                      stroke={1.75}
                      aria-hidden="true"
                    />
                    {item.badge != null && item.badge > 0 ? (
                      <span className="absolute -top-0.5 -end-1 flex size-[17px] items-center justify-center rounded-full bg-fresh text-[9px] font-bold text-primary-foreground ring-2 ring-card">
                        {toFa(item.badge)}
                      </span>
                    ) : null}
                  </span>

                  <span
                    className={cn(
                      "relative mt-0.5 text-[10px] font-medium leading-none transition-colors duration-300",
                      item.active
                        ? "text-fresh-strong dark:text-fresh"
                        : "text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </span>
                </>
              );

              const className = cn(
                "relative flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl px-1 outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
              );

              return item.href ? (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={item.active ? "page" : undefined}
                  className={className}
                >
                  {content}
                </Link>
              ) : (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.onClick}
                  aria-label={item.label}
                  aria-expanded={
                    item.label === "دسته‌بندی‌ها" ? menuOpen : undefined
                  }
                  className={className}
                >
                  {content}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
