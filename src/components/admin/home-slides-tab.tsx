"use client";

/**
 * تب «اسلایدهای هیرو» — مدیریت /api/admin/slides
 * ─────────────────────────────
 * کارت‌های اسلاید با بندانگشتی ۴:۵؛ تعویض سریع تصویر از خود کارت،
 * ویرایش کامل در دیالوگ (عنوان/زیرعنوان/دکمه/مقصد/ترتیب) و حذف با تأیید.
 */

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  IconCirclePlus,
  IconPencil,
  IconPhotoUp,
  IconPlayerPlay,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { toFa } from "@/lib/format";
import { apiFetch, apiSend, uploadImage } from "@/components/admin/api";
import { DeleteConfirm } from "@/components/admin/delete-confirm";
import { EmptyState } from "@/components/admin/empty-state";
import { ImageUploadField } from "@/components/admin/image-upload-field";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { AdminSlideRow } from "@/types/admin";

interface SlidesResponse {
  items: AdminSlideRow[];
}

/** شکل فرم دیالوگ ساخت/ویرایش */
interface SlideForm {
  title: string;
  subtitle: string;
  imageUrl: string;
  mobileImageUrl: string;
  ctaLabel: string;
  ctaHref: string;
  sortOrder: string;
  isActive: boolean;
}

const EMPTY_FORM: SlideForm = {
  title: "",
  subtitle: "",
  imageUrl: "",
  mobileImageUrl: "",
  ctaLabel: "",
  ctaHref: "",
  sortOrder: "0",
  isActive: true,
};

function toForm(slide: AdminSlideRow): SlideForm {
  return {
    title: slide.title,
    subtitle: slide.subtitle ?? "",
    imageUrl: slide.imageUrl,
    mobileImageUrl: slide.mobileImageUrl ?? "",
    ctaLabel: slide.ctaLabel ?? "",
    ctaHref: slide.ctaHref ?? "",
    sortOrder: String(slide.sortOrder),
    isActive: slide.isActive,
  };
}

/** بدنهٔ ارسالی به API — عبارت‌های خالی null می‌شوند */
function toBody(form: SlideForm) {
  return {
    title: form.title.trim(),
    subtitle: form.subtitle.trim().length > 0 ? form.subtitle.trim() : null,
    imageUrl: form.imageUrl.trim(),
    mobileImageUrl: form.mobileImageUrl.trim().length > 0 ? form.mobileImageUrl.trim() : null,
    ctaLabel: form.ctaLabel.trim().length > 0 ? form.ctaLabel.trim() : null,
    ctaHref: form.ctaHref.trim().length > 0 ? form.ctaHref.trim() : null,
    sortOrder: Number.parseInt(form.sortOrder, 10) || 0,
    isActive: form.isActive,
  };
}

