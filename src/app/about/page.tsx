/**
 * دربارهٔ ما — داستان، ارزش‌ها و اطلاعات فروشگاه
 * ─────────────────────────────
 * کارت فروشگاه این صفحه مستقل و هم‌سبکِ کارت فروشگاهِ صفحهٔ خانه است
 * (عمداً کپی نشده تا صفحات مستقل بمانند).
 */

import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  Clock,
  Headset,
  Mail,
  MapPinned,
  MapPin,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Logo, Watermark } from "@/components/shared/brand-assets";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { brand } from "@/config/brand";
import { formatPhoneFa } from "@/lib/format";

export const metadata: Metadata = {
  title: "دربارهٔ ما",
  description:
    "داستان، ارزش‌ها و اطلاعات فروشگاه بسلامت؛ فروشگاه تخصصی لوازم و تجهیزات پزشکی با ضمانت اصالت کالا، مشاورهٔ تخصصی و پشتیبانی پاسخ‌گو.",
};

/* ارزش‌های سه‌گانه — ملاک هر تصمیم */
const VALUES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: ShieldCheck,
    title: "اصالت کالا",
    description:
      "تأمین مستقیم از نمایندگی‌های رسمی؛ هر سفارش با فاکتور معتبر و تضمین اصالت به دست شما می‌رسد.",
  },
  {
    icon: Users,
    title: "مشاورهٔ تخصصی",
    description:
      "کارشناسان ما پیش و پس از خرید کنار شما هستند تا محصولی بخرید که واقعاً مناسب نیاز شماست.",
  },
  {
    icon: Headset,
    title: "پاسخ‌گویی و پشتیبانی",
    description:
      "پیگیری سفارش‌ها، پاسخ به پرسش‌ها و خدمات پس از فروش؛ سریع، دقیق و مسئولانه.",
  },
];

/** ردیف آیکون‌دار اطلاعات فروشگاه — دایرهٔ accent + برچسب + مقدار */
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

export default function AboutPage() {
  return (
    <>
      {/* هیروی وسیع متالیک */}
      <section className="bg-metallic relative overflow-hidden">
        <Watermark className="top-1/2 end-[-5rem] h-80 w-80 -translate-y-1/2 text-gold opacity-[0.07] md:end-[-7rem] md:h-[24rem] md:w-[24rem]" />
        <div className="shell relative py-14 md:py-20">
          <Logo light />
          <h1 className="mt-6 text-3xl font-black leading-snug text-on-metallic md:text-4xl">
            دربارهٔ {brand.name}
          </h1>
          <p className="mt-3 max-w-2xl leading-8 text-on-metallic-muted">
            {brand.tagline}
          </p>
        </div>
      </section>

      {/* داستان ما */}
      <section className="shell py-12">
        <SectionHeading
          title="داستان ما"
          subtitle="آشنایی با مسیر ما و آنچه به آن پایبندیم"
        />
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div className="space-y-5 text-sm leading-8 text-foreground/90 md:text-base">
            <p>
              فروشگاه {brand.name} با یک هدف روشن آغاز به کار کرد: دسترسی ساده
              و مطمئن خانواده‌ها به لوازم و تجهیزات پزشکی اصل. باور ما ساده
              است — کالایی که به سلامتی شما مربوط می‌شود، جای هیچ سازشی
              ندارد؛ به همین دلیل تأمین کالا را فقط از مسیر رسمی و
              نمایندگی‌های معتبر پیش می‌بریم.
            </p>
            <p>
              فروشگاه فیزیکی ما در تهران، در کنار فروشگاه آنلاین، میزبان شماست؛
              جایی که می‌توانید محصولات را از نزدیک ببینید و پیش از خرید،
              مشاورهٔ حضوری کارشناسان ما را دریافت کنید تا انتخابی مطمئن‌تر
              داشته باشید.
            </p>
            <p>
              همراه هر خرید، فاکتور معتبر و تضمین اصالت کالا دریافت می‌کنید و
              پشتیبانی ما با تحویل سفارش تمام نمی‌شود؛ در انتخاب، استفاده و
              خدمات پس از فروش کنار شما می‌مانیم.
            </p>
          </div>

          {/* کارت فروشگاه — بازسازی مستقل با همان سبک */}
          <aside className="card-luxe h-fit p-6 md:p-8">
            <h3 className="text-lg font-black text-foreground">
              فروشگاه {brand.name}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              مشاورهٔ حضوری و تحویل رایگان سفارش‌ها
            </p>

            <div className="mt-6 space-y-4">
              <InfoRow icon={MapPin} label="نشانی فروشگاه">
                {brand.contact.address}
              </InfoRow>
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
              <InfoRow icon={Clock} label="ساعت کاری">
                {brand.contact.hours.map((entry) => (
                  <p key={entry.days}>
                    {entry.days}: {entry.time}
                  </p>
                ))}
              </InfoRow>
            </div>

            <Button
              asChild
              variant="outline"
              className="mt-6 h-11 w-full border-gold/40 text-gold-strong hover:border-gold hover:bg-gold-soft/20 hover:text-gold-strong"
            >
              <Link href="/contact">
                <MapPinned className="size-4" aria-hidden="true" />
                مشاهده روی نقشه
              </Link>
            </Button>
          </aside>
        </div>
      </section>

      {/* ارزش‌های ما */}
      <section className="shell pb-14">
        <SectionHeading
          title="ارزش‌های ما"
          subtitle="سه اصلی که ملاک هر تصمیم ماست"
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {VALUES.map((value) => (
            <div
              key={value.title}
              className="card-luxe card-lift p-6 text-center"
            >
              <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent text-primary">
                <value.icon className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-bold text-foreground">{value.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* فراخوان پایانی */}
      <section className="bg-metallic-soft">
        <div className="shell flex flex-col items-center justify-between gap-6 py-10 text-center md:flex-row md:py-12 md:text-start">
          <div>
            <h2 className="text-lg font-black text-foreground md:text-xl">
              سوالی دارید؟
            </h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              با ما در تماس باشید؛ کارشناسان ما پاسخ‌گوی شما هستند.
            </p>
          </div>
          <Button asChild className="btn-metallic h-12 shrink-0 px-10">
            <Link href="/contact">تماس با ما</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
