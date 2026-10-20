"use client";

/**
 * تنظیمات فروشگاه — فرم بخش‌بندی‌شده + نوار ذخیرهٔ چسبان
 * ─────────────────────────────
 * کلیدهای store.* از GET /api/admin/settings (overlay تایپ‌شده) پر
 * می‌شوند و همه با یک PUT ذخیره می‌شوند؛ سرور پس از ذخیره کش را
 * بی‌اعتبار و صفحات عمومی را revalidate می‌کند.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  IconBrandTelegram,
  IconBuildingStore,
  IconChevronDown,
  IconClock,
  IconDeviceFloppy,
  IconInfoCircle,
  IconMapPin,
  IconPhone,
  IconSettings,
  IconShare,
  IconTrash,
  IconWorldWww,
} from "@tabler/icons-react";

import { toFa } from "@/lib/format";
import { brand } from "@/config/brand";
import { apiFetch, apiSend } from "@/components/admin/api";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { AdminSettingsResponse } from "@/types/admin";

interface SettingsViewProps {
  /** متن بخش «استقرار روی ورسل» از README.md (سمت سرور خوانده شده) */
  deploymentNotes: string | null;
}

interface SettingsForm {
  name: string;
  tagline: string;
  aboutShort: string;
  phone: string;
  email: string;
  address: string;
  mapEmbedUrl: string;
  hours: { days: string; time: string }[];
  /** کلید شبکه → نشانی ("" = مخفی) — توییتر هم داخل همین رکورد است */
  socials: Record<string, string>;
  shippingNote: string;
}

const SOCIAL_ORDER = ["instagram", "telegram", "whatsapp", "twitter", "bale", "eitaa", "rubika"] as const;

const SOCIAL_LABELS: Record<string, string> = {
  instagram: "اینستاگرام",
  telegram: "تلگرام",
  whatsapp: "واتساپ",
  twitter: "توییتر (X)",
  bale: "بله",
  eitaa: "ایتا",
  rubika: "روبیکا",
};

/** قالب بخش‌های فرم — هم‌سان با ویرایشگرهای محصول/مقاله (سربرگ آیکون‌دار + توضیح) */
function FormSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xs">
      <header className="border-b border-border/50 bg-muted/40 px-5 py-3.5">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-sm font-bold">
            <span className="text-muted-foreground" aria-hidden="true">
              {icon}
            </span>
            {title}
          </h2>
          {description ? (
            <p className="mt-0.5 ps-6.5 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </header>
      <div className="space-y-5 p-5">{children}</div>
    </section>
  );
}

