/**
 * بنرهای میانی هوم — دو بنر تصویری با اورلی گرادیان و CTA طلایی
 * ─────────────────────────────
 * Server Component؛ گرادیان از سمت راست (سمت متن در RTL) تیره می‌شود
 * و گلیف پلیس‌هولدرها در سمت چپ کامپوز شده است.
 */

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import type { HomeBannerDTO } from "@/types/shop";

interface HomeBannersProps {
  banners: HomeBannerDTO[];
}

export function HomeBanners({ banners }: HomeBannersProps) {
  if (banners.length === 0) return null;

  return (
    <section className="shell py-8 md:py-10" aria-label="بنرهای فروشگاه">
      <div className="grid gap-4 md:grid-cols-2">
        {banners.map((banner) => (
          <Link
            key={banner.id}
            href={banner.href ?? "/products"}
            className="card-luxe group relative block h-44 overflow-hidden rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:h-52"
          >
            <Image
              src={banner.imageUrl}
              alt={banner.title ?? "بنر فروشگاه"}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            {/* اورلی تیره‌شونده به سمت راست — زیر متن */}
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-l from-black/55 via-black/25 to-transparent"
            />
            <span className="absolute inset-y-0 start-0 flex items-center">
              <span className="ps-6 md:ps-8">
                {banner.title ? (
                  <span className="block text-lg font-black text-white md:text-xl">
                    {banner.title}
                  </span>
                ) : null}
                <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-gold transition-all group-hover:gap-2.5">
                  مشاهده
                  <ArrowLeft className="size-4" aria-hidden="true" />
                </span>
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
