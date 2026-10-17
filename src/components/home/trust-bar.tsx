/**
 * نوار اعتماد — چهار مزیت، چسبیده به زیر هیرو
 * ─────────────────────────────
 * Server Component؛ ردیف ظریف با جداکننده‌های عمودی مویین در دسکتاپ.
 */

import {
  Headset,
  LockKeyhole,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from "lucide-react";

interface TrustItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

const TRUST_ITEMS: TrustItem[] = [
  {
    icon: ShieldCheck,
    title: "ضمانت اصالت کالا",
    description: "کالای اورجینال با فاکتور رسمی",
  },
  {
    icon: Truck,
    title: "ارسال سریع",
    description: "به سراسر کشور، همان‌روز در تهران",
  },
  {
    icon: Headset,
    title: "مشاورهٔ تخصصی",
    description: "کارشناس واقعی، قبل از خرید",
  },
  {
    icon: LockKeyhole,
    title: "پرداخت امن",
    description: "درگاه رسمی و رمزنگاری‌شده",
  },
];

export function TrustBar() {
  return (
    <section
      className="border-b border-border/70 bg-background"
      aria-label="مزیت‌های فروشگاه"
    >
      <div className="shell grid grid-cols-2 gap-x-4 gap-y-6 py-7 lg:grid-cols-4 lg:divide-x lg:divide-x-reverse lg:divide-border/70">
        {TRUST_ITEMS.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="flex items-center gap-3 lg:justify-center"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-gold/25 bg-gold-soft/20 text-gold-strong dark:bg-gold-soft/10 dark:text-gold">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-foreground">{title}</p>
              <p className="mt-0.5 text-[11px] leading-5 text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
