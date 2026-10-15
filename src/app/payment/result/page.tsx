/**
 * نتیجهٔ پرداخت — Server Component
 * ─────────────────────────────────────────────────
 * فاز ۴: verify واقعی از درگاه قبل از رندر (خواندن وضعیت تراکنش از DB)
 * فعلاً وضعیت از query خوانده می‌شود: status=success | failed و order=شمارهٔ سفارش.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { brand } from "@/config/brand";
import { toFa } from "@/lib/format";

export const metadata: Metadata = {
  title: "نتیجهٔ پرداخت",
  robots: { index: false, follow: false },
};

interface PaymentResultPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PaymentResultPage({
  searchParams,
}: PaymentResultPageProps) {
  const params = await searchParams;
  const isSuccess = readParam(params["status"]) === "success";
  const orderNumber = readParam(params["order"]);

  return (
    <div className="shell mx-auto max-w-lg py-14 text-center md:py-20">
      {isSuccess ? (
        <>
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="size-10 text-success" aria-hidden="true" />
          </div>
          <h1 className="mt-6 text-2xl font-black">
            پرداخت با موفقیت انجام شد
          </h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {orderNumber != null && orderNumber.length > 0 ? (
              <>
                سفارش شما با شمارهٔ «{toFa(orderNumber)}» ثبت شد و جزئیات آن
                به موبایل و ایمیل شما ارسال خواهد شد.
              </>
            ) : (
              <>
                سفارش شما ثبت شد و جزئیات آن به موبایل و ایمیل شما ارسال خواهد
                شد.
              </>
            )}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
            {orderNumber != null && orderNumber.length > 0 ? (
              <Button
                asChild
                className="btn-metallic h-12 rounded-xl px-8 text-base font-bold"
              >
                <Link href={`/account/orders/${orderNumber}`}>
                  پیگیری سفارش
                </Link>
              </Button>
            ) : null}
            <Button
              asChild
              variant="ghost"
              className="h-12 rounded-xl px-8 text-base"
            >
              <Link href="/products">بازگشت به فروشگاه</Link>
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="size-10 text-destructive" aria-hidden="true" />
          </div>
          <h1 className="mt-6 text-2xl font-black">پرداخت ناموفق بود</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            مبلغی از حساب شما کسر نشده است؛ در صورت کسر، حداکثر تا ۷۲ ساعت
            بازگشت داده می‌شود.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
            <Button
              asChild
              className="btn-metallic h-12 rounded-xl px-8 text-base font-bold"
            >
              <Link href="/cart">تلاش مجدد</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="h-12 rounded-xl px-8 text-base"
            >
              <a href={`tel:${brand.contact.phone}`}>
                تماس با پشتیبانی
              </a>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
