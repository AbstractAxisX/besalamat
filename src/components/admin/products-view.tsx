"use client";

/**
 * فهرست محصولات پنل — TanStack Table + جستجوی سروری + صفحه‌بندی سروری
 * ─────────────────────────────
 * GET /api/admin/products?q=&page= → {items,total,page,pageCount}؛
 * حذف با AlertDialog تأییدیه؛ ویرایش → /admin/products/[id].
 * صفحه‌بندی UI از کامپوننت کتابخانه‌ای shadcn Pagination (RTL: قبلی راست، بعدی چپ).
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
import { Pill } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
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

/** پنجرهٔ شماره‌های صفحه — ۱ … (حول صفحهٔ جاری) … آخرین */
function pageWindow(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const pages: number[] = [];
  const push = (candidate: number): void => {
    if (candidate >= 1 && candidate <= total && !pages.includes(candidate)) pages.push(candidate);
  };
  push(1);
  for (let candidate = current - 1; candidate <= current + 1; candidate += 1) push(candidate);
  push(total);
  pages.sort((a, b) => a - b);
  const out: Array<number | "ellipsis"> = [];
  let previous = 0;
  for (const item of pages) {
    if (previous !== 0 && item - previous > 1) out.push("ellipsis");
    out.push(item);
    previous = item;
  }
  return out;
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
        cell: ({ row }) => (
          <span className="flex flex-wrap items-center gap-1">
            <Pill tone={row.original.isActive ? "success" : "muted"}>
              {row.original.isActive ? "فعال" : "غیرفعال"}
            </Pill>
            {row.original.isNew ? <Pill tone="fresh">جدید</Pill> : null}
            {row.original.isFeatured ? <Pill tone="warning">ویژه</Pill> : null}
          </span>
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
  const pages = useMemo(() => pageWindow(page, pageCount), [page, pageCount]);

  const goToPage = useCallback(
    (next: number): void => {
      setPage(Math.min(Math.max(1, next), pageCount));
    },
    [pageCount],
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="محصولات"
        description="مدیریت محصولات فروشگاه — افزودن، ویرایش و حذف"
      />

      {/* نوار ابزار + جدول + صفحه‌بندی (گروه یکدست) */}
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
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
          {/* اکشن اصلی — انتهای RTL */}
          <Button
            type="button"
            asChild
            className="ms-auto gap-1.5 font-semibold"
          >
            <Link href="/admin/products/new">
              <IconPlus className="size-4" stroke={1.75} aria-hidden="true" />
              محصول جدید
            </Link>
          </Button>
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

        {/* صفحه‌بندی سروری — کامپوننت کتابخانه‌ای Pagination (RTL) */}
        {data !== null && pageCount > 1 ? (
          <Pagination aria-label="صفحه‌بندی محصولات" className="mx-0 justify-center">
            <PaginationContent>
              {/* قبلی — سمت راست در RTL، فلش رو به راست */}
              <PaginationItem>
                <PaginationLink
                  href="#"
                  aria-label="صفحهٔ قبلی"
                  aria-disabled={page <= 1 || loading}
                  onClick={(event) => {
                    event.preventDefault();
                    if (page > 1 && !loading) goToPage(page - 1);
                  }}
                  className={cn(
                    "gap-1 px-2.5",
                    (page <= 1 || loading) && "pointer-events-none opacity-50",
                  )}
                >
                  <IconChevronRight className="size-4" stroke={1.75} aria-hidden="true" />
                  قبلی
                </PaginationLink>
              </PaginationItem>

              {pages.map((item, index) =>
                typeof item === "number" ? (
                  <PaginationItem key={`page-${item}`}>
                    <PaginationLink
                      href="#"
                      isActive={item === page}
                      aria-label={`صفحهٔ ${toFa(item)}`}
                      aria-current={item === page ? "page" : undefined}
                      onClick={(event) => {
                        event.preventDefault();
                        goToPage(item);
                      }}
                    >
                      {toFa(item)}
                    </PaginationLink>
                  </PaginationItem>
                ) : (
                  <PaginationItem key={`${item}-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ),
              )}

              {/* بعدی — سمت چپ در RTL، فلش رو به چپ */}
              <PaginationItem>
                <PaginationLink
                  href="#"
                  aria-label="صفحهٔ بعدی"
                  aria-disabled={page >= pageCount || loading}
                  onClick={(event) => {
                    event.preventDefault();
                    if (page < pageCount && !loading) goToPage(page + 1);
                  }}
                  className={cn(
                    "gap-1 px-2.5",
                    (page >= pageCount || loading) && "pointer-events-none opacity-50",
                  )}
                >
                  بعدی
                  <IconChevronLeft className="size-4" stroke={1.75} aria-hidden="true" />
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        ) : null}
      </div>

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
