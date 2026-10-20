"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconArrowLeft,
  IconChevronLeft,
  IconLayoutGrid,
} from "@tabler/icons-react";

import { CategoryIcon } from "@/components/shared/category-icon";
import { formatTomanPlain, toFa } from "@/lib/format";
import { PREVIEW_CATEGORIES, PREVIEW_PRODUCTS } from "@/lib/preview-data";
import { cn } from "@/lib/utils";
import type { CategoryNode, ProductSummary } from "@/types/shop";

interface MegaMenuProps {
  /** باز/بسته — کنترل کامل با هدر (باز شدن فقط با هاور/فوکوس/کلیکِ دکمهٔ دسته‌ها) */
  open: boolean;
  onClose: () => void;
}

const FIRST_CATEGORY_SLUG = PREVIEW_CATEGORIES[0]?.slug ?? "";

/** پیشنهادهای دستهٔ فعال — خودِ دسته یا هر یک از زیردسته‌ها؛ حداکثر ۳ قلم */
function pickSuggestions(category: CategoryNode | undefined): ProductSummary[] {
  if (!category) return [];
  const slugs = new Set<string>([
    category.slug,
    ...category.children.map((child) => child.slug),
  ]);
  return PREVIEW_PRODUCTS.filter(
    (product) => product.categorySlug != null && slugs.has(product.categorySlug),
  ).slice(0, 3);
}

/**
 * مگامنوی سه‌سطحی دسته‌ها
 * ─────────────────────────────
 * پنل هم‌عرضِ ظرف سایت (نه تمام‌صفحه) است و داخل سطر ناوبریِ هدر لنگر می‌گیرد.
 * هاور روی خود پنل آن را باز نگه می‌دارد — مدیریت تایمرِ بسته‌شدن (۱۵۰ms) با هدر است
 * و رویدادهای ماوس از طریق همان والدِ مشترک به اینجا می‌رسند.
 * ⚠️ رپرِ تمام‌عرض عمداً pointer-events-none است و فقط کارت داخلی
 * pointer-events-auto — وگرنه خروج ماوس از چپ/راستِ کارتِ مرئی هنوز داخلِ
 * نوارِ نامرئیِ رپر محسوب می‌شد و منو باز می‌ماند (باگ گزارش‌شده).
 * پس‌زمینهٔ کارت شیشه‌ای (glass-strong) — بلور عمیق روی محتوای صفحه.
 * پردهٔ محو با پورتال به body رندر می‌شود تا از زمینهٔ stacking هدر (backdrop-blur)
 * بیرون بماند؛ چون pointer-events ندارد، کلیک بیرون با شنوندهٔ document بسته می‌شود.
 */
