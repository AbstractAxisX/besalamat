/**
 * تماس با ما — فرم پیام + اطلاعات فروشگاه + نقشه
 * ─────────────────────────────
 * بازطراحی ۲۰۲۶: باند متالیک با چیپ شیشه‌ای تلفن، گریدِ شیشه‌ای فرم/اطلاعات،
 * شبکه‌های اجتماعی، نقشهٔ قاب‌دار سبز و دسترسی‌های سریع — همه با
 * انیمیشن‌های ظریفِ مشترک (Reveal/Stagger). فرم تماسِ موجود دست‌نخورده
 * مانده و فقط پوسته‌اش بازطراحی شده است.
 */

import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  IconArrowLeft,
  IconBrandInstagram,
  IconBrandTelegram,
  IconBrandWhatsapp,
  IconChevronLeft,
  IconClock,
  IconHeadset,
  IconMail,
  IconMapPin,
  IconMessageCircleQuestion,
  IconPhone,
  IconPhoneCall,
  IconSend,
  IconUsers,
} from "@tabler/icons-react";
import type { TablerIcon } from "@tabler/icons-react";

import { ContactForm } from "@/components/contact/contact-form";
import { Watermark } from "@/components/shared/brand-assets";
import { Reveal, StaggerItem, StaggerList } from "@/components/shared/motion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { brand, SOCIAL_LABELS, type SocialConfig } from "@/config/brand";
import { formatPhoneFa } from "@/lib/format";

export const metadata: Metadata = {
  title: "تماس با ما",
  description:
    "تماس با فروشگاه بسلامت؛ شمارهٔ تماس، رایانامه، نشانی و ساعت کاری فروشگاه همراه با فرم ارسال پیام و نقشهٔ مسیر.",
};

/* ── شیشهٔ تیره روی سطوح سبز عمیق — متن روشن، خوانا (الگوی باند فروشگاه) ── */
const GLASS_DARK =
  "border border-white/15 bg-gradient-to-b from-white/[0.14] to-white/[0.05] backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]";

/** آیکون شبکهٔ اجتماعی — سه شبکهٔ اصلی با تبلر؛ شبکه‌های داخلی حرف اول نام */
function SocialIcon({ social }: { social: SocialConfig }) {
  switch (social.key) {
    case "telegram":
      return (
        <IconBrandTelegram
          className="size-5"
          stroke={1.75}
          aria-hidden="true"
        />
      );
    case "whatsapp":
      return (
        <IconBrandWhatsapp
          className="size-5"
          stroke={1.75}
          aria-hidden="true"
        />
      );
    case "instagram":
      return (
        <IconBrandInstagram
          className="size-5"
          stroke={1.75}
          aria-hidden="true"
        />
      );
    default:
      return (
        <span className="text-sm font-bold leading-none">
          {social.label.charAt(0)}
        </span>
      );
  }
}

