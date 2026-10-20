/**
 * Layout پنل ادمین — گارد نقش ADMIN + پوستهٔ تمام‌صفحه
 * ─────────────────────────────
 * بدون سشن یا با نقش غیرمدیر → هدایت به ورود ادمین با بازگشت به همان مسیر.
 * (middleware فقط وجود کوکی را می‌سنجد؛ نقش همین‌جا عمیقاً بررسی می‌شود.)
 */

import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/server/session";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: "پنل مدیریت",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();
  if (user === null || user.role !== "ADMIN") {
    redirect("/login?admin=1&next=/admin");
  }

  return (
    <AdminShell user={{ name: user.fullName ?? user.phone, phone: user.phone }}>
      {children}
    </AdminShell>
  );
}
