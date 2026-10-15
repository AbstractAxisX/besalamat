/**
 * دربارهٔ فروشگاه — متن معرفی + کارت اطلاعات بازدید حضوری
 * ─────────────────────────────
 * Server Component؛ سطح متالیک لطیف با پترن برند (Pattern کلاینت است و
 * در کامپوننت سروری بدون مشکل مصرف می‌شود — الگوی فوتر).
 */

import Link from "next/link";
import { Clock, ExternalLink, Mail, MapPin, Phone } from "lucide-react";

import { Pattern } from "@/components/shared/brand-assets";
import { brand } from "@/config/brand";
import { formatPhoneFa } from "@/lib/format";

/* ردیف‌های کارت فروشگاه — آیکون طلایی ریز + متن هم‌خط با سطر اول */
const ROW_CLASS = "flex items-start gap-3";
const ICON_CLASS = "mt-1.5 size-4 shrink-0 text-gold";
const TEXT_CLASS = "text-sm leading-7";

interface AboutStoreProps {
  title: string;
}

export function AboutStore({ title }: AboutStoreProps) {
  return (
    <section className="relative overflow-hidden bg-metallic-soft">
      <Pattern className="text-pine opacity-[0.04] dark:text-gold" />

      <div className="shell relative grid items-center gap-10 py-14 md:py-20 lg:grid-cols-2 lg:gap-16">
        {/* ستون متن */}
        <div>
          <h2 className="text-2xl font-black text-foreground md:text-3xl">
            {title}
          </h2>

          <div className="mt-5 space-y-4">
            <p className="text-sm leading-8 text-muted-foreground md:text-base">
              {brand.description} در کنار فروشگاه اینترنتی، سالن نمایش محصولات
              ما در تهران پذیرای بازدیدکنندگان است تا تجهیزات را از نزدیک
              ببینید و با مشاورهٔ حضوری کارشناسان، انتخابی مطمئن‌تر داشته
              باشید.
            </p>
            <p className="text-sm leading-8 text-muted-foreground md:text-base">
              اصالت کالاها تضمین‌شده است؛ هر محصول با فاکتور رسمی و گارانتی
              معتبر عرضه می‌شود و تیم پشتیبانی ما در روزهای کاری پاسخگوی
              پرسش‌های شما دربارهٔ استفاده از تجهیزات و خدمات پس از فروش است.
            </p>
          </div>

          <Link
            href="/contact"
            className="btn-metallic mt-7 inline-flex h-11 items-center gap-2 rounded-full px-7 font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            تماس با ما
            <Phone className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {/* کارت فروشگاه */}
        <div className="card-luxe relative overflow-hidden p-6 md:p-8">
          <span
            className="gold-hairline absolute inset-x-0 top-0"
            aria-hidden="true"
          />

          <h3 className="flex items-center gap-2.5 text-lg font-bold">
            <MapPin className="size-5 text-gold" aria-hidden="true" />
            فروشگاه {brand.name}
          </h3>

          <ul className="mt-5 space-y-4">
            <li className={ROW_CLASS}>
              <MapPin className={ICON_CLASS} aria-hidden="true" />
              <p className={TEXT_CLASS}>{brand.contact.address}</p>
            </li>

            <li className={ROW_CLASS}>
              <Phone className={ICON_CLASS} aria-hidden="true" />
              <p className={TEXT_CLASS}>
                <a
                  href={`tel:${brand.contact.phone}`}
                  dir="ltr"
                  className="transition-colors hover:text-primary"
                >
                  {formatPhoneFa(brand.contact.phone)}
                </a>
                <span
                  className="px-1 text-muted-foreground/50"
                  aria-hidden="true"
                >
                  ·
                </span>
                <a
                  href={`tel:${brand.contact.phoneAlt}`}
                  dir="ltr"
                  className="transition-colors hover:text-primary"
                >
                  {formatPhoneFa(brand.contact.phoneAlt)}
                </a>
              </p>
            </li>

            <li className={ROW_CLASS}>
              <Mail className={ICON_CLASS} aria-hidden="true" />
              <a
                href={`mailto:${brand.contact.email}`}
                className={`${TEXT_CLASS} transition-colors hover:text-primary`}
              >
                {brand.contact.email}
              </a>
            </li>

            {brand.contact.hours.map((entry) => (
              <li key={entry.days} className={ROW_CLASS}>
                <Clock className={ICON_CLASS} aria-hidden="true" />
                <p className={TEXT_CLASS}>
                  {entry.days}: {entry.time}
                </p>
              </li>
            ))}
          </ul>

          <a
            href={brand.contact.mapEmbedUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-gold/40 text-sm font-medium text-gold transition-colors hover:bg-gold hover:text-gold-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            مشاهده روی نقشه
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
