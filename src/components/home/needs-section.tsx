/**
 * «خرید بر اساس نیاز» — شش دغدغهٔ رایج، شش مسیر سریع
 * ─────────────────────────────
 * Server Component؛ ورود پلکانی با StaggerList (مرز کلاینت).
 * لحظهٔ هاور: وارونگی آیکون (سبزفام → سبز عمیق) — امضای بخش.
 */

import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

import { CategoryIcon } from "@/components/shared/category-icon";
import { StaggerItem, StaggerList } from "@/components/shared/motion";
import { SectionHeading } from "@/components/shared/section-heading";
import type { NeedCardDTO } from "@/types/shop";

interface NeedsSectionProps {
  title: string;
  subtitle?: string;
  needs: NeedCardDTO[];
}

export function NeedsSection({ title, subtitle, needs }: NeedsSectionProps) {
  const activeNeeds = needs
    .filter((need) => need.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (activeNeeds.length === 0) return null;

  return (
    <section className="shell py-14 md:py-20" aria-label={title}>
      <SectionHeading
        eyebrow="راهنمای خرید"
        title={title}
        subtitle={subtitle}
      />

      <StaggerList
        className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-3"
        step={0.06}
      >
        {activeNeeds.map((need) => (
          <StaggerItem key={need.id} className="h-full">
            <Link
              href={need.href}
              className="group relative flex h-full flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5 outline-none transition-colors duration-300 hover:border-fresh/60 hover:bg-secondary/40 focus-visible:ring-2 focus-visible:ring-ring md:p-6"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground md:size-14">
                <CategoryIcon iconKey={need.iconKey} className="size-6 md:size-7" />
              </span>

              <span className="space-y-1.5">
                <span className="block text-sm font-black text-foreground md:text-base">
                  {need.title}
                </span>
                <span className="block text-xs leading-6 text-muted-foreground line-clamp-2 md:text-[13px]">
                  {need.description}
                </span>
              </span>

              <span className="mt-auto flex items-center gap-1.5 pt-2 text-xs font-bold text-fresh-strong">
                مشاهدهٔ محصولات
                <IconArrowLeft
                  className="size-4 transition-transform duration-300 group-hover:-translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </Link>
          </StaggerItem>
        ))}
      </StaggerList>
    </section>
  );
}
