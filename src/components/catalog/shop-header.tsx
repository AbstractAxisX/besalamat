"use client";

/**
 * باند هدر فروشگاه — سبزِ عمیق full-bleed
 * ─────────────────────────────
 * جایگزین باندِ سبزفامِ قدیمی که مشتری «بسیار ساده و ناهم‌خانواده با سایت» می‌دانست.
 * عمق بدون هیچ پترن/مش: واترمارک غول‌پیکرِ خطی + دو هالهٔ نرم + بوردر fresh.
 * کاملاً presentational؛ state نزد CatalogView است و عنوان با فریمرموشن
 * روی هر تغییر، نرم می‌لغزد (y 8→0) تا صفحه زنده به نظر برسد.
 */

import { Fragment } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { IconChevronLeft } from "@tabler/icons-react";

import { Watermark } from "@/components/shared/brand-assets";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { toFa } from "@/lib/format";

/** یک سطح از بریدکرامب — آخرین آیتم (بدون href) صفحهٔ جاری است */
export interface ShopHeaderCrumb {
  label: string;
  href?: string;
}

interface ShopHeaderProps {
  /** h1 صفحه — نام دستهٔ فعال / «نتایج جستجو برای «…»» / عنوان پیش‌فرض فروشگاه */
  title: string;
  description?: string;
  breadcrumbItems: ShopHeaderCrumb[];
  /** تعداد نتایج فعلی — چیپ شیشه‌ای بالای باند */
  count: number;
}

export function ShopHeader({
  title,
  description,
  breadcrumbItems,
  count,
}: ShopHeaderProps) {
  const lastIndex = breadcrumbItems.length - 1;

  return (
    <section
      className="bg-metallic relative overflow-hidden border-b border-fresh/20"
      aria-labelledby="shop-header-title"
    >
      {/* عمق بدون پترن — واترمارک غول‌پیکر خطی + دو هاله */}
      <Watermark className="-end-16 -top-16 size-72 rotate-12 text-fresh/10 md:size-96" />
      <div
        aria-hidden="true"
        className="glow -bottom-40 -start-20 size-96 bg-fresh/15"
      />
      <div
        aria-hidden="true"
        className="glow -top-32 end-1/3 size-72 bg-primary/40"
      />

      <div className="shell relative py-8 md:py-12">
        {/* بریدکرامب روشن داخل باند */}
        <Breadcrumb>
          <BreadcrumbList className="text-[11px]">
            {breadcrumbItems.map((crumb, index) => {
              const isLast = index === lastIndex;
              return (
                <Fragment key={`${index}-${crumb.label}`}>
                  <BreadcrumbItem>
                    {crumb.href == null || isLast ? (
                      <BreadcrumbPage className="font-medium text-on-metallic">
                        {crumb.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        asChild
                        className="text-on-metallic-muted transition-colors hover:text-fresh"
                      >
                        <Link href={crumb.href}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < lastIndex ? (
                    <BreadcrumbSeparator className="text-on-metallic-muted/60 [&>svg]:size-3">
                      <IconChevronLeft aria-hidden="true" stroke={1.75} />
                    </BreadcrumbSeparator>
                  ) : null}
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>

        {/* عنوان + شمار نتیجه */}
        <div className="mt-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 md:mt-5">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.32, ease: [0.21, 0.65, 0.36, 1] }}
              className="min-w-0"
            >
              <h1
                id="shop-header-title"
                className="text-2xl font-black leading-tight text-on-metallic md:text-[2rem]"
              >
                {title}
              </h1>
              {description ? (
                <p className="mt-2 max-w-2xl text-[13px] leading-7 text-on-metallic-muted">
                  {description}
                </p>
              ) : null}
            </motion.div>
          </AnimatePresence>

          {/* چیپ شمار نتیجه — شیشه‌ایِ تیره روی باند (متن روشن، خوانا) */}
          <motion.span
            key={count}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="mb-1 shrink-0 rounded-full border border-fresh/25 bg-primary/30 px-4 py-1.5 text-xs font-bold tabular-nums text-on-metallic backdrop-blur-sm"
          >
            {toFa(count)} کالا
          </motion.span>
        </div>
      </div>
    </section>
  );
}
