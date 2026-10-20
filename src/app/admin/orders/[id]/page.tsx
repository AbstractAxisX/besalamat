/**
 * صفحات ادمین — جزئیات سفارش
 */

import type { Metadata } from "next";

import { OrderDetailView } from "@/components/admin/order-detail";

export const metadata: Metadata = { title: "جزئیات سفارش" };

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { id } = await params;
  return <OrderDetailView orderId={id} />;
}
