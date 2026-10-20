/**
 * صفحات ادمین — کاربران (فهرست)
 */

import type { Metadata } from "next";

import { UsersView } from "@/components/admin/users-view";

export const metadata: Metadata = { title: "کاربران" };

export default function AdminUsersPage() {
  return <UsersView />;
}
