"use client";

/**
 * فهرست محصولات پنل — TanStack Table + جستجوی سروری + صفحه‌بندی سروری
 * ─────────────────────────────
 * GET /api/admin/products?q=&page= → {items,total,page,pageCount}؛
 * حذف با AlertDialog تأییدیه؛ ویرایش → /admin/products/[id].
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import {
  IconChevronLeft,
  IconChevronRight,
  IconPackage,
  IconPencil,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { toFa, formatTomanPlain } from "@/lib/format";
import { apiFetch, apiSend } from "@/components/admin/api";
import { DataTable } from "@/components/admin/data-table";
import { PageHeader } from "@/components/admin/page-header";
import { SearchInput } from "@/components/admin/search-input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { AdminProductListResponse, AdminProductRow } from "@/types/admin";

const PAGE_SIZE = 20;

/** بج‌های وضعیت — پیل‌های نرم یکدست */
function StatusPills({ row }: { row: AdminProductRow }) {
  return (
    <span className="flex flex-wrap items-center gap-1">
      <span
        className={cn(
          "rounded-full border px-2 py-0.5 text-[11px] font-semibold",
          row.isActive
            ? "border-success/20 bg-success/10 text-success"
            : "border-border bg-muted text-muted-foreground",
        )}
      >
        {row.isActive ? "فعال" : "غیرفعال"}
      </span>
      {row.isNew ? (
        <span className="rounded-full border border-fresh/20 bg-fresh/10 px-2 py-0.5 text-[11px] font-semibold text-fresh">
          جدید
        </span>
      ) : null}
      {row.isFeatured ? (
        <span className="rounded-full border border-warning/20 bg-warning/10 px-2 py-0.5 text-[11px] font-semibold text-warning">
          ویژه
        </span>
      ) : null}
    </span>
  );
}

