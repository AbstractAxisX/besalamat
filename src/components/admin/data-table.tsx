"use client";

/**
 * جدول دادهٔ عمومی پنل ادمین — TanStack Table + shadcn/ui Table
 * ─────────────────────────────
 * ستون‌ها را با ColumnDef می‌گیرد؛ ردیف‌های اسکلت هنگام بارگذاری،
 * EmptyState فارسی وقتی داده‌ای نیست و کلیک‌پذیری ردیف (مثلاً رفتن به جزئیات).
 * ظاهر: کانتینر rounded-2xl با بوردر مویی، سرجدول آرام bg-muted/40،
 * ردیف‌ها text-[13px] با هاور ملایم و خطوط جداکنندهٔ کم‌رنگ؛ ستون اول
 * ps-5 و ستون آخر pe-5 برای تراز نوری داخل کارت گرد.
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
        "overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-xs",
        className,
      )}
    >
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-border/50 bg-muted/40 hover:bg-muted/40"
            >
              {headerGroup.headers.map((header, index) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    "h-9 px-4 text-start text-[11px] font-semibold text-muted-foreground",
                    index === 0 && "ps-5",
                    index === headerGroup.headers.length - 1 && "pe-5",
                  )}
                >
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
              <TableRow key={`skeleton-${rowIndex}`} className="border-border/50">
                {Array.from({ length: columnCount }).map((_, cellIndex) => (
                  <TableCell
                    key={`skeleton-${rowIndex}-${cellIndex}`}
                    className={cn(
                      "px-4 py-3",
                      cellIndex === 0 && "ps-5",
                      cellIndex === columnCount - 1 && "pe-5",
                    )}
                  >
                    <Skeleton className="h-5 w-full max-w-24" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows.length === 0 ? (
            <TableRow className="border-border/50 hover:bg-transparent">
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
                className={cn(
                  "border-border/50 text-[13px] hover:bg-muted/40",
                  onRowClick !== undefined && "cursor-pointer",
                )}
                onClick={onRowClick !== undefined ? () => onRowClick(row.original) : undefined}
              >
                {row.getVisibleCells().map((cell, index) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      "px-4 py-2.5",
                      index === 0 && "ps-5",
                      index === row.getVisibleCells().length - 1 && "pe-5",
                    )}
                  >
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
