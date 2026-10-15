/**
 * تماس با ما — فرم پیام + اطلاعات فروشگاه + نقشه
 */

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { ContactForm } from "@/components/contact/contact-form";
import { GoldDivider } from "@/components/shared/brand-assets";
import { brand } from "@/config/brand";
import { formatPhoneFa } from "@/lib/format";

export const metadata: Metadata = {
  title: "تماس با ما",
  description:
    "تماس با فروشگاه بسلامت؛ شمارهٔ تماس، رایانامه، نشانی و ساعت کاری فروشگاه همراه با فرم ارسال پیام و نقشهٔ مسیر.",
};

/** ردیف آیکون‌دار اطلاعات تماس — دایرهٔ accent + برچسب + مقدار */
function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="mt-0.5 text-sm leading-7 text-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="shell pb-8 md:pb-12">
      {/* الگوی PageHero — یکنواخت در صفحات محتوایی */}
      <div className="py-10 md:py-14">
        <h1 className="text-2xl font-black text-foreground md:text-3xl">
          تماس با ما
        </h1>
        <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
          پاسخ‌گوی شما هستیم
        </p>
        <GoldDivider className="mt-6" />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        {/* ستون فرم */}
        <div className="lg:col-span-3">
          <div className="card-luxe p-6 md:p-8">
            <h2 className="text-lg font-black text-foreground">ارسال پیام</h2>
            <p className="mt-1 text-sm leading-7 text-muted-foreground">
              پیام خود را بنویسید؛ کارشناسان ما در سریع‌ترین زمان پاسخ
              می‌دهند.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>

        {/* ستون اطلاعات */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* کارت اطلاعات تماس */}
          <div className="card-luxe p-6">
            <h2 className="font-black text-foreground">اطلاعات تماس</h2>
            <div className="mt-5 space-y-4">
              <InfoRow icon={Phone} label="تلفن تماس">
                <a
                  href={`tel:${brand.contact.phone}`}
                  dir="ltr"
                  className="block transition-colors hover:text-primary"
                >
                  {formatPhoneFa(brand.contact.phone)}
                </a>
                <a
                  href={`tel:${brand.contact.phoneAlt}`}
                  dir="ltr"
                  className="block transition-colors hover:text-primary"
                >
                  {formatPhoneFa(brand.contact.phoneAlt)}
                </a>
              </InfoRow>
              <InfoRow icon={Mail} label="رایانامه">
                <a
                  href={`mailto:${brand.contact.email}`}
                  className="transition-colors hover:text-primary"
                >
                  {brand.contact.email}
                </a>
              </InfoRow>
              <InfoRow icon={MapPin} label="نشانی فروشگاه">
                {brand.contact.address}
              </InfoRow>
              <InfoRow icon={Clock} label="ساعت کاری">
                {brand.contact.hours.map((entry) => (
                  <p key={entry.days}>
                    {entry.days}: {entry.time}
                  </p>
                ))}
              </InfoRow>
            </div>
          </div>

          {/* کارت نقشه */}
          <div className="card-luxe overflow-hidden rounded-2xl">
            <iframe
              src={brand.contact.mapEmbedUrl}
              className="h-64 w-full border-0"
              loading="lazy"
              title="نقشهٔ فروشگاه"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