export function ProductsView() {
  const router = useRouter();

  /* ── وضعیت فهرست ── */
  const [search, setSearch] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminProductListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* حذف محصول */
  const [deleting, setDeleting] = useState<AdminProductRow | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  /* جستجو با تأخیر ۳۰۰ms */
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current !== null) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(search.trim());
      setPage(1);
    }, 300);
    return () => {
      if (debounceRef.current !== null) clearTimeout(debounceRef.current);
    };
  }, [search]);

  /* واکشی فهرست */
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (debouncedQuery.length > 0) params.set("q", debouncedQuery);
    apiFetch<AdminProductListResponse>(`/api/admin/products?${params.toString()}`)
      .then((response) => {
        if (active) setData(response);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "بارگذاری محصولات ناموفق بود");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [debouncedQuery, page, reloadKey]);

  /* حذف با تأییدیه */
  const handleDelete = useCallback(async () => {
    if (deleting === null) return;
    setDeleteBusy(true);
    try {
      await apiSend(`/api/admin/products/${deleting.id}`, "DELETE");
      toast.success(`محصول «${deleting.title}» حذف شد`);
      setDeleting(null);
      setReloadKey((key) => key + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "حذف محصول ناموفق بود");
    } finally {
      setDeleteBusy(false);
    }
  }, [deleting]);

  /* ── ستون‌ها ── */
  const columns = useMemo<ColumnDef<AdminProductRow, unknown>[]>(
    () => [
      {
        id: "image",
        header: "تصویر",
        cell: ({ row }) =>
          row.original.images[0] ? (
            <img
              src={row.original.images[0]}
              alt={row.original.title}
              className="size-10 rounded-lg border object-cover"
              loading="lazy"
            />
          ) : (
            <span
              className="flex size-10 items-center justify-center rounded-lg border bg-muted text-muted-foreground"
              aria-hidden="true"
            >
              <IconPackage className="size-5" stroke={1.75} />
            </span>
          ),
      },
      {
        accessorKey: "title",
        header: "عنوان",
        cell: ({ row }) => (
          <div className="min-w-40 max-w-56">
            <p className="truncate font-bold">{row.original.title}</p>
            <p dir="ltr" className="truncate text-start text-xs text-muted-foreground">
              {row.original.slug}
            </p>
          </div>
        ),
      },
      {
        id: "category",
        header: "دسته",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.categoryTitle ?? "—"}
          </span>
        ),
      },
      {
        id: "brand",
        header: "برند",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.brandTitle ?? "—"}</span>
        ),
      },
      {
        accessorKey: "price",
        header: "قیمت (تومان)",
        cell: ({ row }) => (
          <span className="font-semibold tabular-nums">{formatTomanPlain(row.original.price)}</span>
        ),
      },
      {
        accessorKey: "stock",
        header: "موجودی",
        cell: ({ row }) => {
          const stock = row.original.stock;
          return (
            <span
              className={cn(
                "font-semibold tabular-nums",
                stock === 0 ? "text-destructive" : stock <= 2 ? "text-warning" : "",
              )}
            >
              {toFa(stock)}
            </span>
          );
        },
      },
      {
        id: "status",
        header: "وضعیت",
        cell: ({ row }) => <StatusPills row={row.original} />,
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
              asChild
              aria-label={`ویرایش ${row.original.title}`}
            >
              <Link href={`/admin/products/${row.original.id}`}>
                <IconPencil className="size-4" stroke={1.75} aria-hidden="true" />
              </Link>
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
    [],
  );

  const total = data?.total ?? 0;
  const pageCount = data?.pageCount ?? 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="محصولات"
        description="مدیریت محصولات فروشگاه — افزودن، ویرایش و حذف"
        actions={
          <Button type="button" asChild className="gap-1.5 font-semibold">
            <Link href="/admin/products/new">
              <IconPlus className="size-4" stroke={1.75} aria-hidden="true" />
              محصول جدید
            </Link>
          </Button>
        }
      />

      {/* نوار ابزار: جستجو + شمار */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="جستجو در عنوان یا اسلاگ…"
          ariaLabel="جستجوی محصول"
        />
        <p className="text-xs text-muted-foreground">
          {loading
            ? "در حال بارگذاری…"
            : `${toFa(total)} محصول${debouncedQuery.length > 0 ? ` — نتیجهٔ جستجو برای «${debouncedQuery}»` : ""}`}
        </p>
      </div>

      {error ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        loading={loading || data === null}
        emptyTitle="محصولی پیدا نشد"
        emptyDescription={
          debouncedQuery.length > 0
            ? "عبارت دیگری را جستجو کنید یا محصول جدیدی بسازید."
            : "هنوز محصولی ثبت نشده است؛ نخستین محصول را بسازید."
        }
        emptyAction={
          <Button type="button" variant="outline" size="sm" asChild className="gap-1.5">
            <Link href="/admin/products/new">
              <IconPlus className="size-4" stroke={1.75} aria-hidden="true" />
              محصول جدید
            </Link>
          </Button>
        }
        onRowClick={(row) => router.push(`/admin/products/${row.id}`)}
      />

      {/* صفحه‌بندی سروری */}
      {data !== null && pageCount > 1 ? (
        <nav className="flex items-center justify-between gap-2" aria-label="صفحه‌بندی">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="gap-1"
          >
            <IconChevronRight className="size-4" stroke={1.75} aria-hidden="true" />
            قبلی
          </Button>
          <p className="text-sm text-muted-foreground">
            صفحهٔ <span className="font-semibold text-foreground">{toFa(page)}</span> از{" "}
            <span className="font-semibold text-foreground">{toFa(pageCount)}</span>
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= pageCount || loading}
            onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
            className="gap-1"
          >
            بعدی
            <IconChevronLeft className="size-4" stroke={1.75} aria-hidden="true" />
          </Button>
        </nav>
      ) : null}

      {/* تأییدیهٔ حذف */}
      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف محصول</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف «{deleting?.title}» مطمئن هستید؟ این عمل بازگشت‌پذیر نیست و تصاویر،
              تنوع‌ها و مشخصات آن هم حذف می‌شوند.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBusy}>انصراف</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteBusy}
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteBusy ? "در حال حذف…" : "حذف کن"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
