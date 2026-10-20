/**
 * صفحات ادمین — ویرایش محصول
 */

import type { Metadata } from "next";

import { ProductEditor } from "@/components/admin/product-editor";

export const metadata: Metadata = { title: "ویرایش محصول" };

interface AdminProductEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminProductEditPage({ params }: AdminProductEditPageProps) {
  const { id } = await params;
  return <ProductEditor mode="edit" productId={id} />;
}
