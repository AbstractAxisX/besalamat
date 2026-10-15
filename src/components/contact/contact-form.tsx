"use client";

/**
 * فرم تماس — RHF + zod با پیام‌های خطای فارسی
 * ─────────────────────────────
 * فعلاً ثبت لوکال موفق است؛ اتصال به API در فاز ۵ انجام می‌شود.
 */

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { normalizePhone } from "@/lib/format";

/* گزینه‌های موضوع پیام */
const SUBJECT_VALUES = [
  "orders",
  "product",
  "support",
  "cooperation",
  "other",
] as const;
type SubjectValue = (typeof SUBJECT_VALUES)[number];

const SUBJECT_LABELS: Record<SubjectValue, string> = {
  orders: "سفارش‌ها",
  product: "مشاورهٔ محصول",
  support: "پشتیبانی",
  cooperation: "همکاری",
  other: "سایر",
};

const contactSchema = z.object({
  name: z.string().min(2, "نام را وارد کنید"),
  mobile: z
    .string()
    .refine((value) => normalizePhone(value) !== null, {
      message: "شمارهٔ موبایل معتبر نیست",
    }),
  subject: z.enum(SUBJECT_VALUES),
  message: z.string().min(10, "پیام خود را کامل بنویسید"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const DEFAULT_VALUES: ContactFormValues = {
  name: "",
  mobile: "",
  subject: "orders",
  message: "",
};

/** پیام خطای فارسی زیر فیلد */
function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-xs text-destructive">
      {message}
    </p>
  );
}

export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: DEFAULT_VALUES,
  });

  async function onSubmit() {
    // TODO(فاز ۵): POST /api/contact + ثبت در ContactMessage + ایمیل تأیید
    await new Promise((resolve) => setTimeout(resolve, 700));
    toast.success("پیام شما ثبت شد؛ کارشناسان ما به‌زودی پاسخ می‌دهند");
    reset(DEFAULT_VALUES);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* نام */}
      <div className="space-y-2">
        <Label htmlFor="contact-name">نام و نام خانوادگی</Label>
        <Input
          id="contact-name"
          autoComplete="name"
          placeholder="مثلاً سارا محمدی"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
          className="h-11"
          {...register("name")}
        />
        <FieldError id="contact-name-error" message={errors.name?.message} />
      </div>

      {/* موبایل */}
      <div className="space-y-2">
        <Label htmlFor="contact-mobile">شمارهٔ موبایل</Label>
        <Input
          id="contact-mobile"
          type="tel"
          inputMode="tel"
          dir="ltr"
          autoComplete="tel"
          placeholder="۰۹۱۲ ۳۴۵ ۶۷۸۹"
          aria-invalid={errors.mobile ? true : undefined}
          aria-describedby={errors.mobile ? "contact-mobile-error" : undefined}
          className="h-11"
          {...register("mobile")}
        />
        <FieldError id="contact-mobile-error" message={errors.mobile?.message} />
      </div>

      {/* موضوع */}
      <div className="space-y-2">
        <Label htmlFor="contact-subject">موضوع پیام</Label>
        <Controller
          control={control}
          name="subject"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                id="contact-subject"
                aria-invalid={errors.subject ? true : undefined}
                aria-describedby={
                  errors.subject ? "contact-subject-error" : undefined
                }
                className="h-11 w-full"
              >
                <SelectValue placeholder="موضوع را انتخاب کنید" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECT_VALUES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {SUBJECT_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FieldError
          id="contact-subject-error"
          message={errors.subject?.message}
        />
      </div>

      {/* پیام */}
      <div className="space-y-2">
        <Label htmlFor="contact-message">متن پیام</Label>
        <Textarea
          id="contact-message"
          rows={5}
          placeholder="پیام خود را بنویسید…"
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className="min-h-32 resize-y"
          {...register("message")}
        />
        <FieldError
          id="contact-message-error"
          message={errors.message?.message}
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className="btn-metallic h-12 w-full px-10 md:w-auto"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            در حال ارسال…
          </>
        ) : (
          "ارسال پیام"
        )}
      </Button>
    </form>
  );
}
