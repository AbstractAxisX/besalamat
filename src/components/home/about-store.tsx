/**
 * باند «دربارهٔ فروشگاه» — متن معرفی + کارت شیشه‌ای فروشگاه حضوری
 * ─────────────────────────────
 * Server Component؛ سطح متالیک با پترن و واترمارک برند.
 * چک‌لیست اعتماد (۳ مورد) جای آمارهای ساختگی را می‌گیرد — صداقت می‌فروشد.
 */

import Link from "next/link";
import {
  Check,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

import { Pattern, Watermark } from "@/components/shared/brand-assets";
import { brand } from "@/config/brand";
import { formatPhoneFa } from "@/lib/format";

const TRUST_POINTS = [
  "ضمانت اصالت کالا با فاکتور رسمی و گارانتی معتبر",
  "مشاورهٔ تخصصی رایگان، قبل و بعد از خرید",
  "ارسال به سراسر کشور؛ تحویل حضوری از فروشگاه رایگان",
] as const;

const ROW_CLASS = "flex items-start gap-3";
const ICON_CLASS = "mt-1 size-4 shrink-0 text-gold";
const TEXT_CLASS = "text-sm leading-7";

interface AboutStoreProps {
  title: string;
}

export function AboutStore({ title }: AboutStoreProps) {
  return (
    <section
      className="relative overflow-hidden bg-metallic"
      aria-label={title}
    >
      <Pattern className="text-gold opacity-[0.05]" />
      <Watermark className="start-[-4rem] top-1/2 size-[26rem] -translate-y-1/2 text-on-metallic opacity-[0.04] md:size-[32rem]" />

      <div className="shell relative grid items-center gap-10 py-14 md:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        {/* ستون متن */}
        <div>
          <p className="flex items-center gap-2 text-[11px] font-bold tracking-wide text-gold">
            <span className="h-px w-6 bg-gold/70" aria-hidden="true" />
            {title}
          </p>
          <h2 className="mt-3 text-2xl leading-[1.5] font-black text-on-metallic md:text-[2rem] md:leading-[1.45]">
            بیش از یک فروشگاه؛
            <br />
            مشاورِ سلامتِ خانوادهٔ شما
          </h2>

          <p className="mt-5 max-w-xl text-sm leading-8 text-on-metallic-muted md:text-[15px]">
            {brand.description} در کنار فروشگاه اینترنتی، سالن نمایش محصولات ما
            در تهران پذیرای بازدیدکنندگان است تا تجهیزات را از نزدیک ببینید و
            با مشاورهٔ حضوری کارشناسان، انتخابی مطمئن‌تر داشته باشید.
          </p>

          <ul className="mt-6 space-y-2.5">
            {TRUST_POINTS.map((point) => (
              <li
                key={point}
                className="flex items-center gap-2.5 text-sm text-on-metallic"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold">
                  <Check className="size-3.5" aria-hidden="true" />
                </span>
                {point}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/about"
              className="inline-flex h-11 items-center rounded-full border border-white/25 px-6 text-sm font-medium text-on-metallic transition-all duration-300 hover:border-gold hover:text-gold"
            >
              دربارهٔ ما
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-gold px-6 text-sm font-black text-gold-foreground transition-all duration-300 hover:brightness-110"
            >
              تماس با ما
              <Phone className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* کارت شیشه‌ای فروشگاه حضوری */}
        <div className="relative rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm md:p-8">
          <span
            className="gold-hairline absolute inset-x-8 top-0"
            aria-hidden="true"
          />

          <h3 className="flex items-center gap-2.5 text-lg font-bold text-on-metallic">
            <MapPin className="size-5 text-gold" aria-hidden="true" />
            فروشگاه حضوری {brand.name}
          </h3>

          <ul className="mt-6 space-y-4">
            <li className={ROW_CLASS}>
              <MapPin className={ICON_CLASS} aria-hidden="true" />
              <p className={`${TEXT_CLASS} text-on-metallic-muted`}>
                {brand.contact.address}
              </p>
            </li>

            <li className={ROW_CLASS}>
              <Phone className={ICON_CLASS} aria-hidden="true" />
              <p className={TEXT_CLASS}>
                <a
                  href={`tel:${brand.contact.phone}`}
                  dir="ltr"
                  className="text-on-metallic transition-colors hover:text-gold"
                >
                  {formatPhoneFa(brand.contact.phone)}
                </a>
                <span
                  className="px-1 text-on-metallic-muted/50"
                  aria-hidden="true"
                >
                  ·
                </span>
                <a
                  href={`tel:${brand.contact.phoneAlt}`}
                  dir="ltr"
                  className="text-on-metallic transition-colors hover:text-gold"
                >
                  {formatPhoneFa(brand.contact.phoneAlt)}
                </a>
              </p>
            </li>

            <li className={ROW_CLASS}>
              <Mail className={ICON_CLASS} aria-hidden="true" />
              <a
                href={`mailto:${brand.contact.email}`}
                className={`${TEXT_CLASS} text-on-metallic-muted transition-colors hover:text-gold`}
              >
                {brand.contact.email}
              </a>
            </li>

            {brand.contact.hours.map((entry) => (
              <li key={entry.days} className={ROW_CLASS}>
                <Clock className={ICON_CLASS} aria-hidden="true" />
                <p className={`${TEXT_CLASS} text-on-metallic-muted`}>
                  {entry.days}: {entry.time}
                </p>
              </li>
            ))}
          </ul>

          <a
            href={brand.contact.mapEmbedUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gold/40 text-sm font-bold text-gold transition-colors duration-300 hover:bg-gold hover:text-gold-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-pine"
          >
            مشاهده روی نقشه
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
