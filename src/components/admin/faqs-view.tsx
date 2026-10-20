"use client";

/**
 * پرسش‌های متداول — ردیف‌های ساده + جابه‌جایی با فلش
 * ─────────────────────────────
 * ترتیب نمایش عمومی: sortOrder صعودی و فقط فعال‌ها؛
 * ویرایش در دیالوگ (پرسش/پاسخ/ترتیب) و حذف با تأیید.
 */

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  IconArrowDown,
  IconArrowUp,
  IconCirclePlus,
  IconMessageQuestion,
  IconPencil,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { toFa } from "@/lib/format";
import { apiFetch, apiSend } from "@/components/admin/api";
import { DeleteConfirm } from "@/components/admin/delete-confirm";
import { EmptyState } from "@/components/admin/empty-state";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { AdminFaqRow } from "@/types/admin";

interface FaqsResponse {
  items: AdminFaqRow[];
}

interface FaqForm {
  question: string;
  answer: string;
  sortOrder: string;
  isActive: boolean;
}

const EMPTY_FORM: FaqForm = { question: "", answer: "", sortOrder: "0", isActive: true };

export function FaqsView() {
  const [rows, setRows] = useState<AdminFaqRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [editing, setEditing] = useState<AdminFaqRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FaqForm>(EMPTY_FORM);
  const [formBusy, setFormBusy] = useState(false);
  const [deleting, setDeleting] = useState<AdminFaqRow | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback((): void => {
    setLoading(true);
    apiFetch<FaqsResponse>("/api/admin/faqs")
      .then((response) => setRows([...response.items].sort((a, b) => a.sortOrder - b.sortOrder)))
      .catch((error: unknown) =>
        toast.error(error instanceof Error ? error.message : "بارگذاری پرسش‌ها ناموفق بود"),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => load(), [load]);

  /* جابه‌جایی با تعویض sortOrder دو ردیف */
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
          apiSend(`/api/admin/faqs/${a.id}`, "PUT", {
            question: a.question,
            answer: a.answer,
            sortOrder: b.sortOrder,
            isActive: a.isActive,
          }),
          apiSend(`/api/admin/faqs/${b.id}`, "PUT", {
            question: b.question,
            answer: b.answer,
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

  const openEdit = useCallback((faq: AdminFaqRow): void => {
    setEditing(faq);
    setForm({
      question: faq.question,
      answer: faq.answer,
      sortOrder: String(faq.sortOrder),
      isActive: faq.isActive,
    });
  }, []);

  const closeDialog = useCallback((): void => {
    setCreating(false);
    setEditing(null);
  }, []);

  const submitForm = useCallback(async (): Promise<void> => {
    if (form.question.trim().length < 5) {
      toast.error("پرسش را کامل وارد کنید (حداقل ۵ حرف)");
      return;
    }
    if (form.answer.trim().length < 5) {
      toast.error("پاسخ را کامل وارد کنید (حداقل ۵ حرف)");
      return;
    }
    setFormBusy(true);
    const body = {
      question: form.question.trim(),
      answer: form.answer.trim(),
      sortOrder: Number.parseInt(form.sortOrder, 10) || 0,
      isActive: form.isActive,
    };
    try {
      if (editing !== null) {
        await apiSend(`/api/admin/faqs/${editing.id}`, "PUT", body);
        toast.success("پرسش ویرایش شد");
      } else {
        await apiSend("/api/admin/faqs", "POST", body);
        toast.success("پرسش اضافه شد");
      }
      closeDialog();
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ذخیرهٔ پرسش ناموفق بود");
    } finally {
      setFormBusy(false);
    }
  }, [form, editing, closeDialog, load]);

  const confirmDelete = useCallback(async (): Promise<void> => {
    if (deleting === null) return;
    setDeleteBusy(true);
    try {
      await apiSend(`/api/admin/faqs/${deleting.id}`, "DELETE");
      toast.success("پرسش حذف شد");
      setDeleting(null);
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حذف پرسش ناموفق بود");
      setDeleting(null);
    } finally {
      setDeleteBusy(false);
    }
  }, [deleting, load]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="پرسش‌های متداول"
        description={
          loading
            ? "در حال بارگذاری…"
            : `${toFa(rows?.length ?? 0)} پرسش — ${toFa(rows?.filter((row) => row.isActive).length ?? 0)} فعال در صفحهٔ پشتیبانی`
        }
        actions={
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={load} disabled={loading} className="gap-1.5">
              <IconRefresh className="size-4" stroke={1.75} aria-hidden="true" />
              بازآوری
            </Button>
            <Button type="button" size="sm" onClick={openCreate} className="gap-1.5 font-semibold">
              <IconCirclePlus className="size-4" stroke={1.75} aria-hidden="true" />
              پرسش جدید
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : rows === null || rows.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card shadow-xs">
          <EmptyState
            icon={<IconMessageQuestion className="size-7" stroke={1.75} aria-hidden="true" />}
            title="پرسشی ثبت نشده است"
            description="پرسش‌های پرتکرار مشتریان را برای صفحهٔ پرسش‌های متداول ثبت کنید."
            className="py-16"
          />
        </div>
      ) : (
        <ul className="divide-y divide-border/50 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xs">
          {rows.map((faq, index) => (
            <li
              key={faq.id}
              className={cn("flex items-start gap-3 p-4", !faq.isActive && "bg-muted/30")}
            >
              {/* فلش‌های جابه‌جایی */}
              <div className="flex shrink-0 flex-col gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground"
                  disabled={index === 0 || busyId !== null}
                  onClick={() => void move(index, -1)}
                  aria-label={`جابه‌جایی پرسش «${faq.question}» به بالا`}
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
                  aria-label={`جابه‌جایی پرسش «${faq.question}» به پایین`}
                  title="یک پله پایین‌تر"
                >
                  <IconArrowDown className="size-4" stroke={1.75} aria-hidden="true" />
                </Button>
              </div>

              {/* متن */}
              <div className="min-w-0 flex-1">
                <p className={cn("font-semibold leading-7", !faq.isActive && "text-muted-foreground")}>
                  {faq.question}
                </p>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
              </div>

              {/* اقدامات */}
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-primary"
                  onClick={() => openEdit(faq)}
                  aria-label={`ویرایش پرسش ${faq.question}`}
                >
                  <IconPencil className="size-4" stroke={1.75} aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleting(faq)}
                  aria-label={`حذف پرسش ${faq.question}`}
                >
                  <IconTrash className="size-4" stroke={1.75} aria-hidden="true" />
                </Button>
                <label className="flex cursor-pointer items-center gap-1.5">
                  <Switch
                    checked={faq.isActive}
                    disabled={busyId === faq.id}
                    onCheckedChange={async (checked) => {
                      setBusyId(faq.id);
                      try {
                        await apiSend(`/api/admin/faqs/${faq.id}`, "PUT", {
                          question: faq.question,
                          answer: faq.answer,
                          sortOrder: faq.sortOrder,
                          isActive: checked,
                        });
                        toast.success(checked ? "پرسش فعال شد" : "پرسش مخفی شد");
                        load();
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : "تغییر وضعیت ناموفق بود");
                      } finally {
                        setBusyId(null);
                      }
                    }}
                    aria-label={`فعال بودن پرسش ${faq.question}`}
                  />
                  <span className="sr-only">فعال</span>
                </label>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* دیالوگ ساخت/ویرایش پرسش */}
      <Dialog
        open={creating || editing !== null}
        onOpenChange={(open) => {
          if (!open && !formBusy) closeDialog();
        }}
      >
        <DialogContent dir="rtl" className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing !== null ? "ویرایش پرسش" : "پرسش جدید"}</DialogTitle>
            <DialogDescription>
              پرسش‌های فعال به‌ترتیبِ شماره در صفحهٔ پشتیبانی نمایش داده می‌شوند.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <Label htmlFor="faq-question" className="text-xs font-semibold">
                پرسش *
              </Label>
              <Textarea
                id="faq-question"
                rows={2}
                value={form.question}
                onChange={(event) => setForm((f) => ({ ...f, question: event.target.value }))}
                placeholder="مثلاً: هزینهٔ ارسال چقدر است؟"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="faq-answer" className="text-xs font-semibold">
                پاسخ *
              </Label>
              <Textarea
                id="faq-answer"
                rows={5}
                value={form.answer}
                onChange={(event) => setForm((f) => ({ ...f, answer: event.target.value }))}
                placeholder="پاسخ کامل و روشن برای مشتری…"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="faq-order" className="text-xs font-semibold">
                  ترتیب
                </Label>
                <Input
                  id="faq-order"
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
                    aria-label="فعال بودن پرسش"
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
              {formBusy ? "در حال ذخیره…" : editing !== null ? "ذخیرهٔ تغییرات" : "افزودن پرسش"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* تأیید حذف */}
      <DeleteConfirm
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="حذف پرسش"
        description={
          deleting !== null
            ? `پرسش «${deleting.question}» حذف می‌شود؛ این کار برگشت‌پذیر نیست.`
            : ""
        }
        busy={deleteBusy}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
