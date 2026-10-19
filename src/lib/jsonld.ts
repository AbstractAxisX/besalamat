/**
 * سازنده‌های JSON-LD (Schema.org) — سئوی ساختاریافته
 * ─────────────────────────────
 * خروجی: آبجکت‌های خام؛ رندر با <JsonLd data={...} />.
 * مرجع‌ها: schema.org/Organization, /WebSite, /Product, /BreadcrumbList,
 * /Article, /FAQPage
 */

import { brand } from "@/config/brand";
import type { ArticleSummary, ProductDetail } from "@/types/shop";

export interface JsonLdBreadcrumbEntry {
  name: string;
  url: string;
}

/** سازمان / فروشگاه — یک‌بار در root layout */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${brand.domain}/#organization`,
    name: brand.name,
    alternateName: brand.latinName,
    url: brand.domain,
    logo: `${brand.domain}/logo.svg`,
    description: brand.description,
    slogan: brand.tagline,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: brand.contact.phone,
      contactType: "customer service",
      availableLanguage: ["fa"],
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: brand.contact.address,
      addressCountry: "IR",
    },
  } as const;
}

/** وب‌سایت + اکشن جستجو — یک‌بار در root layout */
export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${brand.domain}/#website`,
    name: brand.name,
    url: brand.domain,
    inLanguage: "fa-IR",
    publisher: { "@id": `${brand.domain}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${brand.domain}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  } as const;
}

/** محصول — در صفحهٔ جزئیات محصول */
export function productJsonLd(product: ProductDetail, absoluteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.shortDescription ?? undefined,
    image: product.images.map((image) => `${brand.domain}${image.url}`),
    sku: product.id,
    brand: product.brandTitle
      ? { "@type": "Brand", name: product.brandTitle }
      : undefined,
    category: product.categoryTitle ?? undefined,
    offers: {
      "@type": "Offer",
      url: absoluteUrl,
      priceCurrency: "IRR",
      price: product.price * 10, // تومان → ریال
      availability:
        product.inStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${brand.domain}/#organization` },
    },
  } as const;
}

/** مسیر راهنما (breadcrumb) — در صفحات محصول/مقاله/فروشگاه */
export function breadcrumbJsonLd(entries: JsonLdBreadcrumbEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: entry.url,
    })),
  } as const;
}

/** مقالهٔ وبلاگ */
export function articleJsonLd(article: ArticleSummary, absoluteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: `${brand.domain}${article.coverUrl}`,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    inLanguage: "fa-IR",
    mainEntityOfPage: absoluteUrl,
    author: { "@id": `${brand.domain}/#organization` },
    publisher: { "@id": `${brand.domain}/#organization` },
  } as const;
}

/** پرسش‌های متداول */
export function faqJsonLd(faqs: ReadonlyArray<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  } as const;
}
