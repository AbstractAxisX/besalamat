"use client";

/**
 * دیالوگ جستجوی سراسری — تجربهٔ جستجوی اصلی سایت
 * ─────────────────────────────
 *  - شورت‌کات: Ctrl+K / ⌘K و «/»
 *  - جستجوی لحظه‌ای در محصولات (عنوان + برند) با نرمال‌سازی فارسی
 *  - جستجوهای پرطرفدار + جستجوهای اخیر (localStorage، قابل حذف تک‌تک)
 *  - Enter → صفحهٔ نتایج کامل /search?q=
 * مصرف: <SearchDialog /> یک‌بار (مثلاً داخل Header)؛ باز کردن با useSearchDialogStore.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useStore } from "zustand";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { formatTomanPlain } from "@/lib/format";
import { PREVIEW_POPULAR_SEARCHES, PREVIEW_PRODUCTS } from "@/lib/preview-data";
import { useSearchDialogStore } from "@/store/search";
import {
  IconArrowLeft,
  IconSearch,
  IconClock,
  IconX,
  IconFlame,
} from "@tabler/icons-react";

const RECENT_KEY = "besalamat:recent-searches";
const RECENT_MAX = 6;

/** نرمال‌سازی فارسی برای جستجو — ی/ک عربی، اعراب، ارقام */
function normalizeFa(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[\u064A\u0649]/g, "ی")
    .replace(/[\u0643]/g, "ک")
    .replace(/[\u0640]/g, "")
    .replace(/[\u064B-\u0652]/g, "")
    .replace(/[يﻱﻲ]/g, "ی");
}

function readRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string").slice(0, RECENT_MAX) : [];
  } catch {
    return [];
  }
}

function writeRecent(items: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(items.slice(0, RECENT_MAX)));
  } catch {
    /* حافظه پر یا غیرفعال — بی‌صدا رد می‌شود */
  }
}

