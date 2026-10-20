"use client";

/**
 * تسویهٔ تک‌صفحه‌ای — فرم سه‌بخشی + خلاصهٔ چسبان
 * ─────────────────────────────────────────────────
 * سبد با الگوی hydration هدر خوانده می‌شود؛ اعتبارسنجی RHF + zod.
 * روش ارسال حضوری، بخش آدرس را آنی جمع می‌کند (بدون الزام فرم).
 * ثبت سفارش واقعی: POST /api/orders (سشن الزامی) → شبیه‌سازی پرداخت
 * در /payment/result با شمارهٔ سفارش واقعی؛ سبد پس از موفقیت خالی می‌شود.
 */

import { useSyncExternalStore, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck, ShoppingBag, Store, Truck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { brand } from "@/config/brand";
import { formatTomanPlain, normalizePhone, toEnDigits, toFa } from "@/lib/format";
import { IRAN_PROVINCES, PROVINCE_NAMES } from "@/lib/provinces";
import { cn } from "@/lib/utils";
import { cartSubtotal, useCartStore } from "@/store/cart";

/* الگوی mounted — همان قرارداد header.tsx */
const emptySubscribe = () => () => {};

function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

/* ── هزینهٔ ارسال (تومان) ── */
// فاز ۴: از تنظیمات (Setting: shipping.cost) خوانده می‌شود
const SHIPPING_COST = brand.shipping.flatRate;

type ShippingMethod = "post" | "pickup";

const SHIPPING_METHODS: {
  value: ShippingMethod;
  label: string;
  description: string;
  icon: typeof Truck;
}[] = [
  {
    value: "post",
    label: "پست پیشتاز",
    description: "تحویل ۲ تا ۴ روز کاری — هزینهٔ ثابت ۴۵٬۰۰۰ تومان",
    icon: Truck,
  },
  {
    value: "pickup",
    label: "تحویل حضوری از فروشگاه",
    description: "رایگان — دریافت حضوری در ساعات کاری",
    icon: Store,
  },
];

/* ── اعتبارسنجی ── */
const checkoutSchema = z
  .object({
    fullName: z.string().trim().min(2, { message: "نام را کامل وارد کنید" }),
    phone: z
      .string()
      .refine((value) => normalizePhone(value) !== null, {
        message: "شمارهٔ موبایل معتبر نیست",
      }),
    province: z.string(),
    city: z.string(),
    address: z.string(),
    postalCode: z.string(),
    shippingMethod: z.enum(["post", "pickup"]),
  })
  .superRefine((data, ctx) => {
    // تحویل حضوری: آدرس لازم نیست
    if (data.shippingMethod === "pickup") return;

    if (data.province.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["province"],
        message: "استان را انتخاب کنید",
      });
    }
    if (data.city.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["city"],
        message: "شهر را انتخاب کنید",
      });
    }
    if (data.address.trim().length < 10) {
      ctx.addIssue({
        code: "custom",
        path: ["address"],
        message: "نشانی کامل را وارد کنید",
      });
    }
    const postal = toEnDigits(data.postalCode).replace(/\D/g, "");
    if (postal.length > 0 && !/^\d{10}$/.test(postal)) {
      ctx.addIssue({
        code: "custom",
        path: ["postalCode"],
        message: "کد پستی باید ۱۰ رقم باشد",
      });
    }
  });

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

/* ── اجزای کوچک ── */
function SectionHeading({
  index,
  title,
}: {
  index: number;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "flex size-7 items-center justify-center rounded-full text-xs font-bold",
          "bg-gold-soft/40 text-gold-strong dark:bg-gold-soft/15 dark:text-gold",
        )}
        aria-hidden="true"
      >
        {toFa(index)}
      </span>
      <h2 className="font-bold">{title}</h2>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-xs text-destructive" role="alert">
      {message}
    </p>
  );
}

