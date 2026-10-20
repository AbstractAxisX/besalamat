"use client";

import Link from "next/link";
import {
  IconBrandInstagram,
  IconBrandTelegram,
  IconBrandWhatsapp,
  IconChevronDown,
  IconChevronLeft,
  IconPhone,
  IconSearch,
  IconX,
} from "@tabler/icons-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Logo } from "@/components/shared/brand-assets";
import { CategoryIcon } from "@/components/shared/category-icon";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { brand, SOCIAL_LABELS, type SocialConfig } from "@/config/brand";
import { formatPhoneFa } from "@/lib/format";
import { useSearchDialogStore } from "@/store/search";
import type { CategoryNode } from "@/types/shop";

const MAIN_LINKS = [
  { href: "/", label: "صفحهٔ اصلی" },
  { href: "/products", label: "همهٔ محصولات" },
  { href: "/products?discount=1", label: "تخفیف‌دارها" },
  { href: "/blog", label: "مجلهٔ سلامت" },
  { href: "/about", label: "دربارهٔ ما" },
  { href: "/contact", label: "تماس با ما" },
  { href: "/faq", label: "پرسش‌های متداول" },
  { href: "/login", label: "ورود / حساب من" },
] as const;

const SECTION_TITLE_CLASS = "px-1 pb-1 text-xs font-bold text-fresh-strong";

/** آیکون شبکهٔ اجتماعی — سه شبکهٔ اصلی با تبلر؛ شبکه‌های داخلی حرف اول نام */
function SocialIcon({ social }: { social: SocialConfig }) {
  switch (social.key) {
    case "telegram":
      return (
        <IconBrandTelegram
          className="size-4"
          stroke={1.75}
          aria-hidden="true"
        />
      );
    case "whatsapp":
      return (
        <IconBrandWhatsapp
          className="size-4"
          stroke={1.75}
          aria-hidden="true"
        />
      );
    case "instagram":
      return (
        <IconBrandInstagram
          className="size-4"
          stroke={1.75}
          aria-hidden="true"
        />
      );
    default:
      return (
        <span className="text-sm font-bold leading-none">
          {social.label.charAt(0)}
        </span>
      );
  }
}

/**
 * منوی موبایل — Sheet سمت راست (start در RTL)
 * ─────────────────────────────
 * جستجو دیالوگ سراسری را باز می‌کند و منو را می‌بندد؛
 * قفل اسکرول و Escape را خودِ Radix Sheet انجام می‌دهد.
 */
