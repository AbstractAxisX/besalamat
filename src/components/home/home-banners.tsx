/**
 * بنرهای میانی هوم — دونمایی نامتقارن با اورلی و CTA طلایی
 * ─────────────────────────────
 * Server Component؛ بنر اول عریض‌تر (سلسله‌مراتب بصری)،
 * گرادیان از سمت راست (سمت متن در RTL) تیره می‌شود.
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
    <section className="shell py-12 md:py-16" aria-label="بنرهای فروشگاه">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1.55fr_1fr]">
        {banners.map((banner, index) => (
          <Link
            key={banner.id}
            href={banner.href ?? "/products"}
            className="group relative block h-52 overflow-hidden rounded-[1.5rem] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:h-64"
          >
            <Image
              src={banner.imageUrl}
              alt={banner.title ?? "بنر فروشگاه"}
              fill
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
            />
            {/* اورلی تیره‌شونده به سمت راست — زیر متن */}
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-l from-pine/85 via-pine/45 to-transparent"
            />
            {/* خط طلایی پایین — نشانهٔ CTA */}
            <span
              aria-hidden="true"
              className="absolute bottom-0 start-0 h-1 w-0 bg-gold transition-all duration-500 group-hover:w-full"
            />

            <span className="absolute inset-y-0 start-0 flex items-center">
              <span className="ps-6 md:ps-8">
                {banner.title ? (
                  <span className="block text-xl leading-9 font-black text-white md:text-2xl">
                    {banner.title}
                  </span>
                ) : null}
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur transition-all duration-300 group-hover:border-gold group-hover:bg-gold group-hover:text-gold-foreground">
                  مشاهدهٔ دسته
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
