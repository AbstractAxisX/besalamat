/**
 * تاریخ جلالی — پوشش سبک روی date-fns-jalali (tree-shakeable)
 * همهٔ خروجی‌ها با ارقام فارسی.
 */

import { format } from "date-fns-jalali";
import { faIR } from "date-fns-jalali/locale";
import { toFa } from "@/lib/format";

type DateInput = Date | string | number;

function toDate(value: DateInput): Date {
  return value instanceof Date ? value : new Date(value);
}

/** «۱۵ آبان ۱۴۰۴» */
export function faDate(value: DateInput): string {
  return toFa(format(toDate(value), "d MMMM yyyy", { locale: faIR }));
}

/** «۱۴۰۴/۰۸/۱۵» */
export function faDateShort(value: DateInput): string {
  return toFa(format(toDate(value), "yyyy/MM/dd"));
}

/** «۱۵ آبان ۱۴۰۴، ساعت ۱۴:۳۰» */
export function faDateTime(value: DateInput): string {
  return toFa(format(toDate(value), "d MMMM yyyy، HH:mm", { locale: faIR }));
}

/** «۱۴:۳۰» */
export function faTime(value: DateInput): string {
  return toFa(format(toDate(value), "HH:mm"));
}

/** «۱۵ آبان» — برای محور چارت‌ها */
export function faDateTick(value: DateInput): string {
  return toFa(format(toDate(value), "d MMM", { locale: faIR }));
}

/** «۳ روز پیش» — نسبی سبک */
export function faRelative(value: DateInput): string {
  const diffMs = Date.now() - toDate(value).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "همین حالا";
  if (minutes < 60) return `${toFa(minutes)} دقیقه پیش`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${toFa(hours)} ساعت پیش`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${toFa(days)} روز پیش`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${toFa(weeks)} هفته پیش`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${toFa(months)} ماه پیش`;
  return `${toFa(Math.floor(months / 12))} سال پیش`;
}
