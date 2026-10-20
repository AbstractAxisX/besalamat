/**
 * صفحات ادمین — سفارش‌ها (فهرست)
 * useSearchParams در کامپوننت کلاینت — پوشش Suspense برای اطمینان از رندر پویا.
 */

import type { Metadata } from "next";
import { Suspense } from "react";

import { OrdersView } from "@/components/admin/orders-view";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "سفارش‌ها" };

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-full max-w-xl rounded-full" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      }
    >
      <OrdersView />
    </Suspense>
  );
}
