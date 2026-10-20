"use client";

/**
 * دیالوگ جستجوی سراسری — تجربهٔ جستجوی اصلی سایت
 * ─────────────────────────────
 *  - شورت‌کات: Ctrl+K / ⌘K و «/»
 *  - جستجوی لحظه‌ای با API سرور (/api/search) — debounce ۲۵۰ms + AbortController؛
 *    در خطای شبکه/پاسخ نامعتبر → fallback محلی روی دادهٔ پیش‌نمایش
 *  - جستجوهای پرطرفدار + جستجوهای اخیر (localStorage، قابل حذف تک‌تک)
 *  - Enter → صفحهٔ نتایج کامل /search?q=
 * مصرف: <SearchDialog /> یک‌بار (مثلاً داخل layout)؛ باز کردن با useSearchDialogStore.
 */

import { useCallback, useEffect, useState } from "react";
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
import type { ProductSummary } from "@/types/shop";
import {
  IconArrowLeft,
  IconSearch,
  IconClock,
  IconX,
  IconFlame,
} from "@tabler/icons-react";

const RECENT_KEY = "besalamat:recent-searches";
const RECENT_MAX = 6;

/** حداقل طول عبارت برای رفتن به سرور */
const MIN_QUERY_LENGTH = 2;

/** تأخیر debounce میلی‌ثانیه */
const SEARCH_DEBOUNCE_MS = 250;

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

/** فیلتر محلی روی دادهٔ پیش‌نمایش — fallback جستجوی سرور */
function localPreviewFilter(q: string): ProductSummary[] {
  const normalized = normalizeFa(q);
  if (!normalized) return [];
  return PREVIEW_PRODUCTS.filter((product) => {
    const title = normalizeFa(product.title);
    const brand = normalizeFa(product.brandTitle ?? "");
    return title.includes(normalized) || brand.includes(normalized);
  }).slice(0, 6);
}

/** اعتبارسنجی امن پاسخ /api/search → ProductSummary[] */
function parseProducts(payload: unknown): ProductSummary[] | null {
  if (typeof payload !== "object" || payload === null) return null;
  const raw = (payload as Record<string, unknown>)["products"];
  if (!Array.isArray(raw)) return null;
  const products: ProductSummary[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) continue;
    const row = item as Record<string, unknown>;
    if (
      typeof row["id"] === "string" &&
      typeof row["slug"] === "string" &&
      typeof row["title"] === "string" &&
      typeof row["image"] === "string" &&
      typeof row["price"] === "number" &&
      typeof row["inStock"] === "boolean"
    ) {
      products.push({
        id: row["id"],
        slug: row["slug"],
        title: row["title"],
        image: row["image"],
        price: row["price"],
        comparePrice: typeof row["comparePrice"] === "number" ? row["comparePrice"] : null,
        inStock: row["inStock"],
        brandTitle: typeof row["brandTitle"] === "string" ? row["brandTitle"] : null,
        isNew: row["isNew"] === true,
        isFeatured: row["isFeatured"] === true,
        categorySlug: typeof row["categorySlug"] === "string" ? row["categorySlug"] : null,
      });
    }
  }
  return products;
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
  const [results, setResults] = useState<ProductSummary[]>([]);

  /* جستجوی سرور — debounce ۲۵۰ms + AbortController؛ حداقل ۲ نویسه.
     خطا یا پاسخ نامعتبر → fallback محلی روی دادهٔ پیش‌نمایش. */
  useEffect(() => {
    const q = query.trim();
    if (q.length < MIN_QUERY_LENGTH) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      void (async () => {
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
            signal: controller.signal,
          });
          if (!res.ok) throw new Error("پاسخ نامعتبر");
          const data: unknown = await res.json();
          const products = parseProducts(data);
          if (products === null) throw new Error("ساختار نامعتبر");
          /* خالی هم fallback محلی می‌خورد (هم‌داده با سرور → معمولاً خالی می‌ماند) */
          setResults(products.length > 0 ? products.slice(0, 6) : localPreviewFilter(q));
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") return;
          setResults(localPreviewFilter(q));
        }
      })();
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

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
      showCloseButton={false}
      className="border-border/70 bg-popover/90 shadow-pop backdrop-blur-2xl sm:max-w-xl"
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
        {/* راهنمای کلید — دکمهٔ ضربدر حذف شده به درخواست مشتری؛
            بستن با Esc، کلیک بیرون یا انتخاب نتیجه */}
        <kbd
          dir="ltr"
          className="shrink-0 rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
          aria-hidden="true"
        >
          /
        </kbd>
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
                  <Image src={product.image} alt={product.title} fill sizes="48px" className="object-cover" />
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
