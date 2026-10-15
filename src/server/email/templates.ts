/**
 * قالب‌های ایمیل RTL «بسلامت»
 * ═══════════════════════════════
 * چهار قالب جدول‌محور (سازگاری Gmail/Outlook) با استایل کاملاً inline و بدون فایل خارجی.
 * هویت: هدر سبز کاجی #0C3B2E + خط طلایی نازک #C9A24B + لوگوی متنی برند؛ بدنهٔ کارت سفید روی عاجی #F7F6F1؛ فوتر با متن کوچک + لینک فروشگاه.
 * فونت: Tahoma / Segoe UI — ایمیل‌کلاینت‌ها Vazirmatn ندارند؛ ساده و تمیز.
 *
 * نکتهٔ URLها: trackUrl/productUrl از caller به‌صورت relative می‌آیند (مثل /account/orders/x)
 * و همین‌گونه در href می‌مانند — TODO فاز ۷: APP_URL از env برای لینک مطلق.
 */

import { brand } from "@/config/brand";
import { formatToman, toFa } from "@/lib/format";

/* ─── توکن‌های رنگ ایمیل (کلاینت‌ها CSS متغیر نمی‌فهمند؛ همه inline) ─── */
const PINE = "#0C3B2E"; // سبز کاجی — هدر/دکمه/عناوین
const GOLD = "#C9A24B"; // طلایی — خط هدر/جزئیات
const IVORY = "#F7F6F1"; // عاجی — پس‌زمینهٔ بیرونی/سطرهای جدول
const INK = "#1F2937"; // متن اصلی
const MUTED = "#6B7280"; // متن فرعی/فوتر
const HAIR = "#EFEBE0"; // خطوط داخلی جدول
const FONT = "Tahoma,'Segoe UI',sans-serif";

/* ─── امضاهای داده (strict — payload خام در outbox با type guard به این‌ها تبدیل می‌شود) ─── */

export interface OrderPlacedEmailData {
  customerName: string;
  orderNumber: string;
  total: number;
  itemsCount: number;
  items: { title: string; qty: number; lineTotal: number }[];
  trackUrl: string;
}

export interface OrderStatusEmailData {
  customerName: string;
  orderNumber: string;
  newStatusLabel: string;
  note?: string;
  trackUrl: string;
}

export interface StockAvailableEmailData {
  productName: string;
  productUrl: string;
  storeName: string;
}

export interface ContactAckEmailData {
  name: string;
  subject: string;
}

/* ─── ابزارک‌های خصوصی ─── */

/** escape مقادیر کاربر در HTML (عنوان کالا، نام مشتری، URL و…) */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface EmailCta {
  label: string;
  href: string;
}

/** دکمهٔ CTA سبز/طلایی — جدول‌محور تا در همهٔ کلاینت‌ها رندر یکسان بگیرد */
function ctaButton(cta: EmailCta): string {
  // TODO فاز ۷: APP_URL از env برای لینک مطلق — href همان مسیر relative می‌ماند
  return (
    `<table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin:28px auto 6px;">` +
    `<tr><td align="center" style="background-color:${PINE};border:1px solid ${GOLD};border-radius:10px;">` +
    `<a href="${escapeHtml(cta.href)}" style="display:inline-block;padding:13px 36px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;font-family:${FONT};">${escapeHtml(cta.label)}</a>` +
    `</td></tr></table>`
  );
}

/** بج وضعیت سفارش — قرص سبز با حلقهٔ طلایی */
function statusBadge(label: string): string {
  return (
    `<div style="text-align:center;margin:20px 0 8px;">` +
    `<span style="display:inline-block;background-color:${PINE};color:#ffffff;border:1px solid ${GOLD};border-radius:999px;padding:8px 26px;font-size:14px;font-weight:bold;">${escapeHtml(label)}</span>` +
    `</div>`
  );
}

