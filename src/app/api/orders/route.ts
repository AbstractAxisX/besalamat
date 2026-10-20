/**
 * POST /api/orders — ثبت سفارش واقعی (اتمیک)
 * ─────────────────────────────
 * احراز هویت: سشن الزامی است (۴۰۱ فارسی بدون سشن).
 * قیمت/عنوان/تصویر اقلام به‌صورت «مرجع سرور» از DB خوانده می‌شود (snapshot)
 * و موجودی به‌اندازهٔ خرید کسر می‌شود — همه داخل یک تراکنش.
 * هزینهٔ ارسال فعلاً ۰ است («هزینهٔ ارسال در مرحلهٔ بعد» — فاز ۴ درگاه)؛
 * شمارهٔ سفارش: BS- + دنبالهٔ ۶ رقمی از Setting «order.sequence».
 */

import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { normalizePhone } from "@/lib/format";
import { getSessionUser } from "@/server/session";
import { clientIp, rateLimit } from "@/server/rate-limit";

/* ── اعتبارسنجی ورودی (پیام‌های فارسی) ── */

const orderLineSchema = z.object({
  productId: z.string().min(1, "شناسهٔ محصول نامعتبر است"),
  variantId: z.string().nullable().optional(),
  qty: z
    .number({ message: "تعداد باید عدد باشد" })
    .int("تعداد باید عدد صحیح باشد")
    .positive("تعداد باید حداقل ۱ باشد"),
});

const orderSchema = z
  .object({
    lines: z
      .array(orderLineSchema)
      .min(1, "سبد خرید شما خالی است"),
    receiverName: z.string().trim().min(2, "نام گیرنده را کامل وارد کنید"),
    receiverPhone: z.string().refine((value) => normalizePhone(value) !== null, {
      message: "شمارهٔ موبایل گیرنده معتبر نیست",
    }),
    province: z.string().trim().optional().default(""),
    city: z.string().trim().optional().default(""),
    addressLine: z.string().trim().optional().default(""),
    postalCode: z.string().trim().nullable().optional(),
    note: z.string().trim().nullable().optional(),
    shippingMethod: z.enum(["POST", "PICKUP"], {
      message: "روش ارسال نامعتبر است",
    }),
  })
  .superRefine((data, ctx) => {
    /* تحویل حضوری: آدرس لازم نیست (سرور مقادیر پیش‌فرض می‌گذارد) */
    if (data.shippingMethod === "PICKUP") return;
    if (data.province.length === 0) {
      ctx.addIssue({ code: "custom", path: ["province"], message: "استان را انتخاب کنید" });
    }
    if (data.city.length === 0) {
      ctx.addIssue({ code: "custom", path: ["city"], message: "شهر را وارد کنید" });
    }
    if (data.addressLine.length < 10) {
      ctx.addIssue({ code: "custom", path: ["addressLine"], message: "نشانی کامل را وارد کنید" });
    }
  });

type OrderInput = z.infer<typeof orderSchema>;

/* ── دنبالهٔ شمارهٔ سفارش — BS- + ۶ رقم ── */

const ORDER_NUMBER_PREFIX = "BS-";
const MAX_ORDER_RETRIES = 3;

function formatOrderNumber(sequence: number): string {
  return `${ORDER_NUMBER_PREFIX}${String(sequence).padStart(6, "0")}`;
}

/** خواندن دنبالهٔ فعلی از Setting (JSON عددی) — با مقدار پیش‌فرض brand */
async function readSequence(): Promise<number> {
  const row = await db.setting.findUnique({ where: { key: "order.sequence" } });
  if (row === null) return 10234;
  try {
    const parsed: unknown = JSON.parse(row.value);
    return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : 10234;
  } catch {
    return 10234;
  }
}

/* ── اعتبارسنجی اقلام و ساخت snapshotها ── */

interface PreparedItem {
  productId: string;
  variantId: string | null;
  titleSnapshot: string;
  variantSnapshot: string | null;
  imageSnapshot: string | null;
  unitPrice: number;
  comparePriceSnapshot: number | null;
  quantity: number;
  lineTotal: number;
  /** کسر موجودی: تنوع‌دار → تنوع؛ ساده → خود محصول */
  decrement: { variantId: string | null; qty: number };
}

/**
 * بارگذاری مرجع سرورِ هر قلم — قیمت/عنوان/تصویر/موجودی از DB.
 * خطا → پیام فارسی نام‌دار (name سبک «PersianError») تا تراکنش اجرا نشود.
 */
class PersianError extends Error {}

async function prepareItems(input: OrderInput): Promise<PreparedItem[]> {
  const prepared: PreparedItem[] = [];

  for (const line of input.lines) {
    const product = await db.product.findUnique({
      where: { id: line.productId },
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        variants: { orderBy: { sortOrder: "asc" } },
      },
    });
    if (product === null || !product.isActive) {
      throw new PersianError("یکی از محصولات سبد یافت نشد یا فعال نیست؛ سبد را به‌روزرسانی کنید.");
    }

    const variant =
      line.variantId != null
        ? product.variants.find((row) => row.id === line.variantId)
        : undefined;
    if (line.variantId != null && variant === undefined) {
      throw new PersianError(`تنوع انتخاب‌شده برای «${product.title}» یافت نشد؛ سبد را به‌روزرسانی کنید.`);
    }

    const availableStock = variant?.stock ?? product.stock;
    if (availableStock < line.qty) {
      throw new PersianError(
        `موجودی «${product.title}» کافی نیست (${availableStock} عدد باقی مانده است).`,
      );
    }

    const unitPrice = variant?.price ?? product.price;
    prepared.push({
      productId: product.id,
      variantId: variant?.id ?? null,
      titleSnapshot: product.title,
      variantSnapshot: variant?.title ?? null,
      imageSnapshot: product.images[0]?.url ?? null,
      unitPrice,
      comparePriceSnapshot: variant?.comparePrice ?? product.comparePrice,
      quantity: line.qty,
      lineTotal: unitPrice * line.qty,
      decrement: { variantId: variant?.id ?? null, qty: line.qty },
    });
  }

  return prepared;
}

