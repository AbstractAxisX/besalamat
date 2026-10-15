/**
 * ابزارهای قالب‌بندی — اعداد فارسی، تومان، شماره موبایل، شماره سفارش
 * (بدون کتابخانه؛ ~۲۰ خط منطق)
 */

import { brand } from "@/config/brand";

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"] as const;

/** تبدیل ارقام لاتین به فارسی */
export function toFa(value: string | number): string {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

/** تبدیل ارقام فارسی/عربی به لاتین (برای ورودی‌ها) */
export function toEnDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

/** جداکنندهٔ هزارگان با ممیز فارسی */
export function formatNumber(value: number): string {
  return Math.round(value)
    .toLocaleString("en-US")
    .replace(/,/g, "٬");
}

/** «۱٬۲۵۰٬۰۰۰ تومان» */
export function formatToman(value: number): string {
  return `${toFa(formatNumber(value))} ${brand.currencyLabel}`;
}

/** فقط عدد فارسی جدا شده (بدون واژهٔ تومان) */
export function formatTomanPlain(value: number): string {
  return toFa(formatNumber(value));
}

/** درصد تخفیف گردشده — null یعنی بدون تخفیف */
export function discountPercent(
  price: number,
  comparePrice: number | null,
): number | null {
  if (comparePrice == null || comparePrice <= price) return null;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

/**
 * نرمال‌سازی شماره موبایل ایران → «09xxxxxxxxx»
 * فارسی/عربی، +98، 0098 و فاصله‌ها را می‌پذیرد؛ نامعتبر = null
 */
export function normalizePhone(input: string): string | null {
  let phone = toEnDigits(input).replace(/\D/g, "");
  if (phone.startsWith("0098")) {
    phone = `0${phone.slice(4)}`;
  } else if (phone.startsWith("98") && phone.length === 12) {
    phone = `0${phone.slice(2)}`;
  }
  if (/^9\d{9}$/.test(phone)) phone = `0${phone}`;
  return /^09\d{9}$/.test(phone) ? phone : null;
}

/** نمایش خوانای شماره موبایل: ۰۹۱۲ ۳۴۵ ۶۷۸۹ */
export function formatPhoneFa(phone: string): string {
  const en = toEnDigits(phone).replace(/\D/g, "");
  if (/^09\d{9}$/.test(en)) {
    return toFa(`${en.slice(0, 4)} ${en.slice(4, 7)} ${en.slice(7)}`);
  }
  return toFa(phone);
}

/** شماره سفارش خوانا: BS-10234 */
export function formatOrderNumber(sequence: number): string {
  return `${brand.orderNumberPrefix}-${sequence}`;
}

/** شماره سفارش با ارقام فارسی: BS-۱۰۲۳۴ */
export function formatOrderNumberFa(sequence: number): string {
  return toFa(formatOrderNumber(sequence));
}
