/**
 * صفحهٔ محصول — Server Component
 * ─────────────────────────────
 * params (Next 16: Promise) → سرویس DB-first (shop-data) → notFound.
 * متای داینامیک + بریدکرامب (خانه/والد/فرزند/محصول) + محصولات مرتبط.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { ProductDetail as ProductDetailView } from "@/components/product/product-detail";
import { ProductGrid } from "@/components/product/product-grid";
import { SectionHeading } from "@/components/shared/section-heading";
import { JsonLd } from "@/components/shared/json-ld";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/jsonld";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { brand } from "@/config/brand";
import {
  getBrands,
  getCategoriesTree,
  getProductDetailBySlug,
  getRelatedProducts,
} from "@/server/shop-data";
import type { CategoryNode } from "@/types/shop";

export const dynamic = "force-dynamic";

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

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductDetailBySlug(slug);
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
  const product = await getProductDetailBySlug(slug);
  if (!product) notFound();

  const [categories, brands, related] = await Promise.all([
    getCategoriesTree(),
    getBrands(),
    getRelatedProducts(product.slug, product.categorySlug),
  ]);

  const parentCategory = findParentCategory(product.categorySlug, categories);

  const truncatedTitle =
    product.title.length > 48 ? `${product.title.slice(0, 48)}…` : product.title;

  const productUrl = `${brand.domain}/products/${product.slug}`;

  /* سئوی ساختاریافته — Product + BreadcrumbList */
  const breadcrumbEntries = [
    { name: "خانه", url: brand.domain },
    ...(parentCategory
      ? [
          {
            name: parentCategory.title,
            url: `${brand.domain}/products?category=${parentCategory.slug}`,
          },
        ]
      : []),
    ...(product.categoryTitle && product.categorySlug
      ? [
          {
            name: product.categoryTitle,
            url: `${brand.domain}/products?category=${product.categorySlug}`,
          },
        ]
      : []),
    { name: product.title, url: productUrl },
  ];

  return (
    <div className="shell py-8 md:py-12">
      <JsonLd data={productJsonLd(product, productUrl)} />
      <JsonLd data={breadcrumbJsonLd(breadcrumbEntries)} />
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
        <ProductDetailView product={product} related={related} brands={brands} />
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
