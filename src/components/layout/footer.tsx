import Link from "next/link";
import {
  Clock,
  Headset,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
} from "lucide-react";

import { Logo, Pattern } from "@/components/shared/brand-assets";
import { brand, SOCIAL_LABELS, type SocialConfig } from "@/config/brand";
import { formatPhoneFa, toFa } from "@/lib/format";
import { PREVIEW_CATEGORIES } from "@/lib/preview-data";

const FOOTER_LINK_CLASS =
  "block text-[13px] leading-8 text-on-metallic-muted transition-colors hover:text-gold";

const COLUMN_TITLE_CLASS = "text-[13px] font-black text-gold";

/** آیکون شبکهٔ اجتماعی — سه شبکهٔ اصلی lucide؛ شبکه‌های داخلی حرف اول نام */
function SocialIcon({ social }: { social: SocialConfig }) {
  switch (social.key) {
    case "telegram":
      return <Send className="size-4" aria-hidden="true" />;
    case "whatsapp":
      return <MessageCircle className="size-4" aria-hidden="true" />;
    case "instagram":
      return <Instagram className="size-4" aria-hidden="true" />;
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
  const year = toFa(new Date().getFullYear());

  return (
    <footer className="relative overflow-hidden bg-metallic text-on-metallic">
      <Pattern className="text-gold opacity-[0.05]" />
      <div className="gold-hairline absolute inset-x-0 top-0" aria-hidden="true" />

      {/* ── باند مشاوره ── */}
      <div className="relative border-b border-white/10">
        <div className="shell flex flex-wrap items-center justify-between gap-x-6 gap-y-4 py-6">
          <p className="flex items-center gap-3.5 text-sm font-black md:text-base">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold">
              <Headset className="size-5" aria-hidden="true" />
            </span>
            قبل از خرید، با کارشناس {brand.name} مشورت کنید
          </p>
          <a
            href={`tel:${brand.contact.phone}`}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-gold px-6 text-sm font-black text-gold-foreground transition-all duration-300 hover:brightness-110"
          >
            <Phone className="size-4" aria-hidden="true" />
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
                className="flex size-10 items-center justify-center rounded-full border border-white/15 text-on-metallic-muted transition-all duration-300 hover:border-gold hover:bg-gold hover:text-gold-foreground"
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
              <MapPin
                className="mt-2 size-4 shrink-0 text-gold"
                aria-hidden="true"
              />
              <span className="text-[13px] leading-7 text-on-metallic-muted">
                {brand.contact.address}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Phone
                className="mt-2 size-4 shrink-0 text-gold"
                aria-hidden="true"
              />
              <span className="block">
                <a
                  href={`tel:${brand.contact.phone}`}
                  dir="ltr"
                  className="block text-[13px] leading-7 text-on-metallic-muted transition-colors hover:text-gold"
                >
                  {formatPhoneFa(brand.contact.phone)}
                </a>
                <a
                  href={`tel:${brand.contact.phoneAlt}`}
                  dir="ltr"
                  className="block text-[13px] leading-7 text-on-metallic-muted transition-colors hover:text-gold"
                >
                  {formatPhoneFa(brand.contact.phoneAlt)}
                </a>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Mail
                className="mt-2 size-4 shrink-0 text-gold"
                aria-hidden="true"
              />
              <a
                href={`mailto:${brand.contact.email}`}
                className="text-[13px] leading-7 text-on-metallic-muted transition-colors hover:text-gold"
              >
                {brand.contact.email}
              </a>
            </li>
            {brand.contact.hours.map((entry) => (
              <li key={entry.days} className="flex items-start gap-3">
                <Clock
                  className="mt-2 size-4 shrink-0 text-gold"
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
      <div className="relative border-t border-white/10">
        <div className="shell flex flex-col items-center justify-between gap-4 py-5 md:flex-row">
          <p className="text-[11px] text-on-metallic-muted">
            © {year} {brand.name} — تمامی حقوق محفوظ است.
          </p>

          {/* جوازها — placeholder تا فاز ۷ */}
          <div className="flex items-center gap-3" aria-label="جوازها">
            <span className="flex h-11 w-28 flex-col items-center justify-center rounded-lg border border-white/15 text-[9px] leading-4 text-on-metallic-muted">
              <ShieldCheck className="size-4 text-gold" aria-hidden="true" />
              نماد اعتماد الکترونیکی
            </span>
            <span className="flex h-11 w-28 flex-col items-center justify-center rounded-lg border border-white/15 text-[9px] leading-4 text-on-metallic-muted">
              <ShieldCheck className="size-4 text-gold" aria-hidden="true" />
              ساماندهی رسانه‌های دیجیتال
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
