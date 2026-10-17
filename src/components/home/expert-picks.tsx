/**
 * منتخب کارشناس سلامت — چیدمان مجله‌ای (کارت بزرگ + ردیف‌های فشرده)
 * ─────────────────────────────
 * Server Component؛ باند سبزفام متناوب برای شکستن ریتم صفحه.
 * جایگزین تب‌های تکراری: تحریریه‌ای که «چرا این محصول» را روایت می‌کند.
 */

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, ChevronLeft } from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";
import { discountPercent, formatTomanPlain, toFa } from "@/lib/format";
import type { ProductSummary } from "@/types/shop";

interface ExpertPicksProps {
  title: string;
  subtitle: string | null;
  products: ProductSummary[];
}

const FEATURE_REASONS = [
  "کیفیت ساخت و دقت اندازه‌گیری",
  "ارزش خرید در برابر قیمت",
  "سهولت استفاده برای سنین مختلف",
] as const;

export function ExpertPicks({ title, subtitle, products }: ExpertPicksProps) {
  if (products.length < 2) return null;

  const [feature, ...rest] = products;
  const rows = rest.slice(0, 3);
  const featureDiscount = discountPercent(
    feature.price,
    feature.comparePrice,
  );

  return (
    <section className="bg-surface-alt py-12 md:py-16" aria-label={title}>
      <div className="shell">
        <SectionHeading
          eyebrow="انتخاب کارشناسان"
          title={title}
          subtitle={subtitle ?? undefined}
          href="/products?sort=popular"
          hrefLabel="محصولات بیشتر"
        />

        <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
          {/* ── کارت شاخص ── */}
          <article className="card-luxe group relative flex flex-col overflow-hidden sm:flex-row">
            <Link
              href={`/products/${feature.slug}`}
              className="img-canvas relative block aspect-square sm:aspect-auto sm:w-[42%] shrink-0"
            >
              <Image
                src={feature.image}
                alt={feature.title}
                fill
                sizes="(max-width: 640px) 100vw, 300px"
                className="object-contain p-8 transition-transform duration-500 group-hover:scale-[1.05]"
              />
            </Link>

            <div className="flex flex-1 flex-col p-5 md:p-6">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-gold/40 bg-gold-soft/25 px-3 py-1 text-[10px] font-black text-gold-strong dark:bg-gold-soft/15 dark:text-gold">
                <Check className="size-3" aria-hidden="true" />
                انتخاب کارشناس {toFa(1)} — منتخب اول
              </span>

              <h3 className="mt-3 text-lg leading-8 font-black text-foreground md:text-xl">
                <Link
                  href={`/products/${feature.slug}`}
                  className="transition-colors hover:text-primary"
                >
                  {feature.title}
                </Link>
              </h3>

              <ul className="mt-4 space-y-2">
                {FEATURE_REASONS.map((reason) => (
                  <li
                    key={reason}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <Check
                      className="size-3.5 shrink-0 text-success"
                      aria-hidden="true"
                    />
                    {reason}
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                <div>
                  {feature.comparePrice != null ? (
                    <p className="text-xs text-muted-foreground line-through">
                      {formatTomanPlain(feature.comparePrice)}
                    </p>
                  ) : null}
                  <p className="text-xl font-black text-primary">
                    {formatTomanPlain(feature.price)}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      تومان
                    </span>
                  </p>
                </div>
                <Link
                  href={`/products/${feature.slug}`}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full px-5 text-xs font-bold text-primary-foreground transition-all duration-300 hover:brightness-110"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  مشاهده و خرید
                  <ArrowLeft className="size-3.5" aria-hidden="true" />
                </Link>
              </div>

              {featureDiscount != null ? (
                <span className="absolute top-4 start-4 rounded-full bg-gold px-2.5 py-0.5 text-[11px] font-black text-gold-foreground">
                  ٪{toFa(featureDiscount)}
                </span>
              ) : null}
            </div>
          </article>

          {/* ── ردیف‌های فشرده ── */}
          <div className="flex flex-col gap-4">
            {rows.map((product, index) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="card-luxe group flex flex-1 items-center gap-4 p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-lift md:p-4"
              >
                <span className="img-canvas relative size-[4.5rem] shrink-0 overflow-hidden rounded-xl md:size-20">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    sizes="88px"
                    className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.08]"
                  />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-gold/70">
                      {toFa(String(index + 2).padStart(2, "0"))}
                    </span>
                    {product.brandTitle ? (
                      <span className="text-[11px] text-muted-foreground">
                        {product.brandTitle}
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-1 block truncate text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                    {product.title}
                  </span>
                  <span className="mt-1.5 block text-sm font-black text-primary">
                    {formatTomanPlain(product.price)}{" "}
                    <span className="text-[10px] font-normal text-muted-foreground">
                      تومان
                    </span>
                  </span>
                </span>

                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-300 group-hover:border-gold/50 group-hover:bg-gold-soft/20 group-hover:text-gold-strong dark:group-hover:text-gold">
                  <ChevronLeft className="size-4" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
