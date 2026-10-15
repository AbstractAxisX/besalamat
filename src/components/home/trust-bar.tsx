/**
 * نوار اعتماد — چهار مزیت فروشگاه، چسبیده به زیر هیرو
 * ─────────────────────────────
 * Server Component؛ موبایل ۲ ستون، دسکتاپ ۴ ستون — ساده و بی‌جداکننده.
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
    icon: Truck,
    title: "ارسال سریع و مطمئن",
    description: "به سراسر کشور",
  },
  {
    icon: ShieldCheck,
    title: "ضمانت اصالت کالا",
    description: "کالای اورجینال با فاکتور",
  },
  {
    icon: Headset,
    title: "پشتیبانی تخصصی",
    description: "همراهِ انتخاب شما",
  },
  {
    icon: LockKeyhole,
    title: "پرداخت امن",
    description: "درگاه پرداخت معتبر",
  },
];

export function TrustBar() {
  return (
    <section className="border-b border-border/60 bg-card" aria-label="مزیت‌های فروشگاه">
      <div className="shell grid grid-cols-2 gap-6 py-8 lg:grid-cols-4">
        {TRUST_ITEMS.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gold-soft/40 text-gold-strong dark:bg-gold-soft/15 dark:text-gold">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground">{title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
