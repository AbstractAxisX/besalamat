/**
 * صفحات ادمین — تنظیمات فروشگاه
 * ─────────────────────────────
 * متن بخش «استقرار روی ورسل» از README.md در سرور خوانده و
 * داخل کارت اطلاعِ OTP دمو (جمع‌شونده) نمایش داده می‌شود.
 */

import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { SettingsView } from "@/components/admin/settings-view";

export const metadata: Metadata = { title: "تنظیمات" };

/** استخراج بخش «استقرار روی ورسل» از README — خطا → null */
async function readDeploymentNotes(): Promise<string | null> {
  try {
    const content = await readFile(path.join(process.cwd(), "README.md"), "utf8");
    const start = content.indexOf("## استقرار روی ورسل");
    if (start === -1) return null;
    const next = content.indexOf("\n## ", start + 1);
    const section = next === -1 ? content.slice(start) : content.slice(start, next);
    return section.trim();
  } catch {
    return null;
  }
}

export default async function AdminSettingsPage() {
  const deploymentNotes = await readDeploymentNotes();
  return <SettingsView deploymentNotes={deploymentNotes} />;
}
