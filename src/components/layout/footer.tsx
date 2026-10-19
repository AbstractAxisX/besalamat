import Link from "next/link";
import { format } from "date-fns-jalali";
import {
  IconBrandInstagram,
  IconBrandTelegram,
  IconBrandWhatsapp,
  IconClock,
  IconHeadset,
  IconMail,
  IconMapPin,
  IconPhone,
  IconShieldCheck,
} from "@tabler/icons-react";

import { Logo, Watermark } from "@/components/shared/brand-assets";
import { brand, SOCIAL_LABELS, type SocialConfig } from "@/config/brand";
import { formatPhoneFa, toFa } from "@/lib/format";
import { PREVIEW_CATEGORIES } from "@/lib/preview-data";

const FOOTER_LINK_CLASS =
  "block text-[13px] leading-8 text-on-metallic-muted transition-colors hover:text-fresh";

const COLUMN_TITLE_CLASS = "text-sm font-black text-on-metallic";

/** آیکون شبکهٔ اجتماعی — سه شبکهٔ اصلی با تبلر؛ شبکه‌های داخلی حرف اول نام */
function SocialIcon({ social }: { social: SocialConfig }) {
  switch (social.key) {
    case "telegram":
      return (
        <IconBrandTelegram
          className="size-4"
          stroke={1.75}
          aria-hidden="true"
        />
      );
    case "whatsapp":
      return (
        <IconBrandWhatsapp
          className="size-4"
          stroke={1.75}
          aria-hidden="true"
        />
      );
    case "instagram":
      return (
        <IconBrandInstagram
          className="size-4"
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

export function Footer() {
  const activeSocials = brand.socials.filter(
    (social) => social.defaultHref !== "",
  );
  /* سال شمسی برای حق نشر */
  const year = toFa(format(new Date(), "yyyy"));

  return (
    <footer className="relative overflow-hidden bg-metallic text-on-metallic">
      {/* عمق بدون پترن — هالهٔ محو + واترمارک نشان برند */}
      <div
        className="glow start-[-12rem] top-[-8rem] size-96 bg-fresh/10"
        aria-hidden="true"
      />
      <Watermark className="bottom-[-3rem] end-[-3rem] size-80 text-fresh/10" />

      {/* ── باند مشاوره ── */}
      <div className="relative border-b border-on-metallic/15">
        <div className="shell flex flex-wrap items-center justify-between gap-x-6 gap-y-4 py-6">
          <p className="flex items-center gap-3.5 text-sm font-black md:text-base">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-fresh/40 bg-fresh/10 text-fresh">
              <IconHeadset
                className="size-5"
                stroke={1.75}
                aria-hidden="true"
              />
            </span>
            قبل از خرید، با کارشناس {brand.name} مشورت کنید
          </p>
          <a
            href={`tel:${brand.contact.phone}`}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-fresh-strong px-6 text-sm font-black text-primary-foreground transition-all duration-300 hover:brightness-110"
          >
            <IconPhone className="size-4" stroke={1.75} aria-hidden="true" />
            <span dir="ltr">{formatPhoneFa(brand.contact.phone)}</span>
          </a>
        </div>
      </div>

      {/* ── ستون‌های اصلی ── */}
      <div className="shell relative grid gap-10 py-12 sm:grid-cols-2 md:py-14 lg:grid-cols-[1.25fr_0.75fr_0.85fr_1.1fr] lg:gap-8">
        {/* برند */}
        <div className="space-y-5">
          <Logo light />
          <p className="max-w-xs text-[13px] leading-7 text-on-metallic-muted">
            {brand.tagline} — {brand.description}
          </p>
          <div className="flex items-center gap-2.5">
            {activeSocials.map((social) => (
              <a
                key={social.key}
                href={social.defaultHref}
                aria-label={SOCIAL_LABELS[social.key]}
                className="flex size-10 items-center justify-center rounded-full border border-on-metallic/20 text-on-metallic-muted transition-all duration-300 hover:border-fresh hover:text-fresh"
              >
                <SocialIcon social={social} />
              </a>
            ))}
          </div>
        </div>

        {/* دسترسی سریع */}
        <nav aria-label="دسترسی سریع">
          <h3 className={COLUMN_TITLE_CLASS}>دسترسی سریع</h3>
          <ul className="mt-4">
            <li>
              <Link href="/" className={FOOTER_LINK_CLASS}>
                صفحهٔ اصلی
              </Link>
            </li>
            <li>
              <Link href="/products" className={FOOTER_LINK_CLASS}>
                فروشگاه
              </Link>
            </li>
            <li>
              <Link href="/products?discount=1" className={FOOTER_LINK_CLASS}>
                تخفیف‌دارها
              </Link>
            </li>
            <li>
              <Link href="/blog" className={FOOTER_LINK_CLASS}>
                مجلهٔ سلامت
              </Link>
            </li>
            <li>
              <Link href="/about" className={FOOTER_LINK_CLASS}>
                دربارهٔ ما
              </Link>
            </li>
            <li>
              <Link href="/faq" className={FOOTER_LINK_CLASS}>
                پرسش‌های متداول
              </Link>
            </li>
          </ul>
        </nav>

        {/* دسته‌های پرطرفدار */}
        <nav aria-label="دسته‌های پرطرفدار">
          <h3 className={COLUMN_TITLE_CLASS}>دسته‌های پرطرفدار</h3>
          <ul className="mt-4">
            {PREVIEW_CATEGORIES.slice(0, 6).map((category) => (
              <li key={category.id}>
                <Link
                  href={`/products?category=${category.slug}`}
                  className={FOOTER_LINK_CLASS}
                >
                  {category.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* تماس */}
        <div>
          <h3 className={COLUMN_TITLE_CLASS}>تماس با {brand.name}</h3>
          <ul className="mt-4 space-y-1">
            <li className="flex items-start gap-3">
              <IconMapPin
                className="mt-2 size-4 shrink-0 text-fresh"
                stroke={1.75}
                aria-hidden="true"
              />
              <span className="text-[13px] leading-7 text-on-metallic-muted">
                {brand.contact.address}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <IconPhone
                className="mt-2 size-4 shrink-0 text-fresh"
                stroke={1.75}
                aria-hidden="true"
              />
              <span className="block">
                <a
                  href={`tel:${brand.contact.phone}`}
                  dir="ltr"
                  className="block text-[13px] leading-7 text-on-metallic-muted transition-colors hover:text-fresh"
                >
                  {formatPhoneFa(brand.contact.phone)}
                </a>
                <a
                  href={`tel:${brand.contact.phoneAlt}`}
                  dir="ltr"
                  className="block text-[13px] leading-7 text-on-metallic-muted transition-colors hover:text-fresh"
                >
                  {formatPhoneFa(brand.contact.phoneAlt)}
                </a>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <IconMail
                className="mt-2 size-4 shrink-0 text-fresh"
                stroke={1.75}
                aria-hidden="true"
              />
              <a
                href={`mailto:${brand.contact.email}`}
                className="text-[13px] leading-7 text-on-metallic-muted transition-colors hover:text-fresh"
              >
                {brand.contact.email}
              </a>
            </li>
            {brand.contact.hours.map((entry) => (
              <li key={entry.days} className="flex items-start gap-3">
                <IconClock
                  className="mt-2 size-4 shrink-0 text-fresh"
                  stroke={1.75}
                  aria-hidden="true"
                />
                <span className="text-[13px] leading-7 text-on-metallic-muted">
                  {entry.days}: {entry.time}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── نوار پایانی ── */}
      <div className="relative border-t border-on-metallic/15">
        <div className="shell flex flex-col items-center justify-between gap-4 py-5 md:flex-row">
          <p className="text-[11px] text-on-metallic-muted">
            © {year} {brand.name} — تمامی حقوق محفوظ است.
          </p>
          <p className="text-[11px] text-on-metallic-muted">
            طراحی و توسعه — {brand.name}
          </p>

          {/* جوازها — placeholder تا فاز ۷ */}
          <div className="flex items-center gap-3" aria-label="جوازها">
            <span className="flex h-11 w-28 flex-col items-center justify-center rounded-lg border border-on-metallic/15 text-[9px] leading-4 text-on-metallic-muted">
              <IconShieldCheck
                className="size-4 text-fresh"
                stroke={1.75}
                aria-hidden="true"
              />
              نماد اعتماد الکترونیکی
            </span>
            <span className="flex h-11 w-28 flex-col items-center justify-center rounded-lg border border-on-metallic/15 text-[9px] leading-4 text-on-metallic-muted">
              <IconShieldCheck
                className="size-4 text-fresh"
                stroke={1.75}
                aria-hidden="true"
              />
              ساماندهی رسانه‌های دیجیتال
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
