"use client";

/**
 * تب «بنرهای تبلیغاتی» — مدیریت /api/admin/banners + قالب ads.layout
 * ─────────────────────────────
 * قالب گرید (بنتو/دوتایی/سه‌تایی) از Setting «ads.layout» خوانده و
 * از طریق /api/admin/settings ذخیره می‌شود؛ شرح فارسی هر جایگاه
 * (slot) بر اساس قالب جاری از قرارداد ad-grid می‌آید.
 */

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  IconAd,
  IconCirclePlus,
  IconLayoutGrid,
  IconPencil,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { toFa } from "@/lib/format";
import { apiFetch, apiSend } from "@/components/admin/api";
import { DeleteConfirm } from "@/components/admin/delete-confirm";
import { EmptyState } from "@/components/admin/empty-state";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Pill } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import type { AdminBannerRow, AdminSettingsResponse } from "@/types/admin";

interface BannersResponse {
  items: AdminBannerRow[];
}

type AdLayoutKey = "bento" | "duo" | "trio";

const AD_LAYOUTS: { key: AdLayoutKey; title: string; description: string }[] = [
  {
    key: "bento",
    title: "بنتو",
    description: "کاشی بزرگ + نوار عریض + دو مربع (۴ جایگاه)",
  },
  {
    key: "duo",
    title: "دوتایی",
    description: "دو مستطیل عریض (۲ جایگاه)",
  },
  {
    key: "trio",
    title: "سه‌تایی",
    description: "سه مربع هم‌اندازه (۳ جایگاه)",
  },
];

/** ظرف هر قالب — جایگاه‌های بیشتر از این عدد در سایت نمایش داده نمی‌شوند */
const LAYOUT_CAPACITY: Record<AdLayoutKey, number> = { bento: 4, duo: 2, trio: 3 };

/** شرح فارسی هر جایگاه در هر قالب (عین قرارداد ad-grid) */
const SLOT_DESCRIPTIONS: Record<AdLayoutKey, string[]> = {
  bento: [
    "کاشی بزرگ — مربع ۱:۱ (۱۴۴۰×۱۴۴۰)",
    "کاشی عریض — افقی ۲:۱ (۱۴۴۰×۷۲۰)",
    "مربع کوچک — ۱:۱ (۷۲۰×۷۲۰)",
    "مربع کوچک — ۱:۱ (۷۲۰×۷۲۰)",
  ],
  duo: ["مستطیل عریض — ۱۲:۵ (۱۶۸۰×۷۰۰)", "مستطیل عریض — ۱۲:۵ (۱۶۸۰×۷۰۰)"],
  trio: ["مربع — ۱:۱ (۱۰۰۰×۱۰۰۰)", "مربع — ۱:۱ (۱۰۰۰×۱۰۰۰)", "مربع — ۱:۱ (۱۰۰۰×۱۰۰۰)"],
};

function slotDescription(layout: AdLayoutKey, slot: number): string {
  const list = SLOT_DESCRIPTIONS[layout];
  return list[slot] ?? "خارج از قالب جاری";
}

interface BannerForm {
  slot: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  href: string;
  isActive: boolean;
}

const EMPTY_FORM: BannerForm = {
  slot: "0",
  title: "",
  subtitle: "",
  imageUrl: "",
  href: "",
  isActive: true,
};

