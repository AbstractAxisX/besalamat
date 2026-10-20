import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: false,
  images: {
    /** پلیس‌هولدرها و آپلودهای SVG خودمان (مطمئن) */
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  /**
   * استقرار روی ورسل — فایل SQLite باید داخل باندل لامبدا باشد.
   * بدون این خط، Node File Tracing فایل .db را دنبال نمی‌کند و در ران‌تایم
   * خطای «P1003: Database file does not exist» می‌گیرید.
   */
  outputFileTracingIncludes: {
    "/**": ["./db/**"],
  },
};

export default nextConfig;