export function SearchDialog() {
  const router = useRouter();
  const open = useStore(useSearchDialogStore, (state) => state.open);
  const openDialog = useSearchDialogStore((state) => state.openDialog);
  const closeDialog = useSearchDialogStore((state) => state.closeDialog);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);

  /* شورت‌کات صفحه‌کلید — Ctrl+K / ⌘K / «/» */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        openDialog();
      } else if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const target = event.target as HTMLElement | null;
        const tag = target?.tagName?.toLowerCase();
        if (tag !== "input" && tag !== "textarea" && !target?.isContentEditable) {
          event.preventDefault();
          openDialog();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openDialog]);

  /* خواندن اخیرها هنگام باز شدن دیالوگ */
  useEffect(() => {
    if (open) setRecent(readRecent());
  }, [open]);

  const commitSearch = useCallback(
    (term: string) => {
      const q = term.trim();
      if (!q) return;
      const next = [q, ...recent.filter((item) => item !== q)];
      setRecent(next.slice(0, RECENT_MAX));
      writeRecent(next);
      closeDialog();
      router.push(`/search?q=${encodeURIComponent(q)}`);
    },
    [closeDialog, recent, router],
  );

  const results = useMemo(() => {
    const q = normalizeFa(query);
    if (!q) return [];
    return PREVIEW_PRODUCTS.filter((product) => {
      const title = normalizeFa(product.title);
      const brand = normalizeFa(product.brandTitle ?? "");
      return title.includes(q) || brand.includes(q);
    }).slice(0, 6);
  }, [query]);

  const removeRecent = (term: string) => {
    const next = recent.filter((item) => item !== term);
    setRecent(next);
    writeRecent(next);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={(next) => (next ? openDialog() : closeDialog())}
      title="جستجو در بسلامت"
      description="جستجوی محصولات، برندها و دسته‌بندی‌ها"
      className="sm:max-w-xl"
    >
      {/* ورودی جستجو */}
      <div data-slot="command-input-wrapper" className="flex items-center gap-2 border-b border-border/70 px-4">
        <IconSearch className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" stroke={1.75} />
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="دنبال چه محصولی هستید؟ مثلاً فشارسنج…"
          className="flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-muted-foreground"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="پاک کردن جستجو"
            className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <IconX className="size-4" aria-hidden="true" />
          </button>
        ) : (
          <kbd className="hidden shrink-0 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:block" dir="ltr">
            /
          </kbd>
        )}
      </div>

      <CommandList className="max-h-[min(60vh,26rem)] overflow-y-auto p-2">
        <CommandEmpty className="py-10 text-center text-sm text-muted-foreground">
          نتیجه‌ای پیدا نشد — با کلید Enter در کل سایت جستجو کنید
        </CommandEmpty>

        {/* نتایج لحظه‌ای */}
        {results.length > 0 ? (
          <CommandGroup heading="محصولات" className="[&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-bold">
            {results.map((product) => (
              <CommandItem
                key={product.id}
                value={`product-${product.title}-${product.brandTitle ?? ""}`}
                onSelect={() => {
                  const next = [product.title, ...recent.filter((item) => item !== product.title)];
                  writeRecent(next);
                  closeDialog();
                  router.push(`/products/${product.slug}`);
                }}
                className="gap-3 rounded-xl py-2.5"
              >
                <span className="img-canvas relative size-12 shrink-0 overflow-hidden rounded-lg border border-border/60">
                  <Image src={product.image} alt={product.title} fill sizes="48px" className="object-contain" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[13px] font-semibold text-foreground">{product.title}</span>
                  <span className="text-[11px] text-muted-foreground">{product.brandTitle ?? "—"}</span>
                </span>
                <span className="shrink-0 text-xs font-black text-primary">
                  {product.inStock ? formatTomanPlain(product.price) : "ناموجود"}
                </span>
              </CommandItem>
            ))}
            <CommandItem
              value={`search-all-${query}`}
              onSelect={() => commitSearch(query)}
              className="justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-[13px] font-medium text-muted-foreground"
            >
              <IconArrowLeft className="size-4" aria-hidden="true" />
              دیدن همهٔ نتایج «{query}»
            </CommandItem>
          </CommandGroup>
        ) : null}

        {/* اخیر — فقط وقتی query خالی است */}
        {query === "" && recent.length > 0 ? (
          <CommandGroup heading="جستجوهای اخیر" className="[&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-bold">
            {recent.map((term) => (
              <CommandItem
                key={`recent-${term}`}
                value={`recent-item-${term}`}
                onSelect={() => commitSearch(term)}
                className="group/recent gap-3 rounded-xl py-2.5"
              >
                <IconClock className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" stroke={1.75} />
                <span className="flex-1 text-[13px] text-foreground">{term}</span>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeRecent(term);
                  }}
                  aria-label={`حذف «${term}» از جستجوهای اخیر`}
                  className="flex size-6 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-destructive group-hover/recent:opacity-100 focus-visible:opacity-100"
                >
                  <IconX className="size-3.5" aria-hidden="true" />
                </button>
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}

        {/* پرطرفدار — فقط وقتی query خالی است */}
        {query === "" ? (
          <CommandGroup heading="پرطرفدارترین جستجوها" className="[&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-bold">
            <div className="flex flex-wrap gap-2 px-1 py-1.5">
              {PREVIEW_POPULAR_SEARCHES.map((term) => (
                <button
                  key={`popular-${term}`}
                  type="button"
                  onClick={() => commitSearch(term)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-fresh/60 hover:bg-secondary hover:text-primary"
                >
                  <IconFlame className="size-3.5 text-fresh-strong dark:text-fresh" aria-hidden="true" stroke={1.75} />
                  {term}
                </button>
              ))}
            </div>
          </CommandGroup>
        ) : null}
      </CommandList>
    </CommandDialog>
  );
}
