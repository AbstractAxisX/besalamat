"use client";

/**
 * مدیریت صفحهٔ اصلی فروشگاه — ۵ تب
 * ─────────────────────────────
 * تب «بخش‌ها» چیدمان ۸ بخش خانه را با فلش بالا/پایین و کلیدهای
 * عنوان/زیرعنوان/فعال ویرایش می‌کند و کل آرایه را PUT می‌کند؛
 * تب‌های دیگر (اسلاید/بنر/نیاز/جستجو) هرکدام CRUD موردی دارند.
 * پس از هر ذخیره، API مسیرهای عمومی را revalidate می‌کند.
 */

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  IconArrowDown,
  IconArrowUp,
  IconExternalLink,
  IconGripVertical,
  IconLayoutNavbar,
  IconSearch,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { apiFetch, apiSend } from "@/components/admin/api";
import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { HomeSlidesTab } from "@/components/admin/home-slides-tab";
import { HomeBannersTab } from "@/components/admin/home-banners-tab";
import { HomeNeedsTab } from "@/components/admin/home-needs-tab";
import { HomePopularTab } from "@/components/admin/home-popular-tab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AdminHomeSectionRow } from "@/types/admin";

/* ── شرح فارسی هر بخش + عنوان پیش‌فرض کامپوننت (placeholder ورودی) ── */

interface SectionMeta {
  label: string;
  description: string;
  /** عنوان پیش‌فرض کامپوننت — null یعنی بخش عنوان اختصاصی ندارد */
  defaultTitle: string | null;
  defaultSubtitle?: string;
}

const SECTION_META: Record<string, SectionMeta> = {
  hero: {
    label: "هیرو",
    description: "اسلایدر بزرگ بالای صفحه + نوار جستجو و پیشنهادها",
    defaultTitle: null,
  },
  needs: {
    label: "خرید بر اساس نیاز",
    description: "ردیف‌های شماره‌دار دغدغه‌ها با پنل پیش‌نمایش تصویری",
    defaultTitle: "خرید بر اساس نیاز",
    defaultSubtitle: "به جای جست‌وجوی دسته‌ها، بگویید دغدغه‌تان چیست",
  },
  ads: {
    label: "بنرهای تبلیغاتی",
    description: "گرید کاشی‌های تصویری تخفیف‌ها و پیشنهادها",
    defaultTitle: null,
  },
  productRail: {
    label: "ریل محصولات",
    description: "کاروسل محصولات با تب‌های محبوب / جدید / تخفیف‌دار",
    defaultTitle: "محبوب‌ترین‌ها",
    defaultSubtitle: "انتخاب واقعی مشتریان، به‌روزرسانی هفتگی",
  },
  expertPicks: {
    label: "منتخب کارشناس",
    description: "کارت‌های انتخابی تیم کارشناسی سلامت",
    defaultTitle: "منتخب کارشناس سلامت",
    defaultSubtitle: "تیم کارشناسی ما این قلم‌ها را با وسواس انتخاب کرده است",
  },
  brands: {
    label: "برندها",
    description: "نوار متحرک برندهای همراه فروشگاه",
    defaultTitle: "برندهای همراه ما",
  },
  articles: {
    label: "مجلهٔ سلامت",
    description: "سه مقالهٔ تازهٔ وبلاگ",
    defaultTitle: "مجلهٔ سلامت",
    defaultSubtitle: "خواندنی‌های کاربردی برای سلامتی خانواده",
  },
  aboutStore: {
    label: "دربارهٔ فروشگاه",
    description: "معرفی فروشگاه + آمار اعتماد و نقشه",
    defaultTitle: "دربارهٔ ما",
  },
};

function sectionMeta(key: string): SectionMeta {
  return (
    SECTION_META[key] ?? {
      label: key,
      description: "بخش سفارشی",
      defaultTitle: null,
    }
  );
}

/* ══════════════════════ تب «بخش‌ها» ══════════════════════ */

interface SectionsResponse {
  items: AdminHomeSectionRow[];
}

