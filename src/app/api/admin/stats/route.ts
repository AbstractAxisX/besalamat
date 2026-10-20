/**
 * GET /api/admin/stats — آمار داشبورد ادمین
 * ─────────────────────────────
 * منطق در src/server/admin-stats.ts مشترک است (صفحهٔ /admin هم از همان
 * تابع استفاده می‌کند)؛ این روت فقط پوستهٔ JSON است.
 */

import { NextResponse } from "next/server";

import { adminHandler } from "@/server/api";
import { getAdminStats } from "@/server/admin-stats";

export async function GET() {
  return adminHandler(async () => {
    const stats = await getAdminStats();
    return NextResponse.json(stats);
  });
}
