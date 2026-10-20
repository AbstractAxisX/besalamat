"use client";

/**
 * صندوق پیام‌های تماس — دوپنلی (فهرست راست، متن چپ)
 * ─────────────────────────────
 * کلیک روی پیام آن را «خوانده‌شده» می‌کند (PUT) و در پنل نمایش
 * می‌دهد؛ در موبایل متن در Dialog باز می‌شود. دکمهٔ تماس با tel: لینک است.
 * جستجوی سمت کلاینت روی نام/موضوع/متن (نوار ابزار مشابه سایر صفحات).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  IconInbox,
  IconMail,
  IconPhone,
  IconRefresh,
  IconUser,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { formatPhoneFa, toFa } from "@/lib/format";
import { faDateTime, faRelative } from "@/lib/jalali";
import { apiFetch, apiSend } from "@/components/admin/api";
import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { SearchInput } from "@/components/admin/search-input";
import { Pill } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminMessageRow } from "@/types/admin";

interface MessagesResponse {
  items: AdminMessageRow[];
}

/** پنل متن پیام — مشترک بین نمای دسکتاپ و دیالوگ موبایل */
function MessageBody({ message }: { message: AdminMessageRow }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* سربرگ: فرستنده + راه‌های پاسخ */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/50 p-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {message.name.trim().charAt(0) || "؟"}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold">{message.name}</p>
            <p className="text-xs text-muted-foreground">{faDateTime(message.createdAt)}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" variant="outline" size="sm" asChild className="gap-1.5">
            <a href={`tel:${message.phone}`}>
              <IconPhone className="size-4" stroke={1.75} aria-hidden="true" />
              تماس
            </a>
          </Button>
          {message.email ? (
            <Button type="button" variant="outline" size="sm" asChild className="gap-1.5">
              <a href={`mailto:${message.email}`}>
                <IconMail className="size-4" stroke={1.75} aria-hidden="true" />
                رایانامه
              </a>
            </Button>
          ) : null}
        </div>
      </div>

      {/* موضوع و متن */}
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <Pill tone="primary">{message.subject}</Pill>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-8">{message.body}</p>
      </div>

      {/* پاصفحه: راهنمای پاسخ */}
      <div className="border-t border-border/50 bg-muted/30 p-3 text-center text-xs leading-6 text-muted-foreground">
        برای پاسخ، با شمارهٔ <span dir="ltr" className="font-semibold">{formatPhoneFa(message.phone)}</span> تماس
        بگیرید یا رایانامه بفرستید؛ پاسخ از داخل پنل ارسال نمی‌شود.
      </div>
    </div>
  );
}