export function HomeBannersTab() {
  const [rows, setRows] = useState<AdminBannerRow[] | null>(null);
  const [layout, setLayout] = useState<AdLayoutKey>("bento");
  const [loading, setLoading] = useState(true);
  const [layoutBusy, setLayoutBusy] = useState(false);

  const [editing, setEditing] = useState<AdminBannerRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<BannerForm>(EMPTY_FORM);
  const [formBusy, setFormBusy] = useState(false);
  const [deleting, setDeleting] = useState<AdminBannerRow | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback((): void => {
    setLoading(true);
    Promise.all([
      apiFetch<BannersResponse>("/api/admin/banners"),
      apiFetch<AdminSettingsResponse>("/api/admin/settings"),
    ])
      .then(([banners, settings]) => {
        setRows(banners.items);
        try {
          const parsed: unknown = JSON.parse(settings.raw["ads.layout"] ?? "null");
          if (parsed === "bento" || parsed === "duo" || parsed === "trio") {
            setLayout(parsed);
          }
        } catch {
          /* مقدار خراب → پیش‌فرض bento */
        }
      })
      .catch((error: unknown) =>
        toast.error(error instanceof Error ? error.message : "بارگذاری بنرها ناموفق بود"),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => load(), [load]);

  /* تغییر قالب گرید → ذخیرهٔ Setting */
  const changeLayout = useCallback(async (next: AdLayoutKey): Promise<void> => {
    if (next === layout || layoutBusy) return;
    const previous = layout;
    setLayout(next);
    setLayoutBusy(true);
    try {
      await apiSend("/api/admin/settings", "PUT", { "ads.layout": next });
      toast.success("قالب گرید تبلیغات ذخیره شد و صفحهٔ اصلی به‌روز شد");
    } catch (error) {
      setLayout(previous);
      toast.error(error instanceof Error ? error.message : "ذخیرهٔ قالب ناموفق بود");
    } finally {
      setLayoutBusy(false);
    }
  }, [layout, layoutBusy]);

  const openCreate = useCallback((): void => {
    setForm({ ...EMPTY_FORM, slot: String(rows?.length ?? 0) });
    setCreating(true);
  }, [rows]);

  const openEdit = useCallback((banner: AdminBannerRow): void => {
    setEditing(banner);
    setForm({
      slot: String(banner.slot),
      title: banner.title ?? "",
      subtitle: banner.subtitle ?? "",
      imageUrl: banner.imageUrl,
      href: banner.href ?? "",
      isActive: banner.isActive,
    });
  }, []);

  const closeDialog = useCallback((): void => {
    setCreating(false);
    setEditing(null);
  }, []);

  const submitForm = useCallback(async (): Promise<void> => {
    const slot = Number.parseInt(form.slot, 10);
    if (Number.isNaN(slot) || slot < 0 || slot > 3) {
      toast.error("جایگاه بنر بین ۰ تا ۳ است");
      return;
    }
    if (form.title.trim().length === 0) {
      toast.error("عنوان بنر را وارد کنید");
      return;
    }
    if (form.imageUrl.trim().length === 0) {
      toast.error("تصویر بنر را بارگذاری یا نشانی آن را وارد کنید");
      return;
    }
    if (form.href.trim().length === 0) {
      toast.error("مقصد کلیک بنر را وارد کنید (مثل /products)");
      return;
    }
    setFormBusy(true);
    const body = {
      slot,
      imageUrl: form.imageUrl.trim(),
      href: form.href.trim(),
      title: form.title.trim(),
      subtitle: form.subtitle.trim().length > 0 ? form.subtitle.trim() : null,
      isActive: form.isActive,
    };
    try {
      if (editing !== null) {
        await apiSend(`/api/admin/banners/${editing.id}`, "PUT", body);
        toast.success("بنر ویرایش شد و صفحهٔ اصلی به‌روز شد");
      } else {
        await apiSend("/api/admin/banners", "POST", body);
        toast.success("بنر جدید ساخته شد و صفحهٔ اصلی به‌روز شد");
      }
      closeDialog();
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ذخیرهٔ بنر ناموفق بود");
    } finally {
      setFormBusy(false);
    }
  }, [form, editing, closeDialog, load]);

  const confirmDelete = useCallback(async (): Promise<void> => {
    if (deleting === null) return;
    setDeleteBusy(true);
    try {
      await apiSend(`/api/admin/banners/${deleting.id}`, "DELETE");
      toast.success("بنر حذف شد");
      setDeleting(null);
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حذف بنر ناموفق بود");
    } finally {
      setDeleteBusy(false);
    }
  }, [deleting, load]);

  return (
    <div className="space-y-5">
      {/* انتخاب قالب گرید */}
      <section className="rounded-2xl border border-border/60 bg-card shadow-xs p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-bold">
            <IconLayoutGrid className="size-4.5 text-primary" stroke={1.75} aria-hidden="true" />
            قالب گرید تبلیغات
          </h3>
          <p className="text-xs text-muted-foreground">جایگاه‌ها به‌همین قالب در صفحهٔ اصلی چیده می‌شوند</p>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {AD_LAYOUTS.map((item) => (
            <button
              key={item.key}
              type="button"
              disabled={layoutBusy}
              onClick={() => void changeLayout(item.key)}
              aria-pressed={layout === item.key}
              className={cn(
                "rounded-xl border p-3 text-start transition-colors",
                layout === item.key
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "hover:border-primary/40",
              )}
            >
              <span className="flex items-center justify-between">
                <span className="font-bold">{item.title}</span>
                {layout === item.key ? <Pill tone="primary">فعال</Pill> : null}
              </span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.description}</span>
            </button>
          ))}
        </div>
      </section>

      {/* نوار ابزار — شمار + اکشن‌ها در انتهای RTL */}
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs text-muted-foreground">
          {loading ? "در حال بارگذاری…" : `${toFa(rows?.length ?? 0)} بنر — قالب جاری: ${AD_LAYOUTS.find((l) => l.key === layout)?.title}`}
        </p>
        <div className="flex gap-2 ms-auto">
          <Button type="button" variant="ghost" size="sm" onClick={load} disabled={loading} className="gap-1.5">
            <IconRefresh className="size-4" stroke={1.75} aria-hidden="true" />
            بازآوری
          </Button>
          <Button type="button" size="sm" onClick={openCreate} className="gap-1.5 font-semibold">
            <IconCirclePlus className="size-4" stroke={1.75} aria-hidden="true" />
            بنر جدید
          </Button>
        </div>
      </div>

      {/* فهرست بنرها به‌ترتیب جایگاه */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : rows === null || rows.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card shadow-xs">
          <EmptyState
            icon={<IconAd className="size-7" stroke={1.75} aria-hidden="true" />}
            title="بنری ثبت نشده است"
            description="اولین کاشی تبلیغاتی گرید صفحهٔ اصلی را بسازید."
            className="py-16"
          />
        </div>
      ) : (
        <ul className="space-y-3">
          {[...rows]
            .sort((a, b) => a.slot - b.slot)
            .map((banner) => {
              const outOfLayout = banner.slot >= LAYOUT_CAPACITY[layout];
              return (
                <li
                  key={banner.id}
                  className={cn(
                    "flex flex-col gap-3 rounded-2xl border border-border/60 bg-card shadow-xs p-4 sm:flex-row sm:items-center",
                    (!banner.isActive || outOfLayout) && "opacity-60",
                  )}
                >
                  {/* بندانگشتی */}
                  <div className="aspect-[8/5] w-full shrink-0 overflow-hidden rounded-xl border bg-muted/60 sm:w-32">
                    <img
                      src={banner.imageUrl}
                      alt={`پیش‌نمایش بنر ${banner.title ?? ""}`}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* متن */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill tone="primary">جایگاه {toFa(banner.slot)}</Pill>
                      <span className="text-xs text-muted-foreground">{slotDescription(layout, banner.slot)}</span>
                      {outOfLayout ? <Pill tone="warning">خارج از قالب جاری</Pill> : null}
                    </div>
                    {banner.title ? <p className="mt-1.5 truncate font-semibold">{banner.title}</p> : null}
                    {banner.subtitle ? (
                      <p className="truncate text-sm text-muted-foreground">{banner.subtitle}</p>
                    ) : null}
                    <p dir="ltr" className="mt-0.5 truncate text-start text-xs text-muted-foreground">
                      {banner.href}
                    </p>
                  </div>

                  {/* اقدامات */}
                  <div className="flex shrink-0 items-center gap-1 sm:flex-col sm:items-end">
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-primary"
                        onClick={() => openEdit(banner)}
                        aria-label={`ویرایش بنر جایگاه ${toFa(banner.slot)}`}
                      >
                        <IconPencil className="size-4" stroke={1.75} aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleting(banner)}
                        aria-label={`حذف بنر جایگاه ${toFa(banner.slot)}`}
                      >
                        <IconTrash className="size-4" stroke={1.75} aria-hidden="true" />
                      </Button>
                    </div>
                    <label className="flex cursor-pointer items-center gap-1.5">
                      <Switch
                        checked={banner.isActive}
                        onCheckedChange={async (checked) => {
                          try {
                            await apiSend(`/api/admin/banners/${banner.id}`, "PUT", {
                              slot: banner.slot,
                              imageUrl: banner.imageUrl,
                              href: banner.href ?? "/products",
                              title: banner.title ?? "",
                              subtitle: banner.subtitle,
                              isActive: checked,
                            });
                            toast.success(checked ? "بنر فعال شد" : "بنر مخفی شد");
                            load();
                          } catch (error) {
                            toast.error(error instanceof Error ? error.message : "تغییر وضعیت ناموفق بود");
                          }
                        }}
                        aria-label={`فعال بودن بنر جایگاه ${toFa(banner.slot)}`}
                      />
                      <span className="text-xs font-semibold text-muted-foreground">
                        {banner.isActive ? "فعال" : "غیرفعال"}
                      </span>
                    </label>
                  </div>
                </li>
              );
            })}
        </ul>
      )}

      {/* دیالوگ ساخت/ویرایش بنر */}
      <Dialog
        open={creating || editing !== null}
        onOpenChange={(open) => {
          if (!open && !formBusy) closeDialog();
        }}
      >
        <DialogContent dir="rtl" className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing !== null ? "ویرایش بنر" : "بنر جدید"}</DialogTitle>
            <DialogDescription>
              کاشی‌های تصویری گرید تبلیغات؛ متن روی تصویر و دکمهٔ گوشه به‌صورت خودکار اضافه می‌شود.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">جایگاه در گرید *</Label>
              <Select value={form.slot} onValueChange={(value) => setForm((f) => ({ ...f, slot: value }))}>
                <SelectTrigger className="w-full" aria-label="جایگاه بنر">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3].map((slot) => (
                    <SelectItem key={slot} value={String(slot)}>
                      جایگاه {toFa(slot)} — {slotDescription(layout, slot)}
                      {slot >= LAYOUT_CAPACITY[layout] ? " (خارج از قالب جاری)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                ابعاد پیشنهادی تصویر هر جایگاه در شرح آن آمده است (@۲x).
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="banner-title" className="text-xs font-semibold">
                  عنوان *
                </Label>
                <Input
                  id="banner-title"
                  value={form.title}
                  onChange={(event) => setForm((f) => ({ ...f, title: event.target.value }))}
                  placeholder="مثلاً: فشارسنج‌های دیجیتال"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="banner-subtitle" className="text-xs font-semibold">
                  زیرعنوان
                </Label>
                <Input
                  id="banner-subtitle"
                  value={form.subtitle}
                  onChange={(event) => setForm((f) => ({ ...f, subtitle: event.target.value }))}
                  placeholder="مثلاً: دقت بالینیک، دو سال گارانتی"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="banner-href" className="text-xs font-semibold">
                مقصد کلیک *
              </Label>
              <Input
                id="banner-href"
                dir="ltr"
                className="text-start"
                value={form.href}
                onChange={(event) => setForm((f) => ({ ...f, href: event.target.value }))}
                placeholder="/products?category=blood-pressure"
              />
            </div>
            <ImageUploadField
              ratio="landscape"
              label="تصویر بنر *"
              value={form.imageUrl}
              onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
            />
            <label className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 py-2">
              <span className="text-xs font-semibold">فعال</span>
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, isActive: checked }))}
                aria-label="فعال بودن بنر"
              />
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog} disabled={formBusy}>
              انصراف
            </Button>
            <Button type="button" className="font-semibold" disabled={formBusy} onClick={() => void submitForm()}>
              {formBusy ? "در حال ذخیره…" : editing !== null ? "ذخیرهٔ تغییرات" : "ساخت بنر"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* تأیید حذف */}
      <DeleteConfirm
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="حذف بنر"
        description={
          deleting !== null
            ? `بنر «${deleting.title ?? "بدون عنوان"}» جایگاه ${toFa(deleting.slot)} حذف می‌شود؛ این کار برگشت‌پذیر نیست.`
            : ""
        }
        busy={deleteBusy}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
