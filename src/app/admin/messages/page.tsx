/**
 * صفحات ادمین — پیام‌های تماس (صندوق ورودی)
 */

import type { Metadata } from "next";

import { MessagesView } from "@/components/admin/messages-view";

export const metadata: Metadata = { title: "پیام‌ها" };

export default function AdminMessagesPage() {
  return <MessagesView />;
}
