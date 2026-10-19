/**
 * گرید تبلیغات عکسی — چیدمان‌های «بنتو / جفت / سه‌تایی»
 * ─────────────────────────────
 * Server Component؛ هر کاشی یک Link با روکش گرادیانی و CTA گوشه.
 *
 * 📐 ابعاد طراحی تصاویر (برای طراح — عین AD_LAYOUT_SPECS):
 *  - bento: [۱:۱ ۱۴۴۰×۱۴۴۰، ۲:۱ ۱۴۴۰×۷۲۰، ۱:۱ ۷۲۰×۷۲۰، ۱:۱ ۷۲۰×۷۲۰]
 *  - duo:   [۱۲:۵ ۱۶۸۰×۷۰۰ ×۲]
 *  - trio:  [۱:۱ ۱۰۰۰×۱۰۰۰ ×۳]
 * طراح تصویر را دقیقاً با این ابعاد (@۲x) آماده کند؛ متن‌های مهم
 * دور از لبهٔ «پایین-پایان» (جای عنوان و دکمه) قرار گیرد.
 */

import Image from "next/image";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import type { AdGridDTO, AdLayoutKey, AdTileDTO } from "@/types/shop";

/** کلاس گرید هر قالب */
const GRID_CLASS: Record<AdLayoutKey, string> = {
  bento: "grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4 lg:grid-rows-2",
  duo: "grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4",
  trio: "grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4",
};

/** کلاس اسلات هر قالب — ترتیب آرایه = slotIndex */
const SLOT_CLASS: Record<AdLayoutKey, string[]> = {
  bento: [
    "col-span-2 aspect-square lg:row-span-2",
    "col-span-2 aspect-[2/1]",
    "col-span-1 aspect-square",
    "col-span-1 aspect-square",
  ],
  duo: ["aspect-[12/5]", "aspect-[12/5]"],
  trio: ["aspect-square", "aspect-square", "aspect-square"],
};

/** sizes هر اسلات — برای بهینه‌سازی بارگذاری تصویر */
const SLOT_SIZES: Record<AdLayoutKey, string[]> = {
  bento: [
    "(max-width:1024px) 100vw, 50vw",
    "(max-width:1024px) 100vw, 50vw",
    "(max-width:1024px) 50vw, 25vw",
    "(max-width:1024px) 50vw, 25vw",
  ],
  duo: ["(max-width:768px) 100vw, 50vw", "(max-width:768px) 100vw, 50vw"],
  trio: [
    "(max-width:640px) 100vw, 33vw",
    "(max-width:640px) 100vw, 33vw",
    "(max-width:640px) 100vw, 33vw",
  ],
};

interface AdGridProps {
  data: AdGridDTO;
  className?: string;
}

export function AdGrid({ data, className }: AdGridProps) {
  const slots = SLOT_CLASS[data.layout];
  const tiles = data.tiles
    .filter(
      (tile) =>
        tile.isActive &&
        tile.slotIndex >= 0 &&
        tile.slotIndex < slots.length,
    )
    .sort((a, b) => a.slotIndex - b.slotIndex);

  if (tiles.length === 0) return null;

  return (
    <div className={cn(GRID_CLASS[data.layout], className)}>
      {tiles.map((tile) => (
        <AdTile
          key={tile.id}
          tile={tile}
          className={slots[tile.slotIndex]}
          sizes={SLOT_SIZES[data.layout][tile.slotIndex]}
        />
      ))}
    </div>
  );
}

interface AdTileProps {
  tile: AdTileDTO;
  className: string;
  sizes: string;
}

function AdTile({ tile, className, sizes }: AdTileProps) {
  return (
    <Link
      href={tile.href}
      aria-label={tile.title ?? "پیشنهاد ویژه"}
      className={cn(
        "group relative block overflow-hidden rounded-2xl border border-border/60 bg-card",
        "outline-none transition-colors duration-300 hover:border-fresh/50 focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <Image
        src={tile.imageUrl}
        alt={tile.title ?? "پیشنهاد ویژه"}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />

      {/* روکش گرادیانی — خوانایی متن روی هر تصویری */}
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
      />

      {/* متن — پایین-شروع؛ pe تا زیر دکمه نرود */}
      {tile.title ? (
        <span className="absolute inset-x-0 bottom-0 p-4 pe-14 md:p-5 md:pe-16">
          <span className="block text-sm font-black text-white drop-shadow md:text-base">
            {tile.title}
          </span>
          {tile.subtitle ? (
            <span className="mt-1 block text-[11px] text-white/80 md:text-xs">
              {tile.subtitle}
            </span>
          ) : null}
        </span>
      ) : null}

      {/* CTA گوشه — پایین-پایان */}
      <span
        aria-hidden="true"
        className="absolute bottom-4 end-4 flex size-9 items-center justify-center rounded-full border border-white/25 bg-white/15 text-white backdrop-blur transition-all duration-300 group-hover:border-fresh group-hover:bg-fresh"
      >
        <IconArrowLeft className="size-4.5 transition-transform duration-300 group-hover:-translate-x-0.5" />
      </span>
    </Link>
  );
}
