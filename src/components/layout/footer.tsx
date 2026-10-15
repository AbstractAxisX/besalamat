import Link from "next/link";
import {
  Clock,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";

import { Logo, Pattern } from "@/components/shared/brand-assets";
import { brand, SOCIAL_LABELS, type SocialConfig } from "@/config/brand";
import { formatPhoneFa, toFa } from "@/lib/format";
import { PREVIEW_CATEGORIES } from "@/lib/preview-data";

const FOOTER_LINK_CLASS =
  "block text-sm leading-8 text-on-metallic-muted transition-colors hover:text-on-metallic";

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

  return (
    <footer className="relative overflow-hidden bg-metallic text-on-metallic">
      <Pattern className="text-gold opacity-[0.05]" />
      <div className="gold-hairline absolute inset-x-0 top-0" aria-hidden="true" />

      <div className="shell relative grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        {/* برند */}
        <div className="space-y-5">
          <Logo light />
          <p className="text-sm leading-7 text-on-metallic-muted">
            {brand.tagline}
          </p>
          <div className="flex items-center gap-2.5">
            {activeSocials.map((social) => (
              <a
                key={social.key}
                href={social.defaultHref}
                aria-label={SOCIAL_LABELS[social.key]}
                className="flex size-9 items-center justify-center rounded-full border border-gold/40 text-gold transition-colors hover:bg-gold hover:text-gold-foreground"
              >
                <SocialIcon social={social} />
              </a>
            ))}
          </div>
        </div>

        {/* دسترسی سریع */}
        <div>
          <h3 className="text-sm font-bold text-gold">دسترسی سریع</h3>
          <ul className="mt-3">
            <li>
              <Link href="/" className={FOOTER_LINK_CLASS}>
                صفحهٔ اصلی
              </Link>
            </li>
            <li>
              <Link href="/blog" className={FOOTER_LINK_CLASS}>
                وبلاگ
              </Link>
            </li>
            <li>
              <Link href="/about" className={FOOTER_LINK_CLASS}>
                دربارهٔ ما
              </Link>
            </li>
            <li>
              <Link href="/contact" className={FOOTER_LINK_CLASS}>
                تماس با ما
              </Link>
            </li>
            <li>
              <Link href="/faq" className={FOOTER_LINK_CLASS}>
                پرسش‌های متداول
              </Link>
            </li>
          </ul>
        </div>

        {/* دسته‌های پرطرفدار */}
        <div>
          <h3 className="text-sm font-bold text-gold">دسته‌های پرطرفدار</h3>
          <ul className="mt-3">
            {PREVIEW_CATEGORIES.slice(0, 5).map((category) => (
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
        </div>

        {/* فروشگاه */}
        <div>
          <h3 className="text-sm font-bold text-gold">فروشگاه</h3>
          <ul className="mt-4 space-y-1">
            <li className="flex items-start gap-3">
              <MapPin
                className="mt-1.5 size-4 shrink-0 text-gold"
                aria-hidden="true"
              />
              <span className="text-sm leading-7 text-on-metallic-muted">
                {brand.contact.address}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Phone
                className="mt-1.5 size-4 shrink-0 text-gold"
                aria-hidden="true"
              />
              <span className="block">
                <a
                  href={`tel:${brand.contact.phone}`}
                  dir="ltr"
                  className="block text-sm leading-7 text-on-metallic-muted transition-colors hover:text-on-metallic"
                >
                  {formatPhoneFa(brand.contact.phone)}
                </a>
                <a
                  href={`tel:${brand.contact.phoneAlt}`}
                  dir="ltr"
                  className="block text-sm leading-7 text-on-metallic-muted transition-colors hover:text-on-metallic"
                >
                  {formatPhoneFa(brand.contact.phoneAlt)}
                </a>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Mail
                className="mt-1.5 size-4 shrink-0 text-gold"
                aria-hidden="true"
              />
              <a
                href={`mailto:${brand.contact.email}`}
                className="text-sm leading-7 text-on-metallic-muted transition-colors hover:text-on-metallic"
              >
                {brand.contact.email}
              </a>
            </li>
            {brand.contact.hours.map((entry) => (
              <li key={entry.days} className="flex items-start gap-3">
                <Clock
                  className="mt-1.5 size-4 shrink-0 text-gold"
                  aria-hidden="true"
                />
                <span className="text-sm leading-7 text-on-metallic-muted">
                  {entry.days}: {entry.time}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* نوار پایین */}
      <div className="relative border-t border-white/10 py-5">
        <div className="shell flex flex-col items-center justify-between gap-3 text-xs text-on-metallic-muted sm:flex-row">
          <p>
            © {toFa(new Date().getFullYear())} {brand.name} — تمامی حقوق محفوظ
            است.
          </p>
          <p>طراحی‌شده با وسواسِ کیفیت</p>
        </div>
      </div>
    </footer>
  );
}
