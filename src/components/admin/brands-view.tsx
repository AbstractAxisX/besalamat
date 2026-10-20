"use client";

/**
 * برندها — جدول مدیریت /api/admin/brands
 * ─────────────────────────────
 * ساخت/ویرایش در دیالوگ (عنوان/نامک/لوگو با آپلود)؛ حذف برند مجاز است و
 * محصولات مرتبط طبق اسکیمای دیتابیس بدون برند می‌شوند.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import {
  IconBuildingStore,
  IconCirclePlus,
  IconPencil,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { toFa } from "@/lib/format";
import { apiFetch, apiSend } from "@/components/admin/api";
import { DataTable } from "@/components/admin/data-table";
import { DeleteConfirm } from "@/components/admin/delete-confirm";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { PageHeader } from "@/components/admin/page-header";
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
import { Switch } from "@/components/ui/switch";
import type { AdminBrandRow } from "@/types/admin";

interface BrandsResponse {
  items: AdminBrandRow[];
}

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

interface BrandForm {
  title: string;
  slug: string;
  logoUrl: string;
  sortOrder: string;
  isActive: boolean;
}

const EMPTY_FORM: BrandForm = {
  title: "",
  slug: "",
  logoUrl: "",
  sortOrder: "0",
  isActive: true,
};

export function BrandsView() {
  const [rows, setRows] = useState<AdminBrandRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [editing, setEditing] = useState<AdminBrandRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<BrandForm>(EMPTY_FORM);
  const [formBusy, setFormBusy] = useState(false);
  const [deleting, setDeleting] = useState<AdminBrandRow | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback((): void => {
    setLoading(true);
    setError(null);
    apiFetch<BrandsResponse>("/api/admin/brands")
      .then((response) => setRows(response.items))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "بارگذاری برندها ناموفق بود"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => load(), [load]);

  const openCreate = useCallback((): void => {
    const nextOrder = rows.length > 0 ? rows[rows.length - 1].sortOrder + 1 : 0;
    setForm({ ...EMPTY_FORM, sortOrder: String(nextOrder) });
    setCreating(true);
  }, [rows]);

  const openEdit = useCallback((brand: AdminBrandRow): void => {
    setEditing(brand);
    setForm({
      title: brand.title,
      slug: brand.slug,
      logoUrl: brand.logoUrl ?? "",
      sortOrder: String(brand.sortOrder),
      isActive: brand.isActive,
    });
  }, []);

  const closeDialog = useCallback((): void => {
    setCreating(false);
    setEditing(null);
  }, []);

  const submitForm = useCallback(async (): Promise<void> => {
    if (form.title.trim().length < 2) {
      toast.error("عنوان برند را وارد کنید (حداقل ۲ حرف)");
      return;
    }
    if (!SLUG_REGEX.test(form.slug.trim())) {
      toast.error("نامک فقط حروف کوچک لاتین، عدد و خط تیره — مثل omron");
      return;
    }
    setFormBusy(true);
    const body = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      logoUrl: form.logoUrl.trim().length > 0 ? form.logoUrl.trim() : null,
      sortOrder: Number.parseInt(form.sortOrder, 10) || 0,
      isActive: form.isActive,
    };
    try {
      if (editing !== null) {
        await apiSend(`/api/admin/brands/${editing.id}`, "PUT", body);
        toast.success("برند ویرایش شد");
      } else {
        await apiSend("/api/admin/brands", "POST", body);
        toast.success("برند جدید ساخته شد");
      }
      closeDialog();
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ذخیرهٔ برند ناموفق بود");
    } finally {
      setFormBusy(false);
    }
  }, [form, editing, closeDialog, load]);

  const confirmDelete = useCallback(async (): Promise<void> => {
    if (deleting === null) return;
    setDeleteBusy(true);
    try {
      await apiSend(`/api/admin/brands/${deleting.id}`, "DELETE");
      toast.success("برند حذف شد");
      setDeleting(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "حذف برند ناموفق بود");
      setDeleting(null);
    } finally {
      setDeleteBusy(false);
    }
  }, [deleting, load]);

  const toggleActive = useCallback(
    async (brand: AdminBrandRow, checked: boolean): Promise<void> => {
      setBusyId(brand.id);
      try {
        await apiSend(`/api/admin/brands/${brand.id}`, "PUT", {
          title: brand.title,
          slug: brand.slug,
          logoUrl: brand.logoUrl,
          sortOrder: brand.sortOrder,
          isActive: checked,
        });
        toast.success(checked ? `برند «${brand.title}» فعال شد` : `برند «${brand.title}» مخفی شد`);
        load();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "تغییر وضعیت ناموفق بود");
      } finally {
        setBusyId(null);
      }
    },
    [load],
  );

  const columns = useMemo<ColumnDef<AdminBrandRow, unknown>[]>(
    () => [
      {
        id: "brand",
        header: "برند",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/60">
              {row.original.logoUrl ? (
                <img
                  src={row.original.logoUrl}
                  alt={`لوگوی ${row.original.title}`}
                  className="h-full w-full object-contain p-1"
                />
              ) : (
                <IconBuildingStore className="size-4.5 text-muted-foreground" stroke={1.75} aria-hidden="true" />
              )}
            </span>
            <div className="min-w-0">
              <p className="max-w-44 truncate font-semibold">{row.original.title}</p>
              <p dir="ltr" className="truncate text-start font-mono text-[11px] text-muted-foreground">
                {row.original.slug}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "productCount",
        header: "محصولات",
        cell: ({ row }) => (
          <span className="font-semibold tabular-nums">{toFa(row.original.productCount)}</span>
        ),
      },
      {
        accessorKey: "sortOrder",
        header: "ترتیب",
        cell: ({ row }) => (
          <span className="text-muted-foreground tabular-nums">{toFa(row.original.sortOrder)}</span>
        ),
      },
      {
        id: "status",
        header: "وضعیت",
        cell: ({ row }) => (
          <label className="flex cursor-pointer items-center gap-2" onClick={(event) => event.stopPropagation()}>
            <Switch
              checked={row.original.isActive}
              disabled={busyId === row.original.id}
              onCheckedChange={(checked) => void toggleActive(row.original, checked)}
              aria-label={`فعال بودن برند ${row.original.title}`}
            />
            <span className="text-xs font-semibold text-muted-foreground">
              {row.original.isActive ? "فعال" : "غیرفعال"}
            </span>
          </label>
        ),
      },
      {
        id: "actions",
        header: "عملیات",
        cell: ({ row }) => (
          <div className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-primary"
              onClick={() => openEdit(row.original)}
              aria-label={`ویرایش ${row.original.title}`}
            >
              <IconPencil className="size-4" stroke={1.75} aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-destructive"
              onClick={() => setDeleting(row.original)}
              aria-label={`حذف ${row.original.title}`}
            >
              <IconTrash className="size-4" stroke={1.75} aria-hidden="true" />
            </Button>
          </div>
        ),
      },
    ],
    [busyId, openEdit, toggleActive],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="برندها"
        description={
          loading
            ? "در حال بارگذاری…"
            : `${toFa(rows.length)} برند — ${toFa(rows.filter((row) => row.isActive).length)} فعال`
        }
        actions={
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={load} disabled={loading} className="gap-1.5">
              <IconRefresh className="size-4" stroke={1.75} aria-hidden="true" />
              بازآوری
            </Button>
            <Button type="button" size="sm" onClick={openCreate} className="gap-1.5 font-semibold">
              <IconCirclePlus className="size-4" stroke={1.75} aria-hidden="true" />
              برند جدید
            </Button>
          </div>
        }
      />

      {error ? (
        <p className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        emptyTitle="برندی ثبت نشده است"
        emptyDescription="برندها در نوار برندای صفحهٔ اصلی و فیلتر محصولات نمایش داده می‌شوند."
      />

      <p className={cn("text-xs leading-6 text-muted-foreground")}>
        حذف برند مجاز است؛ محصولات مرتبط با آن به‌صورت خودکار «بدون برند» می‌شوند.
      </p>

      {/* دیالوگ ساخت/ویرایش برند */}
      <Dialog
        open={creating || editing !== null}
        onOpenChange={(open) => {
          if (!open && !formBusy) closeDialog();
        }}
      >
        <DialogContent dir="rtl" className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing !== null ? "ویرایش برند" : "برند جدید"}</DialogTitle>
            <DialogDescription>نامک برند در فیلترها و نشانی محصولات استفاده می‌شود.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="brand-title" className="text-xs font-semibold">
                  عنوان *
                </Label>
                <Input
                  id="brand-title"
                  value={form.title}
                  onChange={(event) => setForm((f) => ({ ...f, title: event.target.value }))}
                  placeholder="مثلاً: اومرون"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="brand-slug" className="text-xs font-semibold">
                  نامک *
                </Label>
                <Input
                  id="brand-slug"
                  dir="ltr"
                  className="text-start font-mono"
                  value={form.slug}
                  onChange={(event) => setForm((f) => ({ ...f, slug: event.target.value.toLowerCase() }))}
                  placeholder="omron"
                />
              </div>
            </div>
            <ImageUploadField
              ratio="square"
              label="لوگو (اختیاری)"
              value={form.logoUrl}
              onChange={(url) => setForm((f) => ({ ...f, logoUrl: url }))}
              hint="لوگوی شفاف با پس‌زمینهٔ روشن بهترین نتیجه را دارد"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="brand-order" className="text-xs font-semibold">
                  ترتیب
                </Label>
                <Input
                  id="brand-order"
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
                    aria-label="فعال بودن برند"
                  />
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog} disabled={formBusy}>
              انصراف
            </Button>
            <Button type="button" className="font-semibold" disabled={formBusy} onClick={() => void submitForm()}>
              {formBusy ? "در حال ذخیره…" : editing !== null ? "ذخیرهٔ تغییرات" : "ساخت برند"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* تأیید حذف */}
      <DeleteConfirm
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="حذف برند"
        description={
          deleting !== null
            ? `برند «${deleting.title}» حذف شود؟ ${deleting.productCount > 0 ? `${toFa(deleting.productCount)} محصول این برند بدون برند می‌شوند.` : ""}`
            : ""
        }
        busy={deleteBusy}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
