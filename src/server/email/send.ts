/**
 * ارسال ایمیل — «بسلامت»
 * ══════════════════════
 * قاعدهٔ طلایی (هم‌راستا با درایورهای پیامک/پرداخت): هرگز throw نکن —
 * خطا همیشه به‌صورت { ok: false, message } با پیام فارسی برمی‌گردد.
 *
 * env:
 *   SMTP_HOST  — اگر خالی باشد سرویس غیرفعال است و ایمیل ارسال نمی‌شود (بدون خطا)
 *   SMTP_PORT  — پیش‌فرض 587 (اگر 465 بود اتصال TLS مستقیم)
 *   SMTP_USER / SMTP_PASS — احراز هویت (اختیاری برای رلهٔ محلی)
 *   SMTP_FROM  — آدرس فرستنده؛ پیش‌فرض SMTP_USER
 */

import nodemailer, { type Transporter } from "nodemailer";

export interface EmailSendResult {
  ok: boolean;
  message?: string;
}

/** کش ترنسپورتر روی globalThis — مقاوم به هات‌ریلود dev و تغییر env */
interface SmtpCacheShape {
  key: string | null;
  transporter: Transporter | null;
}

const globalForSmtp = globalThis as unknown as { __bsSmtpCache?: SmtpCacheShape };
const smtpCache: SmtpCacheShape = (globalForSmtp.__bsSmtpCache ??= { key: null, transporter: null });

/** ساخت (یا بازیابی از کش) ترنسپورتر SMTP — کلید کش = پیکربندی فعلی env */
function getTransporter(host: string, port: number, user: string, pass: string): Transporter {
  const key = `${host}:${port}:${user}`;
  if (smtpCache.key === key && smtpCache.transporter !== null) {
    return smtpCache.transporter;
  }
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user !== "" ? { user, pass } : undefined,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 10_000,
  });
  smtpCache.key = key;
  smtpCache.transporter = transporter;
  return transporter;
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<EmailSendResult> {
  const host = process.env.SMTP_HOST?.trim() ?? "";
  if (host === "") {
    // SMTP تنظیم نشده — وضعیت عادی محیط فعلی است؛ فقط هشدار و خروجی typed
    console.warn("[SMTP] تنظیم نشده — ایمیل ارسال نشد");
    return { ok: false, message: "سرویس ایمیل تنظیم نشده است" };
  }

  const port = Number(process.env.SMTP_PORT ?? 587) || 587;
  const user = process.env.SMTP_USER ?? "";
  const pass = process.env.SMTP_PASS ?? "";
  const from = process.env.SMTP_FROM?.trim() || user || "no-reply@besalamat.example.com";

  try {
    const transporter = getTransporter(host, port, user, pass);
    await transporter.sendMail({ from, to: input.to, subject: input.subject, html: input.html });
    return { ok: true };
  } catch (error) {
    // جزئیات فنی فقط در لاگ سرور؛ به کاربر/صف پیام فارسی کوتاه می‌رسد
    console.error("[SMTP] ارسال ایمیل ناموفق بود:", error);
    return { ok: false, message: "ارسال ایمیل ناموفق بود" };
  }
}
