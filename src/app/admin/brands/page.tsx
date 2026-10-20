/**
 * صفحات ادمین — برندها
 */

import type { Metadata } from "next";

import { BrandsView } from "@/components/admin/brands-view";

export const metadata: Metadata = { title: "برندها" };

export default function AdminBrandsPage() {
  return <BrandsView />;
}