function SectionsTab() {
  const [rows, setRows] = useState<AdminHomeSectionRow[] | null>(null);
  const [original, setOriginal] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    apiFetch<SectionsResponse>("/api/admin/home/sections")
      .then((response) => {
        if (!active) return;
        const sorted = [...response.items].sort((a, b) => a.sortOrder - b.sortOrder);
        setRows(sorted);
        setOriginal(JSON.stringify(sorted));
      })
      .catch((error: unknown) => {
        if (active) toast.error(error instanceof Error ? error.message : "بارگذاری بخش‌ها ناموفق بود");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const dirty = rows !== null && JSON.stringify(rows) !== original;

  /* جابه‌جایی ردیف با همسایه — سپس شماره‌گذاری دوبارهٔ sortOrder */
  const move = useCallback((index: number, direction: -1 | 1): void => {
    setRows((current) => {
      if (current === null) return current;
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((row, order) => ({ ...row, sortOrder: order }));
    });
  }, []);

  const patch = useCallback((key: string, changes: Partial<AdminHomeSectionRow>): void => {
    setRows((current) =>
      current === null ? current : current.map((row) => (row.key === key ? { ...row, ...changes } : row)),
    );
  }, []);

  const save = useCallback(async (): Promise<void> => {
    if (rows === null || !dirty) return;
    setSaving(true);
    try {
      const payload = rows.map((row) => ({
        key: row.key,
        title: (row.title ?? "").trim().length > 0 ? (row.title ?? "").trim() : null,
        subtitle: (row.subtitle ?? "").trim().length > 0 ? (row.subtitle ?? "").trim() : null,
        sortOrder: row.sortOrder,
        isActive: row.isActive,
      }));
      await apiSend("/api/admin/home/sections", "PUT", payload);
      setOriginal(JSON.stringify(rows));
      toast.success("چیدمان ذخیره شد و صفحهٔ اصلی فروشگاه به‌روز شد");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ذخیرهٔ چیدمان ناموفق بود");
    } finally {
      setSaving(false);
    }
  }, [rows, dirty]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (rows === null || rows.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card shadow-xs">
        <EmptyState
          icon={<IconLayoutNavbar className="size-7" stroke={1.75} aria-hidden="true" />}
          title="بخشی پیدا نشد"
          description="بخش‌های صفحهٔ اصلی در دسترس نیستند؛ صفحه را دوباره بارگذاری کنید."
          className="py-16"
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* فهرست بخش‌ها */}
      <ul className="divide-y divide-border/50 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xs">
        {rows.map((row, index) => {
          const meta = sectionMeta(row.key);
          const hasTitle = meta.defaultTitle !== null;
          return (
            <li
              key={row.key}
              className={cn("flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:gap-4", !row.isActive && "bg-muted/30")}
            >
              {/* دستگیرهٔ جابه‌جایی + فلش‌ها */}
              <div className="flex shrink-0 items-center gap-1 sm:flex-col">
                <span className="hidden text-muted-foreground/40 sm:block" aria-hidden="true">
                  <IconGripVertical className="size-4" stroke={1.75} />
                </span>
                <div className="flex items-center gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    aria-label={`جابه‌جایی «${meta.label}» به بالا`}
                    title="یک پله بالاتر"
                  >
                    <IconArrowUp className="size-4" stroke={1.75} aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground"
                    disabled={index === rows.length - 1}
                    onClick={() => move(index, 1)}
                    aria-label={`جابه‌جایی «${meta.label}» به پایین`}
                    title="یک پله پایین‌تر"
                  >
                    <IconArrowDown className="size-4" stroke={1.75} aria-hidden="true" />
                  </Button>
                </div>
              </div>

              {/* عنوان کلید + ورودی‌ها */}
              <div className="min-w-0 flex-1 space-y-2.5">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground" dir="ltr">
                    {row.key}
                  </span>
                  <span className="text-sm font-bold">{meta.label}</span>
                  <span className="text-xs text-muted-foreground">— {meta.description}</span>
                </div>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <div>
                    <Input
                      value={row.title ?? ""}
                      disabled={!hasTitle}
                      placeholder={hasTitle ? meta.defaultTitle ?? "بدون عنوان" : "این بخش عنوان اختصاصی ندارد"}
                      onChange={(event) => patch(row.key, { title: event.target.value })}
                      aria-label={`عنوان بخش ${meta.label}`}
                      className="h-9"
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {hasTitle ? "خالی = عنوان پیش‌فرض" : "—"}
                    </p>
                  </div>
                  <div>
                    <Input
                      value={row.subtitle ?? ""}
                      disabled={!hasTitle}
                      placeholder={meta.defaultSubtitle ?? "بدون زیرعنوان"}
                      onChange={(event) => patch(row.key, { subtitle: event.target.value })}
                      aria-label={`زیرعنوان بخش ${meta.label}`}
                      className="h-9"
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {hasTitle ? "زیرعنوان اختیاری" : "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* سوییچ فعال */}
              <label className="flex shrink-0 cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 py-2 sm:mt-1 sm:flex-col sm:gap-1 sm:border-0 sm:px-0 sm:py-1">
                <Switch
                  checked={row.isActive}
                  onCheckedChange={(checked) => patch(row.key, { isActive: checked })}
                  aria-label={`فعال بودن بخش ${meta.label}`}
                />
                <span className="text-xs font-semibold text-muted-foreground">
                  {row.isActive ? "نمایش" : "مخفی"}
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      {/* نوار ذخیرهٔ چسبان — هم‌سان با ویرایشگرها */}
      <div className="sticky bottom-0 z-20 -mx-4 border-t border-border/60 bg-card/95 px-4 py-3 backdrop-blur-sm md:-mx-8 md:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-muted-foreground">
            {dirty
              ? "تغییرات ذخیره نشده است."
              : "تغییرات بلافاصله پس از ذخیره در صفحهٔ اصلی فروشگاه اعمال می‌شود."}
          </p>
          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!dirty || saving}
              onClick={() => {
                const restored = JSON.parse(original) as AdminHomeSectionRow[];
                setRows(restored);
              }}
            >
              بازنشانی
            </Button>
            <Button type="button" size="sm" className="font-semibold" disabled={!dirty || saving} onClick={() => void save()}>
              {saving ? "در حال ذخیره…" : "ذخیرهٔ چیدمان"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════ پوستهٔ تب‌ها ══════════════════════ */

export function HomeManager() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="صفحهٔ اصلی فروشگاه"
        description="چیدمان بخش‌ها، اسلایدها، بنرها، کارت‌های نیاز و جستجوهای پرطرفدار — ریز به ریز"
        actions={
          <Button type="button" variant="outline" size="sm" asChild className="gap-1.5">
            <a href="/" target="_blank" rel="noreferrer">
              مشاهدهٔ صفحهٔ اصلی
              <IconExternalLink className="size-4" stroke={1.75} aria-hidden="true" />
            </a>
          </Button>
        }
      />

      <Tabs defaultValue="sections" dir="rtl">
        {/* نوار تب — موبایل: اسکرول افقی */}
        <div className="max-w-full overflow-x-auto pb-1">
          <TabsList className="h-auto w-max gap-1 rounded-xl p-1">
            <TabsTrigger value="sections" className="whitespace-nowrap px-3 py-1.5">
              <IconLayoutNavbar className="size-4" stroke={1.75} aria-hidden="true" />
              بخش‌ها
            </TabsTrigger>
            <TabsTrigger value="slides" className="whitespace-nowrap px-3 py-1.5">
              اسلایدهای هیرو
            </TabsTrigger>
            <TabsTrigger value="banners" className="whitespace-nowrap px-3 py-1.5">
              بنرهای تبلیغاتی
            </TabsTrigger>
            <TabsTrigger value="needs" className="whitespace-nowrap px-3 py-1.5">
              خرید بر اساس نیاز
            </TabsTrigger>
            <TabsTrigger value="popular" className="whitespace-nowrap px-3 py-1.5">
              <IconSearch className="size-4" stroke={1.75} aria-hidden="true" />
              جستجوهای پرطرفدار
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="sections" className="mt-5">
          <SectionsTab />
        </TabsContent>
        <TabsContent value="slides" className="mt-5">
          <HomeSlidesTab />
        </TabsContent>
        <TabsContent value="banners" className="mt-5">
          <HomeBannersTab />
        </TabsContent>
        <TabsContent value="needs" className="mt-5">
          <HomeNeedsTab />
        </TabsContent>
        <TabsContent value="popular" className="mt-5">
          <HomePopularTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
