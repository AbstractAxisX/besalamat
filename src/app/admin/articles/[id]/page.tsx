/**
 * صفحات ادمین — ویرایش مقاله (ادیتور)
 */

import type { Metadata } from "next";

import { ArticleEditor } from "@/components/admin/article-editor";

export const metadata: Metadata = { title: "ویرایش مقاله" };

export default async function AdminArticleEditPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  return <ArticleEditor mode="edit" articleId={id} />;
}
