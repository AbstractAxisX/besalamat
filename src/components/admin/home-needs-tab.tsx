"use client";

/**
 * تب «خرید بر اساس نیاز» — مدیریت /api/admin/needs
 * ─────────────────────────────
 * ردیف‌های شماره‌دار با فلش بالا/پایین (جابه‌جایی دو PUT)؛
 * مقصد هر کارت معمولاً فیلتر دستهٔ مرتبط است.
 */

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  IconArrowDown,
  IconArrowUp,
  IconCirclePlus,
  IconHeartbeat,
  IconPencil,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { toFa } from "@/lib/format";
import { apiFetch, apiSend } from "@/components/admin/api";
import { DeleteConfirm } from "@/components/admin/delete-confirm";
import { EmptyState } from "@/components/admin/empty-state";
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
import type { AdminNeedRow } from "@/types/admin";

interface NeedsResponse {
  items: AdminNeedRow[];
}

interface NeedForm {
  title: string;
  description: string;
  href: string;
  sortOrder: string;
  isActive: boolean;
}

const EMPTY_FORM: NeedForm = {
  title: "",
  description: "",
  href: "",
  sortOrder: "0",
  isActive: true,
};

export function HomeNeedsTab() {
  const [rows, setRows] = useState<AdminNeedRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [editing, setEditing] = useState<AdminNeedRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<NeedForm>(EMPTY_FORM);
  const [formBusy, setFormBusy] = useState(false);
  const [deleting, setDeleting] = useState<AdminNeedRow | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback((): void => {
    setLoading(true);
    apiFetch<NeedsResponse>("/api/admin/needs")
      .then((response) => setRows([...response.items].sort((a, b) => a.sortOrder - b.sortOrder)))
      .catch((error: unknown) =>
        toast.error(error instanceof Error ? error.message : "بارگذاری نیازها ناموفق بود"),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => load(), [load]);

  /* جابه‌جایی ردیف — دو PUT با sortOrder جابه‌جاشده */
  const move = useCallback(
    async (index: number, direction: -1 | 1): Promise<void> => {
      if (rows === null) return;
      const target = index + direction;
      if (target < 0 || target >= rows.length) return;
      const a = rows[index];
      const b = rows[target];
      setBusyId(a.id);
      try {
        await Promise.all([
          apiSend(`/api/admin/needs/${a.id}`, "PUT", {
            title: a.title,
            description: a.description,
            href: a.href,
            sortOrder: b.sortOrder,
            isActive: a.isActive,
          }),
          apiSend(`/api/admin/needs/${b.id}`, "PUT", {
            title: b.title,
            description: b.description,
            href: b.href,
            sortOrder: a.sortOrder,
            isActive: b.isActive,
          }),
        ]);
        load();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "جابه‌جایی ناموفق بود");
      } finally {
        setBusyId(null);
      }
    },
    [rows, load],
  );

  const openCreate = useCallback((): void => {
    const nextOrder = rows !== null && rows.length > 0 ? rows[rows.length - 1].sortOrder + 1 : 0;
    setForm({ ...EMPTY_FORM, sortOrder: String(nextOrder) });
    setCreating(true);
  }, [rows]);

  const openEdit = useCallback((need: AdminNeedRow): void => {
    setEditing(need);
    setForm({
      title: need.title,
      description: need.description,
      href: need.href,
      sortOrder: String(need.sortOrder),
      isActive: need.isActive,
    });
  }, []);

  const closeDialog = useCallback((): void => {
    setCreating(false);
    setEditing(null);
  }, []);

  const submitForm = useCallback(async (): Promise<void> => {
    if (form.title.trim().length < 2) {
      toast.error("عنوان نیاز را وارد کنید (حداقل ۲ حرف)");
      return;
    }
    if (form.description.trim().length < 2) {
      toast.error("توضیح نیاز را وارد کنید");
      return;
    }
    if (form.href.trim().length === 0) {
      toast.error("مقصد کلیک را وارد کنید (مثل /products?category=…)");
      return;
    }
    setFormBusy(true);
    const body = {
      title: form.title.trim(),
      description: form.description.trim(),
      href: form.href.trim(),
      sortOrder: Number.parseInt(form.sortOrder, 10) || 0,
      isActive: form.isActive,
    };
    try {
      if (editing !== null) {
        await apiSend(`/api/admin/needs/${editing.id}`, "PUT", body);
        toast.success("کارت نیاز ویرایش شد و صفحهٔ اصلی به‌روز شد");
      } else {
        await apiSend("/api/admin/needs", "POST", body);
        toast.success("کارت نیاز ساخته شد و صفحهٔ اصلی به‌روز شد");
      }
      closeDialog();
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ذخیرهٔ کارت نیاز ناموفق بود");
    } finally {
      setFormBusy(false);
    }
  }, [form, editing, closeDialog, load]);

  const confirmDelete = useCallback(async (): Promise<void> => {
    if (deleting === null) return;
    setDeleteBusy(true);
    try {
      await apiSend(`/api/admin/needs/${deleting.id}`, "DELETE");
      toast.success("کارت نیاز حذف شد");
      setDeleting(null);
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حذف کارت نیاز ناموفق بود");
    } finally {
      setDeleteBusy(false);
    }
  }, [deleting, load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {loading ? "در حال بارگذاری…" : `${toFa(rows?.length ?? 0)} کارت نیاز در صفحهٔ اصلی`}
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={load} disabled={loading} className="gap-1.5">
            <IconRefresh className="size-4" stroke={1.75} aria-hidden="true" />
            بازآوری
          </Button>
          <Button type="button" size="sm" onClick={openCreate} className="gap-1.5 font-semibold">
            <IconCirclePlus className="size-4" stroke={1.75} aria-hidden="true" />
            نیاز جدید
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : rows === null || rows.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card shadow-xs">
          <EmptyState
            icon={<IconHeartbeat className="size-7" stroke={1.75} aria-hidden="true" />}
            title="کارت نیازی ثبت نشده است"
            description="ردیف‌های «خرید بر اساس نیاز» بخش کلیدی صفحهٔ اصلی هستند؛ اولین را بسازید."
            className="py-16"
          />
        </div>
      ) : (
        <ul className="divide-y divide-border/50 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xs">
          {rows.map((need, index) => (
            <li
              key={need.id}
              className={cn(
                "flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4",
                !need.isActive && "bg-muted/30",
              )}
            >
              {/* دایرهٔ شماره + فلش‌ها */}
              <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:gap-1">
                <span
                  className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary"
                  aria-hidden="true"
                >
                  {toFa(index + 1)}
                </span>
                <div className="flex items-center gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground"
                    disabled={index === 0 || busyId !== null}
                    onClick={() => void move(index, -1)}
                    aria-label={`جابه‌جایی «${need.title}» به بالا`}
                    title="یک پله بالاتر"
                  >
                    <IconArrowUp className="size-4" stroke={1.75} aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground"
                    disabled={index === rows.length - 1 || busyId !== null}
                    onClick={() => void move(index, 1)}
                    aria-label={`جابه‌جایی «${need.title}» به پایین`}
                    title="یک پله پایین‌تر"
                  >
                    <IconArrowDown className="size-4" stroke={1.75} aria-hidden="true" />
                  </Button>
                </div>
              </div>

              {/* متن */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{need.title}</p>
                <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{need.description}</p>
                <p dir="ltr" className="mt-1 truncate text-start font-mono text-[11px] text-muted-foreground">
                  {need.href}
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
                    onClick={() => openEdit(need)}
                    aria-label={`ویرایش ${need.title}`}
                  >
                    <IconPencil className="size-4" stroke={1.75} aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleting(need)}
                    aria-label={`حذف ${need.title}`}
                  >
                    <IconTrash className="size-4" stroke={1.75} aria-hidden="true" />
                  </Button>
                </div>
                <label className="flex cursor-pointer items-center gap-1.5">
                  <Switch
                    checked={need.isActive}
                    disabled={busyId === need.id}
                    onCheckedChange={async (checked) => {
                      setBusyId(need.id);
                      try {
                        await apiSend(`/api/admin/needs/${need.id}`, "PUT", {
                          title: need.title,
                          description: need.description,
                          href: need.href,
                          sortOrder: need.sortOrder,
                          isActive: checked,
                        });
                        toast.success(checked ? "کارت فعال شد" : "کارت مخفی شد");
                        load();
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : "تغییر وضعیت ناموفق بود");
                      } finally {
                        setBusyId(null);
                      }
                    }}
                    aria-label={`فعال بودن ${need.title}`}
                  />
                  <span className="text-xs font-semibold text-muted-foreground">
                    {need.isActive ? "فعال" : "غیرفعال"}
                  </span>
                </label>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* دیالوگ ساخت/ویرایش */}
      <Dialog
        open={creating || editing !== null}
        onOpenChange={(open) => {
          if (!open && !formBusy) closeDialog();
        }}
      >
        <DialogContent dir="rtl" className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing !== null ? "ویرایش کارت نیاز" : "کارت نیاز جدید"}</DialogTitle>
            <DialogDescription>
              هر نیاز یک ردیف شماره‌دار در صفحهٔ اصلی است؛ با مقصد آن می‌توانید به فیلتر دستهٔ مرتبط لینک بدهید.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <Label htmlFor="need-title" className="text-xs font-semibold">
                عنوان *
              </Label>
              <Input
                id="need-title"
                value={form.title}
                onChange={(event) => setForm((f) => ({ ...f, title: event.target.value }))}
                placeholder="مثلاً: سلامت قلب و فشار خون"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="need-description" className="text-xs font-semibold">
                توضیح *
              </Label>
              <Textarea
                id="need-description"
                rows={2}
                value={form.description}
                onChange={(event) => setForm((f) => ({ ...f, description: event.target.value }))}
                placeholder="یک خط توضیح برای دغدغهٔ مشتری"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="need-href" className="text-xs font-semibold">
                مقصد کلیک *
              </Label>
              <Input
                id="need-href"
                dir="ltr"
                className="text-start"
                value={form.href}
                onChange={(event) => setForm((f) => ({ ...f, href: event.target.value }))}
                placeholder="/products?category=blood-pressure"
              />
              <p className="text-xs text-muted-foreground">
                معمولاً /products?category=نامک-دسته — آیکون کارت از همین دسته انتخاب می‌شود.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="need-order" className="text-xs font-semibold">
                  ترتیب
                </Label>
                <Input
                  id="need-order"
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
                    aria-label="فعال بودن کارت نیاز"
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
              {formBusy ? "در حال ذخیره…" : editing !== null ? "ذخیرهٔ تغییرات" : "ساخت کارت"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* تأیید حذف */}
      <DeleteConfirm
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="حذف کارت نیاز"
        description={
          deleting !== null
            ? `کارت «${deleting.title}» از صفحهٔ اصلی حذف می‌شود؛ این کار برگشت‌پذیر نیست.`
            : ""
        }
        busy={deleteBusy}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
