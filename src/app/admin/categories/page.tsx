/**
 * صفحات ادمین — دسته‌بندی‌ها (درخت دو سطحی)
 */

import type { Metadata } from "next";

import { CategoriesView } from "@/components/admin/categories-view";

export const metadata: Metadata = { title: "دسته‌بندی‌ها" };

export default function AdminCategoriesPage() {
  return <CategoriesView />;
}
