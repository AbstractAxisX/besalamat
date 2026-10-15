/**
 * صف ارسال پیام (Outbox) — «بسلامت»
 * ═════════════════════════════════
 * enqueueOutbox پیام را با status=PENDING در MessageOutbox ثبت می‌کند؛
 * processOutbox پیام‌های سررسیدشده را رندر و ارسال می‌کند و در صورت خطا با backoff زمان‌بندی‌شده retry می‌کند.
 *
 * فراخوانی فرصت‌طلبانه: هر درخواست سفارش/اقدام ادمین + پنل ادمین فاز ۶ دکمهٔ پردازش صف.
 *
 * قاعدهٔ طلایی: هیچ متد این ماژول به فراخواننده (route) throw نمی‌کند —
 * خطاها به‌صورت lastError روی رکورد و خروجی شمارشی typed برمی‌گردند.
 * payload خام به‌صورت Record<string, unknown> با type guard خوانده می‌شود (بدون any).
 */

import { db } from "@/lib/db";
import { brand } from "@/config/brand";
import { formatToman } from "@/lib/format";
import { getSmsDriver } from "@/server/drivers/sms";
import { sendEmail } from "@/server/email/send";
import {
  renderContactAckEmail,
  renderOrderPlacedEmail,
  renderOrderStatusEmail,
  renderStockAvailableEmail,
} from "@/server/email/templates";

export type OutboxTemplateKey = "order.placed" | "order.status" | "stock.available" | "contact.ack";

export interface EnqueueInput {
  channel: "SMS" | "EMAIL";
  template: OutboxTemplateKey;
  target: string;
  payload: Record<string, unknown>;
}

export interface ProcessOutboxStats {
  processed: number;
  sent: number;
  failed: number;
  retried: number;
}

/* ─── type guardهای امن برای payload خام (unknown) ─── */

/** خواندن رشتهٔ غیرخالی؛ نبود/نامعتبر → null */
function getString(p: Record<string, unknown>, key: string): string | null {
  const value: unknown = p[key];
  if (typeof value === "string" && value.trim() !== "") return value;
  return null;
}

/** خواندن عدد متناهی؛ نبود/نامعتبر → null */
function getNumber(p: Record<string, unknown>, key: string): number | null {
  const value: unknown = p[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return null;
}

/** آیتم‌های سفارش — آرایهٔ {title, qty, lineTotal}؛ هر عضو باید کامل و معتبر باشد */
interface OrderItemData {
  title: string;
  qty: number;
  lineTotal: number;
}

function getOrderItems(p: Record<string, unknown>): OrderItemData[] | null {
  const value: unknown = p["items"];
  if (!Array.isArray(value)) return null;
  const items: OrderItemData[] = [];
  for (const raw of value) {
    if (raw === null || typeof raw !== "object") return null;
    const record: Record<string, unknown> = raw;
    const title = getString(record, "title");
    const qty = getNumber(record, "qty");
    const lineTotal = getNumber(record, "lineTotal");
    if (title === null || qty === null || lineTotal === null) return null;
    items.push({ title, qty, lineTotal });
  }
  return items;
}

/* ─── registry قالب‌ها (strict) ─── */

interface TemplateDef {
  renderSms?: (p: Record<string, unknown>) => string;
  renderEmail?: (p: Record<string, unknown>) => { subject: string; html: string };
}

/** خطای داخلی برای «نبود فیلد» — توسط processOutbox گرفته می‌شود و به lastError تبدیل می‌شود */
class IncompletePayloadError extends Error {
  constructor() {
    super("payload ناقص");
    this.name = "IncompletePayloadError";
  }
}

const TEMPLATE_REGISTRY: Record<OutboxTemplateKey, TemplateDef> = {
  "order.placed": {
    renderSms: (p) => {
      const orderNumber = getString(p, "orderNumber");
      const total = getNumber(p, "total");
      if (orderNumber === null || total === null) throw new IncompletePayloadError();
      return `سفارش ${orderNumber} با موفقیت ثبت شد. مبلغ: ${formatToman(total)}`;
    },
    renderEmail: (p) => {
      const customerName = getString(p, "customerName");
      const orderNumber = getString(p, "orderNumber");
      const total = getNumber(p, "total");
      const itemsCount = getNumber(p, "itemsCount");
      const trackUrl = getString(p, "trackUrl");
      const items = getOrderItems(p);
      if (
        customerName === null ||
        orderNumber === null ||
        total === null ||
        itemsCount === null ||
        trackUrl === null ||
        items === null
      ) {
        throw new IncompletePayloadError();
      }
      return renderOrderPlacedEmail({
        customerName,
        orderNumber,
        total,
        itemsCount,
        items,
        trackUrl,
      });
    },
  },
  "order.status": {
    renderSms: (p) => {
      const orderNumber = getString(p, "orderNumber");
      // در پیامک «statusLabel» و در ایمیل «newStatusLabel» — هر دو نام پذیرفته می‌شود
      const statusLabel = getString(p, "statusLabel") ?? getString(p, "newStatusLabel");
      if (orderNumber === null || statusLabel === null) throw new IncompletePayloadError();
      return `وضعیت سفارش ${orderNumber}: ${statusLabel}`;
    },
    renderEmail: (p) => {
      const customerName = getString(p, "customerName");
      const orderNumber = getString(p, "orderNumber");
      const newStatusLabel = getString(p, "newStatusLabel");
      const trackUrl = getString(p, "trackUrl");
      if (customerName === null || orderNumber === null || newStatusLabel === null || trackUrl === null) {
        throw new IncompletePayloadError();
      }
      const note = getString(p, "note") ?? undefined;
      return renderOrderStatusEmail({ customerName, orderNumber, newStatusLabel, note, trackUrl });
    },
  },
  "stock.available": {
    renderSms: (p) => {
      const productName = getString(p, "productName");
      if (productName === null) throw new IncompletePayloadError();
      return `${productName} در ${brand.name} موجود شد!`;
    },
    renderEmail: (p) => {
      const productName = getString(p, "productName");
      const productUrl = getString(p, "productUrl");
      const storeName = getString(p, "storeName");
      if (productName === null || productUrl === null || storeName === null) {
        throw new IncompletePayloadError();
      }
      return renderStockAvailableEmail({ productName, productUrl, storeName });
    },
  },
  "contact.ack": {
    // پیام تأیید فرم تماس فقط ایمیل دارد — پیامک تعریف نشده است
    renderEmail: (p) => {
      const name = getString(p, "name");
      const subject = getString(p, "subject");
      if (name === null || subject === null) throw new IncompletePayloadError();
      return renderContactAckEmail({ name, subject });
    },
  },
};

const TEMPLATE_KEYS = new Set<string>(["order.placed", "order.status", "stock.available", "contact.ack"]);

function getTemplateDef(key: string): TemplateDef | null {
  if (!TEMPLATE_KEYS.has(key)) return null;
  // با گارد Set مطمئنیم کلید معتبر است
  return TEMPLATE_REGISTRY[key as OutboxTemplateKey];
}

/** JSON.parse امن payload — خراب/غیر-Object → همان خطای «payload ناقص» */
function parsePayload(json: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(json);
    if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // JSON خراب — مثل نبود فیلد رفتار می‌شود
  }
  throw new IncompletePayloadError();
}

