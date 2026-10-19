/**
 * رندر JSON-LD — تگ اسکریپت استاندارد سئوی ساختاریافته
 * ─────────────────────────────
 * Server Component؛ مصرف: <JsonLd data={productJsonLd(...)} />
 */

interface JsonLdProps {
  data: Record<string, unknown> | Readonly<Record<string, unknown>>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // آبجکت‌های JSON-LD امن‌اند — خروجی JSON.stringify است
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
