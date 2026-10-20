/**
 * پرسش‌های متداول — آکاردئون شش‌گانه + کارت فراخوان
 * ─────────────────────────────
 * داده از جدول Faq (سرویس DB-first با fallback امن) تغذیه می‌شود؛
 * مدیریت پرسش‌ها از پنل ادمین انجام می‌شود.
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
import { JsonLd } from "@/components/shared/json-ld";
import { faqJsonLd } from "@/lib/jsonld";
import { getFaqList } from "@/server/shop-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "پرسش‌های متداول",
  description:
    "پاسخ پرسش‌های رایج دربارهٔ هزینهٔ ارسال، تحویل حضوری، اصالت کالا، پیگیری سفارش، پرداخت و بازگشت کالا در فروشگاه بسلامت.",
};

export default async function FaqPage() {
  const faqs = await getFaqList();

  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />
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
          {faqs.map((faq) => (
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
    </>
  );
}
