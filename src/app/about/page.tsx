/**
 * دربارهٔ ما — داستان، مسیر، ارزش‌ها و اطلاعات فروشگاه
 * ─────────────────────────────
 * بازطراحی ۲۰۲۶: باند متالیک با آمارِ شیشه‌ای شمارشی، نوار اعتمادِ متحرک،
 * داستان دوستونه با کارت شیشه‌ای شناور روی پنل سبز، خطِ زمان و ردیف‌های
 * شماره‌دارِ ارزش‌ها — همه با حرکت‌های ظریفِ مشترک (Reveal/CountUp/Stagger).
 * صفحه سروری است؛ انیمیشن‌ها از کامپوننت‌های کلاینتِ مشترک می‌آیند.
 */

import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  IconArrowLeft,
  IconBuildingStore,
  IconChevronLeft,
  IconCircleCheckFilled,
  IconClock,
  IconFlag,
  IconHeadset,
  IconHistory,
  IconMail,
  IconMapPin,
  IconPhone,
  IconShieldCheck,
  IconUsers,
} from "@tabler/icons-react";
import type { TablerIcon } from "@tabler/icons-react";

import { Watermark } from "@/components/shared/brand-assets";
import { Marquee } from "@/components/shared/marquee";
import {
  CountUp,
  Reveal,
  StaggerItem,
  StaggerList,
} from "@/components/shared/motion";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { brand } from "@/config/brand";
import { formatPhoneFa } from "@/lib/format";

export const metadata: Metadata = {
  title: "دربارهٔ ما",
  description:
    "داستان، ارزش‌ها و اطلاعات فروشگاه بسلامت؛ فروشگاه تخصصی لوازم و تجهیزات پزشکی با ضمانت اصالت کالا، مشاورهٔ تخصصی و پشتیبانی پاسخ‌گو.",
};

/* ── شیشهٔ تیره روی سطوح سبز عمیق — متن روشن، خوانا (الگوی باند فروشگاه) ── */
const GLASS_DARK =
  "border border-white/15 bg-gradient-to-b from-white/[0.14] to-white/[0.05] backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]";

/* آمار هیرو — هم‌ارز با باند «دربارهٔ فروشگاه» صفحهٔ خانه */
const HERO_STATS = [
  { value: 12, prefix: "+", suffix: "", label: "سال تجربهٔ تخصصی" },
  { value: 8_500, prefix: "+", suffix: "", label: "کد کالای اصل" },
  { value: 98, prefix: "", suffix: "٪", label: "رضایت خریداران" },
] as const;

/* نوار اعتماد متحرک زیر هیرو */
const TRUST_ITEMS = [
  "ضمانت اصالت کالا",
  "فاکتور معتبر با هر خرید",
  "مشاورهٔ تخصصی پیش از خرید",
  "ارسال به سراسر کشور",
  "تحویل حضوری از فروشگاه",
  "پشتیبانی پاسخ‌گو",
] as const;

/* ارزش‌های سه‌گانه — ملاک هر تصمیم؛ ردیف‌های شماره‌دارِ ادیتوریال */
const VALUES: {
  icon: TablerIcon;
  num: string;
  title: string;
  description: string;
}[] = [
  {
    icon: IconShieldCheck,
    num: "۰۱",
    title: "اصالت کالا",
    description:
      "تأمین مستقیم از نمایندگی‌های رسمی؛ هر سفارش با فاکتور معتبر و تضمین اصالت به دست شما می‌رسد.",
  },
  {
    icon: IconUsers,
    num: "۰۲",
    title: "مشاورهٔ تخصصی",
    description:
      "کارشناسان ما پیش و پس از خرید کنار شما هستند تا محصولی بخرید که واقعاً مناسب نیاز شماست.",
  },
  {
    icon: IconHeadset,
    num: "۰۳",
    title: "پاسخ‌گویی و پشتیبانی",
    description:
      "پیگیری سفارش‌ها، پاسخ به پرسش‌ها و خدمات پس از فروش؛ سریع، دقیق و مسئولانه.",
  },
];