export function HomeSlidesTab() {
  const [rows, setRows] = useState<AdminSlideRow[] | null>(null);
  const [loading, setLoading] = useState(true);

  /* دیالوگ ساخت/ویرایش */
  const [editing, setEditing] = useState<AdminSlideRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<SlideForm>(EMPTY_FORM);
  const [formBusy, setFormBusy] = useState(false);

  /* حذف و تعویض سریع تصویر */
  const [deleting, setDeleting] = useState<AdminSlideRow | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [swapBusyId, setSwapBusyId] = useState<string | null>(null);

  const load = useCallback((): void => {
    setLoading(true);
    apiFetch<SlidesResponse>("/api/admin/slides")
      .then((response) => setRows(response.items))
      .catch((error: unknown) =>
        toast.error(error instanceof Error ? error.message : "بارگذاری اسلایدها ناموفق بود"),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => load(), [load]);

  /* ── دیالوگ ساخت ── */
  const openCreate = useCallback((): void => {
    const nextOrder = rows !== null && rows.length > 0 ? rows[rows.length - 1].sortOrder + 1 : 0;
    setForm({ ...EMPTY_FORM, sortOrder: String(nextOrder) });
    setCreating(true);
  }, [rows]);

  /* ── دیالوگ ویرایش ── */
  const openEdit = useCallback((slide: AdminSlideRow): void => {
    setEditing(slide);
    setForm(toForm(slide));
  }, []);

  const closeDialog = useCallback((): void => {
    setCreating(false);
    setEditing(null);
  }, []);

  /* ── ارسال فرم (ساخت یا ویرایش) ── */
  const submitForm = useCallback(async (): Promise<void> => {
    if (form.title.trim().length < 2) {
      toast.error("عنوان اسلاید را وارد کنید (حداقل ۲ حرف)");
      return;
    }
    if (form.imageUrl.trim().length === 0) {
      toast.error("تصویر اسلاید را بارگذاری یا نشانی آن را وارد کنید");
      return;
    }
    setFormBusy(true);
    try {
      if (editing !== null) {
        await apiSend(`/api/admin/slides/${editing.id}`, "PUT", toBody(form));
        toast.success("اسلاید ویرایش شد و صفحهٔ اصلی به‌روز شد");
      } else {
        await apiSend("/api/admin/slides", "POST", toBody(form));
        toast.success("اسلاید جدید ساخته شد و صفحهٔ اصلی به‌روز شد");
      }
      closeDialog();
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ذخیرهٔ اسلاید ناموفق بود");
    } finally {
      setFormBusy(false);
    }
  }, [form, editing, closeDialog, load]);

  /* ── حذف ── */
  const confirmDelete = useCallback(async (): Promise<void> => {
    if (deleting === null) return;
    setDeleteBusy(true);
    try {
      await apiSend(`/api/admin/slides/${deleting.id}`, "DELETE");
      toast.success("اسلاید حذف شد");
      setDeleting(null);
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حذف اسلاید ناموفق بود");
    } finally {
      setDeleteBusy(false);
    }
  }, [deleting, load]);

  /* ── تعویض سریع تصویر از روی کارت ── */
  const swapImage = useCallback(
    async (slide: AdminSlideRow, file: File): Promise<void> => {
      setSwapBusyId(slide.id);
      try {
        const url = await uploadImage(file);
        await apiSend(`/api/admin/slides/${slide.id}`, "PUT", { ...toBody(toForm(slide)), imageUrl: url });
        toast.success("تصویر اسلاید تعویض شد");
        load();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "تعویض تصویر ناموفق بود");
      } finally {
        setSwapBusyId(null);
      }
    },
    [load],
  );

  return (
    <div className="space-y-4">
      {/* نوار ابزار */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {loading
            ? "در حال بارگذاری…"
            : `${toFa(rows?.length ?? 0)} اسلاید — ${toFa(rows?.filter((row) => row.isActive).length ?? 0)} فعال`}
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={load} disabled={loading} className="gap-1.5">
            <IconRefresh className="size-4" stroke={1.75} aria-hidden="true" />
            بازآوری
          </Button>
          <Button type="button" size="sm" onClick={openCreate} className="gap-1.5 font-bold">
            <IconCirclePlus className="size-4" stroke={1.75} aria-hidden="true" />
            اسلاید جدید
          </Button>
        </div>
      </div>

      {/* فهرست */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : rows === null || rows.length === 0 ? (
        <div className="rounded-xl border bg-card">
          <EmptyState
            icon={<IconPlayerPlay className="size-7" stroke={1.75} aria-hidden="true" />}
            title="اسلایدی ثبت نشده است"
            description="اولین اسلاید هیرو را برای بالای صفحهٔ اصلی بسازید."
            className="py-16"
          />
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((slide) => (
            <li
              key={slide.id}
              className={cn(
                "flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center",
                !slide.isActive && "opacity-60",
              )}
            >
              {/* بندانگشتی + تعویض سریع */}
              <div className="relative shrink-0">
                <div className="aspect-[4/5] w-20 overflow-hidden rounded-xl border bg-muted/60">
                  <img
                    src={slide.imageUrl}
                    alt={`پیش‌نمایش اسلاید ${slide.title}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <label
                  className={cn(
                    "absolute -bottom-1.5 -end-1.5 flex size-7 cursor-pointer items-center justify-center rounded-full border bg-card text-muted-foreground shadow-sm transition-colors hover:text-primary",
                    swapBusyId === slide.id && "pointer-events-none opacity-50",
                  )}
                  title="تعویض سریع تصویر"
                >
                  <IconPhotoUp className="size-4" stroke={1.75} aria-hidden="true" />
                  <span className="sr-only">تعویض تصویر اسلاید {slide.title}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    disabled={swapBusyId === slide.id}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = "";
                      if (file !== undefined) void swapImage(slide, file);
                    }}
                  />
                </label>
              </div>

              {/* متن */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{slide.title}</p>
                {slide.subtitle ? (
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">{slide.subtitle}</p>
                ) : null}
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>ترتیب: {toFa(slide.sortOrder)}</span>
                  {slide.ctaLabel ? (
                    <span>
                      دکمه: «{slide.ctaLabel}» → <span dir="ltr">{slide.ctaHref}</span>
                    </span>
                  ) : (
                    <span>بدون دکمه</span>
                  )}
                </div>
              </div>

              {/* اقدامات */}
              <div className="flex shrink-0 items-center gap-1 sm:flex-col sm:items-end">
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-primary"
                    onClick={() => openEdit(slide)}
                    aria-label={`ویرایش اسلاید ${slide.title}`}
                  >
                    <IconPencil className="size-4" stroke={1.75} aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleting(slide)}
                    aria-label={`حذف اسلاید ${slide.title}`}
                  >
                    <IconTrash className="size-4" stroke={1.75} aria-hidden="true" />
                  </Button>
                </div>
                <label className="flex cursor-pointer items-center gap-1.5">
                  <Switch
                    checked={slide.isActive}
                    onCheckedChange={async (checked) => {
                      try {
                        await apiSend(`/api/admin/slides/${slide.id}`, "PUT", {
                          ...toBody(toForm(slide)),
                          isActive: checked,
                        });
                        toast.success(checked ? "اسلاید فعال شد" : "اسلاید مخفی شد");
                        load();
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : "تغییر وضعیت ناموفق بود");
                      }
                    }}
                    aria-label={`فعال بودن اسلاید ${slide.title}`}
                  />
                  <span className="text-xs font-bold text-muted-foreground">
                    {slide.isActive ? "فعال" : "غیرفعال"}
                  </span>
                </label>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* دیالوگ ساخت/ویرایش اسلاید */}
      <Dialog
        open={creating || editing !== null}
        onOpenChange={(open) => {
          if (!open && !formBusy) closeDialog();
        }}
      >
        <DialogContent dir="rtl" className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing !== null ? "ویرایش اسلاید" : "اسلاید جدید"}</DialogTitle>
            <DialogDescription>
              اسلایدهای فعال به‌ترتیبِ «ترتیب» در بالای صفحهٔ اصلی نمایش داده می‌شوند.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <Label htmlFor="slide-title" className="text-sm font-bold">
                عنوان *
              </Label>
              <Input
                id="slide-title"
                value={form.title}
                onChange={(event) => setForm((f) => ({ ...f, title: event.target.value }))}
                placeholder="مثلاً: تجهیزات پزشکی اصل، با خیال راحت"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slide-subtitle" className="text-sm font-bold">
                زیرعنوان
              </Label>
              <Textarea
                id="slide-subtitle"
                rows={2}
                value={form.subtitle}
                onChange={(event) => setForm((f) => ({ ...f, subtitle: event.target.value }))}
                placeholder="توضیح کوتاه زیر عنوان"
              />
            </div>
            <ImageUploadField
              ratio="portrait"
              label="تصویر اسلاید *"
              value={form.imageUrl}
              onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
              hint="نسبت عمودی ۴:۵ — برای هیرو صفحهٔ اصلی"
            />
            <ImageUploadField
              ratio="portrait"
              label="تصویر موبایل (اختیاری)"
              value={form.mobileImageUrl}
              onChange={(url) => setForm((f) => ({ ...f, mobileImageUrl: url }))}
              hint="در صورت خالی بودن، همان تصویر اصلی استفاده می‌شود"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="slide-cta-label" className="text-sm font-bold">
                  متن دکمه
                </Label>
                <Input
                  id="slide-cta-label"
                  value={form.ctaLabel}
                  onChange={(event) => setForm((f) => ({ ...f, ctaLabel: event.target.value }))}
                  placeholder="مثلاً: دیدن محصولات"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="slide-cta-href" className="text-sm font-bold">
                  مقصد دکمه
                </Label>
                <Input
                  id="slide-cta-href"
                  dir="ltr"
                  className="text-start"
                  value={form.ctaHref}
                  onChange={(event) => setForm((f) => ({ ...f, ctaHref: event.target.value }))}
                  placeholder="/products"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="slide-order" className="text-sm font-bold">
                  ترتیب
                </Label>
                <Input
                  id="slide-order"
                  dir="ltr"
                  inputMode="numeric"
                  className="text-start"
                  value={form.sortOrder}
                  onChange={(event) =>
                    setForm((f) => ({ ...f, sortOrder: event.target.value.replace(/[^\d]/g, "") }))
                  }
                />
              </div>
              <div className="flex items-end">
                <label className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 py-2">
                  <span className="text-sm font-bold">فعال</span>
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(checked) => setForm((f) => ({ ...f, isActive: checked }))}
                    aria-label="فعال بودن اسلاید"
                  />
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog} disabled={formBusy}>
              انصراف
            </Button>
            <Button type="button" className="font-bold" disabled={formBusy} onClick={() => void submitForm()}>
              {formBusy ? "در حال ذخیره…" : editing !== null ? "ذخیرهٔ تغییرات" : "ساخت اسلاید"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* تأیید حذف */}
      <DeleteConfirm
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="حذف اسلاید"
        description={
          deleting !== null
            ? `اسلاید «${deleting.title}» برای همیشه حذف می‌شود؛ این کار برگشت‌پذیر نیست.`
            : ""
        }
        busy={deleteBusy}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