export function MobileMenu({
  open,
  onClose,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  /** درخت دسته‌ها — از سرویس DB-first (هدر می‌رساند) */
  categories: CategoryNode[];
}) {
  const openDialog = useSearchDialogStore((state) => state.openDialog);
  const activeSocials = brand.socials.filter(
    (social) => social.defaultHref !== "",
  );

  const handleSearch = () => {
    onClose();
    openDialog();
  };

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent
        aria-describedby={undefined}
        className="flex w-full flex-col gap-0 p-0 sm:max-w-[22rem] [&>button]:hidden"
      >
        {/* هدر منو — لوگو + تم + بستن */}
        <SheetHeader className="flex-row items-center justify-between gap-0 space-y-0 border-b border-border/60 px-5 py-3">
          <SheetTitle className="sr-only">منوی اصلی فروشگاه</SheetTitle>
          <Link
            href="/"
            onClick={onClose}
            className="rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <Logo />
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              onClick={onClose}
              aria-label="بستن منو"
              className="flex size-10 items-center justify-center rounded-full text-foreground outline-none transition-colors hover:bg-accent hover:text-primary focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <IconX className="size-5" stroke={1.75} aria-hidden="true" />
            </button>
          </div>
        </SheetHeader>

        {/* جستجو — دیالوگ سراسری */}
        <div className="px-5 pt-4">
          <button
            type="button"
            onClick={handleSearch}
            className="flex h-12 w-full items-center gap-2.5 rounded-full bg-muted/70 px-4 text-start text-sm text-muted-foreground transition-colors hover:bg-muted"
          >
            <IconSearch
              className="size-4.5 shrink-0"
              stroke={1.75}
              aria-hidden="true"
            />
            جستجو در فروشگاه…
          </button>
        </div>

        {/* بدنهٔ اسکرول‌شونده */}
        <div className="flex-1 overflow-y-auto px-5 pb-6">
          {/* لینک‌های اصلی */}
          <nav className="pt-4" aria-label="ناوبری موبایل">
            <p className={SECTION_TITLE_CLASS}>دسترسی سریع</p>
            <ul className="mt-1 space-y-0.5">
              {MAIN_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="flex min-h-11 items-center justify-between gap-2 rounded-xl px-3 text-sm font-medium text-foreground outline-none transition-colors hover:bg-secondary/70 hover:text-primary focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    {item.label}
                    <IconChevronLeft
                      className="size-4 shrink-0 text-muted-foreground"
                      stroke={1.75}
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* درخت دسته‌ها */}
          <nav className="pt-5" aria-label="دسته‌بندی کالاها">
            <p className={SECTION_TITLE_CLASS}>دسته‌بندی کالاها</p>
            <Accordion type="single" collapsible className="mt-1">
              {categories.map((category) =>
                category.children.length > 0 ? (
                  <AccordionItem
                    key={category.id}
                    value={category.slug}
                    className="border-border/50"
                  >
                    <AccordionTrigger className="group gap-3 py-1 text-start hover:no-underline [&>svg]:hidden">
                      <span className="flex min-h-11 w-full items-center gap-3 py-1">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                          <CategoryIcon
                            iconKey={category.iconKey}
                            className="size-5"
                          />
                        </span>
                        <span className="flex-1 text-start text-[15px] font-bold text-foreground">
                          {category.title}
                        </span>
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-transform duration-300 group-data-[state=open]:rotate-180">
                          <IconChevronDown
                            className="size-4"
                            stroke={1.75}
                            aria-hidden="true"
                          />
                        </span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-3">
                      <ul className="space-y-0.5 ps-12">
                        {category.children.map((child) => (
                          <li key={child.id}>
                            <Link
                              href={`/products?category=${child.slug}`}
                              onClick={onClose}
                              className="flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-[13px] text-muted-foreground outline-none transition-colors hover:bg-secondary/70 hover:text-primary focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                              <span
                                className="size-1.5 shrink-0 rounded-full bg-fresh/50"
                                aria-hidden="true"
                              />
                              {child.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ) : (
                  <div key={category.id} className="border-b border-border/50">
                    <Link
                      href={`/products?category=${category.slug}`}
                      onClick={onClose}
                      className="flex min-h-11 items-center gap-3 py-1 text-[15px] font-bold text-foreground outline-none transition-colors hover:text-primary focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                        <CategoryIcon
                          iconKey={category.iconKey}
                          className="size-5"
                        />
                      </span>
                      {category.title}
                    </Link>
                  </div>
                ),
              )}
            </Accordion>
          </nav>
        </div>

        {/* نوار پایین — شبکه‌ها + تماس */}
        <div className="space-y-3 border-t border-border/60 p-4">
          {activeSocials.length > 0 ? (
            <div className="flex items-center justify-center gap-2.5">
              {activeSocials.map((social) => (
                <a
                  key={social.key}
                  href={social.defaultHref}
                  aria-label={SOCIAL_LABELS[social.key]}
                  className="flex size-10 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-colors hover:border-fresh/60 hover:text-fresh"
                >
                  <SocialIcon social={social} />
                </a>
              ))}
            </div>
          ) : null}
          <a
            href={`tel:${brand.contact.phone}`}
            className="btn-metallic flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold"
          >
            <IconPhone className="size-4.5" stroke={1.75} aria-hidden="true" />
            <span dir="ltr">{formatPhoneFa(brand.contact.phone)}</span>
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}
