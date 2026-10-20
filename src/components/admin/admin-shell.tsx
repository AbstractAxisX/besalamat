"use client";

/**
 * پوستهٔ تمام‌صفحهٔ پنل ادمین — سایدبار راست RTL + نوار بالای چسبان
 * ─────────────────────────────
 * سایدبار shadcn با collapsible="icon" (دسکتاپ) و Sheet اورلی (موبایل)؛
 * نوار بالا: دکمهٔ باز/بستن + عنوان صفحهٔ جاری + تعویض پوسته + منوی کاربر (خروج).
 * کلاسیک و تمیز: کارت سفید، بوردر مویی، بدون شیشه‌ای/گرادیان.
 */

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  IconBuildingStore,
  IconCategory,
  IconDashboard,
  IconExternalLink,
  IconHeartbeat,
  IconHome,
  IconLogout,
  IconMail,
  IconMessageQuestion,
  IconNews,
  IconPackage,
  IconSettings,
  IconShoppingBag,
  IconUsers,
} from "@tabler/icons-react";

import { brand } from "@/config/brand";
import { formatPhoneFa, toFa } from "@/lib/format";
import { apiSend } from "@/components/admin/api";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

type TablerIcon = typeof IconDashboard;

interface NavItem {
  href: string;
  title: string;
  icon: TablerIcon;
}

interface NavGroup {
  label: string | null;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [{ href: "/admin", title: "میزکار", icon: IconDashboard }],
  },
  {
    label: "فروشگاه",
    items: [
      { href: "/admin/products", title: "محصولات", icon: IconPackage },
      { href: "/admin/orders", title: "سفارش‌ها", icon: IconShoppingBag },
      { href: "/admin/users", title: "کاربران", icon: IconUsers },
    ],
  },
  {
    label: "محتوا",
    items: [
      { href: "/admin/home", title: "صفحهٔ اصلی", icon: IconHome },
      { href: "/admin/articles", title: "مقالات", icon: IconNews },
      { href: "/admin/faqs", title: "پرسش‌های متداول", icon: IconMessageQuestion },
      { href: "/admin/messages", title: "پیام‌ها", icon: IconMail },
    ],
  },
  {
    label: "سیستم",
    items: [
      { href: "/admin/categories", title: "دسته‌بندی‌ها", icon: IconCategory },
      { href: "/admin/brands", title: "برندها", icon: IconBuildingStore },
      { href: "/admin/settings", title: "تنظیمات", icon: IconSettings },
    ],
  },
];

/** عنوان نوار بالا از روی مسیر */
const TOPBAR_TITLES: readonly (readonly [string, string])[] = [
  ["/admin/products", "مدیریت محصولات"],
  ["/admin/orders", "مدیریت سفارش‌ها"],
  ["/admin/users", "مدیریت کاربران"],
  ["/admin/home", "صفحهٔ اصلی فروشگاه"],
  ["/admin/articles", "مقالات"],
  ["/admin/faqs", "پرسش‌های متداول"],
  ["/admin/messages", "پیام‌ها"],
  ["/admin/categories", "دسته‌بندی‌ها"],
  ["/admin/brands", "برندها"],
  ["/admin/settings", "تنظیمات"],
];

function topbarTitle(pathname: string): string {
  for (const [prefix, title] of TOPBAR_TITLES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return title;
  }
  return "میزکار";
}

interface AdminShellProps {
  user: { name: string; phone: string };
  children: React.ReactNode;
}

