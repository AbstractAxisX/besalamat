/**
 * صفحهٔ ۴۰۴ — تمام‌صفحهٔ شیک با نشان برند و ۴۰۴ِ طلاییِ گرادیانی
 */

import Link from "next/link";

import {
  LogoMark,
  Pattern,
  Watermark,
} from "@/components/shared/brand-assets";
import { Button } from "@/components/ui/button";
import { toFa } from "@/lib/format";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
      {/* تزئینات بسیار محو */}
      <Pattern className="text-pine opacity-[0.03] dark:text-gold dark:opacity-[0.04]" />
      <Watermark className="top-1/2 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 text-pine opacity-[0.045] dark:text-gold dark:opacity-[0.06]" />

      <div className="shell relative py-16 text-center">
        <LogoMark className="mx-auto size-16 opacity-90" />

        <p
          aria-hidden="true"
          className="text-gold-gradient mt-6 text-7xl font-black leading-none md:text-8xl"
        >
          {toFa(404)}
        </p>

        <h1 className="mt-4 text-xl font-bold text-foreground">
          صفحه‌ای که دنبالش بودید پیدا نشد
        </h1>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          شاید آدرس را اشتباه وارد کرده‌اید یا این صفحه جابه‌جا شده است.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild className="btn-metallic h-12 px-8">
            <Link href="/">بازگشت به خانه</Link>
          </Button>
          <Button asChild variant="ghost" className="h-12 px-8">
            <Link href="/search">جستجو در فروشگاه</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
