import type { Metadata, Viewport } from "next";
import "./globals.css";

import { ThemeProvider } from "next-themes";

import { BottomNav } from "@/components/layout/bottom-nav";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/sonner";
import { JsonLd } from "@/components/shared/json-ld";
import { SearchDialog } from "@/components/shared/search-dialog";
import { brand } from "@/config/brand";
import { organizationJsonLd, webSiteJsonLd } from "@/lib/jsonld";

/* ── سئوی سراسری ── */
export const metadata: Metadata = {
  metadataBase: new URL(brand.domain),
  title: {
    default: brand.meta.defaultTitle,
    template: brand.meta.titleTemplate,
  },
  description: brand.meta.defaultDescription,
  applicationName: brand.name,
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
    brand.name,
  ],
  authors: [{ name: brand.name, url: brand.domain }],
  creator: brand.name,
  publisher: brand.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: brand.domain,
    siteName: brand.name,
    title: brand.meta.defaultTitle,
    description: brand.meta.defaultDescription,
    images: [
      {
        url: brand.meta.ogImage,
        width: 1200,
        height: 630,
        alt: brand.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: brand.meta.defaultTitle,
    description: brand.meta.defaultDescription,
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
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/logo.svg",
  },
  category: "shopping",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0b4634" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1511" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

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
          <div className="flex min-h-dvh flex-col">
            <Header />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
            {/* جاداده برای داک شناور موبایل — ارتفاع داک + حاشیه‌ها + ناحیهٔ امن */}
            <div
              className="h-[calc(5.75rem+env(safe-area-inset-bottom))] md:hidden"
              aria-hidden="true"
            />
          </div>
          <BottomNav />
          <SearchDialog />
          <Toaster position="top-center" dir="rtl" richColors closeButton />
        </ThemeProvider>
        {/* سئوی ساختاریافته — سراسری */}
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={webSiteJsonLd()} />
      </body>
    </html>
  );
}
