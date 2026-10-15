/**
 * آیکون دسته‌بندی — مپِ iconKey داده‌ها به آیکون‌های lucide
 * ─────────────────────────────
 * Server Component؛ کلید ناشناخته یا null → آیکون جایگزین عمومی.
 * مصرف: <CategoryIcon iconKey={c.iconKey} className="size-5" />
 */

import {
  BedDouble,
  Bone,
  CircleEllipsis,
  Droplets,
  HeartPulse,
  PersonStanding,
  Scale,
  ShieldPlus,
  Thermometer,
  Wind,
  type LucideIcon,
} from "lucide-react";

/** مپ صریح iconKey → آیکون (برای مصرف مستقیم در مگامنو/ادمین هم export شده) */
export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  "blood-pressure": HeartPulse,
  glucose: Droplets,
  thermometer: Thermometer,
  respiratory: Wind,
  wheelchair: PersonStanding,
  beds: BedDouble,
  orthopedic: Bone,
  masks: ShieldPlus,
  scales: Scale,
};

interface CategoryIconProps {
  iconKey: string | null;
  className?: string;
}

export function CategoryIcon({ iconKey, className }: CategoryIconProps) {
  const Icon = (iconKey != null && CATEGORY_ICON_MAP[iconKey]) || CircleEllipsis;
  return <Icon className={className} aria-hidden="true" />;
}