/* ── POST ── */

export async function POST(request: Request) {
  /* گارد سشن */
  const user = await getSessionUser();
  if (user === null) {
    return NextResponse.json(
      { message: "برای ثبت سفارش ابتدا وارد حساب خود شوید." },
      { status: 401 },
    );
  }

  /* نرخ: ۱۰ ثبت سفارش در ۱۰ دقیقه برای هر کاربر */
  const ip = clientIp(new Headers(request.headers));
  const limit = rateLimit(`orders:u:${user.userId}:ip:${ip}`, 10, 10 * 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { message: "تعداد درخواست‌های ثبت سفارش زیاد است؛ چند دقیقه بعد دوباره تلاش کنید." },
      { status: 429 },
    );
  }

  /* بدنه */
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "بدنهٔ درخواست نامعتبر است." }, { status: 400 });
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "ورودی نامعتبر است." },
      { status: 400 },
    );
  }
  const input = parsed.data;
  const receiverPhone = normalizePhone(input.receiverPhone)!;

  /* اعتبارسنجی اقلام خارج از تراکنش (پیام‌های دقیق‌تر) */
  let items: PreparedItem[];
  try {
    items = await prepareItems(input);
  } catch (error) {
    const message =
      error instanceof PersianError
        ? error.message
        : "خطا در بازبینی اقلام سبد؛ لطفاً دوباره تلاش کنید.";
    return NextResponse.json({ message }, { status: 400 });
  }

  const subtotal = items.reduce((total, item) => total + item.lineTotal, 0);
  /* هزینهٔ ارسال در مرحلهٔ بعد (درگاه) محاسبه می‌شود — فعلاً ۰ */
  const shippingCost = 0;
  const total = subtotal;

  /* تراکنش اتمیک + تلاش مجدد در برخورد شمارهٔ تکراری */
  let lastError: unknown = null;
  for (let attempt = 0; attempt < MAX_ORDER_RETRIES; attempt += 1) {
    try {
      const sequence = await readSequence();
      const nextSequence = sequence + 1;
      const orderNumber = formatOrderNumber(nextSequence);

      const created = await db.$transaction(async (tx) => {
        /* رزرو دنباله (به‌روزرسانی پیش از ساخت تا برخورد هم‌زمان کمتر شود) */
        await tx.setting.upsert({
          where: { key: "order.sequence" },
          create: { key: "order.sequence", value: JSON.stringify(nextSequence) },
          update: { value: JSON.stringify(nextSequence) },
        });

        const order = await tx.order.create({
          data: {
            orderNumber,
            userId: user.userId,
            status: "PENDING_PAYMENT",
            shippingMethod: input.shippingMethod,
            shippingCost,
            subtotal,
            discountTotal: 0,
            total,
            receiverName: input.receiverName,
            receiverPhone,
            province:
              input.shippingMethod === "PICKUP" && input.province === ""
                ? "تهران"
                : input.province,
            city:
              input.shippingMethod === "PICKUP" && input.city === ""
                ? "تهران"
                : input.city,
            addressLine:
              input.shippingMethod === "PICKUP" && input.addressLine === ""
                ? "تحویل حضوری از فروشگاه"
                : input.addressLine,
            postalCode: input.postalCode?.length ? input.postalCode : null,
            note: input.note?.length ? input.note : null,
            items: {
              /* فقط فیلدهای DB — کلید کمکی decrement نباید به Prisma برود */
              create: items.map(({ decrement: _decrement, ...item }) => item),
            },
            statusLogs: {
              create: {
                fromStatus: null,
                toStatus: "PENDING_PAYMENT",
                note: "سفارش شما ثبت شد و در انتظار پرداخت است.",
                actor: "system",
              },
            },
          },
          select: { orderNumber: true },
        });

        /* کسر اتمیک موجودی — خطِ تنوع‌دار از تنوع، خطِ ساده از محصول */
        for (const item of items) {
          if (item.decrement.variantId !== null) {
            await tx.productVariant.update({
              where: { id: item.decrement.variantId },
              data: { stock: { decrement: item.decrement.qty } },
            });
          } else {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.decrement.qty } },
            });
          }
        }

        return order;
      });

      return NextResponse.json({ orderNumber: created.orderNumber }, { status: 201 });
    } catch (error) {
      lastError = error;
      /* فقط برخورد یونیکِ شمارهٔ سفارش ارزش تلاش مجدد دارد */
      const code =
        typeof error === "object" && error !== null && "code" in error
          ? String((error as { code: unknown }).code)
          : "";
      if (code !== "P2002") break;
    }
  }

  console.error("[api/orders] خطای ثبت سفارش:", lastError);
  return NextResponse.json(
    { message: "ثبت سفارش ناموفق بود؛ لطفاً دوباره تلاش کنید." },
    { status: 500 },
  );
}