export function MessagesView() {
  const [rows, setRows] = useState<AdminMessageRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async (): Promise<void> => {
    try {
      const response = await apiFetch<MessagesResponse>("/api/admin/messages");
      setRows(response.items);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "بارگذاری پیام‌ها ناموفق بود");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const unreadCount = useMemo(() => rows?.filter((row) => !row.isRead).length ?? 0, [rows]);
  /* جستجوی سمت کلاینت — نام، موضوع یا متن */
  const filtered = useMemo(() => {
    if (rows === null) return null;
    const query = search.trim();
    if (query.length === 0) return rows;
    return rows.filter(
      (row) =>
        row.name.includes(query) || row.subject.includes(query) || row.body.includes(query),
    );
  }, [rows, search]);
  const selected = useMemo(
    () => rows?.find((row) => row.id === selectedId) ?? null,
    [rows, selectedId],
  );

  /* انتخاب پیام → خوانده‌شده شدن خودکار (دیالوگ فقط در نمای موبایل باز می‌شود) */
  const select = useCallback(
    (message: AdminMessageRow): void => {
      setSelectedId(message.id);
      if (window.matchMedia("(max-width: 1023px)").matches) {
        setMobileOpen(true);
      }
      if (message.isRead) return;
      apiSend(`/api/admin/messages/${message.id}`, "PUT", { isRead: true })
        .then(() => {
          setRows((current) =>
            current === null
              ? current
              : current.map((row) => (row.id === message.id ? { ...row, isRead: true } : row)),
          );
        })
        .catch((error: unknown) =>
          toast.error(error instanceof Error ? error.message : "علامت‌گذاری خوانده‌شده ناموفق بود"),
        );
    },
    [],
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="پیام‌ها"
        description="پیام‌های فرم «تماس با ما»"
        actions={
          <Button type="button" variant="outline" size="sm" onClick={load} disabled={loading} className="gap-1.5">
            <IconRefresh className="size-4" stroke={1.75} aria-hidden="true" />
            بازآوری
          </Button>
        }
      />

      {/* نوار ابزار + صندوق دوپنلی (گروه یکدست) */}
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="جستجو در نام، موضوع یا متن…"
            ariaLabel="جستجوی پیام"
          />
          <p className="text-xs text-muted-foreground">
            {loading
              ? "در حال بارگذاری…"
              : rows === null || rows.length === 0
                ? "صندوق پیام خالی است"
                : `${toFa(filtered?.length ?? 0)} پیام${unreadCount > 0 ? ` — ${toFa(unreadCount)} خوانده‌نشده` : " — همه خوانده‌شده"}`}
          </p>
        </div>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_1fr]">
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
          <Skeleton className="hidden h-96 w-full rounded-2xl lg:block" />
        </div>
      ) : filtered === null || filtered.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card shadow-xs">
          <EmptyState
            icon={<IconInbox className="size-6" stroke={1.75} aria-hidden="true" />}
            title={
              rows !== null && rows.length > 0 && search.trim().length > 0
                ? "پیامی با این جستجو پیدا نشد"
                : "پیامی نرسیده است"
            }
            description={
              rows !== null && rows.length > 0 && search.trim().length > 0
                ? "عبارت دیگری را جستجو کنید."
                : "پیام‌های فرم «تماس با ما» اینجا نمایش داده می‌شوند."
            }
            className="py-16"
          />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_1fr]">
          {/* فهرست پیام‌ها (راست) */}
          <ul className="max-h-[70vh] divide-y divide-border/50 overflow-y-auto rounded-2xl border border-border/60 bg-card shadow-xs lg:max-h-[75vh]">
            {filtered.map((message) => (
              <li key={message.id}>
                <button
                  type="button"
                  onClick={() => select(message)}
                  aria-current={selectedId === message.id}
                  className={cn(
                    "flex w-full items-start gap-3 p-4 text-start transition-colors hover:bg-muted/40",
                    selectedId === message.id && "bg-muted/60",
                    !message.isRead && "bg-primary/[0.04]",
                  )}
                >
                  {/* نقطهٔ خوانده‌نشده */}
                  <span className="mt-2 flex size-2 shrink-0 justify-center" aria-hidden="true">
                    {message.isRead ? null : (
                      <span className="size-2 rounded-full bg-primary" title="خوانده‌نشده" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className={cn("truncate text-sm", message.isRead ? "font-semibold" : "font-bold")}>
                        {message.name}
                      </span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {faRelative(message.createdAt)}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 block truncate text-xs",
                        message.isRead ? "text-muted-foreground" : "font-semibold text-foreground/80",
                      )}
                    >
                      {message.subject}
                    </span>
                    <span className="mt-1 block truncate text-xs text-muted-foreground">
                      {message.body}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {/* پنل متن (چپ — فقط دسکتاپ) */}
          <div className="hidden min-h-[480px] overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xs lg:block">
            {selected !== null ? (
              <MessageBody message={selected} />
            ) : (
              <EmptyState
                icon={<IconUser className="size-6" stroke={1.75} aria-hidden="true" />}
                title="پیامی انتخاب نشده است"
                description="از فهرست سمت راست یک پیام را انتخاب کنید تا متن کامل آن نمایش داده شود."
                className="py-16"
              />
            )}
          </div>
        </div>
      )}
      </div>

      {/* دیالوگ موبایل */}
      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent dir="rtl" className="max-h-[85vh] overflow-hidden p-0 sm:max-w-lg">
          <DialogHeader className="border-b border-border/50 p-4">
            <DialogTitle className="text-base">متن پیام</DialogTitle>
            <DialogDescription>
              {selected !== null ? `${selected.name} — ${faDateTime(selected.createdAt)}` : ""}
            </DialogDescription>
          </DialogHeader>
          {selected !== null ? (
            <div className="max-h-[62vh] overflow-y-auto px-4 py-3">
              <Pill tone="primary">{selected.subject}</Pill>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-8">{selected.body}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" asChild className="gap-1.5">
                  <a href={`tel:${selected.phone}`}>
                    <IconPhone className="size-4" stroke={1.75} aria-hidden="true" />
                    تماس با {formatPhoneFa(selected.phone)}
                  </a>
                </Button>
                {selected.email ? (
                  <Button type="button" variant="outline" size="sm" asChild className="gap-1.5">
                    <a href={`mailto:${selected.email}`}>
                      <IconMail className="size-4" stroke={1.75} aria-hidden="true" />
                      رایانامه
                    </a>
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
