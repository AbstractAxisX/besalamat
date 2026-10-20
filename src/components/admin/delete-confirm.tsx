"use client";

/**
 * دیالوگ تأیید حذف مشترک — AlertDialog با پیام فارسی
 * ─────────────────────────────
 * دکمهٔ مخرب «حذف می‌کنم» + انصراف؛ busy دکمه را قفل می‌کند.
 */

import { IconAlertTriangle } from "@tabler/icons-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** عنوان دیالوگ — مثل «حذف اسلاید» */
  title: string;
  /** توضیح کامل — مثل «اسلاید «تجهیزات اصل» حذف شود؟» */
  description: string;
  busy?: boolean;
  onConfirm: () => void;
}

export function DeleteConfirm({
  open,
  onOpenChange,
  title,
  description,
  busy = false,
  onConfirm,
}: DeleteConfirmProps) {
  return (
    <AlertDialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <IconAlertTriangle
              className="size-5 text-destructive"
              stroke={1.75}
              aria-hidden="true"
            />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>انصراف</AlertDialogCancel>
          <AlertDialogAction
            disabled={busy}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={(event) => {
              /* جلوگیری از بستن خودکار تا وضعیت busy مدیریت شود */
              event.preventDefault();
              onConfirm();
            }}
          >
            {busy ? "در حال حذف…" : "حذف می‌کنم"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
