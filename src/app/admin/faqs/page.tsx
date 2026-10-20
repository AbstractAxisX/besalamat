/**
 * صفحات ادمین — پرسش‌های متداول
 */

import type { Metadata } from "next";

import { FaqsView } from "@/components/admin/faqs-view";

export const metadata: Metadata = { title: "پرسش‌های متداول" };

export default function AdminFaqsPage() {
  return <FaqsView />;
}
