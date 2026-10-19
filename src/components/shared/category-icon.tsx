/**
 * آیکون دسته‌بندی — مپِ iconKey داده‌ها به آیکون‌های Tabler
 * ─────────────────────────────
 * Server-safe؛ کلید ناشناخته یا null → آیکون جایگزین عمومی.
 * مصرف: <CategoryIcon iconKey={c.iconKey} className="size-5" />
 */

import {
  IconAccessible,
  IconActivity,
  IconBed,
  IconBone,
  IconDroplet,
  IconLungs,
  IconMask,
  IconScale,
  IconStethoscope,
  IconThermometer,
} from "@tabler/icons-react";

type TablerIcon = typeof IconActivity;

/** مپ صریح iconKey → آیکون (برای مصرف مستقیم در مگامنو/ادمین هم export شده) */
export const CATEGORY_ICON_MAP: Record<string, TablerIcon> = {
  "blood-pressure": IconActivity,
  glucose: IconDroplet,
  thermometer: IconThermometer,
  respiratory: IconLungs,
  wheelchair: IconAccessible,
  beds: IconBed,
  orthopedic: IconBone,
  masks: IconMask,
  scales: IconScale,
};

interface CategoryIconProps {
  iconKey: string | null;
  className?: string;
}

export function CategoryIcon({ iconKey, className }: CategoryIconProps) {
  const Icon = (iconKey != null && CATEGORY_ICON_MAP[iconKey]) || IconStethoscope;
  return <Icon className={className} aria-hidden="true" stroke={1.75} />;
}