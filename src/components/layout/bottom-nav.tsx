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
 * ناوبری پایین موبایل — پنج اسلات
 * ─────────────────────────────
 * «دسته‌بندی‌ها» منوی موبایل را باز می‌کند و «جستجو» دیالوگ سراسری را؛
 * حالت فعال: متن سبز تازه + نقطهٔ کوچک زیر آیکون (انیمیشن layoutId).
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
      <div className="glass fixed inset-x-0 bottom-0 z-40 border-t border-border/70 pb-[env(safe-area-inset-bottom)] md:hidden">
        <nav
          className="grid h-16 grid-cols-5 items-center"
          aria-label="ناوبری پایین"
        >
          {items.map((item) => {
            const Icon = item.icon;

            const content = (
              <>
                <span className="relative">
                  <Icon
                    className="size-5"
                    stroke={1.75}
                    aria-hidden="true"
                  />
                  {item.badge != null && item.badge > 0 ? (
                    <span className="absolute -top-1.5 -end-1.5 flex size-[18px] items-center justify-center rounded-full bg-fresh text-[10px] font-bold text-primary-foreground">
                      {toFa(item.badge)}
                    </span>
                  ) : null}
                </span>
                {item.active ? (
                  <motion.span
                    layoutId="bottom-nav-dot"
                    transition={{ type: "spring", stiffness: 480, damping: 40 }}
                    className="size-1 rounded-full bg-fresh"
                    aria-hidden="true"
                  />
                ) : (
                  <span className="size-1" aria-hidden="true" />
                )}
                <span className="text-[10px] font-medium leading-none">
                  {item.label}
                </span>
              </>
            );

            const className = cn(
              "relative flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg px-1 outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
              item.active
                ? "text-fresh"
                : "text-muted-foreground hover:text-foreground",
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
                aria-expanded={item.label === "دسته‌بندی‌ها" ? menuOpen : undefined}
                className={className}
              >
                {content}
              </button>
            );
          })}
        </nav>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