export function MegaMenu({ open, onClose }: MegaMenuProps) {
  const [activeSlug, setActiveSlug] = useState<string>(FIRST_CATEGORY_SLUG);
  const panelRef = useRef<HTMLDivElement>(null);

  /* با هر باز شدن، دستهٔ فعال به نخستین دسته برمی‌گردد (تنظیم در رندر،
     بدون effect؛ در زمانِ بسته‌شدن دست نمی‌زنیم تا خروجیِ انیمیشن تازه نماند) */
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) setActiveSlug(FIRST_CATEGORY_SLUG);
  }

  /* کلیک بیرون از پنل می‌بندد (پرده فقط نمایشی است).
     کلیک روی خودِ دکمهٔ دسته‌ها (data-mega-trigger) نادیده گرفته می‌شود تا
     چرخهٔ focus-open → click بلافاصله منو را نبندد. */
  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (
        target instanceof Element &&
        target.closest("[data-mega-trigger]") != null
      ) {
        return;
      }
      if (
        panelRef.current != null &&
        !panelRef.current.contains(target)
      ) {
        onClose();
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [open, onClose]);

  const activeCategory =
    PREVIEW_CATEGORIES.find((category) => category.slug === activeSlug) ??
    PREVIEW_CATEGORIES[0];

  const suggestions = useMemo(
    () => pickSuggestions(activeCategory),
    [activeCategory],
  );

  const subCategoryCount = useMemo(
    () =>
      PREVIEW_CATEGORIES.reduce(
        (total, category) => total + category.children.length,
        0,
      ),
    [],
  );

  return (
    <AnimatePresence>
      {open ? (
        <>
          {/* پردهٔ محو — عمقِ صفحه بدون پترن؛ پورتال به body */}
          {createPortal(
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="pointer-events-none fixed inset-0 z-40 bg-foreground/20 backdrop-blur-[2px]"
              aria-hidden="true"
            />,
            document.body,
          )}

          {/* پنل — لنگر به سطر ناوبری هدر؛ کارتِ داخلی هم‌عرضِ ظرف سایت (نه تمام‌صفحه).
              رپر عمداً برای ماوس نامرئی است (pointer-events-none) تا خروج از هر چهار
              جهتِ کارتِ مرئی — از جمله چپ و راست — بلافاصله منو را ببندد. */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            role="region"
            aria-label="دسته‌بندی کالاها"
            className="pointer-events-none absolute inset-x-0 top-full z-50"
          >
            <div
              ref={panelRef}
              className="glass-strong pointer-events-auto mx-auto w-full max-w-[1440px] overflow-hidden rounded-b-3xl border-b border-border border-t-2 border-t-fresh/70 shadow-pop"
            >
              <div className="shell py-6">
                <div className="grid gap-8 md:grid-cols-[13rem_minmax(0,1fr)] lg:max-h-[min(30rem,70vh)] lg:grid-cols-[15rem_minmax(0,1fr)_18rem] lg:overflow-hidden">
                  {/* ستون الف — فهرست دسته‌های اصلی */}
                  <nav aria-label="دسته‌های اصلی" className="min-w-0">
                    <ul className="max-h-[26rem] space-y-1 overflow-y-auto pe-1">
                      {PREVIEW_CATEGORIES.map((category) => {
                        const isActive =
                          activeCategory != null &&
                          category.slug === activeCategory.slug;
                        return (
                          <li key={category.id}>
                            <Link
                              href={`/products?category=${category.slug}`}
                              onClick={onClose}
                              onMouseEnter={() => setActiveSlug(category.slug)}
                              onFocus={() => setActiveSlug(category.slug)}
                              className={cn(
                                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring",
                                isActive
                                  ? "bg-secondary text-primary"
                                  : "text-foreground hover:bg-secondary/60 hover:text-primary",
                              )}
                            >
                              <span
                                className={cn(
                                  "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
                                  isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-accent text-primary",
                                )}
                              >
                                <CategoryIcon
                                  iconKey={category.iconKey}
                                  className="size-5"
                                />
                              </span>
                              <span className="min-w-0 flex-1 truncate">
                                {category.title}
                              </span>
                              <IconChevronLeft
                                className={cn(
                                  "size-4 shrink-0 text-muted-foreground transition-opacity duration-200",
                                  isActive ? "opacity-100" : "opacity-0",
                                )}
                                stroke={1.75}
                                aria-hidden="true"
                              />
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>

                  {/* ستون ب — زیردسته‌های دستهٔ فعال */}
                  {activeCategory ? (
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-3">
                        <h3 className="text-base font-black text-foreground">
                          {activeCategory.title}
                        </h3>
                        <Link
                          href={`/products?category=${activeCategory.slug}`}
                          onClick={onClose}
                          className="flex shrink-0 items-center gap-1 text-xs font-semibold text-fresh-strong transition-colors hover:underline"
                        >
                          مشاهدهٔ همه
                          <IconArrowLeft
                            className="size-3.5"
                            stroke={1.75}
                            aria-hidden="true"
                          />
                        </Link>
                      </div>

                      {activeCategory.children.length > 0 ? (
                        <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1">
                          {activeCategory.children.map((child) => (
                            <li key={child.id}>
                              <Link
                                href={`/products?category=${child.slug}`}
                                onClick={onClose}
                                className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-muted-foreground transition-colors duration-200 hover:bg-secondary/60 hover:text-primary"
                              >
                                <span
                                  className="size-1.5 shrink-0 rounded-full bg-fresh/50 transition-colors duration-200 group-hover:bg-fresh"
                                  aria-hidden="true"
                                />
                                {child.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-6 text-[13px] leading-6 text-muted-foreground">
                          زیردسته‌ای برای «{activeCategory.title}» ثبت نشده
                          است؛ همهٔ محصولات این دسته را ببینید.
                        </p>
                      )}
                    </div>
                  ) : null}

                  {/* ستون ج — پیشنهاد این دسته */}
                  {suggestions.length > 0 ? (
                    <aside
                      className="hidden min-w-0 lg:block"
                      aria-label="پیشنهاد این دسته"
                    >
                      <p className="text-xs font-bold text-muted-foreground">
                        پیشنهاد این دسته
                      </p>
                      <ul className="mt-3 space-y-2.5">
                        {suggestions.map((product) => (
                          <li key={product.id}>
                            <Link
                              href={`/products/${product.slug}`}
                              onClick={onClose}
                              className="flex items-center gap-3 rounded-xl border border-border/60 p-2.5 outline-none transition-colors duration-200 hover:border-fresh/50 focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <span className="img-canvas relative size-14 shrink-0 overflow-hidden rounded-lg">
                                <Image
                                  src={product.image}
                                  alt={product.title}
                                  fill
                                  sizes="56px"
                                  className="object-contain"
                                />
                              </span>
                              <span className="min-w-0">
                                <span className="line-clamp-2 block text-xs font-semibold leading-5 text-foreground">
                                  {product.title}
                                </span>
                                {product.inStock ? (
                                  <span className="mt-1 block text-[11px] font-black text-primary">
                                    {formatTomanPlain(product.price)} تومان
                                  </span>
                                ) : (
                                  <span className="mt-1 block text-[11px] font-bold text-muted-foreground">
                                    ناموجود
                                  </span>
                                )}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </aside>
                  ) : null}
                </div>

                {/* نوار پایانی پنل */}
                <div className="mt-5 flex items-center justify-between gap-4 border-t border-border/60 pt-4">
                  <Link
                    href="/products"
                    onClick={onClose}
                    className="flex items-center gap-1.5 text-xs font-bold text-fresh-strong transition-colors hover:underline"
                  >
                    <IconLayoutGrid
                      className="size-4"
                      stroke={1.75}
                      aria-hidden="true"
                    />
                    همهٔ دسته‌بندی‌ها
                  </Link>
                  <p className="text-[11px] text-muted-foreground">
                    {toFa(PREVIEW_CATEGORIES.length)} دستهٔ اصلی و{" "}
                    {toFa(subCategoryCount)} زیردسته
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
