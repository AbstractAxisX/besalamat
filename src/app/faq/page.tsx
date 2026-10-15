/**
 * پرسش‌های متداول — آکاردئون شش‌گانه + کارت فراخوان
 * ─────────────────────────────
 * دادهٔ محلی این صفحه در فاز ۶ از جدول Faq (پنل ادمین) تغذیه می‌شود.
 */

import type { Metadata } from "next";
import Link from "next/link";

import { GoldDivider } from "@/components/shared/brand-assets";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { formatTomanPlain, toFa } from "@/lib/format";

export const metadata: Metadata = {
  title: "پرسش‌های متداول",
  description:
    "پاسخ پرسش‌های رایج دربارهٔ هزینهٔ ارسال، تحویل حضوری، اصالت کالا، پیگیری سفارش، پرداخت و بازگشت کالا در فروشگاه بسلامت.",
};

/** ثابت محلی — تا فاز ۶ که از جدول Faq خوانده می‌شود */
const FAQS = [
  {
    id: "shipping-cost",
    question: "هزینهٔ ارسال چقدر است؟",
    answer: `ارسال سفارش‌ها با پست به سراسر کشور انجام می‌شود و هزینهٔ آن ${formatTomanPlain(45000)} تومان ثابت است. برای تحویل حضوری از فروشگاه هیچ هزینه‌ای دریافت نمی‌شود.`,
  },
  {
    id: "in-store-pickup",
    question: "امکان تحویل حضوری از فروشگاه وجود دارد؟",
    answer:
      "بله؛ در ساعات کاری می‌توانید سفارش خود را حضوری و بدون هزینهٔ اضافه از نشانی فروشگاه تحویل بگیرید.",
  },
  {
    id: "authenticity",
    question: "اصالت کالاها چگونه تضمین می‌شود؟",
    answer:
      "همهٔ محصولات را مستقیماً از نمایندگی‌های رسمی و شرکت‌های معتبر تأمین می‌کنیم و همراه هر سفارش، فاکتور معتبر و تضمین اصالت کالا ارائه می‌شود.",
  },
  {
    id: "order-tracking",
    question: "سفارشم را چگونه پیگیری کنم؟",
    answer:
      "وضعیت سفارش را می‌توانید از پنل کاربری خود ببینید یا با شمارهٔ سفارش، از طریق پشتیبانی پیگیری کنید.",
  },
  {
    id: "payment",
    question: "روش پرداخت چیست؟",
    answer:
      "پرداخت همهٔ سفارش‌ها از طریق درگاه آنلاین امن انجام می‌شود و رسید تراکنش بلافاصله صادر می‌گردد.",
  },
  {
    id: "returns",
    question: "شرایط بازگشت کالا چگونه است؟",
    answer: `تا ${toFa(7)} روز پس از تحویل و با رعایت شرایط بهداشتی، امکان بازگشت کالا و عودت مبلغ وجود دارد.`,
  },
] as const;

export default function FaqPage() {
  return (
    <div className="shell pb-8 md:pb-12">
      <div className="mx-auto max-w-3xl">
        {/* الگوی PageHero — یکنواخت در صفحات محتوایی */}
        <div className="py-10 md:py-14">
          <h1 className="text-2xl font-black text-foreground md:text-3xl">
            پرسش‌های متداول
          </h1>
          <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
            پاسخ سریع به پرسش‌های رایج
          </p>
          <GoldDivider className="mt-6" />
        </div>

        <Accordion type="single" collapsible>
          {FAQS.map((faq) => (
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className="border-b border-border/60 last:border-b"
            >
              <AccordionTrigger className="py-4 text-start text-sm font-semibold text-foreground hover:no-underline md:text-base">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                <p className="pb-1 leading-7">{faq.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* کارت فراخوان */}
        <div className="card-luxe mt-10 p-6 text-center md:p-8">
          <h2 className="text-lg font-black text-foreground">
            پاسخ‌تان را پیدا نکردید؟
          </h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            تیم پشتیبانی ما آمادهٔ پاسخ‌گویی به شماست.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild className="btn-metallic h-11 px-8">
              <Link href="/contact">تماس با ما</Link>
            </Button>
            <Button asChild variant="ghost" className="h-11 px-8">
              <Link href="/blog">مجلهٔ سلامت</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
