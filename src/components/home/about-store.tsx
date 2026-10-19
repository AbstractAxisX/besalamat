/**
 * باند «دربارهٔ فروشگاه» — پنل سبز عمیق، آرام و ادیتوریال
 * ─────────────────────────────
 * Server Component؛ داستان برند + ۳ آمار CountUp + CTA.
 * عمق = واترمارک برند و هاله‌های glow (بدون پترن).
 */

import Link from "next/link";

import { Watermark } from "@/components/shared/brand-assets";
import { CountUp, Reveal } from "@/components/shared/motion";
import { brand } from "@/config/brand";

const ABOUT_STATS = [
  { value: 12, prefix: "+", suffix: "", label: "سال تجربهٔ تخصصی" },
  { value: 8_500, prefix: "+", suffix: "", label: "کد کالای اصل" },
  { value: 98, prefix: "", suffix: "٪", label: "رضایت خریداران" },
] as const;

interface AboutStoreProps {
  title: string;
}

export function AboutStore({ title }: AboutStoreProps) {
  return (
    <section className="shell py-14 md:py-20" aria-label={title}>
      <div className="relative overflow-hidden rounded-[2rem] bg-metallic">
        {/* عمق بدون پترن — واترمارک + هاله‌ها */}
        <Watermark className="end-[-5rem] top-1/2 size-[28rem] -translate-y-1/2 text-on-metallic opacity-[0.06] md:size-[34rem]" />
        <div
          aria-hidden="true"
          className="glow -start-10 -top-32 size-[26rem] bg-fresh/15"
        />
        <div
          aria-hidden="true"
          className="glow end-1/3 -bottom-40 size-[22rem] bg-fresh/10"
        />

        <div className="relative px-6 py-12 md:px-12 md:py-16 lg:px-16 lg:py-20">
          <Reveal>
            <p className="flex items-center gap-2 text-[11px] font-bold tracking-wide text-fresh">
              <span aria-hidden="true" className="h-px w-6 bg-fresh/70" />
              {title}
            </p>

            <h2 className="mt-4 max-w-2xl text-2xl leading-[1.5] font-black text-on-metallic md:text-[2rem] md:leading-[1.45]">
              بیش از یک فروشگاه؛
              <br />
              مشاورِ سلامتِ خانوادهٔ شما
            </h2>

            <p className="mt-5 max-w-2xl text-sm leading-8 text-on-metallic-muted md:text-[15px]">
              {brand.description} در کنار فروشگاه اینترنتی، سالن نمایش
              محصولات ما در تهران پذیرای بازدیدکنندگان است تا تجهیزات را از
              نزدیک ببینید و با مشاورهٔ حضوری کارشناسان، انتخابی مطمئن‌تر
              داشته باشید.
            </p>

            {/* آمار — شمارش نرم فارسی */}
            <div className="mt-9 flex divide-x divide-white/15">
              {ABOUT_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="px-6 first:ps-0 last:pe-0"
                >
                  <p className="text-2xl font-black text-on-metallic md:text-3xl">
                    <CountUp
                      value={stat.value}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                    />
                  </p>
                  <p className="mt-1.5 text-[11px] text-on-metallic-muted md:text-xs">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-9">
              <Link
                href="/about"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-white/25 px-6 text-sm font-medium text-on-metallic transition-all duration-300 outline-none hover:border-fresh/60 hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-pine"
              >
                بیشتر دربارهٔ ما
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
