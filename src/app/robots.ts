/**
 * robots.txt — مسیرهای عمومی باز، مسیرهای خصوصی بسته
 * ─────────────────────────────
 */

import type { MetadataRoute } from "next";

import { brand } from "@/config/brand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/account", "/checkout", "/cart", "/login", "/payment", "/api/"],
      },
    ],
    sitemap: `${brand.domain}/sitemap.xml`,
  };
}
