/**
 * POST /api/contact — ثبت پیام فرم تماس (عمومی)
 * ─────────────────────────────
 * اعتبارسنجی zod با پیام فارسی + ذخیره در ContactMessage + محدودساز نرخ.
 * موضوع به‌صورت مقدار enum («orders» و…) می‌آید و برچسب فارسی ذخیره می‌شود.
 */

import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { normalizePhone } from "@/lib/format";
import { clientIp, rateLimit } from "@/server/rate-limit";

/** برچسب فارسی موضوع — عین گزینه‌های فرم تماس */
const SUBJECT_LABELS: Record<string, string> = {
  orders: "سفارش‌ها",
  product: "مشاورهٔ محصول",
  support: "پشتیبانی",
  cooperation: "همکاری",
  other: "سایر",
};

const contactSchema = z.object({
  name: z.string().trim().min(2, "نام را وارد کنید"),
  mobile: z.string().refine((value) => normalizePhone(value) !== null, {
    message: "شمارهٔ موبایل معتبر نیست",
  }),
  subject: z.enum(["orders", "product", "support", "cooperation", "other"], {
    message: "موضوع پیام نامعتبر است",
  }),
  message: z.string().trim().min(10, "پیام خود را کامل بنویسید"),
  email: z.string().trim().email("رایانامه معتبر نیست").optional().or(z.literal("")),
});

export async function POST(request: Request) {
  /* نرخ: ۵ پیام در ۱۰ دقیقه برای هر IP — جلوگیری از اسپم */
  const ip = clientIp(new Headers(request.headers));
  const limit = rateLimit(`contact:ip:${ip}`, 5, 10 * 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { message: "تعداد پیام‌های ارسالی زیاد است؛ کمی بعد دوباره تلاش کنید." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "بدنهٔ درخواست نامعتبر است." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "ورودی نامعتبر است." },
      { status: 400 },
    );
  }

  const { name, mobile, subject, message, email } = parsed.data;
  const phone = normalizePhone(mobile)!;

  try {
    await db.contactMessage.create({
      data: {
        name,
        phone,
        email: email && email.length > 0 ? email : null,
        subject: SUBJECT_LABELS[subject] ?? "سایر",
        body: message,
      },
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("[api/contact] خطای DB:", error);
    return NextResponse.json(
      { message: "ثبت پیام ناموفق بود؛ لطفاً دوباره تلاش کنید." },
      { status: 500 },
    );
  }
}
