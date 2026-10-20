"use client";

/**
 * دسته‌بندی‌ها — درخت دو سطحی + ساخت/ویرایش/حذف
 * ─────────────────────────────
 * والد‌ها با آکاردئون باز/بسته می‌شوند؛ فرزندان با تورفتگی زیر والد
 * می‌آیند. حذفِ دستهٔ دارای فرزند/محصول توسط API رد می‌شود و پیام
 * فارسی آن به‌صورت توست نمایش داده می‌شود.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  IconChevronDown,
  IconCirclePlus,
  IconPackage,
  IconPencil,
  IconRefresh,
  IconTag,
  IconTrash,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { toFa } from "@/lib/format";
import { CategoryIcon } from "@/components/shared/category-icon";
import { apiFetch, apiSend } from "@/components/admin/api";
import { Combobox } from "@/components/admin/combobox";
import { DeleteConfirm } from "@/components/admin/delete-confirm";
import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { AdminCategoryDetailRow, AdminCategoryNode } from "@/types/admin";

interface TreeResponse {
  tree: AdminCategoryNode[];
}

/** کلیدهای آیکون مجاز CategoryIcon با برچسب فارسی */
const ICON_OPTIONS: { value: string; label: string }[] = [
  { value: "blood-pressure", label: "فشار خون" },
  { value: "glucose", label: "قند خون" },
  { value: "thermometer", label: "تب‌سنج" },
  { value: "respiratory", label: "سلامت تنفس" },
  { value: "wheelchair", label: "ویلچر و توان‌بخشی" },
  { value: "beds", label: "تخت و تشک بیمار" },
  { value: "orthopedic", label: "ارتوپدی" },
  { value: "masks", label: "ماسک و اقلام مصرفی" },
  { value: "scales", label: "ترازو" },
];

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

interface CategoryForm {
  title: string;
  slug: string;
  parentId: string;
  iconKey: string;
  sortOrder: string;
  isActive: boolean;
  seoTitle: string;
  seoDescription: string;
  /** آیا مقادیر سئو از سرور خوانده شده‌اند؟ (ارسال شرطی برای جلوگیری از پاک‌سازی تصادفی) */
  seoLoaded: boolean;
}

const EMPTY_FORM: CategoryForm = {
  title: "",
  slug: "",
  parentId: "none",
  iconKey: "none",
  sortOrder: "0",
  isActive: true,
  seoTitle: "",
  seoDescription: "",
  seoLoaded: true,
};

