"use client";

/**
 * جدول دادهٔ عمومی پنل ادمین — TanStack Table + shadcn/ui Table
 * ─────────────────────────────
 * ستون‌ها را با ColumnDef می‌گیرد؛ ردیف‌های اسکلت هنگام بارگذاری،
 * EmptyState فارسی وقتی داده‌ای نیست و کلیک‌پذیری ردیف (مثلاً رفتن به جزئیات).
 */

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/admin/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  loading?: boolean;
  emptyTitle: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  onRowClick?: (row: TData) => void;
  skeletonRows?: number;
  className?: string;
}

export function DataTable<TData>({
  columns,
  data,
  loading = false,
  emptyTitle,
  emptyDescription,
  emptyAction,
  onRowClick,
  skeletonRows = 6,
  className,
}: DataTableProps<TData>) {
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table عمداً توابع ناپایدار برمی‌گرداند؛ رندر با فراخوانی مستقیم row model انجام می‌شود
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const columnCount = columns.length;

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-xl border bg-card shadow-none",
        className,
      )}
    >
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-muted/50 hover:bg-muted/50">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="text-start text-xs font-bold">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loading ? (
            /* ردیف‌های اسکلت هم‌اندازهٔ جدول */
            Array.from({ length: skeletonRows }).map((_, rowIndex) => (
              <TableRow key={`skeleton-${rowIndex}`}>
                {Array.from({ length: columnCount }).map((_, cellIndex) => (
                  <TableCell key={`skeleton-${rowIndex}-${cellIndex}`}>
                    <Skeleton className="h-6 w-full max-w-28" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columnCount} className="p-0">
                <EmptyState
                  title={emptyTitle}
                  description={emptyDescription}
                  action={emptyAction}
                  className="py-14"
                />
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={cn(onRowClick !== undefined && "cursor-pointer")}
                onClick={onRowClick !== undefined ? () => onRowClick(row.original) : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
