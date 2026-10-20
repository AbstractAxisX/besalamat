/**
 * صفحات ادمین — صفحهٔ اصلی فروشگاه (مدیریت ۵ تب)
 */

import type { Metadata } from "next";

import { HomeManager } from "@/components/admin/home-manager";

export const metadata: Metadata = { title: "صفحهٔ اصلی" };

export default function AdminHomePage() {
  return <HomeManager />;
}