export function AdminShell({ user, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const isActive = (href: string) =>
    href === "/admin"
      ? pathname === "/admin"
      : pathname === href || pathname.startsWith(`${href}/`);

  /* خروج — ابطال سشن در سرور و بازگشت به ورود ادمین */
  async function handleLogout(): Promise<void> {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await apiSend("/api/auth/logout", "POST");
      toast.success("از حساب مدیریت خارج شدید");
      router.replace("/login?admin=1");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "خروج ناموفق بود");
      setLoggingOut(false);
    }
  }

  return (
    <SidebarProvider>
      {/* ── سایدبار (راست — جهت شروع در RTL) ── */}
      <Sidebar side="right" collapsible="icon">
        {/* هدر: نشان برند + نام پنل */}
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                asChild
                tooltip={{ children: `${brand.name} — پنل مدیریت`, side: "left" }}
              >
                <Link href="/admin">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <IconHeartbeat className="size-5" stroke={1.75} aria-hidden="true" />
                  </div>
                  <div className="grid flex-1 text-start leading-tight">
                    <span className="truncate text-base font-black">{brand.name}</span>
                    <span className="truncate text-xs font-medium text-sidebar-foreground/60">
                      پنل مدیریت فروشگاه
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* بدنه: گروه‌های ناوبری */}
        <SidebarContent>
          {NAV_GROUPS.map((group) => (
            <SidebarGroup key={group.label ?? "root"}>
              {group.label ? <SidebarGroupLabel>{group.label}</SidebarGroupLabel> : null}
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.href)}
                        tooltip={{ children: item.title, side: "left" }}
                      >
                        <Link href={item.href}>
                          <item.icon stroke={1.75} className="size-4.5" aria-hidden="true" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        {/* پاصفحه: کارت فروشگاه + کاربر + خروج */}
        <SidebarFooter>
          <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/60 p-2.5 group-data-[collapsible=icon]:hidden">
            <p className="text-xs font-medium text-sidebar-foreground/60">
              فروشگاه <span className="font-black text-sidebar-foreground">{brand.name}</span>
            </p>
            <Separator className="my-2 bg-sidebar-border" />
            <div className="flex items-center gap-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sm font-black text-sidebar-primary-foreground">
                {user.name.trim().charAt(0) || "؟"}
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-bold">{user.name}</p>
                <p dir="ltr" className="truncate text-start text-[11px] text-sidebar-foreground/60">
                  {formatPhoneFa(user.phone)}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={loggingOut}
              onClick={() => void handleLogout()}
              className="mt-2 w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <IconLogout className="size-4" stroke={1.75} aria-hidden="true" />
              خروج از حساب
            </Button>
          </div>
          {/* حالت جمع‌شده: فقط دکمهٔ خروج آیکونی */}
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={{ children: "خروج از حساب", side: "left" }}
                disabled={loggingOut}
                onClick={() => void handleLogout()}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <IconLogout className="size-4.5" stroke={1.75} aria-hidden="true" />
                <span>خروج از حساب</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      {/* ── ناحیهٔ محتوا (چپ) ── */}
      <SidebarInset>
        {/* نوار بالای چسبان */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-card/90 px-4 backdrop-blur md:px-6">
          <SidebarTrigger className="size-8 shrink-0" />
          <Separator orientation="vertical" className="!h-4 shrink-0" />
          <div className="flex min-w-0 items-baseline gap-2">
            <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
              پنل مدیریت
            </span>
            <span className="hidden text-muted-foreground/50 sm:inline" aria-hidden="true">
              /
            </span>
            <h2 className="truncate text-sm font-bold">{topbarTitle(pathname)}</h2>
          </div>
          <div className="flex-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            asChild
            className="hidden gap-1.5 text-muted-foreground md:flex"
          >
            <Link href="/" target="_blank" rel="noreferrer">
              مشاهدهٔ فروشگاه
              <IconExternalLink className="size-4" stroke={1.75} aria-hidden="true" />
            </Link>
          </Button>
          <ThemeToggle />
          {/* منوی کاربر */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="size-9 gap-2 rounded-full px-0 md:px-2"
                aria-label="منوی کاربر"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-black text-primary-foreground">
                  {user.name.trim().charAt(0) || "؟"}
                </span>
                <span className="hidden max-w-32 truncate text-sm font-medium md:inline">
                  {user.name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col gap-0.5">
                <span className="font-bold">{user.name}</span>
                <span
                  dir="ltr"
                  className="text-start text-xs font-normal text-muted-foreground"
                >
                  {formatPhoneFa(user.phone)}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/" target="_blank" rel="noreferrer" className="gap-2">
                  <IconExternalLink className="size-4" stroke={1.75} aria-hidden="true" />
                  مشاهدهٔ فروشگاه
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={loggingOut}
                onClick={() => void handleLogout()}
                className="gap-2 text-destructive focus:text-destructive"
              >
                <IconLogout className="size-4" stroke={1.75} aria-hidden="true" />
                خروج از حساب
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* محتوای صفحهٔ جاری — تمام‌عرض سیال با فوتر چسبیده به کف */}
        <div className="flex flex-1 flex-col">
          <main id="main" className="mx-auto w-full max-w-[1500px] flex-1 p-4 md:p-6">
            {children}
          </main>
          <footer className="mt-auto border-t bg-card px-4 py-3 text-center text-xs text-muted-foreground md:px-6">
            پنل مدیریت {brand.name} — {toFa(new Date().getFullYear())}
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
