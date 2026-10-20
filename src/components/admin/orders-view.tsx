"use client";

/**
 * فهرست سفارش‌های پنل — چیپ‌های فیلتر وضعیت + جدول TanStack
 * ─────────────────────────────
 * GET /api/admin/orders?status= (تا ۲۰۰ سفارش اخیر)؛ شمارش هر وضعیت از
 * پاسخ بدون‌فیلتر محاسبه می‌شود. کلیک ردیف → جزئیات سفارش.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { IconShoppingBag } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { formatPhoneFa, toFa, formatTomanPlain } from "@/lib/format";
import { faDateShort } from "@/lib/jalali";
import { apiFetch } from "@/components/admin/api";
import { DataTable } from "@/components/admin/data-table";
import { PageHeader } from "@/components/admin/page-header";
import { ADMIN_ORDER_STATUSES, StatusBadge } from "@/components/admin/status-badge";
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
          <span dir="ltr" className="text-start font-black tracking-wide text-primary">
            {toFa(row.original.orderNumber)}
          </span>
        ),
      },
      {
        id: "buyer",
        header: "خریدار",
        cell: ({ row }) => (
          <div className="min-w-28">
            <p className="truncate font-bold">
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
        cell: ({ row }) => <span className="font-black tabular-nums">{toFa(row.original.itemsCount)}</span>,
      },
      {
        accessorKey: "total",
        header: "مبلغ (تومان)",
        cell: ({ row }) => (
          <span className="font-black tabular-nums">{formatTomanPlain(row.original.total)}</span>
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

  const chips: { key: StatusFilter; label: string; count?: number }[] = [
    { key: "all", label: "همه", count: counts.all },
    ...ADMIN_ORDER_STATUSES.map((item) => ({
      key: item,
      label: ORDER_STATUS_LABELS[item],
      count: counts[item],
    })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="سفارش‌ها"
        description={
          loading ? "در حال بارگذاری…" : `${toFa(rows.length)} سفارش ${status === "all" ? "در هر وضعیت" : `با وضعیت «${ORDER_STATUS_LABELS[status]}»`}`
        }
      />

      {/* چیپ‌های فیلتر وضعیت */}
      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="فیلتر وضعیت سفارش">
        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            role="tab"
            aria-selected={status === chip.key}
            onClick={() => selectStatus(chip.key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors",
              status === chip.key
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {chip.label}
            {chip.count !== undefined ? (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-black tabular-nums",
                  status === chip.key ? "bg-primary-foreground/20" : "bg-muted",
                )}
              >
                {toFa(chip.count)}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {error ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
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
          <button
            type="button"
            className="text-sm font-bold text-primary hover:underline"
            onClick={() => selectStatus("all")}
          >
            نمایش همهٔ سفارش‌ها
          </button>
        }
        onRowClick={(row) => router.push(`/admin/orders/${row.id}`)}
      />
    </div>
  );
}