export function CategoriesView() {
  const [tree, setTree] = useState<AdminCategoryNode[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);

  const [editing, setEditing] = useState<AdminCategoryNode | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CategoryForm>(EMPTY_FORM);
  const [formBusy, setFormBusy] = useState(false);
  const [deleting, setDeleting] = useState<AdminCategoryNode | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback((): void => {
    setLoading(true);
    apiFetch<TreeResponse>("/api/admin/categories")
      .then((response) => {
        setTree(response.tree);
        /* پیش‌فرض: همهٔ والد‌ها باز */
        setExpanded(new Set(response.tree.map((node) => node.id)));
      })
      .catch((error: unknown) =>
        toast.error(error instanceof Error ? error.message : "بارگذاری دسته‌ها ناموفق بود"),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => load(), [load]);

  const parents = useMemo(() => tree ?? [], [tree]);

  const toggleExpand = useCallback((id: string): void => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  /* ── فرم ساخت ── */
  const openCreate = useCallback((parentId?: string): void => {
    setForm({ ...EMPTY_FORM, parentId: parentId ?? "none" });
    setCreating(true);
  }, []);

  /* ── فرم ویرایش — جزئیات کامل (شامل سئو) از روت [id] خوانده می‌شود ── */
  const openEdit = useCallback((node: AdminCategoryNode): void => {
    setEditing(node);
    setForm({
      title: node.title,
      slug: node.slug,
      parentId: node.parentId ?? "none",
      iconKey: node.iconKey ?? "none",
      sortOrder: String(node.sortOrder),
      isActive: node.isActive,
      seoTitle: "",
      seoDescription: "",
      seoLoaded: false,
    });
    apiFetch<{ category: AdminCategoryDetailRow }>(`/api/admin/categories/${node.id}`)
      .then((response) => {
        setForm((f) => ({
          ...f,
          seoTitle: response.category.seoTitle ?? "",
          seoDescription: response.category.seoDescription ?? "",
          seoLoaded: true,
        }));
      })
      .catch(() => {
        /* خطای جزئیات: سئو ارسال نمی‌شود تا مقدار قبلی حفظ شود */
      });
  }, []);

  const closeDialog = useCallback((): void => {
    setCreating(false);
    setEditing(null);
  }, []);

  const submitForm = useCallback(async (): Promise<void> => {
    if (form.title.trim().length < 2) {
      toast.error("عنوان دسته را وارد کنید (حداقل ۲ حرف)");
      return;
    }
    if (!SLUG_REGEX.test(form.slug.trim())) {
      toast.error("نامک فقط حروف کوچک لاتین، عدد و خط تیره — مثل blood-pressure");
      return;
    }
    setFormBusy(true);
    const body = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      parentId: form.parentId === "none" ? null : form.parentId,
      iconKey: form.iconKey === "none" ? null : form.iconKey,
      sortOrder: Number.parseInt(form.sortOrder, 10) || 0,
      isActive: form.isActive,
      /* سئو فقط وقتی مقدارش از سرور خوانده شده ارسال می‌شود (وگرنه حفظ می‌شود) */
      ...(form.seoLoaded
        ? {
            seoTitle: form.seoTitle.trim().length > 0 ? form.seoTitle.trim() : null,
            seoDescription: form.seoDescription.trim().length > 0 ? form.seoDescription.trim() : null,
          }
        : {}),
    };
    try {
      if (editing !== null) {
        await apiSend(`/api/admin/categories/${editing.id}`, "PUT", body);
        toast.success("دسته ویرایش شد");
      } else {
        await apiSend("/api/admin/categories", "POST", body);
        toast.success("دستهٔ جدید ساخته شد");
      }
      closeDialog();
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ذخیرهٔ دسته ناموفق بود");
    } finally {
      setFormBusy(false);
    }
  }, [form, editing, closeDialog, load]);

  const confirmDelete = useCallback(async (): Promise<void> => {
    if (deleting === null) return;
    setDeleteBusy(true);
    try {
      await apiSend(`/api/admin/categories/${deleting.id}`, "DELETE");
      toast.success("دسته حذف شد");
      setDeleting(null);
      load();
    } catch (error) {
      /* پیام فارسی سرور (دستهٔ پرشده) دقیقاً به کاربر نشان داده می‌شود */
      toast.error(error instanceof Error ? error.message : "حذف دسته ناموفق بود");
      setDeleting(null);
    } finally {
      setDeleteBusy(false);
    }
  }, [deleting, load]);

  /* بدنهٔ PUT برای سوییچ سریع فعال/غیرفعال */
  const toggleActive = useCallback(
    async (node: AdminCategoryNode, checked: boolean): Promise<void> => {
      setBusyId(node.id);
      try {
        await apiSend(`/api/admin/categories/${node.id}`, "PUT", {
          title: node.title,
          slug: node.slug,
          parentId: node.parentId,
          iconKey: node.iconKey,
          sortOrder: node.sortOrder,
          isActive: checked,
          /* سئو ارسال نمی‌شود → مقدار قبلی حفظ می‌شود */
        });
        toast.success(checked ? `دستهٔ «${node.title}» فعال شد` : `دستهٔ «${node.title}» مخفی شد`);
        load();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "تغییر وضعیت ناموفق بود");
      } finally {
        setBusyId(null);
      }
    },
    [load],
  );

  /* ── رندر یک ردیف دسته ── */
  const renderRow = (node: AdminCategoryNode, isChild: boolean): React.ReactNode => (
    <li key={node.id} className={cn(!isChild && "border-b last:border-b-0", isChild && "border-b last:border-b-0")}>
      <div
        className={cn(
          "flex flex-wrap items-center gap-x-3 gap-y-2 p-4",
          isChild && "bg-muted/20 ps-4 sm:ps-6",
          !node.isActive && "opacity-60",
        )}
      >
        {/* آکاردئون والد / خط فرزند */}
        {isChild ? (
          <span className="ms-2 hidden h-6 w-px bg-border sm:block" aria-hidden="true" />
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 text-muted-foreground"
            onClick={() => toggleExpand(node.id)}
            aria-label={expanded.has(node.id) ? `بستن فرزندان ${node.title}` : `باز کردن فرزندان ${node.title}`}
            aria-expanded={expanded.has(node.id)}
          >
            <IconChevronDown
              className={cn("size-4 transition-transform", !expanded.has(node.id) && "-rotate-90")}
              stroke={1.75}
              aria-hidden="true"
            />
          </Button>
        )}

        {/* آیکون + عنوان + نامک */}
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <CategoryIcon iconKey={node.iconKey} className="size-4.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className={cn("truncate text-sm", isChild ? "font-semibold" : "font-bold")}>{node.title}</p>
          <p dir="ltr" className="truncate text-start font-mono text-[11px] text-muted-foreground">
            {node.slug}
          </p>
        </div>

        {/* شمار محصول + ترتیب */}
        <Pill tone="muted" className="shrink-0" title="شمار محصولات این دسته">
          {toFa(node.productCount)} کالا
        </Pill>
        <span className="shrink-0 text-xs text-muted-foreground" title="ترتیب نمایش">
          ترتیب {toFa(node.sortOrder)}
        </span>

        {/* اقدامات */}
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-primary"
            onClick={() => openEdit(node)}
            aria-label={`ویرایش ${node.title}`}
          >
            <IconPencil className="size-4" stroke={1.75} aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-destructive"
            onClick={() => setDeleting(node)}
            aria-label={`حذف ${node.title}`}
          >
            <IconTrash className="size-4" stroke={1.75} aria-hidden="true" />
          </Button>
          <label className="flex cursor-pointer items-center gap-1.5">
            <Switch
              checked={node.isActive}
              disabled={busyId === node.id}
              onCheckedChange={(checked) => void toggleActive(node, checked)}
              aria-label={`فعال بودن ${node.title}`}
            />
            <span className="sr-only">فعال</span>
          </label>
          {/* افزودن فرزند — فقط والد */}
          {!isChild ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-primary"
              onClick={() => openCreate(node.id)}
              aria-label={`افزودن زیردسته به ${node.title}`}
              title="زیردستهٔ جدید"
            >
              <IconCirclePlus className="size-4" stroke={1.75} aria-hidden="true" />
            </Button>
          ) : null}
        </div>
      </div>

      {/* فرزندان */}
      {!isChild && node.children.length > 0 && expanded.has(node.id) ? (
        <ul className="border-t border-dashed bg-card">
          {node.children.map((child) => renderRow(child, true))}
        </ul>
      ) : null}
    </li>
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="دسته‌بندی‌ها"
        description={
          loading
            ? "در حال بارگذاری…"
            : `درخت دو سطحی — ${toFa(parents.length)} دستهٔ اصلی و ${toFa(
                parents.reduce((total, parent) => total + parent.children.length, 0),
              )} زیردسته`
        }
        actions={
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={load} disabled={loading} className="gap-1.5">
              <IconRefresh className="size-4" stroke={1.75} aria-hidden="true" />
              بازآوری
            </Button>
            <Button type="button" size="sm" onClick={() => openCreate()} className="gap-1.5 font-semibold">
              <IconCirclePlus className="size-4" stroke={1.75} aria-hidden="true" />
              دستهٔ جدید
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : tree === null || tree.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card shadow-xs">
          <EmptyState
            icon={<IconTag className="size-7" stroke={1.75} aria-hidden="true" />}
            title="دسته‌ای ثبت نشده است"
            description="اولین دستهٔ اصلی را بسازید؛ دسته‌ها ساختار فروشگاه و منوها را می‌سازند."
            className="py-16"
          />
        </div>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xs">{tree.map((node) => renderRow(node, false))}</ul>
      )}

      {/* نکتهٔ راهنما */}
      <p className="flex items-start gap-2 rounded-xl border border-primary/25 bg-primary/5 p-3 text-xs leading-6 text-muted-foreground">
        <IconPackage className="mt-0.5 size-4 shrink-0 text-primary" stroke={1.75} aria-hidden="true" />
        حذف دستهٔ دارای زیردسته یا محصول ممکن نیست؛ ابتدا فرزندان را حذف/جابه‌جا و محصولات را به دستهٔ دیگری منتقل کنید.
        آیکون هر زیردسته در منوها از همان دسته انتخاب می‌شود.
      </p>

      {/* دیالوگ ساخت/ویرایش */}
      <Dialog
        open={creating || editing !== null}
        onOpenChange={(open) => {
          if (!open && !formBusy) closeDialog();
        }}
      >
        <DialogContent dir="rtl" className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing !== null ? "ویرایش دسته" : "دستهٔ جدید"}</DialogTitle>
            <DialogDescription>
              نامک (slug) نشانی دسته در فیلتر محصولات است — مثل blood-pressure.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="cat-title" className="text-xs font-semibold">
                  عنوان *
                </Label>
                <Input
                  id="cat-title"
                  value={form.title}
                  onChange={(event) => setForm((f) => ({ ...f, title: event.target.value }))}
                  placeholder="مثلاً: فشار خون"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cat-slug" className="text-xs font-semibold">
                  نامک *
                </Label>
                <Input
                  id="cat-slug"
                  dir="ltr"
                  className="text-start font-mono"
                  value={form.slug}
                  onChange={(event) => setForm((f) => ({ ...f, slug: event.target.value.toLowerCase() }))}
                  placeholder="blood-pressure"
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">دستهٔ والد</Label>
                <Combobox
                  options={parents.map((parent) => ({
                    value: parent.id,
                    label: parent.title,
                    disabled: editing !== null && editing.id === parent.id,
                  }))}
                  value={form.parentId === "none" ? "" : form.parentId}
                  onValueChange={(value) => setForm((f) => ({ ...f, parentId: value === "" ? "none" : value }))}
                  disabled={editing !== null && editing.children.length > 0}
                  placeholder="انتخاب والد…"
                  searchPlaceholder="جستجوی دستهٔ والد…"
                  emptyText="دسته‌ای با این نام پیدا نشد."
                  clearLabel="بدون والد (سطح اصلی)"
                  ariaLabel="دستهٔ والد"
                />
                {editing !== null && editing.children.length > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    این دسته زیردسته دارد و والدش قابل تغییر نیست.
                  </p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">آیکون</Label>
                <Combobox
                  options={ICON_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
                  value={form.iconKey === "none" ? "" : form.iconKey}
                  onValueChange={(value) => setForm((f) => ({ ...f, iconKey: value === "" ? "none" : value }))}
                  placeholder="انتخاب آیکون…"
                  searchPlaceholder="جستجوی آیکون…"
                  emptyText="آیکونی با این نام پیدا نشد."
                  clearLabel="بدون آیکون (عمومی)"
                  ariaLabel="آیکون دسته"
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="cat-order" className="text-xs font-semibold">
                  ترتیب
                </Label>
                <Input
                  id="cat-order"
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
                  <span className="text-xs font-semibold">فعال</span>
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(checked) => setForm((f) => ({ ...f, isActive: checked }))}
                    aria-label="فعال بودن دسته"
                  />
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cat-seo-title" className="text-xs font-semibold">
                عنوان سئو (اختیاری)
              </Label>
              <Input
                id="cat-seo-title"
                value={form.seoTitle}
                onChange={(event) => setForm((f) => ({ ...f, seoTitle: event.target.value }))}
                placeholder="خالی = همان عنوان دسته"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-seo-desc" className="text-xs font-semibold">
                توضیح سئو (اختیاری)
              </Label>
              <Textarea
                id="cat-seo-desc"
                rows={2}
                value={form.seoDescription}
                onChange={(event) => setForm((f) => ({ ...f, seoDescription: event.target.value }))}
                placeholder="توضیح متای دسته برای موتورهای جست‌وجو"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog} disabled={formBusy}>
              انصراف
            </Button>
            <Button type="button" className="font-semibold" disabled={formBusy} onClick={() => void submitForm()}>
              {formBusy ? "در حال ذخیره…" : editing !== null ? "ذخیرهٔ تغییرات" : "ساخت دسته"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* تأیید حذف */}
      <DeleteConfirm
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="حذف دسته"
        description={
          deleting !== null
            ? `دستهٔ «${deleting.title}» حذف شود؟ اگر زیردسته یا محصول داشته باشد، سرور اجازهٔ حذف نمی‌دهد.`
            : ""
        }
        busy={deleteBusy}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
