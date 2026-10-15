/**
 * سفارش‌های نمایشی حساب کاربری — DATA خالص (فاز ۱)
 * ─────────────────────────────────────────────────
 * آینهٔ ساختار سفارش واقعی فاز ۴؛ قیمت‌ها عین seed «بسلامت» هستند:
 * فشارسنج M2 = ۲٬۸۵۰٬۰۰۰ • ماسک جراحی = ۱۹۵٬۰۰۰ • ترازو GS27 = ۱٬۲۹۰٬۰۰۰
 * تاریخ‌ها نسبت به زمان بارگذاری ماژول محاسبه می‌شوند تا همیشه «تازه» بمانند.
 */

import type { OrderStatusDTO, OrderTimelineItem } from "@/types/shop";

export interface PreviewOrderItem {
  title: string;
  variantTitle: string | null;
  qty: number;
  unitPrice: number;
  image: string;
}

export interface PreviewOrder {
  orderNumber: string;
  status: OrderStatusDTO;
  /** ISO */
  createdAt: string;
  total: number;
  shippingCost: number;
  items: PreviewOrderItem[];
  timeline: OrderTimelineItem[];
  receiverName: string;
  receiverPhone: string;
  province: string;
  city: string;
  addressLine: string;
  postalCode: string | null;
  postalTrackingCode: string | null;
}

/** تاریخ ISO مربوط به «n روز پیش» با ساعت مشخص */
function daysAgoIso(days: number, hour: number, minute: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

/* ── سفارش ۱ — تحویل‌شده با تایم‌لاین کامل ۵ مرحله ── */
const ORDER_1_ITEMS: PreviewOrderItem[] = [
  {
    title: "فشارسنج بازویی اومرون M2",
    variantTitle: null,
    qty: 1,
    unitPrice: 2850000,
    image: "/placeholders/product-1-a.svg",
  },
  {
    title: "ماسک جراحی سه‌لایه بستهٔ ۵۰ عددی",
    variantTitle: null,
    qty: 2,
    unitPrice: 195000,
    image: "/placeholders/product-13-a.svg",
  },
];

const ORDER_1_ITEMS_SUM =
  ORDER_1_ITEMS[0]!.unitPrice * ORDER_1_ITEMS[0]!.qty +
  ORDER_1_ITEMS[1]!.unitPrice * ORDER_1_ITEMS[1]!.qty;

const ORDER_1_SHIPPING = 45000;

/* ── سفارش ۲ — پرداخت‌شدهٔ دیروز با ۱ قلم ── */
const ORDER_2_ITEMS: PreviewOrderItem[] = [
  {
    title: "ترازوی دیجیتال بویرون GS 27",
    variantTitle: null,
    qty: 1,
    unitPrice: 1290000,
    image: "/placeholders/product-14-a.svg",
  },
];

const ORDER_2_ITEMS_SUM = ORDER_2_ITEMS[0]!.unitPrice * ORDER_2_ITEMS[0]!.qty;

const ORDER_2_SHIPPING = 45000;

export const PREVIEW_ORDERS: PreviewOrder[] = [
  {
    orderNumber: "BS-10234",
    status: "DELIVERED",
    createdAt: daysAgoIso(5, 10, 12),
    total: ORDER_1_ITEMS_SUM + ORDER_1_SHIPPING,
    shippingCost: ORDER_1_SHIPPING,
    items: ORDER_1_ITEMS,
    timeline: [
      {
        status: "PENDING_PAYMENT",
        note: "سفارش شما ثبت شد و در انتظار پرداخت است.",
        createdAt: daysAgoIso(5, 10, 12),
      },
      {
        status: "PAID",
        note: "پرداخت آنلاین تأیید شد.",
        createdAt: daysAgoIso(5, 10, 14),
      },
      {
        status: "PROCESSING",
        note: "سفارش برای بسته‌بندی به انبار ارجاع شد.",
        createdAt: daysAgoIso(4, 16, 20),
      },
      {
        status: "SHIPPED",
        note: "بسته به پست پیشتاز سپرده شد.",
        createdAt: daysAgoIso(3, 11, 5),
      },
      {
        status: "DELIVERED",
        note: "تحویل به گیرنده انجام شد؛ امیدواریم از خرید خود لذت ببرید.",
        createdAt: daysAgoIso(1, 17, 40),
      },
    ],
    receiverName: "سارا محمدی",
    receiverPhone: "09121234567",
    province: "تهران",
    city: "تهران",
    addressLine:
      "خیابان ولیعصر، بالاتر از پارک ساعی، کوچهٔ بهار، پلاک ۱۲، واحد ۳",
    postalCode: "1234567890",
    postalTrackingCode: "24RA8931574",
  },
  {
    orderNumber: "BS-10235",
    status: "PAID",
    createdAt: daysAgoIso(1, 18, 2),
    total: ORDER_2_ITEMS_SUM + ORDER_2_SHIPPING,
    shippingCost: ORDER_2_SHIPPING,
    items: ORDER_2_ITEMS,
    timeline: [
      {
        status: "PENDING_PAYMENT",
        note: null,
        createdAt: daysAgoIso(1, 18, 2),
      },
      {
        status: "PAID",
        note: "پرداخت آنلاین تأیید شد؛ سفارش به‌زودی پردازش می‌شود.",
        createdAt: daysAgoIso(1, 18, 5),
      },
    ],
    receiverName: "سارا محمدی",
    receiverPhone: "09121234567",
    province: "تهران",
    city: "تهران",
    addressLine:
      "خیابان ولیعصر، بالاتر از پارک ساعی، کوچهٔ بهار، پلاک ۱۲، واحد ۳",
    postalCode: "1234567890",
    postalTrackingCode: null,
  },
];
