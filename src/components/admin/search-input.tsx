"use client";

/**
 * ورودی جستجوی نوار ابزار جدول‌های پنل — آیکون در ابتدای فیلد (سمت راست در RTL)
 * همهٔ نمای‌های فهرست از همین کامپوننت استفاده می‌کنند تا نوار ابزار یکدست باشد.
 */

import { IconSearch } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface SearchInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  /** برچسب دسترس‌پذیری */
  ariaLabel: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder, ariaLabel, className }: SearchInputProps) {
  return (
    <div className={cn("relative w-full max-w-xs", className)}>
      <IconSearch
        className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        stroke={1.75}
        aria-hidden="true"
      />
      <Input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="h-9 rounded-lg ps-9"
      />
    </div>
  );
}