/* ─── صف ─── */

/** ثبت یک پیام در صف (همیشه PENDING با attempts=0) */
export async function enqueueOutbox(input: EnqueueInput): Promise<void> {
  await db.messageOutbox.create({
    data: {
      channel: input.channel,
      template: input.template,
      target: input.target,
      payloadJson: JSON.stringify(input.payload),
    },
  });
}

/** backoff پس از شکست: تلاش۱→+۱دقیقه، ۲→+۵، ۳→+۳۰، ۴→+۳۰ (دقیقه) */
const BACKOFF_MS: readonly number[] = [60_000, 300_000, 1_800_000, 1_800_000];

/** حداکثر تلاش قبل از FAILED نهایی */
const MAX_ATTEMPTS = 5;

/** پیام‌های error را به رشتهٔ فارسی/خوانا تبدیل می‌کند */
function errorToMessage(error: unknown): string {
  if (error instanceof Error && error.message !== "") return error.message;
  return "خطای ناشناخته";
}

/**
 * پردازش صف: تا limit پیام سررسیدشده را رندر و ارسال می‌کند.
 * هر رکورد داخل try/catch مستقل — خطای یکی، بقیه را متوقف نمی‌کند.
 * خود تابع هرگز throw نمی‌کند.
 */
export async function processOutbox(limit = 20): Promise<ProcessOutboxStats> {
  const stats: ProcessOutboxStats = { processed: 0, sent: 0, failed: 0, retried: 0 };

  let rows;
  try {
    rows = await db.messageOutbox.findMany({
      where: { status: "PENDING", availableAt: { lte: new Date() } },
      take: limit,
      orderBy: { createdAt: "asc" },
    });
  } catch (error) {
    console.error("[OUTBOX] خواندن صف ناموفق بود:", error);
    return stats;
  }

  for (const row of rows) {
    stats.processed += 1;
    const attempts = row.attempts + 1;

    try {
      const payload = parsePayload(row.payloadJson);
      const def = getTemplateDef(row.template);
      if (def === null) throw new Error("قالب پیام ناشناخته است");

      if (row.channel === "SMS") {
        if (def.renderSms === undefined) {
          throw new Error("قالب پیامک برای این پیام تعریف نشده است");
        }
        const text = def.renderSms(payload);
        const result = await getSmsDriver().send(row.target, text);
        if (!result.ok) throw new Error(result.message ?? "ارسال پیامک ناموفق بود");
      } else {
        if (def.renderEmail === undefined) {
          throw new Error("قالب ایمیل برای این پیام تعریف نشده است");
        }
        const { subject, html } = def.renderEmail(payload);
        const result = await sendEmail({ to: row.target, subject, html });
        if (!result.ok) throw new Error(result.message ?? "ارسال ایمیل ناموفق بود");
      }

      await db.messageOutbox.update({
        where: { id: row.id },
        data: { status: "SENT", attempts, sentAt: new Date(), lastError: null },
      });
      stats.sent += 1;
    } catch (error) {
      const message = errorToMessage(error);
      stats.failed += 1;

      if (attempts >= MAX_ATTEMPTS) {
        // تلاش آخر — FAILED نهایی
        try {
          await db.messageOutbox.update({
            where: { id: row.id },
            data: { status: "FAILED", attempts, lastError: message },
          });
        } catch (dbError) {
          console.error("[OUTBOX] ثبت FAILED ناموفق بود:", dbError);
        }
      } else {
        // retry با backoff — هنوز PENDING می‌ماند
        stats.retried += 1;
        try {
          await db.messageOutbox.update({
            where: { id: row.id },
            data: {
              attempts,
              lastError: message,
              availableAt: new Date(Date.now() + BACKOFF_MS[attempts - 1]),
            },
          });
        } catch (dbError) {
          console.error("[OUTBOX] ثبت retry ناموفق بود:", dbError);
        }
      }
    }
  }

  return stats;
}