export function SettingsView({ deploymentNotes }: SettingsViewProps) {
  const [form, setForm] = useState<SettingsForm | null>(null);
  const [original, setOriginal] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    apiFetch<AdminSettingsResponse>("/api/admin/settings")
      .then((response) => {
        if (!active) return;
        const socials: Record<string, string> = {};
        for (const social of response.store.socials) {
          socials[social.key] = social.defaultHref;
        }
        /* توییتر جزو socials رندر فوتر نیست؛ کلید مستقلش را هم می‌گیریم */
        socials.twitter = response.store.twitter;
        const next: SettingsForm = {
          name: response.store.name,
          tagline: response.store.tagline,
          aboutShort: response.store.aboutShort,
          phone: response.store.phone,
          email: response.store.email,
          address: response.store.address,
          mapEmbedUrl: response.store.mapEmbedUrl,
          hours: response.store.hours.map((entry) => ({ ...entry })),
          socials,
          shippingNote: response.store.shippingNote,
        };
        setForm(next);
        setOriginal(JSON.stringify(next));
      })
      .catch((error: unknown) => {
        if (active) setLoadError(error instanceof Error ? error.message : "بارگذاری تنظیمات ناموفق بود");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const dirty = form !== null && JSON.stringify(form) !== original;

  const patch = useCallback((changes: Partial<SettingsForm>): void => {
    setForm((current) => (current === null ? current : { ...current, ...changes }));
  }, []);

  const save = useCallback(async (): Promise<void> => {
    if (form === null || !dirty) return;
    setSaving(true);
    try {
      /* ساعات خالی از فهرست حذف می‌شوند */
      const hours = form.hours
        .map((entry) => ({ days: entry.days.trim(), time: entry.time.trim() }))
        .filter((entry) => entry.days.length > 0 && entry.time.length > 0);

      const body: Record<string, unknown> = {
        "store.name": form.name.trim(),
        "store.tagline": form.tagline.trim(),
        "store.aboutShort": form.aboutShort.trim(),
        "store.phone": form.phone.trim(),
        "store.email": form.email.trim(),
        "store.address": form.address.trim(),
        "store.mapEmbedUrl": form.mapEmbedUrl.trim(),
        "store.hours": hours,
        "store.shippingNote": form.shippingNote.trim(),
      };
      for (const key of SOCIAL_ORDER) {
        body[`store.${key}`] = (form.socials[key] ?? "").trim();
      }

      await apiSend("/api/admin/settings", "PUT", body);
      const snapshot: SettingsForm = {
        ...form,
        hours,
        socials: { ...form.socials },
      };
      setOriginal(JSON.stringify(snapshot));
      setForm(snapshot);
      toast.success("تنظیمات ذخیره شد و در سایت اعمال شد");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ذخیرهٔ تنظیمات ناموفق بود");
    } finally {
      setSaving(false);
    }
  }, [form, dirty]);

  /* سطر ساعت کاری */
  const hoursEditor = useMemo(() => {
    if (form === null) return null;
    return (
      <div className="space-y-2">
        {form.hours.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={entry.days}
              onChange={(event) => {
                const next = [...form.hours];
                next[index] = { ...next[index], days: event.target.value };
                patch({ hours: next });
              }}
              placeholder="شنبه تا چهارشنبه"
              aria-label={`روزهای سطر ${toFa(index + 1)}`}
              className="flex-1"
            />
            <Input
              value={entry.time}
              onChange={(event) => {
                const next = [...form.hours];
                next[index] = { ...next[index], time: event.target.value };
                patch({ hours: next });
              }}
              placeholder="۹ الی ۱۸"
              aria-label={`ساعات سطر ${toFa(index + 1)}`}
              className="w-32 shrink-0"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => patch({ hours: form.hours.filter((_, i) => i !== index) })}
              aria-label={`حذف سطر ساعت ${toFa(index + 1)}`}
            >
              <IconTrash className="size-4" stroke={1.75} aria-hidden="true" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => patch({ hours: [...form.hours, { days: "", time: "" }] })}
        >
          افزودن سطر ساعت کاری
        </Button>
      </div>
    );
  }, [form, patch]);

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-52 w-full rounded-2xl" />
      </div>
    );
  }

  if (loadError !== null || form === null) {
    return (
      <div className="space-y-6">
        <PageHeader title="تنظیمات" description="تنظیمات فروشگاه" />
        <p className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {loadError ?? "تنظیمات در دسترس نیست."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="تنظیمات فروشگاه"
        description="این مقادیر بلافاصله پس از ذخیره در سراسر سایت (هدر، فوتر، تماس و سبد) اعمال می‌شوند"
      />

      {/* کارت اطلاع OTP دمو + یادداشت استقرار */}
      <section className="rounded-xl border border-warning/30 bg-warning/5 p-4">
        <div className="flex items-start gap-3">
          <IconInfoCircle className="mt-0.5 size-5 shrink-0 text-warning" stroke={1.75} aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-6">
              کد ورود دمو (OTP): <span className="font-mono font-bold">۱۲۳۴۵</span>
            </p>
            <p className="mt-0.5 text-xs leading-6 text-muted-foreground">
              تا زمان اتصال درگاه پیامک واقعی، همهٔ ورودها با همین کد انجام می‌شوند. مقدار کد با متغیر
              محیطی <span dir="ltr" className="font-mono">OTP_DEMO_CODE</span> و روشن/خاموشی آن با
              <span dir="ltr" className="font-mono"> OTP_DEMO_MODE=false</span> در فایل
              <span dir="ltr" className="font-mono"> .env</span> قابل تغییر است.
            </p>
            {deploymentNotes !== null ? (
              <Collapsible className="mt-2">
                <CollapsibleTrigger className="flex items-center gap-1.5 text-xs font-bold text-primary">
                  یادداشت استقرار (README.md — بخش ورسل)
                  <IconChevronDown
                    className="size-3.5 transition-transform [[data-state=open]>&]:rotate-180"
                    stroke={1.75}
                    aria-hidden="true"
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <pre className="mt-2 max-h-72 overflow-y-auto whitespace-pre-wrap rounded-lg border bg-card p-3 text-[11px] leading-6 text-muted-foreground">
                    {deploymentNotes}
                  </pre>
                </CollapsibleContent>
              </Collapsible>
            ) : null}
          </div>
        </div>
      </section>

      {/* اطلاعات فروشگاه */}
      <FormSection
        icon={<IconBuildingStore className="size-4.5" stroke={1.75} />}
        title="اطلاعات فروشگاه"
        description="نام، شعار و معرفی — در هدر، فوتر و تب‌های مرورگر"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="store-name" className="text-xs font-semibold">
              نام فروشگاه
            </Label>
            <Input
              id="store-name"
              value={form.name}
              onChange={(event) => patch({ name: event.target.value })}
              placeholder={brand.name}
            />
            <p className="text-xs text-muted-foreground">در هدر، فوتر و عنوان تب‌ها نمایش داده می‌شود</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="store-tagline" className="text-xs font-semibold">
              شعار (تگ‌لاین)
            </Label>
            <Input
              id="store-tagline"
              value={form.tagline}
              onChange={(event) => patch({ tagline: event.target.value })}
              placeholder={brand.tagline}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="store-about" className="text-xs font-semibold">
            معرفی کوتاه
          </Label>
          <Textarea
            id="store-about"
            rows={3}
            value={form.aboutShort}
            onChange={(event) => patch({ aboutShort: event.target.value })}
            placeholder={brand.description}
          />
          <p className="text-xs text-muted-foreground">
            خالی بماند = متن پیش‌فرض برند؛ در بخش «دربارهٔ فروشگاه» صفحهٔ اصلی و فوتر استفاده می‌شود
          </p>
        </div>
      </FormSection>

      {/* اطلاعات تماس */}
      <FormSection
        icon={<IconPhone className="size-4.5" stroke={1.75} />}
        title="اطلاعات تماس"
        description="تلفن، رایانامه، نشانی، ساعات کاری و نقشه"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="store-phone" className="text-xs font-semibold">
              تلفن فروشگاه
            </Label>
            <Input
              id="store-phone"
              dir="ltr"
              className="text-start"
              value={form.phone}
              onChange={(event) => patch({ phone: event.target.value })}
              placeholder={brand.contact.phone}
            />
            <p className="text-xs text-muted-foreground">در فوتر و صفحهٔ تماس نمایش داده می‌شود</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="store-email" className="text-xs font-semibold">
              رایانامه
            </Label>
            <Input
              id="store-email"
              dir="ltr"
              className="text-start"
              value={form.email}
              onChange={(event) => patch({ email: event.target.value })}
              placeholder={brand.contact.email}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="store-address" className="text-xs font-semibold">
            نشانی
          </Label>
          <Textarea
            id="store-address"
            rows={2}
            value={form.address}
            onChange={(event) => patch({ address: event.target.value })}
            placeholder={brand.contact.address}
          />
        </div>

        {/* ساعت‌های کاری */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-semibold">
            <IconClock className="size-4 text-muted-foreground" stroke={1.75} aria-hidden="true" />
            ساعات کاری
          </Label>
          {hoursEditor}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="store-map" className="flex items-center gap-1.5 text-xs font-semibold">
            <IconMapPin className="size-4 text-muted-foreground" stroke={1.75} aria-hidden="true" />
            نشانی iframe نقشه
          </Label>
          <Textarea
            id="store-map"
            dir="ltr"
            rows={2}
            className="text-start font-mono text-xs"
            value={form.mapEmbedUrl}
            onChange={(event) => patch({ mapEmbedUrl: event.target.value })}
            placeholder={brand.contact.mapEmbedUrl}
          />
          <p className="text-xs leading-5 text-muted-foreground">
            کد embed گوگل‌مپ یا نشان؛ فقط نشانی iframe (src) را بگذارید. در بخش «دربارهٔ فروشگاه» و صفحهٔ
            تماس نمایش داده می‌شود.
          </p>
        </div>
      </FormSection>

      {/* شبکه‌های اجتماعی */}
      <FormSection
        icon={<IconShare className="size-4.5" stroke={1.75} />}
        title="شبکه‌های اجتماعی"
        description="نشانی کامل وارد کنید؛ مقدار خالی یعنی مخفی"
      >
        <p className="text-xs leading-6 text-muted-foreground">
          نشانی کامل (مثل <span dir="ltr" className="font-mono">https://t.me/besalamat</span>) وارد کنید؛
          مقدار خالی یعنی آن شبکه در فوتر مخفی می‌شود.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          {SOCIAL_ORDER.map((key) => (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={`social-${key}`} className="flex items-center gap-1.5 text-xs font-semibold">
                {key === "telegram" ? (
                  <IconBrandTelegram className="size-4 text-muted-foreground" stroke={1.75} aria-hidden="true" />
                ) : (
                  <IconWorldWww className="size-4 text-muted-foreground" stroke={1.75} aria-hidden="true" />
                )}
                {SOCIAL_LABELS[key]}
              </Label>
              <Input
                id={`social-${key}`}
                dir="ltr"
                className="text-start"
                value={form.socials[key] ?? ""}
                onChange={(event) =>
                  patch({ socials: { ...form.socials, [key]: event.target.value } })
                }
                placeholder="https://…"
              />
            </div>
          ))}
        </div>
      </FormSection>

      {/* سایر */}
      <FormSection
        icon={<IconSettings className="size-4.5" stroke={1.75} />}
        title="سایر"
        description="یادداشت ارسال برای مشتری در سبد خرید"
      >
        <div className="space-y-1.5">
          <Label htmlFor="store-shipping" className="text-xs font-semibold">
            یادداشت ارسال
          </Label>
          <Textarea
            id="store-shipping"
            rows={3}
            value={form.shippingNote}
            onChange={(event) => patch({ shippingNote: event.target.value })}
            placeholder="مثلاً: ارسال به سراسر کشور؛ سفارش‌های بالای ۲ میلیون تومان رایگان است."
          />
          <p className="text-xs text-muted-foreground">
            خالی بماند = متن پیش‌فرض؛ در فرایند سبد خرید و تسویه به مشتری نمایش داده می‌شود
          </p>
        </div>
      </FormSection>

      {/* نوار ذخیرهٔ چسبان — هم‌سان با ویرایشگرها */}
      <div className="sticky bottom-0 z-20 -mx-4 border-t border-border/60 bg-card/95 px-4 py-3 backdrop-blur-sm md:-mx-8 md:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-muted-foreground">
            {dirty
              ? "تغییرات ذخیره نشده است."
              : "مقادیر خالی هر بخش به پیش‌فرض برند برمی‌گردند."}
          </p>
          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!dirty || saving}
              onClick={() => {
                const restored = JSON.parse(original) as SettingsForm;
                setForm(restored);
              }}
            >
              بازنشانی
            </Button>
            <Button type="button" size="sm" className="gap-1.5 font-semibold" disabled={!dirty || saving} onClick={() => void save()}>
              <IconDeviceFloppy className="size-4" stroke={1.75} aria-hidden="true" />
              {saving ? "در حال ذخیره…" : "ذخیرهٔ تنظیمات"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
