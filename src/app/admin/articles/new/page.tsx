/**
 * صفحات ادمین — مقالهٔ جدید (ادیتور)
 */

import type { Metadata } from "next";

import { ArticleEditor } from "@/components/admin/article-editor";

export const metadata: Metadata = { title: "مقالهٔ جدید" };

export default function AdminArticleNewPage() {
  return <ArticleEditor mode="new" />;
}
