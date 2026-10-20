import type { Metadata, Viewport } from "next";
import "./globals.css";

import { ThemeProvider } from "next-themes";

import { Toaster } from "@/components/ui/sonner";
import { JsonLd } from "@/components/shared/json-ld";
import { brand } from "@/config/brand";
import { organizationJsonLd, webSiteJsonLd } from "@/lib/jsonld";
import { getStoreSettings } from "@/server/shop-data";

/* ── سئوی سراسری — آگاه از تنظیمات فروشگاه (store.*) ── */

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreSettings();
  /* پیش‌فرض‌های ثابت brand.ts با نام فروشگاهِ تنظیمات بازنویسی می‌شوند */
  const defaultTitle = brand.meta.defaultTitle.replace(brand.name, store.name);
  const titleTemplate = brand.meta.titleTemplate.replace(brand.name, store.name);
  const description = store.aboutShort || brand.meta.defaultDescription;

  return {
    metadataBase: new URL(brand.domain),
    title: {
      default: defaultTitle,
      template: titleTemplate,
    },
    description,
    applicationName: store.name,
    keywords: [
      "لوازم پزشکی",
      "تجهیزات پزشکی",
      "فروشگاه لوازم پزشکی",
      "فشارسنج",
      "قندسنج",
      "بخور",
      "ویلچر",
      "تخت بیمار",
      "اقلام مصرفی پزشکی",
      store.name,
    ],
    authors: [{ name: store.name, url: brand.domain }],
    creator: store.name,
    publisher: store.name,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      locale: "fa_IR",
      url: brand.domain,
      siteName: store.name,
      title: defaultTitle,
      description,
      images: [
        {
          url: brand.meta.ogImage,
          width: 1200,
          height: 630,
          alt: store.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description,
      images: [brand.meta.ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0b4634" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1511" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

/**
 * Layout ریشه — فقط پوستهٔ html/body (تم، توست، سئو).
 * کروم فروشگاه در (shop)/layout.tsx و کروم ادمین در admin/layout.tsx است.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/fonts/Vazirmatn-Variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-[70] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
          >
            پرش به محتوای اصلی
          </a>
          {children}
          <Toaster position="top-center" dir="rtl" richColors closeButton />
        </ThemeProvider>
        {/* سئوی ساختاریافته — سراسری */}
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={webSiteJsonLd()} />
      </body>
    </html>
  );
}
