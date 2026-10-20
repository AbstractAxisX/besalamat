/**
 * صفحات ادمین — ساخت محصول جدید
 */

import type { Metadata } from "next";

import { ProductEditor } from "@/components/admin/product-editor";

export const metadata: Metadata = { title: "محصول جدید" };

export default function AdminProductNewPage() {
  return <ProductEditor mode="create" />;
}
