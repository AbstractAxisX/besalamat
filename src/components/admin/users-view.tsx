"use client";

/**
 * فهرست کاربران پنل — جستجو + مسدودسازی + ویرایش نام/نقش
 * ─────────────────────────────
 * GET /api/admin/users?q= (تا ۲۰۰ نفر) + GET /api/auth/me برای شناسایی
 * ردیف خودِ مدیر (سوییچ مسدودسازی مخفی می‌شود)؛
 * PUT /api/admin/users/[id] با {isBlocked} یا {fullName, role}.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { IconPencil } from "@tabler/icons-react";

import { formatPhoneFa, toFa } from "@/lib/format";
import { faDateShort } from "@/lib/jalali";
import { apiFetch, apiSend } from "@/components/admin/api";
import { DataTable } from "@/components/admin/data-table";
import { PageHeader } from "@/components/admin/page-header";
import { SearchInput } from "@/components/admin/search-input";
import { Pill } from "@/components/admin/status-badge";
import type { AdminUserMeResponse, AdminUserRow } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UsersResponse {
  items: AdminUserRow[];
}

export function UsersView() {
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myUserId, setMyUserId] = useState<string | null>(null);

  /* جستجو با تأخیر */
  const [search, setSearch] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* دیالوگ ویرایش */
  const [editing, setEditing] = useState<AdminUserRow | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<"USER" | "ADMIN">("USER");
  const [editBusy, setEditBusy] = useState(false);

  const [toggleBusyId, setToggleBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (debounceRef.current !== null) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(search.trim()), 300);
    return () => {
      if (debounceRef.current !== null) clearTimeout(debounceRef.current);
    };
  }, [search]);

  /* شناسایی خودِ مدیر */
  useEffect(() => {
    apiFetch<AdminUserMeResponse>("/api/auth/me")
      .then((response) => setMyUserId(response.user.userId))
      .catch(() => setMyUserId(null));
  }, []);

  const load = useCallback((query: string) => {
    let active = true;
    setLoading(true);
    setError(null);
    const suffix = query.length > 0 ? `?q=${encodeURIComponent(query)}` : "";
    apiFetch<UsersResponse>(`/api/admin/users${suffix}`)
      .then((response) => {
        if (active) setRows(response.items);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "بارگذاری کاربران ناموفق بود");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => load(debouncedQuery), [debouncedQuery, load]);

  /* مسدود / آزادسازی */
  const toggleBlock = useCallback(
    async (user: AdminUserRow): Promise<void> => {
      setToggleBusyId(user.id);
      try {
        await apiSend(`/api/admin/users/${user.id}`, "PUT", { isBlocked: !user.isBlocked });
        toast.success(user.isBlocked ? `کاربر ${user.fullName ?? user.phone} آزاد شد` : `کاربر ${user.fullName ?? user.phone} مسدود شد`);
        load(debouncedQuery);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "تغییر وضعیت کاربر ناموفق بود");
      } finally {
        setToggleBusyId(null);
      }
    },
    [debouncedQuery, load],
  );

  /* بازکردن دیالوگ ویرایش */
  const openEdit = useCallback((user: AdminUserRow): void => {
    setEditing(user);
    setEditName(user.fullName ?? "");
    setEditRole(user.role);
  }, []);

  /* ذخیرهٔ ویرایش نام/نقش */
  const submitEdit = useCallback(async (): Promise<void> => {
    if (editing === null) return;
    const trimmed = editName.trim();
    if (trimmed.length > 0 && trimmed.length < 2) {
      toast.error("نام را کامل وارد کنید (حداقل ۲ حرف)");
      return;
    }
    setEditBusy(true);
    try {
      await apiSend(`/api/admin/users/${editing.id}`, "PUT", {
        fullName: trimmed.length > 0 ? trimmed : null,
        role: editRole,
      });
      toast.success("اطلاعات کاربر ذخیره شد");
      setEditing(null);
      load(debouncedQuery);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ذخیرهٔ اطلاعات کاربر ناموفق بود");
    } finally {
      setEditBusy(false);
    }
  }, [editing, editName, editRole, debouncedQuery, load]);

  const columns = useMemo<ColumnDef<AdminUserRow, unknown>[]>(
    () => [
      {
        id: "name",
        header: "نام",
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {(row.original.fullName ?? row.original.phone).trim().charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="max-w-40 truncate font-semibold">
                {row.original.fullName ?? "— بدون نام —"}
              </p>
              {row.original.email ? (
                <p dir="ltr" className="truncate text-start text-xs text-muted-foreground">
                  {row.original.email}
                </p>
              ) : null}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "phone",
        header: "موبایل",
        cell: ({ row }) => (
          <span dir="ltr" className="text-start font-semibold tabular-nums">
            {formatPhoneFa(row.original.phone)}
          </span>
        ),
      },
      {
        accessorKey: "orderCount",
        header: "سفارش‌ها",
        cell: ({ row }) => (
          <span className="font-semibold tabular-nums">{toFa(row.original.orderCount)}</span>
        ),
      },
      {
        accessorKey: "role",
        header: "نقش",
        cell: ({ row }) =>
          row.original.role === "ADMIN" ? (
            <Pill tone="primary">مدیر</Pill>
          ) : (
            <Pill tone="muted">کاربر</Pill>
          ),
      },
      {
        accessorKey: "isBlocked",
        header: "وضعیت",
        cell: ({ row }) =>
          row.original.isBlocked ? (
            <Pill tone="destructive">مسدود</Pill>
          ) : (
            <Pill tone="success">فعال</Pill>
          ),
      },
      {
        accessorKey: "createdAt",
        header: "عضویت",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {faDateShort(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "عملیات",
        cell: ({ row }) => {
          const isSelf = row.original.id === myUserId;
          return (
            <div className="flex items-center gap-3" onClick={(event) => event.stopPropagation()}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-primary"
                onClick={() => openEdit(row.original)}
                aria-label={`ویرایش ${row.original.fullName ?? row.original.phone}`}
              >
                <IconPencil className="size-4" stroke={1.75} aria-hidden="true" />
              </Button>
              {isSelf ? (
                <span className="text-xs text-muted-foreground" title="حساب خودتان قابل مسدودسازی نیست">
                  حساب شما
                </span>
              ) : (
                <label className="flex cursor-pointer items-center gap-2">
                  <Switch
                    checked={!row.original.isBlocked}
                    disabled={toggleBusyId === row.original.id}
                    onCheckedChange={() => void toggleBlock(row.original)}
                    aria-label={
                      row.original.isBlocked
                        ? "آزادسازی کاربر"
                        : `مسدودسازی ${row.original.fullName ?? row.original.phone}`
                    }
                  />
                  <span className="text-xs font-semibold text-muted-foreground">فعال</span>
                </label>
              )}
            </div>
          );
        },
      },
    ],
    [myUserId, openEdit, toggleBlock, toggleBusyId],
  );

  return (
    <div className="space-y-8">
      <PageHeader title="کاربران" description="مدیریت کاربران، نقش‌ها و مسدودسازی" />

      {/* نوار ابزار + جدول (گروه یکدست) */}
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="جستجو در نام، موبایل یا رایانامه…"
            ariaLabel="جستجوی کاربر"
          />
          <p className="text-xs text-muted-foreground">
            {loading
              ? "در حال بارگذاری…"
              : `${toFa(rows.length)} کاربر${debouncedQuery.length > 0 ? ` — نتیجهٔ جستجو برای «${debouncedQuery}»` : ""}`}
          </p>
        </div>

        {error ? (
          <p className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <DataTable
          columns={columns}
          data={rows}
          loading={loading}
          emptyTitle="کاربری پیدا نشد"
          emptyDescription="عبارت دیگری را جستجو کنید."
        />
      </div>

      {/* دیالوگ ویرایش نام/نقش */}
      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>ویرایش کاربر</DialogTitle>
            <DialogDescription>
              {editing !== null ? (
                <>
                  شمارهٔ <span dir="ltr" className="font-bold">{formatPhoneFa(editing.phone)}</span>
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="user-fullname" className="text-xs font-semibold">
                نام و نام خانوادگی
              </Label>
              <Input
                id="user-fullname"
                placeholder="مثلاً زهرا محمدی"
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">خالی بماند = بدون نام</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="user-role" className="text-xs font-semibold">
                نقش
              </Label>
              <Select value={editRole} onValueChange={(value) => setEditRole(value as "USER" | "ADMIN")}>
                <SelectTrigger id="user-role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">کاربر</SelectItem>
                  <SelectItem value="ADMIN" disabled={editing?.id === myUserId}>
                    مدیر {editing?.id === myUserId ? "(نقش خودتان قابل تغییر نیست)" : ""}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editing?.id === myUserId ? (
              <p className="rounded-lg border border-warning/30 bg-warning/10 p-2.5 text-xs text-warning">
                این حساب شماست؛ تغییر نقش یا مسدودسازی آن مجاز نیست.
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditing(null)} disabled={editBusy}>
              انصراف
            </Button>
            <Button
              type="button"
              className="font-semibold"
              disabled={editBusy}
              onClick={() => void submitEdit()}
            >
              {editBusy ? "در حال ذخیره…" : "ذخیره"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
