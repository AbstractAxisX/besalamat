"use client";

/**
 * تب «جستجوهای پرطرفدار» — مدیریت /api/admin/popular-terms
 * ─────────────────────────────
 * واژه‌های پیشنهادی زیر نوار جستجوی هیرو؛ ترتیب عمومی = وزن نزولی
 * (حداکثر ۶ واژهٔ فعال در سایت).
 */

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { IconCirclePlus, IconPencil, IconRefresh, IconSearch, IconTrash } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { toFa } from "@/lib/format";
import { apiFetch, apiSend } from "@/components/admin/api";
import { DeleteConfirm } from "@/components/admin/delete-confirm";
import { EmptyState } from "@/components/admin/empty-state";
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
import type { AdminPopularTermRow } from "@/types/admin";

interface TermsResponse {
  items: AdminPopularTermRow[];
}

interface TermForm {
  term: string;
  weight: string;
  isActive: boolean;
}

const EMPTY_FORM: TermForm = { term: "", weight: "10", isActive: true };

export function HomePopularTab() {
  const [rows, setRows] = useState<AdminPopularTermRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [editing, setEditing] = useState<AdminPopularTermRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<TermForm>(EMPTY_FORM);
  const [formBusy, setFormBusy] = useState(false);
  const [deleting, setDeleting] = useState<AdminPopularTermRow | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback((): void => {
    setLoading(true);
    apiFetch<TermsResponse>("/api/admin/popular-terms")
      .then((response) => setRows(response.items))
      .catch((error: unknown) =>
        toast.error(error instanceof Error ? error.message : "بارگذاری واژه‌ها ناموفق بود"),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => load(), [load]);

  const openCreate = useCallback((): void => {
    setForm(EMPTY_FORM);
    setCreating(true);
  }, []);

  const openEdit = useCallback((term: AdminPopularTermRow): void => {
    setEditing(term);
    setForm({ term: term.term, weight: String(term.weight), isActive: term.isActive });
  }, []);

  const closeDialog = useCallback((): void => {
    setCreating(false);
    setEditing(null);
  }, []);

  const submitForm = useCallback(async (): Promise<void> => {
    if (form.term.trim().length < 2) {
      toast.error("واژه را وارد کنید (حداقل ۲ حرف)");
      return;
    }
    setFormBusy(true);
    const body = {
      term: form.term.trim(),
      weight: Number.parseInt(form.weight, 10) || 0,
      isActive: form.isActive,
    };
    try {
      if (editing !== null) {
        await apiSend(`/api/admin/popular-terms/${editing.id}`, "PUT", body);
        toast.success("واژه ویرایش شد");
      } else {
        await apiSend("/api/admin/popular-terms", "POST", body);
        toast.success("واژه اضافه شد");
      }
      closeDialog();
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ذخیرهٔ واژه ناموفق بود");
    } finally {
      setFormBusy(false);
    }
  }, [form, editing, closeDialog, load]);

  const confirmDelete = useCallback(async (): Promise<void> => {
    if (deleting === null) return;
    setDeleteBusy(true);
    try {
      await apiSend(`/api/admin/popular-terms/${deleting.id}`, "DELETE");
      toast.success("واژه حذف شد");
      setDeleting(null);
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حذف واژه ناموفق بود");
    } finally {
      setDeleteBusy(false);
    }
  }, [deleting, load]);

  return (
    <div className="space-y-5">
      {/* نوار ابزار — شمار + اکشن‌ها در انتهای RTL */}
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs text-muted-foreground">
          {loading
            ? "در حال بارگذاری…"
            : `${toFa(rows?.length ?? 0)} واژه — ${toFa(rows?.filter((row) => row.isActive).length ?? 0)} فعال (سایت: ۶ واژهٔ پر‌وزن)`}
        </p>
        <div className="flex gap-2 ms-auto">
          <Button type="button" variant="ghost" size="sm" onClick={load} disabled={loading} className="gap-1.5">
            <IconRefresh className="size-4" stroke={1.75} aria-hidden="true" />
            بازآوری
          </Button>
          <Button type="button" size="sm" onClick={openCreate} className="gap-1.5 font-semibold">
            <IconCirclePlus className="size-4" stroke={1.75} aria-hidden="true" />
            واژهٔ جدید
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : rows === null || rows.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card shadow-xs">
          <EmptyState
            icon={<IconSearch className="size-7" stroke={1.75} aria-hidden="true" />}
            title="واژه‌ای ثبت نشده است"
            description="واژه‌های پرجستجو زیر نوار جستجوی صفحهٔ اصلی نمایش داده می‌شوند."
            className="py-16"
          />
        </div>
      ) : (
        <ul className="divide-y divide-border/50 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xs">
          {rows.map((term) => (
            <li
              key={term.id}
              className={cn("flex items-center gap-3 p-3.5", !term.isActive && "bg-muted/30")}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <IconSearch className="size-4" stroke={1.75} aria-hidden="true" />
              </span>
              <span className={cn("min-w-0 flex-1 truncate", term.isActive ? "font-bold" : "text-muted-foreground")}>
                {term.term}
              </span>
              <Pill tone="primary" className="shrink-0" title="وزن — ترتیب نمایش در سایت">
                وزن {toFa(term.weight)}
              </Pill>
              <label className="flex shrink-0 cursor-pointer items-center gap-1.5">
                <Switch
                  checked={term.isActive}
                  disabled={busyId === term.id}
                  onCheckedChange={async (checked) => {
                    setBusyId(term.id);
                    try {
                      await apiSend(`/api/admin/popular-terms/${term.id}`, "PUT", {
                        term: term.term,
                        weight: term.weight,
                        isActive: checked,
                      });
                      toast.success(checked ? "واژه فعال شد" : "واژه مخفی شد");
                      load();
                    } catch (error) {
                      toast.error(error instanceof Error ? error.message : "تغییر وضعیت ناموفق بود");
                    } finally {
                      setBusyId(null);
                    }
                  }}
                  aria-label={`فعال بودن واژه ${term.term}`}
                />
                <span className="sr-only">فعال</span>
              </label>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-primary"
                  onClick={() => openEdit(term)}
                  aria-label={`ویرایش واژه ${term.term}`}
                >
                  <IconPencil className="size-4" stroke={1.75} aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleting(term)}
                  aria-label={`حذف واژه ${term.term}`}
                >
                  <IconTrash className="size-4" stroke={1.75} aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* دیالوگ ساخت/ویرایش واژه */}
      <Dialog
        open={creating || editing !== null}
        onOpenChange={(open) => {
          if (!open && !formBusy) closeDialog();
        }}
      >
        <DialogContent dir="rtl" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing !== null ? "ویرایش واژه" : "واژهٔ جدید"}</DialogTitle>
            <DialogDescription>
              واژه‌های فعال با ترتیب وزن (بیشترین اول) زیر جستجوی هیرو نمایش داده می‌شوند.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <Label htmlFor="term-text" className="text-xs font-semibold">
                واژه *
              </Label>
              <Input
                id="term-text"
                value={form.term}
                onChange={(event) => setForm((f) => ({ ...f, term: event.target.value }))}
                placeholder="مثلاً: فشارسنج بازویی"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="term-weight" className="text-xs font-semibold">
                  وزن
                </Label>
                <Input
                  id="term-weight"
                  dir="ltr"
                  inputMode="numeric"
                  className="text-start"
                  value={form.weight}
                  onChange={(event) =>
                    setForm((f) => ({ ...f, weight: event.target.value.replace(/[^\d]/g, "") }))
                  }
                />
                <p className="text-xs text-muted-foreground">عدد بزرگ‌تر = جایگاه بالاتر</p>
              </div>
              <div className="flex items-end">
                <label className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 py-2">
                  <span className="text-xs font-semibold">فعال</span>
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(checked) => setForm((f) => ({ ...f, isActive: checked }))}
                    aria-label="فعال بودن واژه"
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
              {formBusy ? "در حال ذخیره…" : editing !== null ? "ذخیرهٔ تغییرات" : "افزودن واژه"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* تأیید حذف */}
      <DeleteConfirm
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="حذف واژه"
        description={
          deleting !== null
            ? `واژهٔ «${deleting.term}» حذف می‌شود؛ این کار برگشت‌پذیر نیست.`
            : ""
        }
        busy={deleteBusy}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
