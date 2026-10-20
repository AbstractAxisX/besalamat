"use client";

/**
 * جدول «سفارش‌های اخیر» میزکار — DataTable مشترک (TanStack)
 * ─────────────────────────────
 * کلاینت است چون ColumnDefها توابع رندر دارند؛ دادهٔ خام از
 * صفحهٔ سروری میزکار به‌صورت props سریالایزشده می‌رسد.
 */

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";

import { toFa, formatTomanPlain } from "@/lib/format";
import { faDateShort } from "@/lib/jalali";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import type { AdminStatsRecentOrder } from "@/server/admin-stats";

const COLUMNS: ColumnDef<AdminStatsRecentOrder, unknown>[] = [
  {
    accessorKey: "orderNumber",
    header: "شمارهٔ سفارش",
    cell: ({ row }) => (
      <Link
        href={`/admin/orders/${row.original.id}`}
        className="font-bold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {toFa(row.original.orderNumber)}
      </Link>
    ),
  },
  {
    accessorKey: "receiverName",
    header: "گیرنده",
    cell: ({ row }) => (
      <span className="block max-w-36 truncate" title={row.original.receiverName}>
        {row.original.receiverName}
      </span>
    ),
  },
  {
    accessorKey: "total",
    header: "مبلغ",
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
];

export function RecentOrdersTable({ orders }: { orders: AdminStatsRecentOrder[] }) {
  return (
    <DataTable
      columns={COLUMNS}
      data={orders}
      emptyTitle="هنوز سفارشی ثبت نشده است"
      emptyDescription="سفارش‌های تازهٔ فروشگاه همین‌جا نمایش داده می‌شوند."
      skeletonRows={5}
    />
  );
}
