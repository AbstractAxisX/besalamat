"use client";

/**
 * فیلد تصویر مشترک پنل — پیش‌نمایش + ورودی نشانی + دکمهٔ بارگذاری
 * ─────────────────────────────
 * آپلود از طریق POST /api/admin/upload انجام می‌شود و نشانی
 * برگشتی در فیلد قرار می‌گیرد. کارت تمیز کلاسیک؛ بدون افکت شیشه‌ای.
 */

import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { uploadImage } from "@/components/admin/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type PreviewRatio = "portrait" | "landscape" | "square";

const RATIO_CLASS: Record<PreviewRatio, string> = {
  portrait: "aspect-[4/5] w-20",
  landscape: "aspect-[8/5] w-28",
  square: "aspect-square w-20",
};

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  placeholder?: string;
  ratio?: PreviewRatio;
  /** کلاس اضافهٔ قاب پیش‌نمایش (مثلاً object-contain برای لوگو) */
  previewClassName?: string;
  disabled?: boolean;
  className?: string;
}

export function ImageUploadField({
  value,
  onChange,
  label,
  hint,
  placeholder = "نشانی تصویر (مثل /placeholders/…) یا بارگذاری فایل",
  ratio = "landscape",
  previewClassName,
  disabled = false,
  className,
}: ImageUploadFieldProps) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File): Promise<void> {
    setBusy(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
      toast.success("تصویر بارگذاری شد");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "آپلود تصویر ناموفق بود");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <span className="block text-sm font-bold">{label}</span>
      ) : null}
      <div className="flex items-start gap-3">
        {/* پیش‌نمایش — نسبت تصویر قابل تنظیم */}
        <div
          className={cn(
            "relative shrink-0 overflow-hidden rounded-xl border bg-muted/60",
            RATIO_CLASS[ratio],
          )}
        >
          {busy ? (
            <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
          ) : value.trim().length > 0 ? (
            <img
              src={value}
              alt="پیش‌نمایش تصویر"
              className={cn("h-full w-full object-cover", previewClassName)}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-muted-foreground/60">
              <IconPhoto className="size-6" stroke={1.75} aria-hidden="true" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex gap-2">
            <Input
              id={inputId}
              dir="ltr"
              className="text-start"
              value={value}
              placeholder={placeholder}
              disabled={disabled || busy}
              onChange={(event) => onChange(event.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-9 shrink-0"
              disabled={disabled || busy}
              onClick={() => fileRef.current?.click()}
              aria-label="بارگذاری تصویر از سیستم"
              title="بارگذاری تصویر از سیستم"
            >
              <IconUpload className="size-4" stroke={1.75} aria-hidden="true" />
            </Button>
            {value.trim().length > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 shrink-0 text-muted-foreground hover:text-destructive"
                disabled={disabled || busy}
                onClick={() => onChange("")}
                aria-label="حذف تصویر"
                title="حذف تصویر"
              >
                <IconX className="size-4" stroke={1.75} aria-hidden="true" />
              </Button>
            ) : null}
          </div>
          <p className="text-xs leading-5 text-muted-foreground">
            {hint ?? "PNG، JPG یا WebP — حداکثر ۵ مگابایت"}
          </p>
        </div>
      </div>

      {/* ورودی فایل مخفی */}
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file !== undefined) void handleFile(file);
        }}
      />
    </div>
  );
}
