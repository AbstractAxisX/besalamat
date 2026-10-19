/**
 * مانیفست PWA — نام و رنگ برند
 * ─────────────────────────────
 */

import type { MetadataRoute } from "next";

import { brand } from "@/config/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${brand.name} | فروشگاه تخصصی لوازم پزشکی`,
    short_name: brand.name,
    description: brand.meta.defaultDescription,
    start_url: "/",
    display: "standalone",
    dir: "rtl",
    lang: "fa-IR",
    background_color: "#f6faf7",
    theme_color: "#0b4634",
    icons: [
      {
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