/** جدول آیتم‌های سفارش (عنوان/تعداد/مبلغ) + سطر جمع کل */
function itemsTableHtml(items: { title: string; qty: number; lineTotal: number }[], total: number): string {
  const head =
    `<tr>` +
    `<th align="right" style="background-color:${IVORY};color:${PINE};font-size:13px;font-weight:bold;padding:10px 14px;border-bottom:1px solid ${HAIR};font-family:${FONT};">کالا</th>` +
    `<th align="center" style="background-color:${IVORY};color:${PINE};font-size:13px;font-weight:bold;padding:10px 14px;border-bottom:1px solid ${HAIR};font-family:${FONT};">تعداد</th>` +
    `<th align="left" style="background-color:${IVORY};color:${PINE};font-size:13px;font-weight:bold;padding:10px 14px;border-bottom:1px solid ${HAIR};font-family:${FONT};">مبلغ</th>` +
    `</tr>`;
  const rows = items
    .map(
      (item) =>
        `<tr>` +
        `<td align="right" style="padding:10px 14px;border-bottom:1px solid ${HAIR};font-size:13px;color:${INK};font-family:${FONT};">${escapeHtml(item.title)}</td>` +
        `<td align="center" style="padding:10px 14px;border-bottom:1px solid ${HAIR};font-size:13px;color:${INK};font-family:${FONT};">${toFa(item.qty)}</td>` +
        `<td align="left" style="padding:10px 14px;border-bottom:1px solid ${HAIR};font-size:13px;color:${INK};font-family:${FONT};">${formatToman(item.lineTotal)}</td>` +
        `</tr>`,
    )
    .join("");
  const totalRow =
    `<tr>` +
    `<td colspan="2" align="right" style="padding:12px 14px;background-color:${IVORY};font-size:14px;font-weight:bold;color:${PINE};font-family:${FONT};">جمع کل سفارش</td>` +
    `<td align="left" style="padding:12px 14px;background-color:${IVORY};font-size:14px;font-weight:bold;color:${PINE};font-family:${FONT};">${formatToman(total)}</td>` +
    `</tr>`;
  return (
    `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="width:100%;margin:16px 0 4px;border:1px solid ${HAIR};border-radius:10px;border-collapse:collapse;">` +
    head +
    rows +
    totalRow +
    `</table>`
  );
}

/** عنوان و پاراگراف بدنه */
function h1(text: string): string {
  return `<h1 style="margin:0 0 18px;font-size:19px;font-weight:bold;color:${PINE};line-height:1.8;font-family:${FONT};">${text}</h1>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 12px;font-size:14px;color:${INK};line-height:2;font-family:${FONT};">${text}</p>`;
}

/**
 * قاب مشترک همهٔ ایمیل‌ها (header/footer) — DRY.
 * کارت سفید با گوشه‌های گرد روی پس‌زمینهٔ عاجی؛ هدر متالیک با لوگوی متنی برند
 * و خط طلایی نازک زیر آن؛ فوتر با متن کوچک + لینک فروشگاه.
 */
