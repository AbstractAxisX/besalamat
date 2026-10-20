"use client";

/**
 * فهرست سفارش‌های پنل — فیلتر وضعیت با Select + جدول TanStack
 * ─────────────────────────────
 * GET /api/admin/orders?status= (تا ۲۰۰ سفارش اخیر)؛ شمارش هر وضعیت از
 * پاسخ بدون‌فیلتر محاسبه می‌شود. کلیک ردیف → جزئیات سفارش.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";

import { formatPhoneFa, toFa, formatTomanPlain } from "@/lib/format";
import { faDateShort } from "@/lib/jalali";
import { apiFetch } from "@/components/admin/api";
import { DataTable } from "@/components/admin/data-table";
import { PageHeader } from "@/components/admin/page-header";
import { ADMIN_ORDER_STATUSES, StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminOrderRow } from "@/types/admin";
import { ORDER_STATUS_LABELS, type OrderStatusDTO } from "@/types/shop";

type StatusFilter = OrderStatusDTO | "all";

interface OrdersResponse {
  items: AdminOrderRow[];
}

/** خوانش وضعیت اولیه از پارامتر URL (لینک داشبورد) */
function initialStatus(param: string | null): StatusFilter {
  if (param !== null && (ADMIN_ORDER_STATUSES as string[]).includes(param)) {
    return param as OrderStatusDTO;
  }
  return "all";
}

export function OrdersView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<StatusFilter>(() => initialStatus(searchParams.get("status")));
  const [rows, setRows] = useState<AdminOrderRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /* شمارش هر وضعیت — یک واکشی بدون فیلتر */
  useEffect(() => {
    let active = true;
    apiFetch<OrdersResponse>("/api/admin/orders")
      .then((response) => {
        if (!active) return;
        const tally: Record<string, number> = { all: response.items.length };
        for (const order of response.items) {
          tally[order.status] = (tally[order.status] ?? 0) + 1;
        }
        setCounts(tally);
      })
      .catch(() => {
        /* شمارش حیاتی نیست — نادیده */
      });
    return () => {
      active = false;
    };
  }, []);

  /* فهرست بر اساس فیلتر — بارگذاری در هندلر فیلتر روشن می‌شود */
  useEffect(() => {
    let active = true;
    const query =
      status === "all" ? "" : `?status=${encodeURIComponent(status as OrderStatusDTO)}`;
    apiFetch<OrdersResponse>(`/api/admin/orders${query}`)
      .then((response) => {
        if (active) setRows(response.items);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "بارگذاری سفارش‌ها ناموفق بود");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [status]);

  const selectStatus = useCallback((next: StatusFilter) => {
    setStatus(next);
    setLoading(true);
    setError(null);
  }, []);

  const columns = useMemo<ColumnDef<AdminOrderRow, unknown>[]>(
    () => [
      {
        accessorKey: "orderNumber",
        header: "شمارهٔ سفارش",
        cell: ({ row }) => (
          <span dir="ltr" className="text-start font-bold tracking-wide text-primary">
            {toFa(row.original.orderNumber)}
          </span>
        ),
      },
      {
        id: "buyer",
        header: "خریدار",
        cell: ({ row }) => (
          <div className="min-w-28">
            <p className="truncate font-semibold">
              {row.original.userFullName ?? row.original.receiverName}
            </p>
            <p dir="ltr" className="text-start text-xs text-muted-foreground">
              {formatPhoneFa(row.original.userPhone)}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "itemsCount",
        header: "اقلام",
        cell: ({ row }) => <span className="font-semibold tabular-nums">{toFa(row.original.itemsCount)}</span>,
      },
      {
        accessorKey: "total",
        header: "مبلغ (تومان)",
        cell: ({ row }) => (
          <span className="font-semibold tabular-nums">{formatTomanPlain(row.original.total)}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "وضعیت",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "createdAt",
        header: "تاریخ",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {faDateShort(row.original.createdAt)}
          </span>
        ),
      },
    ],
    [],
  );

  /* برچسب فیلتر جاری + شمارش همان وضعیت */
  const activeCount = status === "all" ? counts.all : counts[status];
  const filterLabel =
    status === "all" ? "همهٔ وضعیت‌ها" : ORDER_STATUS_LABELS[status as OrderStatusDTO];

  return (
    <div className="space-y-6">
      <PageHeader
        title="سفارش‌ها"
        description="پیگیری و مدیریت سفارش‌های فروشگاه"
      />

      {/* نوار ابزار: فیلتر وضعیت + شمار */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select
          value={status}
          onValueChange={(value) => selectStatus(value as StatusFilter)}
          dir="rtl"
        >
          <SelectTrigger className="h-9 w-44 rounded-lg" aria-label="فیلتر وضعیت سفارش">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              همه ({toFa(counts.all ?? 0)})
            </SelectItem>
            {ADMIN_ORDER_STATUSES.map((item) => (
              <SelectItem key={item} value={item}>
                {ORDER_STATUS_LABELS[item]}
                {counts[item] !== undefined ? ` (${toFa(counts[item])})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {loading
            ? "در حال بارگذاری…"
            : `${toFa(rows.length)} سفارش — ${filterLabel}${
                activeCount !== undefined ? ` (${toFa(activeCount)})` : ""
              }`}
        </p>
      </div>

      {error ? (
        <p className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        emptyTitle="سفارشی با این فیلتر نیست"
        emptyDescription="با تغییر فیلتر وضعیت، سفارش‌های دیگری را ببینید."
        emptyAction={
          <Button type="button" variant="outline" size="sm" onClick={() => selectStatus("all")}>
            نمایش همهٔ سفارش‌ها
          </Button>
        }
        onRowClick={(row) => router.push(`/admin/orders/${row.id}`)}
      />
    </div>
  );
}
