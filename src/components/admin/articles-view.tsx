"use client";

/**
 * فهرست مقاله‌های مجله — /admin/articles
 * ─────────────────────────────
 * جدول با فیلتر همه/منتشرشده/پیش‌نویس؛ ویرایش به صفحهٔ ادیتور
 * اختصاصی (/admin/articles/new و /admin/articles/[id]) می‌رود.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import {
  IconCirclePlus,
  IconNews,
  IconPencil,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";

import { toFa } from "@/lib/format";
import { faDateShort } from "@/lib/jalali";
import { apiFetch, apiSend } from "@/components/admin/api";
import { DataTable } from "@/components/admin/data-table";
import { DeleteConfirm } from "@/components/admin/delete-confirm";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AdminArticleRow } from "@/types/admin";

interface ArticlesResponse {
  items: AdminArticleRow[];
}

type ArticleFilter = "all" | "published" | "draft";

export function ArticlesView() {
  const [rows, setRows] = useState<AdminArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ArticleFilter>("all");
  const [deleting, setDeleting] = useState<AdminArticleRow | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback((): void => {
    setLoading(true);
    setError(null);
    apiFetch<ArticlesResponse>("/api/admin/articles")
      .then((response) => setRows(response.items))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "بارگذاری مقاله‌ها ناموفق بود"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => load(), [load]);

  const confirmDelete = useCallback(async (): Promise<void> => {
    if (deleting === null) return;
    setDeleteBusy(true);
    try {
      await apiSend(`/api/admin/articles/${deleting.id}`, "DELETE");
      toast.success("مقاله حذف شد");
      setDeleting(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "حذف مقاله ناموفق بود");
      setDeleting(null);
    } finally {
      setDeleteBusy(false);
    }
  }, [deleting, load]);

  const filtered = useMemo(() => {
    if (filter === "published") return rows.filter((row) => row.isPublished);
    if (filter === "draft") return rows.filter((row) => !row.isPublished);
    return rows;
  }, [rows, filter]);

  const columns = useMemo<ColumnDef<AdminArticleRow, unknown>[]>(
    () => [
      {
        id: "cover",
        header: "جلد",
        cell: ({ row }) => (
          <span className="block h-10 w-16 overflow-hidden rounded-lg border bg-muted/60">
            <img
              src={row.original.coverUrl}
              alt={`جلد مقالهٔ ${row.original.title}`}
              className="h-full w-full object-cover"
            />
          </span>
        ),
      },
      {
        id: "title",
        header: "عنوان",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="max-w-56 truncate font-semibold">{row.original.title}</p>
            <p dir="ltr" className="truncate text-start font-mono text-[11px] text-muted-foreground">
              {row.original.slug}
            </p>
          </div>
        ),
      },
      {
        id: "category",
        header: "دسته",
        cell: ({ row }) =>
          row.original.categoryTitle ? (
            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
              {row.original.categoryTitle}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: "isPublished",
        header: "وضعیت",
        cell: ({ row }) =>
          row.original.isPublished ? (
            <span className="rounded-full border border-success/20 bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
              منتشرشده
            </span>
          ) : (
            <span className="rounded-full border border-warning/20 bg-warning/10 px-2 py-0.5 text-[11px] font-semibold text-warning">
              پیش‌نویس
            </span>
          ),
      },
      {
        accessorKey: "publishedAt",
        header: "تاریخ انتشار",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {row.original.publishedAt !== null ? faDateShort(row.original.publishedAt) : "—"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "عملیات",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="icon" className="size-8" asChild>
              <Link
                href={`/admin/articles/${row.original.id}`}
                aria-label={`ویرایش مقالهٔ ${row.original.title}`}
              >
                <IconPencil className="size-4 text-muted-foreground" stroke={1.75} aria-hidden="true" />
              </Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-destructive"
              onClick={() => setDeleting(row.original)}
              aria-label={`حذف مقالهٔ ${row.original.title}`}
            >
              <IconTrash className="size-4" stroke={1.75} aria-hidden="true" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="مقالات"
        description={
          loading
            ? "در حال بارگذاری…"
            : `${toFa(rows.length)} مقاله — ${toFa(rows.filter((row) => row.isPublished).length)} منتشرشده`
        }
        actions={
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={load} disabled={loading} className="gap-1.5">
              <IconRefresh className="size-4" stroke={1.75} aria-hidden="true" />
              بازآوری
            </Button>
            <Button type="button" size="sm" asChild className="gap-1.5 font-semibold">
              <Link href="/admin/articles/new">
                <IconCirclePlus className="size-4" stroke={1.75} aria-hidden="true" />
                مقالهٔ جدید
              </Link>
            </Button>
          </div>
        }
      />

      {/* فیلتر وضعیت */}
      <Tabs value={filter} onValueChange={(value) => setFilter(value as ArticleFilter)} dir="rtl">
        <TabsList className="h-auto rounded-xl p-1">
          <TabsTrigger value="all" className="px-3 py-1.5">
            همه ({toFa(rows.length)})
          </TabsTrigger>
          <TabsTrigger value="published" className="px-3 py-1.5">
            منتشرشده
          </TabsTrigger>
          <TabsTrigger value="draft" className="px-3 py-1.5">
            پیش‌نویس
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {error ? (
        <p className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        emptyTitle="مقاله‌ای پیدا نشد"
        emptyDescription={
          filter === "all"
            ? "اولین مقالهٔ مجلهٔ سلامت را بنویسید."
            : "در این وضعیت مقاله‌ای نیست."
        }
      />

      <DeleteConfirm
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="حذف مقاله"
        description={
          deleting !== null
            ? `مقالهٔ «${deleting.title}» برای همیشه حذف می‌شود؛ این کار برگشت‌پذیر نیست.`
            : ""
        }
        busy={deleteBusy}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
