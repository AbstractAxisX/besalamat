/**
 * صفحهٔ محصول — Server Component
 * ─────────────────────────────
 * params (Next 16: Promise) → PREVIEW_PRODUCT_DETAILS[slug] → notFound.
 * متای داینامیک + بریدکرامب (خانه/والد/فرزند/محصول) + محصولات مرتبط.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { ProductDetail } from "@/components/product/product-detail";
import { ProductGrid } from "@/components/product/product-grid";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  PREVIEW_CATEGORIES,
  PREVIEW_PRODUCT_DETAILS,
  PREVIEW_PRODUCTS,
} from "@/lib/preview-data";
import type { CategoryNode, ProductSummary } from "@/types/shop";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

/** چکیدهٔ متنی از HTML توضیحات (برای متا) */
function htmlExcerpt(html: string): string {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 160 ? `${text.slice(0, 160)}…` : text;
}

/** والدِ دستهٔ محصول از درخت دسته‌بندی‌ها */
function findParentCategory(
  categorySlug: string | null,
  categories: CategoryNode[],
): CategoryNode | null {
  if (!categorySlug) return null;
  return (
    categories.find(
      (parent) =>
        parent.slug === categorySlug ||
        parent.children.some((child) => child.slug === categorySlug),
    ) ?? null
  );
}

/** محصولات هم‌خانواده (همان والدِ دسته) — حداکثر ۴ مورد بدون خودِ کالا */
function findRelated(
  slug: string,
  parent: CategoryNode | null,
): ProductSummary[] {
  if (!parent) return [];
  return PREVIEW_PRODUCTS.filter((item) => {
    if (item.slug === slug) return false;
    const itemCategory = PREVIEW_PRODUCT_DETAILS[item.slug]?.categorySlug ?? null;
    if (!itemCategory) return false;
    return (
      itemCategory === parent.slug ||
      parent.children.some((child) => child.slug === itemCategory)
    );
  }).slice(0, 4);
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = PREVIEW_PRODUCT_DETAILS[slug];
  if (!product) {
    return { title: "محصول یافت نشد" };
  }
  const description =
    product.shortDescription ??
    (product.description ? htmlExcerpt(product.description) : undefined);
  return {
    title: product.title,
    description,
    openGraph: {
      title: product.title,
      description,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = PREVIEW_PRODUCT_DETAILS[slug];
  if (!product) notFound();

  const parentCategory = findParentCategory(product.categorySlug, PREVIEW_CATEGORIES);
  const related = findRelated(product.slug, parentCategory);

  const truncatedTitle =
    product.title.length > 48 ? `${product.title.slice(0, 48)}…` : product.title;

  return (
    <div className="shell py-8 md:py-12">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">خانه</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronLeft aria-hidden="true" />
          </BreadcrumbSeparator>
          {product.categoryParentTitle && parentCategory ? (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/products?category=${parentCategory.slug}`}>
                    {product.categoryParentTitle}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronLeft aria-hidden="true" />
              </BreadcrumbSeparator>
            </>
          ) : null}
          {product.categoryTitle && product.categorySlug ? (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/products?category=${product.categorySlug}`}>
                    {product.categoryTitle}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronLeft aria-hidden="true" />
              </BreadcrumbSeparator>
            </>
          ) : null}
          <BreadcrumbItem>
            <BreadcrumbPage>{truncatedTitle}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6 md:mt-8">
        <ProductDetail product={product} related={related} />
      </div>

      {related.length > 0 ? (
        <section className="mt-14 md:mt-20">
          <SectionHeading
            eyebrow="پیشنهاد ما"
            title="محصولات مرتبط"
            href={
              product.categorySlug
                ? `/products?category=${product.categorySlug}`
                : "/products"
            }
            hrefLabel="مشاهدهٔ دسته"
          />
          <ProductGrid products={related} />
        </section>
      ) : null}
    </div>
  );
}