/* ── حالت خالی ── */
function EmptyCheckout() {
  return (
    <div className="card-luxe mx-auto flex max-w-md flex-col items-center px-6 py-16 text-center">
      <ShoppingBag
        className="mx-auto size-12 text-muted-foreground/40"
        aria-hidden="true"
      />
      <p className="mt-4 text-lg font-bold">سبد خرید شما خالی است</p>
      <p className="mt-1 text-sm text-muted-foreground">
        برای ثبت سفارش، ابتدا محصولی به سبد اضافه کنید
      </p>
      <div className="mt-8 flex flex-col gap-2 sm:flex-row">
        <Button
          asChild
          className="btn-metallic h-12 rounded-xl px-8 text-base font-bold"
        >
          <Link href="/products">رفتن به فروشگاه</Link>
        </Button>
        <Button asChild variant="ghost" className="h-12 rounded-xl px-8">
          <Link href="/cart">بازگشت به سبد خرید</Link>
        </Button>
      </div>
    </div>
  );
}

/* ── صفحه ── */
export default function CheckoutPage() {
  const router = useRouter();
  const mounted = useMounted();
  const lines = useCartStore((state) => state.lines);
  const clearCart = useCartStore((state) => state.clear);
  const hydratedLines = mounted ? lines : [];
  const isEmpty = mounted && hydratedLines.length === 0;

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      province: "",
      city: "",
      address: "",
      postalCode: "",
      shippingMethod: "post",
    },
  });

  /* useWatch — مشترک امن و سازگار با React Compiler (به‌جای watch) */
  const shippingMethod = useWatch({ control, name: "shippingMethod" });
  const province = useWatch({ control, name: "province" });
  const cities =
    IRAN_PROVINCES.find((row) => row.province === province)?.cities ?? [];

  const subtotal = cartSubtotal(hydratedLines);
  const shipping = shippingMethod === "pickup" ? 0 : SHIPPING_COST;
  const payable = subtotal + shipping;

  /* ثبت سفارش واقعی + شبیه‌سازی پرداخت:
     ۱) سشن الزامی است — ۴۰۱ → هدایت به ورود با بازگشت به تسویه.
     ۲) POST /api/orders با اقلام سبد (قیمت‌ها مرجع سرور دوباره خوانده می‌شوند).
     ۳) موفقیت → خالی‌کردن سبد + ادامهٔ شبیه‌سازی پرداخت در /payment/result. */
  const [submitting, setSubmitting] = useState(false);

  async function onValid(values: CheckoutFormValues): Promise<void> {
    if (submitting) return;

    /* ۱ — گارد سشن */
    try {
      const me = await fetch("/api/auth/me");
      if (me.status === 401) {
        toast.error("برای ثبت سفارش ابتدا وارد حساب خود شوید");
        router.replace("/login?next=/checkout");
        return;
      }
      if (!me.ok) throw new Error("me failed");
    } catch {
      toast.error("ارتباط با سرور برقرار نشد؛ دوباره تلاش کنید");
      return;
    }

    /* ۲ — ثبت سفارش */
    setSubmitting(true);
    try {
      const phone = normalizePhone(values.phone);
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: hydratedLines.map((line) => ({
            productId: line.productId,
            variantId: line.variantId,
            qty: line.qty,
          })),
          receiverName: values.fullName,
          receiverPhone: phone,
          province: values.province,
          city: values.city,
          addressLine: values.address,
          postalCode: values.postalCode,
          note: null,
          shippingMethod: values.shippingMethod === "pickup" ? "PICKUP" : "POST",
        }),
      });

      if (!res.ok) {
        const data: unknown = await res.json().catch(() => null);
        const message =
          typeof data === "object" &&
          data !== null &&
          typeof (data as Record<string, unknown>)["message"] === "string"
            ? ((data as Record<string, unknown>)["message"] as string)
            : "ثبت سفارش ناموفق بود؛ لطفاً دوباره تلاش کنید";
        toast.error(message);
        return;
      }

      const data: unknown = await res.json();
      const orderNumber =
        typeof data === "object" &&
        data !== null &&
        typeof (data as Record<string, unknown>)["orderNumber"] === "string"
          ? ((data as Record<string, unknown>)["orderNumber"] as string)
          : "";

      /* ۳ — موفقیت: خالی‌کردن سبد + شبیه‌سازی پرداخت */
      clearCart();
      toast.success("سفارش شما ثبت شد");
      router.push(
        orderNumber.length > 0
          ? `/payment/result?status=success&order=${encodeURIComponent(orderNumber)}`
          : "/payment/result?status=success",
      );
    } catch {
      toast.error("ارتباط با سرور برقرار نشد؛ دوباره تلاش کنید");
    } finally {
      setSubmitting(false);
    }
  }

  /* هیدریشن نشده → Skeleton */
  if (!mounted) {
    return (
      <div className="shell py-8 md:py-12">
        <Skeleton className="h-8 w-40" />
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-3">
          <div className="card-luxe space-y-6 p-6 lg:col-span-2 md:p-8">
            {[0, 1, 2].map((row) => (
              <div key={row} className="space-y-3">
                <Skeleton className="h-7 w-44" />
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-full" />
              </div>
            ))}
          </div>
          <div className="card-luxe space-y-4 p-6">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  /* سبد خالی → empty state (بدون ریدایرکت) */
  if (isEmpty) {
    return (
      <div className="shell py-8 md:py-12">
        <EmptyCheckout />
      </div>
    );
  }

  return (
    <div className="shell py-8 md:py-12">
      <header>
        <h1 className="text-2xl font-black">ثبت سفارش</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          اطلاعات ارسال را کامل کنید؛ پرداخت در همین صفحه انجام می‌شود
        </p>
      </header>

      <form
        onSubmit={handleSubmit(onValid)}
        noValidate
        className="mt-8 grid items-start gap-8 lg:grid-cols-3"
      >
        {/* فرم — دو ستون از سه */}
        <div className="card-luxe space-y-8 p-6 md:p-8 lg:col-span-2">
          {/* ۱ — اطلاعات تماس */}
          <section>
            <SectionHeading index={1} title="اطلاعات تماس" />
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="fullName" className="text-sm font-medium">
                  نام و نام خانوادگی
                </label>
                <Input
                  id="fullName"
                  className="mt-2 h-11"
                  placeholder="مثلاً سارا محمدی"
                  autoComplete="name"
                  aria-invalid={errors.fullName != null}
                  {...register("fullName")}
                />
                <FieldError message={errors.fullName?.message} />
              </div>
              <div>
                <label htmlFor="phone" className="text-sm font-medium">
                  شمارهٔ موبایل
                </label>
                <Input
                  id="phone"
                  dir="ltr"
                  inputMode="tel"
                  className="mt-2 h-11 text-center tracking-wide"
                  placeholder="۰۹۱۲ ۳۴۵ ۶۷۸۹"
                  autoComplete="tel"
                  aria-invalid={errors.phone != null}
                  {...register("phone")}
                />
                <FieldError message={errors.phone?.message} />
              </div>
            </div>

            {/* فاز ۴: OTP درجا با purpose=CHECKOUT */}
            <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-dashed border-input p-4">
              <ShieldCheck
                className="mt-0.5 size-4 shrink-0 text-gold"
                aria-hidden="true"
              />
              <p className="text-xs leading-6 text-muted-foreground">
                تأیید شمارهٔ موبایل هنگام پرداخت نهایی انجام می‌شود
              </p>
            </div>
          </section>

          <Separator />

          {/* ۲ — آدرس تحویل */}
          <section>
            <SectionHeading index={2} title="آدرس تحویل" />
            {shippingMethod === "pickup" ? (
              /* تحویل حضوری — آدرس فروشگاه به‌جای فرم */
              <div className="mt-5 rounded-xl border border-gold/30 bg-gold-soft/15 p-4 text-sm">
                <p className="flex items-center gap-2 font-semibold">
                  <Store className="size-4 text-gold" aria-hidden="true" />
                  دریافت حضوری از فروشگاه
                </p>
                <p className="mt-2 leading-7 text-muted-foreground">
                  {brand.contact.address}
                </p>
                <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
                  {brand.contact.hours
                    .map((entry) => `${entry.days}: ${entry.time}`)
                    .join(" • ")}
                </p>
              </div>
            ) : (
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="province" className="text-sm font-medium">
                    استان
                  </label>
                  <Controller
                    control={control}
                    name="province"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          setValue("city", "");
                        }}
                      >
                        <SelectTrigger
                          id="province"
                          className="mt-2 h-11 w-full"
                          aria-invalid={errors.province != null}
                        >
                          <SelectValue placeholder="انتخاب استان" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROVINCE_NAMES.map((name) => (
                            <SelectItem key={name} value={name}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError message={errors.province?.message} />
                </div>

                <div>
                  <label htmlFor="city" className="text-sm font-medium">
                    شهر
                  </label>
                  <Controller
                    control={control}
                    name="city"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={province.length === 0}
                      >
                        <SelectTrigger
                          id="city"
                          className="mt-2 h-11 w-full"
                          aria-invalid={errors.city != null}
                        >
                          <SelectValue
                            placeholder={
                              province.length === 0
                                ? "ابتدا استان را انتخاب کنید"
                                : "انتخاب شهر"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((name) => (
                            <SelectItem key={name} value={name}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError message={errors.city?.message} />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="address" className="text-sm font-medium">
                    نشانی کامل
                  </label>
                  <Textarea
                    id="address"
                    rows={3}
                    className="mt-2 min-h-24"
                    placeholder="خیابان، کوچه، پلاک، واحد…"
                    aria-invalid={errors.address != null}
                    {...register("address")}
                  />
                  <FieldError message={errors.address?.message} />
                </div>

                <div>
                  <label htmlFor="postalCode" className="text-sm font-medium">
                    کد پستی <span className="text-muted-foreground">(اختیاری)</span>
                  </label>
                  <Input
                    id="postalCode"
                    dir="ltr"
                    inputMode="numeric"
                    className="mt-2 h-11 text-center tracking-widest"
                    placeholder="۱۲۳۴۵۶۷۸۹۰"
                    aria-invalid={errors.postalCode != null}
                    {...register("postalCode")}
                  />
                  <FieldError message={errors.postalCode?.message} />
                </div>
              </div>
            )}
          </section>

          <Separator />

          {/* ۳ — روش ارسال */}
          <section>
            <SectionHeading index={3} title="روش ارسال" />
            <Controller
              control={control}
              name="shippingMethod"
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={(value) => field.onChange(value as ShippingMethod)}
                  className="mt-5 gap-3"
                >
                  {SHIPPING_METHODS.map((method) => {
                    const selected = field.value === method.value;
                    const Icon = method.icon;
                    return (
                      <label
                        key={method.value}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors",
                          selected
                            ? "border-gold bg-gold-soft/15"
                            : "border-input hover:border-gold/50",
                        )}
                      >
                        <RadioGroupItem
                          value={method.value}
                          className="border-gold/60"
                        />
                        <Icon
                          className={cn(
                            "size-5 shrink-0",
                            selected ? "text-gold" : "text-muted-foreground",
                          )}
                          aria-hidden="true"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold">
                            {method.label}
                          </span>
                          <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                            {method.description}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </RadioGroup>
              )}
            />
          </section>
        </div>

        {/* خلاصهٔ چسبان */}
        <aside className="lg:col-span-1">
          <div className="card-luxe sticky top-24 p-6">
            <h2 className="font-bold">خلاصهٔ سفارش</h2>

            <ul className="mt-4 space-y-4">
              {hydratedLines.map((line) => (
                <li
                  key={`${line.productId}::${line.variantId ?? "base"}`}
                  className="flex items-center gap-3"
                >
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-white">
                    <Image
                      src={line.image}
                      alt={line.title}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-medium">
                      {line.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatTomanPlain(line.unitPrice)} تومان × {toFa(line.qty)}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-primary">
                    {formatTomanPlain(line.qty * line.unitPrice)}
                  </p>
                </li>
              ))}
            </ul>

            <Separator className="my-5" />

            <dl className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">جمع کالاها</dt>
                <dd className="font-medium">
                  {formatTomanPlain(subtotal)}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    تومان
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">هزینهٔ ارسال</dt>
                <dd className="font-medium">
                  {shipping === 0 ? (
                    <span className="text-success">رایگان</span>
                  ) : (
                    <>
                      {formatTomanPlain(shipping)}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        تومان
                      </span>
                    </>
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-border/70 pt-3">
                <dt className="font-bold">مبلغ قابل پرداخت</dt>
                <dd className="font-black text-primary">
                  {formatTomanPlain(payable)}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    تومان
                  </span>
                </dd>
              </div>
            </dl>

            <Button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              className="btn-metallic mt-5 h-12 w-full rounded-xl text-base font-bold"
            >
              {submitting ? "در حال ثبت سفارش…" : "پرداخت و ثبت سفارش"}
            </Button>
          </div>
        </aside>
      </form>
    </div>
  );
}