/** ردیف آیکون‌دار اطلاعات تماس — دایرهٔ نرم accent + برچسب + مقدار */
function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: TablerIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3.5">
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
        <Icon className="size-[17px]" stroke={1.75} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <div className="mt-0.5 text-sm leading-7 text-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  const activeSocials = brand.socials.filter(
    (social) => social.defaultHref !== "",
  );

  return (
    <>
      {/* ══ هیروی متالیک — تیتر + چیپ شیشه‌ای تلفن ══ */}
      <section
        className="bg-metallic relative overflow-hidden border-b border-fresh/20"
        aria-labelledby="contact-hero-title"
      >
        {/* لایهٔ گرادیان نبض‌دار — پشت چیپ تلفن */}
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-pulse-soft bg-[radial-gradient(55rem_26rem_at_12%_-20%,rgba(30,158,106,0.30),transparent_65%)]"
        />
        {/* عمق بدون پترن — واترمارک غول‌پیکر + هاله‌های نرم */}
        <Watermark className="-end-16 -top-20 size-80 rotate-12 text-fresh/10 md:size-[26rem]" />
        <div
          aria-hidden="true"
          className="glow -bottom-44 -start-24 size-96 bg-fresh/15"
        />
        <div
          aria-hidden="true"
          className="glow -top-36 end-1/3 size-80 animate-float-slow bg-primary/40"
        />

        <div className="shell relative py-10 md:py-16">
          {/* بریدکرامب روشن داخل باند */}
          <Breadcrumb>
            <BreadcrumbList className="text-[11px]">
              <BreadcrumbItem>
                <BreadcrumbLink
                  asChild
                  className="text-on-metallic-muted transition-colors hover:text-fresh"
                >
                  <Link href="/">خانه</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-on-metallic-muted/60 [&>svg]:size-3">
                <IconChevronLeft aria-hidden="true" stroke={1.75} />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium text-on-metallic">
                  تماس با ما
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mt-6 grid items-center gap-8 md:mt-8 lg:grid-cols-[1.1fr_0.9fr]">
            {/* تیتر */}
            <Reveal>
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold text-fresh ${GLASS_DARK}`}
              >
                <IconHeadset
                  className="size-4"
                  stroke={1.75}
                  aria-hidden="true"
                />
                پاسخ‌گوی شما هستیم
              </span>
              <h1
                id="contact-hero-title"
                className="mt-5 text-3xl font-black leading-[1.3] text-on-metallic md:text-[2.75rem] md:leading-[1.3]"
              >
                تماس با ما
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-8 text-on-metallic-muted md:text-base">
                پیش از خرید مشورت می‌خواهید، سفارشتان را پیگیری می‌کنید یا
                پیشنهاد همکاری دارید؟ کارشناسان {brand.name} آمادهٔ
                پاسخ‌گویی به شما هستند.
              </p>
            </Reveal>

            {/* چیپ بزرگ تلفن — شیشه‌ای */}
            <Reveal delay={0.15}>
              <a
                href={`tel:${brand.contact.phone}`}
                className={`group flex items-center gap-4 rounded-3xl p-5 transition-all duration-300 hover:border-fresh/50 md:p-6 ${GLASS_DARK}`}
              >
                <span className="relative flex size-13 shrink-0 items-center justify-center rounded-2xl bg-fresh/15 text-fresh">
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 animate-pulse-soft rounded-2xl bg-fresh/20"
                  />
                  <IconPhoneCall
                    className="relative size-6"
                    stroke={1.75}
                    aria-hidden="true"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] text-on-metallic-muted">
                    مشاورهٔ تخصصی — شنبه تا پنجشنبه
                  </span>
                  <span
                    dir="ltr"
                    className="mt-1.5 block text-2xl font-black leading-none text-on-metallic md:text-[1.75rem]"
                  >
                    {formatPhoneFa(brand.contact.phone)}
                  </span>
                </span>
                <IconArrowLeft
                  className="size-5 shrink-0 text-on-metallic-muted transition-transform duration-300 group-hover:-translate-x-1"
                  stroke={1.75}
                  aria-hidden="true"
                />
              </a>
              <p className="mt-3 flex items-center justify-center gap-2 text-[11px] text-on-metallic-muted lg:justify-start">
                <IconClock
                  className="size-3.5"
                  stroke={1.75}
                  aria-hidden="true"
                />
                ساعت پاسخ‌گویی: ۹ الی ۱۸ — جمعه‌ها تعطیل
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ گرید اصلی — فرم شیشه‌ای + ستون اطلاعات ══ */}
      <section
        className="relative overflow-hidden py-12 md:py-16"
        aria-labelledby="contact-form-title"
      >
        {/* گرادیان‌های نرم محیطی */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(46rem_24rem_at_100%_0%,rgba(30,158,106,0.09),transparent_62%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(42rem_22rem_at_0%_100%,rgba(11,70,52,0.06),transparent_62%)]"
        />

        <div className="shell relative grid gap-8 lg:grid-cols-5 lg:gap-10">
          {/* ── فرم — ستون بزرگ‌تر ── */}
          <Reveal className="lg:col-span-3">
            <div className="relative h-full">
              {/* هاله‌های پشت کارت — شیشه را زنده می‌کنند */}
              <div
                aria-hidden="true"
                className="glow -top-12 -start-20 size-80 bg-fresh/15"
              />
              <div
                aria-hidden="true"
                className="glow -bottom-16 -end-12 size-72 bg-primary/10"
              />

              <div className="glass relative flex h-full flex-col rounded-[2rem] border border-border/60 p-6 shadow-soft md:p-8">
                <div className="flex items-center gap-3.5">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
                    <IconSend
                      className="size-5"
                      stroke={1.75}
                      aria-hidden="true"
                    />
                  </span>
                  <div>
                    <h2
                      id="contact-form-title"
                      className="text-lg font-black text-foreground"
                    >
                      ارسال پیام
                    </h2>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">
                      پیامتان را بنویسید؛ در سریع‌ترین زمان پاسخ می‌دهیم
                    </p>
                  </div>
                </div>

                <div className="mt-7 flex-1">
                  <ContactForm />
                </div>
              </div>
            </div>
          </Reveal>

          {/* ── اطلاعات — تماس، شبکه‌ها، نقشه ── */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* اطلاعات تماس */}
            <Reveal delay={0.1}>
              <div className="glass rounded-[2rem] border border-border/60 p-6 shadow-soft md:p-7">
                <h2 className="text-base font-black text-foreground">
                  اطلاعات تماس
                </h2>
                <div className="mt-5 space-y-4">
                  <InfoRow icon={IconPhone} label="تلفن تماس">
                    <a
                      href={`tel:${brand.contact.phone}`}
                      dir="ltr"
                      className="block w-fit transition-colors hover:text-primary"
                    >
                      {formatPhoneFa(brand.contact.phone)}
                    </a>
                    <a
                      href={`tel:${brand.contact.phoneAlt}`}
                      dir="ltr"
                      className="block w-fit transition-colors hover:text-primary"
                    >
                      {formatPhoneFa(brand.contact.phoneAlt)}
                    </a>
                  </InfoRow>
                  <InfoRow icon={IconMail} label="رایانامه">
                    <a
                      href={`mailto:${brand.contact.email}`}
                      className="break-all transition-colors hover:text-primary"
                    >
                      {brand.contact.email}
                    </a>
                  </InfoRow>
                  <InfoRow icon={IconMapPin} label="نشانی فروشگاه">
                    {brand.contact.address}
                  </InfoRow>
                  <InfoRow icon={IconClock} label="ساعت کاری">
                    {brand.contact.hours.map((entry) => (
                      <p key={entry.days}>
                        {entry.days}: {entry.time}
                      </p>
                    ))}
                  </InfoRow>
                </div>
              </div>
            </Reveal>

            {/* شبکه‌های اجتماعی */}
            <Reveal delay={0.16}>
              <div className="glass rounded-[2rem] border border-border/60 p-6 shadow-soft md:p-7">
                <h2 className="text-base font-black text-foreground">
                  همراه ما باشید
                </h2>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  تازه‌های محصولات و راهنماهای سلامت
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {activeSocials.map((social) => (
                    <a
                      key={social.key}
                      href={social.defaultHref}
                      aria-label={SOCIAL_LABELS[social.key]}
                      className="flex size-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-all duration-300 hover:border-fresh/60 hover:text-fresh-strong"
                    >
                      <SocialIcon social={social} />
                    </a>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* نقشه — قاب سبز؛ در دسکتاپ تا کفِ ستون کشیده می‌شود */}
            <Reveal delay={0.22} className="flex-1">
              <div className="glass flex h-full flex-col rounded-[2rem] border border-border/60 p-5 shadow-soft md:p-6">
                <div className="flex items-center gap-3.5">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
                    <IconMapPin
                      className="size-5"
                      stroke={1.75}
                      aria-hidden="true"
                    />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-base font-black text-foreground">
                      موقعیت فروشگاه
                    </h2>
                    <p className="mt-0.5 text-[11px] leading-5 text-muted-foreground">
                      {brand.contact.address}
                    </p>
                  </div>
                </div>
                <div className="mt-5 min-h-56 flex-1 overflow-hidden rounded-2xl border border-fresh/25 md:min-h-64">
                  <iframe
                    src={brand.contact.mapEmbedUrl}
                    className="h-full w-full border-0"
                    loading="lazy"
                    title="نقشهٔ فروشگاه بسلامت"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ دسترسی سریع — دربارهٔ ما و پرسش‌های متداول ══ */}
      <section className="shell pb-14 md:pb-20" aria-label="دسترسی سریع">
        <StaggerList className="grid gap-4 sm:grid-cols-2" step={0.12}>
          <StaggerItem>
            <Link
              href="/about"
              className="group flex items-center gap-4 rounded-3xl border border-border/70 bg-card p-5 shadow-soft transition-all duration-300 hover:border-fresh/50 hover:shadow-card md:p-6"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-on-metallic">
                <IconUsers
                  className="size-5"
                  stroke={1.75}
                  aria-hidden="true"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black text-foreground">
                  دربارهٔ ما
                </span>
                <span className="mt-1 block text-[13px] leading-6 text-muted-foreground">
                  با داستان و ارزش‌های {brand.name} آشنا شوید
                </span>
              </span>
              <IconArrowLeft
                className="size-5 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-x-1 group-hover:text-fresh"
                stroke={1.75}
                aria-hidden="true"
              />
            </Link>
          </StaggerItem>

          <StaggerItem>
            <Link
              href="/faq"
              className="group flex items-center gap-4 rounded-3xl border border-border/70 bg-card p-5 shadow-soft transition-all duration-300 hover:border-fresh/50 hover:shadow-card md:p-6"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-on-metallic">
                <IconMessageCircleQuestion
                  className="size-5"
                  stroke={1.75}
                  aria-hidden="true"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black text-foreground">
                  پرسش‌های متداول
                </span>
                <span className="mt-1 block text-[13px] leading-6 text-muted-foreground">
                  پاسخ سریع به رایج‌ترین پرسش‌های شما
                </span>
              </span>
              <IconArrowLeft
                className="size-5 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-x-1 group-hover:text-fresh"
                stroke={1.75}
                aria-hidden="true"
              />
            </Link>
          </StaggerItem>
        </StaggerList>
      </section>
    </>
  );
}
