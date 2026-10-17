"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Search, ShoppingBag, Store, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { toFa } from "@/lib/format";
import { cn } from "@/lib/utils";
import { cartCount, useCartStore } from "@/store/cart";

interface BottomNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
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

const ITEMS: BottomNavItem[] = [
  { href: "/", label: "خانه", icon: Home, isActive: (p) => p === "/" },
  {
    href: "/products",
    label: "فروشگاه",
    icon: Store,
    isActive: (p) => p.startsWith("/products"),
  },
  {
    href: "/cart",
    label: "سبد",
    icon: ShoppingBag,
    isActive: (p) => p.startsWith("/cart"),
  },
  {
    href: "/login",
    label: "حساب من",
    icon: UserRound,
    isActive: (p) => p.startsWith("/login") || p.startsWith("/account"),
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const lines = useCartStore((state) => state.lines);
  const mounted = useMounted();

  const count = mounted ? cartCount(lines) : 0;
  /* آیتم‌های کناری در دو نیمهٔ چپ/راست می‌نشینند و جستجو وسط است */
  const [startItems, endItems] = [
    ITEMS.slice(0, 2),
    ITEMS.slice(2),
  ];

  const renderItem = (item: BottomNavItem) => {
    const active = item.isActive(pathname);
    const Icon = item.icon;

    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "relative flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg px-2 outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
          active
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {active ? (
          <motion.span
            layoutId="bottom-nav-active"
            className="absolute top-0 mx-auto h-0.5 w-6 rounded-full bg-gold"
            aria-hidden="true"
            transition={{ type: "spring", stiffness: 480, damping: 40 }}
          />
        ) : null}
        <span className="relative">
          <Icon className="size-5" aria-hidden="true" />
          {item.href === "/cart" && count > 0 ? (
            <span className="absolute -top-1.5 -end-1.5 flex size-[18px] items-center justify-center rounded-full bg-gold text-[10px] font-bold text-gold-foreground">
              {toFa(count)}
            </span>
          ) : null}
        </span>
        <span className="text-[11px] leading-none">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <nav
        className="grid h-16 grid-cols-[1fr_1fr_auto_1fr_1fr] items-center"
        aria-label="ناوبری پایین"
      >
        {startItems.map(renderItem)}

        {/* دکمهٔ مرکزی جستجو */}
        <Link
          href="/search"
          aria-label="جستجو در فروشگاه"
          className="mx-2 flex size-14 -translate-y-4 items-center justify-center rounded-full bg-metallic text-on-metallic outline-none transition-all duration-300 hover:brightness-110 focus-visible:ring-[3px] focus-visible:ring-ring/60"
          style={{ boxShadow: "0 10px 24px -10px rgba(12,59,46,0.5)" }}
        >
          <span
            className="absolute inset-0 rounded-full border border-gold/40"
            aria-hidden="true"
          />
          <Search className="size-6" aria-hidden="true" />
        </Link>

        {endItems.map(renderItem)}
      </nav>
    </div>
  );
}
