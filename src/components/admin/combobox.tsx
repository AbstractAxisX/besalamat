"use client";

/**
 * کامبوباکس (دراپ‌داون جستجودار) — دستور رسمی shadcn/ui «Combobox»
 * ─────────────────────────────
 * Popover + Command (cmdk) با آیکون تیک، نوار جستجو، حالت خالی و
 * گزینهٔ پاک‌کردن مقدار («همهٔ وضعیت‌ها» / «بدون دسته» …).
 * RTL: متن‌ها text-start، جستجو از راست، کنترل‌پذیر (value/onValueChange).
 * سبک مینیمال-پریمیوم: دکمهٔ h-9 rounded-lg؛ فهرست اسکرول‌شونده با max-h.
 */

import { useState } from "react";
import { IconCheck, IconSelector } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export interface ComboboxOption {
  /** مقدار (شناسه) — خالی فقط برای گزینهٔ پاک‌کردن استفاده می‌شود */
  value: string;
  /** برچسب فارسی — همین متن در جستجو هم می‌گردد */
  label: string;
  disabled?: boolean;
}

interface ComboboxProps {
  options: ComboboxOption[];
  /** مقدار کنترل‌شده — "" یعنی پاک‌شده (فقط وقتی clearLabel داده شده) */
  value: string | null | undefined;
  onValueChange: (value: string) => void;
  /** متن دکمه وقتی مقداری انتخاب نشده */
  placeholder?: string;
  /** جای‌نما (placeholder) ورودی جستجو */
  searchPlaceholder?: string;
  /** متن حالت «چیزی پیدا نشد» */
  emptyText?: string;
  /** با ست‌شدن، گزینهٔ «پاک‌کردن» با مقدار "" بالای فهرست می‌آید */
  clearLabel?: string;
  disabled?: boolean;
  /** برای اتصال Label (htmlFor) به دکمهٔ کامبوباکس */
  id?: string;
  /** برچسب دسترس‌پذیری دکمه */
  ariaLabel?: string;
  /** کلاس دکمهٔ تریگر — مثل w-44 یا w-full */
  className?: string;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "انتخاب کنید…",
  searchPlaceholder = "جستجو…",
  emptyText = "موردی پیدا نشد.",
  clearLabel,
  disabled = false,
  id,
  ariaLabel,
  className,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);

  const selected = options.find((option) => option.value === value) ?? null;
  /* مقدار "" + clearLabel → برچسب گزینهٔ پاک‌کننده روی دکمه */
  const triggerLabel =
    selected !== null
      ? selected.label
      : value === "" && clearLabel !== undefined
        ? clearLabel
        : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel}
          disabled={disabled}
          className={cn(
            "h-9 w-full justify-between gap-2 rounded-lg font-normal",
            className,
          )}
        >
          <span
            className={cn(
              "min-w-0 truncate text-start text-sm",
              triggerLabel === null && "text-muted-foreground",
            )}
          >
            {triggerLabel ?? placeholder}
          </span>
          <IconSelector
            className="size-3.5 shrink-0 text-muted-foreground"
            stroke={1.75}
            aria-hidden="true"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
        sideOffset={6}
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList className="max-h-64">
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {clearLabel !== undefined ? (
                <CommandItem
                  value={clearLabel}
                  onSelect={() => {
                    onValueChange("");
                    setOpen(false);
                  }}
                  className="text-start"
                >
                  <IconCheck
                    className={cn(
                      "size-4",
                      value === "" || value === undefined ? "opacity-100" : "opacity-0",
                    )}
                    stroke={1.75}
                    aria-hidden="true"
                  />
                  {clearLabel}
                </CommandItem>
              ) : null}
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  disabled={option.disabled}
                  onSelect={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                  className="text-start"
                >
                  <IconCheck
                    className={cn(
                      "size-4",
                      value === option.value ? "opacity-100" : "opacity-0",
                    )}
                    stroke={1.75}
                    aria-hidden="true"
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