/* نقاط عطف — سازگار با «بیش از یک دهه تجربه» (آغاز ۱۳۹۱) */
const MILESTONES = [
  {
    year: "۱۳۹۱",
    title: "آغاز راه",
    description:
      "آغاز فعالیت فروشگاه بسلامت در تهران با تمرکز بر لوازم پزشکی خانگی.",
  },
  {
    year: "۱۳۹۵",
    title: "فروشگاه آنلاین",
    description:
      "راه‌اندازی فروشگاه اینترنتی و آغاز ارسال سفارش‌ها به سراسر کشور.",
  },
  {
    year: "۱۳۹۹",
    title: "تیم مشاورهٔ تخصصی",
    description:
      "گسترش تیم کارشناسان برای همراهیِ شما پیش و پس از خرید.",
  },
  {
    year: "۱۴۰۳",
    title: "۸٬۵۰۰+ کد کالای اصل",
    description:
      "تنوع کامل لوازم و تجهیزات پزشکی، همیشه با ضمانت اصالت.",
  },
] as const;

/** ردیف آیکون‌دار اطلاعات فروشگاه داخل کارت شیشه‌ای تیره */
function StoreInfoRow({
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
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-fresh">
        <Icon className="size-[18px]" stroke={1.75} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-on-metallic-muted">{label}</p>
        <div className="mt-0.5 text-[13px] leading-7 text-on-metallic">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <>
      {/* ══ هیروی متالیک — آمار شیشه‌ای شمارشی ══ */}
      <section
        className="bg-metallic relative overflow-hidden border-b border-fresh/20"
        aria-labelledby="about-hero-title"
      >
        {/* لایهٔ گرادیان نبض‌دار — عمقِ زنده */}
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-pulse-soft bg-[radial-gradient(55rem_26rem_at_85%_-20%,rgba(30,158,106,0.30),transparent_65%)]"
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
                  دربارهٔ ما
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mt-6 md:mt-8">
            {/* چیپ شیشه‌ای — قدمت */}
            <Reveal from="none" y={10}>
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold text-fresh ${GLASS_DARK}`}
              >
                <IconHistory
                  className="size-4"
                  stroke={1.75}
                  aria-hidden="true"
                />
                همراهِ سلامتی خانواده‌ها از سال ۱۳۹۱
              </span>
            </Reveal>

            <Reveal delay={0.08}>
              <h1
                id="about-hero-title"
                className="mt-5 text-3xl font-black leading-[1.3] text-on-metallic md:text-[2.75rem] md:leading-[1.3]"
              >
                دربارهٔ{" "}
                <span className="relative inline-block isolate">
                  {brand.name}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-1 -z-10 h-[0.35em] rounded-sm bg-fresh/35"
                  />
                </span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-8 text-on-metallic-muted md:text-base">
                فروشگاهی که کالای مربوط به سلامتی شما را جدی می‌گیرد؛ از
                تأمینِ اصل تا مشاورهٔ تخصصی و پشتیبانی پس از خرید.
              </p>
            </Reveal>
          </div>

          {/* آمار — چیپ‌های شیشه‌ای با شمارش نرمِ فارسی */}
          <StaggerList
            className="mt-10 grid grid-cols-3 gap-3 md:mt-12 md:gap-5"
            step={0.12}
          >
            {HERO_STATS.map((stat) => (
              <StaggerItem key={stat.label}>
                <div
                  className={`rounded-2xl px-3 py-5 text-center md:px-6 md:py-7 ${GLASS_DARK}`}
                >
                  <p className="text-xl font-black tabular-nums text-on-metallic md:text-4xl">
                    <CountUp
                      value={stat.value}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                    />
                  </p>
                  <p className="mt-2 text-[10px] leading-5 text-on-metallic-muted md:text-xs md:leading-6">
                    {stat.label}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerList>
        </div>
      </section>

      {/* ══ نوار اعتماد متحرک — گذارِ زنده بین بخش‌ها ══ */}
      <section
        aria-label="تعهدهای بسلامت"
        className="border-b border-border/60 bg-card/50"
      >
        <div className="shell py-5">
          <Marquee duration={34} className="mask-fade-x">
            {TRUST_ITEMS.map((item) => (
              <span
                key={item}
                className="flex items-center gap-2.5 px-6 text-[13px] font-medium text-foreground/75"
              >
                <IconCircleCheckFilled
                  className="size-4 shrink-0 text-fresh"
                  aria-hidden="true"
                />
                {item}
              </span>
            ))}
          </Marquee>
        </div>
      </section>

      {/* ══ داستان ما — متنِ ادیتوریال + کارت شیشه‌ای شناور روی پنل سبز ══ */}
      <section
        className="relative py-14 md:py-20"
        aria-labelledby="about-story-title"
      >
        {/* گرادیان‌های نرم محیطی */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(48rem_24rem_at_100%_20%,rgba(30,158,106,0.07),transparent_60%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(42rem_22rem_at_0%_100%,rgba(11,70,52,0.05),transparent_60%)]"
        />

        <div className="shell relative grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* متن داستان */}
          <Reveal>
            <p className="flex items-center gap-2 text-[11px] font-bold tracking-wide text-fresh-strong dark:text-fresh">
              <span aria-hidden="true" className="h-px w-6 bg-fresh/70" />
              داستان ما
            </p>
            <h2
              id="about-story-title"
              className="mt-4 text-2xl font-black leading-[1.5] text-foreground md:text-[2rem] md:leading-[1.45]"
            >
              کالایی که به سلامتی شما مربوط می‌شود،
              <br />
              جای هیچ سازشی ندارد
            </h2>

            <div className="mt-6 space-y-5 text-sm leading-8 text-foreground/90 md:text-[15px]">
              <p>
                فروشگاه {brand.name} با یک هدف روشن آغاز به کار کرد: دسترسی
                ساده و مطمئن خانواده‌ها به لوازم و تجهیزات پزشکی اصل. باور ما
                ساده است — کالایی که به سلامتی شما مربوط می‌شود، جای هیچ
                سازشی ندارد؛ به همین دلیل تأمین کالا را فقط از مسیر رسمی و
                نمایندگی‌های معتبر پیش می‌بریم.
              </p>
              <p>
                فروشگاه فیزیکی ما در تهران، در کنار فروشگاه آنلاین، میزبان
                شماست؛ جایی که می‌توانید محصولات را از نزدیک ببینید و پیش از
                خرید، مشاورهٔ حضوری کارشناسان ما را دریافت کنید تا انتخابی
                مطمئن‌تر داشته باشید.
              </p>
              <p>
                همراه هر خرید، فاکتور معتبر و تضمین اصالت کالا دریافت می‌کنید
                و پشتیبانی ما با تحویل سفارش تمام نمی‌شود؛ در انتخاب، استفاده
                و خدمات پس از فروش کنار شما می‌مانیم.
              </p>
            </div>

            {/* خط امضا */}
            <div className="mt-8 flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-10 bg-fresh/60" />
              <p className="text-[13px] font-bold text-primary">
                تیم {brand.name}
              </p>
            </div>
          </Reveal>

          {/* ویژوال — پنل سبز + کارت شیشه‌ای اطلاعاتِ فروشگاه */}
          <Reveal delay={0.15} className="relative">
            <div className="relative">
              {/* قاب هندسی چرخیده — عمق گرافیکی (بیرون‌زدگیِ افقیِ
                  چرخش زیر پدینگِ shell می‌ماند تا اسکرول افقی نسازد) */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 -inset-y-3 -rotate-2 rounded-[2.75rem] border border-fresh/25 bg-fresh/5"
              />

              {/* چیپ سال — شناور */}
              <div
                className={`absolute -top-5 end-7 z-10 flex animate-float items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-on-metallic ${GLASS_DARK}`}
              >
                <IconFlag
                  className="size-4 text-fresh"
                  stroke={1.75}
                  aria-hidden="true"
                />
                آغاز از ۱۳۹۱
              </div>

              <div className="relative overflow-hidden rounded-[2.5rem] bg-metallic p-6 shadow-lift md:p-8">
                <Watermark className="-start-16 -bottom-16 size-64 text-on-metallic opacity-[0.07]" />
                <div
                  aria-hidden="true"
                  className="glow -top-32 -end-16 size-72 bg-fresh/15"
                />

                {/* کارت شیشه‌ای اطلاعات فروشگاه */}
                <div
                  className={`relative rounded-3xl p-5 shadow-lift md:p-7 ${GLASS_DARK}`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-fresh/15 text-fresh">
                      <IconBuildingStore
                        className="size-5"
                        stroke={1.75}
                        aria-hidden="true"
                      />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-base font-black text-on-metallic">
                        فروشگاه {brand.name}
                      </h3>
                      <p className="mt-0.5 text-[11px] text-on-metallic-muted">
                        میزبانی شما در تهران — مشاورهٔ حضوری
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <StoreInfoRow
                      icon={IconMapPin}
                      label="نشانی فروشگاه"
                    >
                      {brand.contact.address}
                    </StoreInfoRow>
                    <StoreInfoRow icon={IconPhone} label="تلفن تماس">
                      <a
                        href={`tel:${brand.contact.phone}`}
                        dir="ltr"
                        className="block transition-colors hover:text-fresh"
                      >
                        {formatPhoneFa(brand.contact.phone)}
                      </a>
                      <a
                        href={`tel:${brand.contact.phoneAlt}`}
                        dir="ltr"
                        className="block transition-colors hover:text-fresh"
                      >
                        {formatPhoneFa(brand.contact.phoneAlt)}
                      </a>
                    </StoreInfoRow>
                    <StoreInfoRow icon={IconMail} label="رایانامه">
                      <a
                        href={`mailto:${brand.contact.email}`}
                        className="break-all transition-colors hover:text-fresh"
                      >
                        {brand.contact.email}
                      </a>
                    </StoreInfoRow>
                    <StoreInfoRow icon={IconClock} label="ساعت کاری">
                      {brand.contact.hours.map((entry) => (
                        <p key={entry.days}>
                          {entry.days}: {entry.time}
                        </p>
                      ))}
                    </StoreInfoRow>
                  </div>

                  <Link
                    href="/contact"
                    className="mt-6 flex h-11 items-center justify-center gap-2 rounded-full border border-white/25 text-sm font-medium text-on-metallic transition-all duration-300 hover:border-fresh/60 hover:bg-white/5"
                  >
                    تماس و مسیر رسیدن
                    <IconArrowLeft
                      className="size-4"
                      stroke={1.75}
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </div>

              {/* نشان اصالت — شناورِ آرام */}
              <div
                className={`absolute -bottom-5 start-7 z-10 flex animate-float-slow items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-on-metallic ${GLASS_DARK}`}
              >
                <IconShieldCheck
                  className="size-4 text-fresh"
                  stroke={1.75}
                  aria-hidden="true"
                />
                ضمانت اصالت کالا
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ مسیر ما — خطِ زمان (عمودی در موبایل، افقی در دسکتاپ) ══ */}
      <section
        className="bg-surface-alt relative overflow-hidden py-14 md:py-20"
        aria-label="مسیر ما"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(50rem_24rem_at_0%_0%,rgba(30,158,106,0.06),transparent_60%)]"
        />
        <div
          aria-hidden="true"
          className="glow -top-40 end-1/4 size-96 bg-fresh/10"
        />

        <div className="shell relative">
          <SectionHeading
            eyebrow="مسیر ما"
            title="از ۱۳۹۱ تا امروز"
            subtitle="گام‌هایی که در مسیرِ اعتمادِ شما برداشتیم"
          />

          <StaggerList className="relative" step={0.12}>
            {/* خط زمان — عمودی در موبایل، افقی در دسکتاپ */}
            <div
              aria-hidden="true"
              className="absolute start-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-fresh/70 via-fresh/30 to-transparent md:start-0 md:end-0 md:top-[7px] md:bottom-auto md:h-px md:w-auto md:bg-gradient-to-l md:from-fresh/70 md:via-fresh/30 md:to-transparent"
            />

            <div className="grid gap-9 md:grid-cols-4 md:gap-6">
              {MILESTONES.map((milestone) => (
                <StaggerItem key={milestone.year}>
                  <div className="relative ps-8 md:ps-0 md:pt-8">
                    {/* نقطهٔ راه — مرکزش روی خط */}
                    <span
                      aria-hidden="true"
                      className="absolute start-0 top-1 size-[15px] rounded-full border-[3px] border-fresh bg-surface-alt shadow-[0_0_0_4px_rgba(30,158,106,0.15)] md:top-0"
                    />
                    <p className="text-xl font-black text-primary">
                      {milestone.year}
                    </p>
                    <h3 className="mt-1 text-sm font-black text-foreground">
                      {milestone.title}
                    </h3>
                    <p className="mt-2 text-[13px] leading-7 text-muted-foreground">
                      {milestone.description}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </div>
          </StaggerList>
        </div>
      </section>

      {/* ══ ارزش‌ها — ردیف‌های شماره‌دارِ ادیتوریال ══ */}
      <section
        className="shell py-14 md:py-20"
        aria-label="ارزش‌های ما"
      >
        <SectionHeading
          eyebrow="چرا بسلامت"
          title="ارزش‌های ما"
          subtitle="سه اصلی که ملاک هر تصمیم ماست"
        />

        <StaggerList
          step={0.12}
          className="overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-soft"
        >
          {VALUES.map((value) => (
            <StaggerItem key={value.title}>
              <div className="group flex items-start gap-5 border-b border-border/60 p-6 transition-colors duration-300 last:border-b-0 hover:bg-secondary/40 md:items-center md:gap-8 md:p-8">
                {/* شمارهٔ بزرگ */}
                <span
                  aria-hidden="true"
                  className="pt-1 text-3xl font-black leading-none text-fresh/30 transition-colors duration-300 group-hover:text-fresh md:pt-0 md:text-4xl"
                >
                  {value.num}
                </span>

                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-black text-foreground md:text-lg">
                    {value.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-7 text-muted-foreground md:text-sm md:leading-8">
                    {value.description}
                  </p>
                </div>

                {/* آیکون کوچک — وارونگی در هاور */}
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-on-metallic md:size-12">
                  <value.icon
                    className="size-5"
                    stroke={1.75}
                    aria-hidden="true"
                  />
                </span>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>
      </section>

      {/* ══ فراخوان پایانی — پنل متالیک گِرد ══ */}
      <section className="shell pb-14 md:pb-20" aria-labelledby="about-cta-title">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-metallic px-6 py-14 text-center shadow-lift md:px-12 md:py-20">
            <Watermark className="-start-16 -top-16 size-72 -rotate-12 text-fresh/10 md:size-80" />
            <Watermark className="-end-14 -bottom-14 size-64 rotate-12 text-fresh/10" />
            <div
              aria-hidden="true"
              className="glow start-1/2 -top-32 size-96 -translate-x-1/2 bg-fresh/15"
            />

            <div className="relative">
              <p className="flex items-center justify-center gap-2 text-[11px] font-bold tracking-wide text-fresh">
                <span
                  aria-hidden="true"
                  className="size-1.5 animate-pulse-soft rounded-full bg-fresh"
                />
                همیشه پاسخ‌گوی شما
              </p>
              <h2
                id="about-cta-title"
                className="mt-3 text-2xl font-black text-on-metallic md:text-4xl"
              >
                سوالی دارید؟
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-8 text-on-metallic-muted md:text-[15px]">
                کارشناسان {brand.name} در ساعات کاری پاسخ‌گوی شما هستند؛
                تلفنی تماس بگیرید یا از فرم تماس برای ما پیام بگذارید.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-fresh-strong px-8 text-sm font-black text-primary-foreground transition-all duration-300 hover:brightness-110"
                >
                  تماس با ما
                  <IconArrowLeft
                    className="size-4"
                    stroke={1.75}
                    aria-hidden="true"
                  />
                </Link>
                <Link
                  href="/faq"
                  className="inline-flex h-12 items-center rounded-full border border-white/25 px-8 text-sm font-medium text-on-metallic transition-all duration-300 hover:border-fresh/60 hover:bg-white/5"
                >
                  پرسش‌های متداول
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
