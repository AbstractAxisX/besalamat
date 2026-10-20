/**
 * صفحات ادمین — محصولات (فهرست)
 * پوستهٔ سروری؛ جدول و جستجو کامپوننت کلاینت ProductsView است.
 */

import type { Metadata } from "next";

import { ProductsView } from "@/components/admin/products-view";

export const metadata: Metadata = { title: "محصولات" };

export default function AdminProductsPage() {
  return <ProductsView />;
}
