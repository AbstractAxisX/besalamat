"use client";

/**
 * ورود | ثبت‌نام — OTP واقعی دو استپی (متصل به /api/auth)
 * ─────────────────────────────────────────────────
 * استپ ۱ شمارهٔ موبایل → استپ ۲ کد ۵ رقمی با تایمر ۱۲۰ ثانیه‌ای.
 * اگر کاربر از قبل لاگین باشد → /account. مقصد پس از ورود از
 * پارامتر next (یا admin=1 → /admin) خوانده می‌شود.
 */

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/shared/brand-assets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPhoneFa, normalizePhone, toEnDigits, toFa } from "@/lib/format";

/* ── ابزارک خواندن امن پاسخ JSON (بدون any) ── */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(source: unknown, key: string): string | undefined {
  if (!isRecord(source)) return undefined;
  const value = source[key];
  return typeof value === "string" ? value : undefined;
}

function readNumber(source: unknown, key: string): number | undefined {
  if (!isRecord(source)) return undefined;
  const value = source[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

type LoginStep = "phone" | "code";

/* ── اسکلت هم‌اندازهٔ کارت (حین بررسی سشن / ساسپنس) ── */
function LoginSkeleton() {
  return (
    <div className="shell mx-auto max-w-md py-14 md:py-20">
      <div className="card-luxe p-8">
        <Skeleton className="mx-auto size-10 rounded-full" />
        <Skeleton className="mx-auto mt-6 h-6 w-32" />
        <Skeleton className="mx-auto mt-3 h-4 w-44" />
        <Skeleton className="mt-8 h-12 w-full rounded-xl" />
        <Skeleton className="mt-4 h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"checking" | "anonymous">("checking");
  const [step, setStep] = useState<LoginStep>("phone");
  const [phoneInput, setPhoneInput] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(false);

  /* مقصد پس از ورود — فقط مسیر داخلی (پرهیز از open redirect) */
  const nextParam = searchParams.get("next");
  const isAdminFlow = searchParams.get("admin") === "1";
  const destination =
    nextParam != null && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : isAdminFlow
        ? "/admin"
        : "/account";

  /* اگر از قبل لاگین است → حساب کاربری */
  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then((res) => {
        if (!active) return;
        if (res.ok) {
          router.replace("/account");
        } else {
          setStatus("anonymous");
        }
      })
      .catch(() => {
        if (active) setStatus("anonymous");
      });
    return () => {
      active = false;
    };
  }, [router]);

  /* تایمر شمارش معکوس کد — فقط در استپ دوم */
  useEffect(() => {
    if (step !== "code") return;
    const timer = setInterval(() => {
      setSeconds((current) => Math.max(0, current - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  /* استپ ۱ → درخواست کد */
  async function requestCode(rawPhone: string): Promise<void> {
    const normalized = normalizePhone(rawPhone);
    if (normalized === null) {
      toast.error("شمارهٔ موبایل معتبر نیست. نمونهٔ صحیح: ۰۹۱۲۳۴۵۶۷۸۹");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          phone: normalized,
          purpose: isAdminFlow ? "ADMIN" : "LOGIN",
        }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(
          readString(data, "message") ??
            "درخواست کد ناموفق بود؛ لطفاً دوباره تلاش کنید",
        );
        return;
      }
      const expires = readNumber(data, "expiresInSeconds") ?? 120;
      setPhone(normalized);
      setCode("");
      setDevCode(readString(data, "devCode") ?? null);
      setSeconds(expires > 0 ? expires : 120);
      setStep("code");
      toast.success(readString(data, "message") ?? "کد تأیید پیامک شد");
    } catch {
      toast.error("ارتباط با سرور برقرار نشد؛ اتصال اینترنت را بررسی کنید");
    } finally {
      setLoading(false);
    }
  }

  /* استپ ۲ → تأیید کد و ورود */
  async function verifyCode(): Promise<void> {
    const normalizedCode = toEnDigits(code).replace(/\D/g, "");
    if (normalizedCode.length !== 5 || phone === "") return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          phone,
          code: normalizedCode,
          purpose: isAdminFlow ? "ADMIN" : "LOGIN",
        }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(
          readString(data, "message") ??
            "تأیید کد ناموفق بود؛ لطفاً دوباره تلاش کنید",
        );
        return;
      }
      toast.success("خوش آمدید");
      router.push(destination);
    } catch {
      toast.error("ارتباط با سرور برقرار نشد؛ اتصال اینترنت را بررسی کنید");
    } finally {
      setLoading(false);
    }
  }

  /* حین بررسی سشن — اسکلت بدون فلش فرم */
  if (status === "checking") {
    return <LoginSkeleton />;
  }

  return (
    <div className="shell mx-auto max-w-md py-14 md:py-20">
      <div className="card-luxe p-8">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h1 className="mt-6 text-center text-xl font-black">ورود | ثبت‌نام</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          {step === "phone"
            ? "شمارهٔ موبایل خود را وارد کنید"
            : "کد پیامک‌شده را وارد کنید"}
        </p>

        {step === "phone" ? (
          /* ── استپ ۱ — شمارهٔ موبایل ── */
          <form
            className="mt-6"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              void requestCode(phoneInput);
            }}
          >
            <label htmlFor="login-phone" className="sr-only">
              شمارهٔ موبایل
            </label>
            <Input
              id="login-phone"
              dir="ltr"
              inputMode="tel"
              autoComplete="tel"
              className="h-12 text-center text-lg tracking-widest"
              placeholder="۰۹۱۲ ۳۴۵ ۶۷۸۹"
              value={phoneInput}
              onChange={(event) => setPhoneInput(event.target.value)}
              autoFocus
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={loading}
              className="btn-metallic mt-4 h-12 w-full rounded-xl text-base font-bold"
            >
              {loading ? (
                <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              ) : (
                "دریافت کد تأیید"
              )}
            </Button>
          </form>
        ) : (
          /* ── استپ ۲ — کد تأیید ── */
          <div className="mt-6">
            <p className="text-center text-sm leading-7 text-muted-foreground">
              کد تأیید به شمارهٔ{" "}
              <span dir="ltr" className="font-semibold text-foreground">
                {formatPhoneFa(phone)}
              </span>{" "}
              پیامک شد
            </p>

            <div dir="ltr" className="mt-5 flex justify-center">
              <InputOTP
                maxLength={5}
                value={code}
                onChange={setCode}
                autoFocus
                disabled={loading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="size-11 text-base" />
                  <InputOTPSlot index={1} className="size-11 text-base" />
                  <InputOTPSlot index={2} className="size-11 text-base" />
                  <InputOTPSlot index={3} className="size-11 text-base" />
                  <InputOTPSlot index={4} className="size-11 text-base" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {/* تایمر / ارسال مجدد */}
            <div className="mt-4 flex h-9 items-center justify-center">
              {seconds > 0 ? (
                <p className="text-xs text-muted-foreground">
                  ارسال مجدد کد تا {toFa(seconds)} ثانیه دیگر
                </p>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 font-medium text-gold hover:text-gold-strong"
                  onClick={() => void requestCode(phone)}
                >
                  ارسال مجدد کد
                </Button>
              )}
            </div>

            {/* کد توسعه — فقط وقتی سرور devCode برگرداند */}
            {devCode !== null ? (
              <p className="mt-2 rounded-xl bg-warning/10 p-3 text-center text-sm text-warning">
                حالت توسعه: کد شما {toFa(devCode)}
              </p>
            ) : null}

            <Button
              type="button"
              disabled={code.length !== 5 || loading}
              className="btn-metallic mt-4 h-12 w-full rounded-xl text-base font-bold"
              onClick={() => void verifyCode()}
            >
              {loading ? (
                <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              ) : (
                "تأیید و ورود"
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="mt-2 h-9 w-full text-muted-foreground"
              onClick={() => {
                setStep("phone");
                setCode("");
                setDevCode(null);
                setSeconds(0);
              }}
            >
              اصلاح شماره
            </Button>
          </div>
        )}

        <p className="mt-6 text-center text-xs leading-6 text-muted-foreground">
          با ورود،{" "}
          <Link href="/" className="text-gold hover:text-gold-strong">
            قوانین فروشگاه
          </Link>{" "}
          را می‌پذیرید.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginContent />
    </Suspense>
  );
}