function emailShell(title: string, bodyHtml: string, cta?: EmailCta): string {
  // TODO فاز ۷: APP_URL از env برای لینک مطلق — فوتر و CTA همان مسیر relative می‌مانند
  const ctaHtml = cta ? ctaButton(cta) : "";
  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<title>${escapeHtml(title)}</title>
</head>
<body dir="rtl" style="margin:0;padding:0;background-color:${IVORY};direction:rtl;font-family:${FONT};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(title)}</div>
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="width:100%;background-color:${IVORY};font-family:${FONT};">
<tr>
<td align="center" style="padding:28px 12px 36px;">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="width:600px;max-width:600px;background-color:#ffffff;border-radius:14px;border:1px solid ${HAIR};overflow:hidden;">
<tr>
<td align="center" dir="rtl" style="background-color:${PINE};padding:32px 24px 28px;">
<div style="font-size:28px;font-weight:bold;color:#ffffff;letter-spacing:0.5px;">${escapeHtml(brand.name)}</div>
<div style="font-size:12px;color:${GOLD};margin-top:8px;letter-spacing:1px;">${escapeHtml(brand.tagline)}</div>
</td>
</tr>
<tr><td style="height:3px;background-color:${GOLD};font-size:0;line-height:0;">&nbsp;</td></tr>
<tr>
<td dir="rtl" align="right" style="padding:32px 28px 12px;">
${bodyHtml}
${ctaHtml}
</td>
</tr>
<tr>
<td dir="rtl" align="center" style="padding:24px 24px 30px;border-top:1px solid ${HAIR};">
<div style="font-size:12px;color:${MUTED};line-height:2.1;">
<a href="/" style="color:${PINE};text-decoration:none;font-weight:bold;">فروشگاه ${escapeHtml(brand.name)}</a>
&nbsp;&middot;&nbsp; تلفن پشتیبانی: ${toFa(brand.contact.phone)}
<br />
&copy; ${toFa(new Date().getFullYear())} ${escapeHtml(brand.name)} — تمامی حقوق محفوظ است.
</div>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>`;
}

/* ─── چهار قالب عمومی ─── */

/** ثبت سفارش — جدول آیتم‌ها + جمع کل + دکمهٔ «پیگیری سفارش» */
export function renderOrderPlacedEmail(d: OrderPlacedEmailData): { subject: string; html: string } {
  const body =
    h1("سفارش شما ثبت شد") +
    p(`${escapeHtml(d.customerName)} عزیز،`) +
    p(
      `سفارش شما با شمارهٔ <strong style="color:${PINE};">${escapeHtml(d.orderNumber)}</strong> با موفقیت در فروشگاه ${escapeHtml(brand.name)} ثبت شد و پس از آماده‌سازی، به آدرس شما ارسال خواهد شد.`,
    ) +
    p(`جزئیات ${toFa(d.itemsCount)} قلم کالای سفارش شما:`) +
    itemsTableHtml(d.items, d.total);
  return {
    subject: `سفارش شما با شمارهٔ ${d.orderNumber} ثبت شد`,
    html: emailShell(`سفارش شما با شمارهٔ ${d.orderNumber} ثبت شد`, body, {
      label: "پیگیری سفارش",
      href: d.trackUrl,
    }),
  };
}

/** تغییر وضعیت سفارش — بج وضعیت + توضیح اختیاری + دکمهٔ پیگیری */
export function renderOrderStatusEmail(d: OrderStatusEmailData): { subject: string; html: string } {
  const noteHtml = d.note
    ? `<div dir="rtl" style="margin:16px 0 8px;background-color:${IVORY};border:1px solid ${HAIR};border-radius:10px;padding:12px 16px;font-size:13px;color:${INK};line-height:2;font-family:${FONT};">توضیح: ${escapeHtml(d.note)}</div>`
    : "";
  const body =
    h1("وضعیت سفارش به‌روزرسانی شد") +
    p(`${escapeHtml(d.customerName)} عزیز،`) +
    p(
      `وضعیت سفارش شما با شمارهٔ <strong style="color:${PINE};">${escapeHtml(d.orderNumber)}</strong> تغییر کرد:`,
    ) +
    statusBadge(d.newStatusLabel) +
    noteHtml;
  return {
    subject: `وضعیت سفارش ${d.orderNumber} به‌روزرسانی شد`,
    html: emailShell(`وضعیت سفارش ${d.orderNumber} به‌روزرسانی شد`, body, {
      label: "پیگیری سفارش",
      href: d.trackUrl,
    }),
  };
}

/** موجود‌شدن کالا (خبرم‌کن) — دکمهٔ «مشاهده و خرید» */
export function renderStockAvailableEmail(d: StockAvailableEmailData): { subject: string; html: string } {
  const body =
    h1("دوباره موجود شد!") +
    p(
      `کالای <strong style="color:${PINE};">${escapeHtml(d.productName)}</strong> که منتظرش بودید، اکنون در فروشگاه ${escapeHtml(d.storeName)} موجود است.`,
    ) +
    p(`موجودی این کالا محدود است؛ همین حالا سفارش دهید تا برای شما رزرو شود.`);
  return {
    subject: `${d.productName} دوباره موجود شد`,
    html: emailShell(`${d.productName} دوباره موجود شد`, body, {
      label: "مشاهده و خرید",
      href: d.productUrl,
    }),
  };
}

/** تأیید دریافت پیام فرم تماس — بدون CTA؛ ارجاع به پشتیبانی تلفنی */
export function renderContactAckEmail(d: ContactAckEmailData): { subject: string; html: string } {
  const body =
    h1("پیام شما دریافت شد") +
    p(`${escapeHtml(d.name)} عزیز،`) +
    p(`پیام شما با موضوع «<strong style="color:${PINE};">${escapeHtml(d.subject)}</strong>» دریافت شد و کارشناسان ما در سریع‌ترین زمان ممکن پاسخ خواهند داد.`) +
    p(
      `برای موضوع‌های فوری، در ساعات کاری (${toFa(brand.contact.hours[0]?.time ?? "")}، ${escapeHtml(brand.contact.hours[0]?.days ?? "شنبه تا پنجشنبه")}) با پشتیبانی تلفنی ${toFa(brand.contact.phone)} در تماس باشید.`,
    );
  return {
    subject: "پیام شما دریافت شد",
    html: emailShell("پیام شما دریافت شد", body),
  };
}
