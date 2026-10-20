/**
 * صفحات ادمین — مقالات (فهرست)
 */

import type { Metadata } from "next";

import { ArticlesView } from "@/components/admin/articles-view";

export const metadata: Metadata = { title: "مقالات" };

export default function AdminArticlesPage() {
  return <ArticlesView />;
}
