"use client";

/**
 * حساب کاربری — سایدبار + سه تب (سفارش‌ها / اطلاعات شخصی / دفترچه آدرس‌ها)
 * ─────────────────────────────────────────────────
 * سشن از /api/auth/me خوانده می‌شود؛ ۴۰۱ → ورود با next=/account.
 * دفترچهٔ آدرس‌ها با استور کوچک useSyncExternalStore روی localStorage
 * (کلید bs-addresses) پیاده شده — hydration-safe و بدون setState در effect.
 * سفارش‌ها فعلاً دادهٔ نمایشی فاز ۱ هستند (بج «نمایشی»).
 */

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LogOut,
  MapPin,
  Package,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { formatPhoneFa, formatToman, toEnDigits, toFa } from "@/lib/format";
import { faDateTime } from "@/lib/jalali";
import { PREVIEW_ORDERS, type PreviewOrder } from "@/lib/preview-orders";
import { IRAN_PROVINCES, PROVINCE_NAMES } from "@/lib/provinces";
import { cn } from "@/lib/utils";
import {
  ORDER_STATUS_LABELS,
  type OrderStatusDTO,
} from "@/types/shop";

/* ══════════════════════════ داده‌ها و ابزارها ══════════════════════════ */

interface MeUser {
  phone: string;
  fullName: string | null;
  email: string | null;
  role: "USER" | "ADMIN";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readMeUser(source: unknown): MeUser | null {
  if (!isRecord(source)) return null;
  const user = source["user"];
  if (!isRecord(user)) return null;
  const phone = user["phone"];
  if (typeof phone !== "string") return null;
  const fullName = user["fullName"];
  const email = user["email"];
  return {
    phone,
    fullName: typeof fullName === "string" && fullName.length > 0 ? fullName : null,
    email: typeof email === "string" && email.length > 0 ? email : null,
    role: user["role"] === "ADMIN" ? "ADMIN" : "USER",
  };
}

/** رنگ بج وضعیت سفارش — قرارداد مشترک با صفحهٔ جزئیات */
const STATUS_BADGE_CLASS: Record<OrderStatusDTO, string> = {
  PENDING_PAYMENT: "bg-warning/10 text-warning",
  PAID: "bg-success/10 text-success",
  PROCESSING: "bg-success/10 text-success",
  SHIPPED: "bg-gold-soft/40 text-gold-strong dark:bg-gold-soft/15 dark:text-gold",
  DELIVERED: "bg-primary/10 text-primary",
  CANCELED: "bg-destructive/10 text-destructive",
  RETURNED: "bg-destructive/10 text-destructive",
};

/* ══════════════════ دفترچهٔ آدرس‌ها — استور localStorage ══════════════════ */

const ADDRESSES_KEY = "bs-addresses";

export interface SavedAddress {
  id: string;
  province: string;
  city: string;
  addressLine: string;
  postalCode: string | null;
}

function isSavedAddress(value: unknown): value is SavedAddress {
  if (!isRecord(value)) return false;
  return (
    typeof value["id"] === "string" &&
    typeof value["province"] === "string" &&
    typeof value["city"] === "string" &&
    typeof value["addressLine"] === "string" &&
    (value["postalCode"] === null || typeof value["postalCode"] === "string")
  );
}

function readAddressesFromStorage(): SavedAddress[] {
  try {
    const raw = window.localStorage.getItem(ADDRESSES_KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSavedAddress);
  } catch {
    return [];
  }
}

/* استور کوچک — getServerSnapshot پایدارِ خالی برای هایدریشن */
const EMPTY_ADDRESSES: SavedAddress[] = [];
let addressesCache: SavedAddress[] | null = null;
const addressListeners = new Set<() => void>();

function subscribeAddresses(onChange: () => void): () => void {
  addressListeners.add(onChange);
  return () => {
    addressListeners.delete(onChange);
  };
}

function getAddressesSnapshot(): SavedAddress[] {
  if (addressesCache === null) {
    addressesCache = readAddressesFromStorage();
  }
  return addressesCache;
}

function getAddressesServerSnapshot(): SavedAddress[] {
  return EMPTY_ADDRESSES;
}

function saveAddresses(next: SavedAddress[]): void {
  addressesCache = next;
  try {
    window.localStorage.setItem(ADDRESSES_KEY, JSON.stringify(next));
  } catch {
    // حافظهٔ پر یا حالت خصوصی — آدرس‌ها تا پایان این نشست می‌مانند
  }
  for (const listener of addressListeners) {
    listener();
  }
}

function makeAddressId(): string {
  return `a-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ══════════════════════════ تب‌ها ══════════════════════════ */

type TabKey = "orders" | "profile" | "addresses";

const TAB_ITEMS: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: "orders", label: "سفارش‌های من", icon: Package },
  { key: "profile", label: "اطلاعات شخصی", icon: UserRound },
  { key: "addresses", label: "دفترچهٔ آدرس‌ها", icon: MapPin },
];

/* ══════════════════════════ اسکلت صفحه ══════════════════════════ */

function AccountSkeleton() {
  return (
    <div className="shell py-8 md:py-12">
      <Skeleton className="h-8 w-44" />
      <div className="mt-6 grid gap-8 lg:grid-cols-4">
        <div className="card-luxe space-y-3 p-4">
          <div className="flex items-center gap-3 pb-3">
            <Skeleton className="size-11 rounded-full" />
            <div className="w-full space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
          <Skeleton className="h-11 w-full rounded-lg" />
          <Skeleton className="h-11 w-full rounded-lg" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
        <div className="space-y-6 lg:col-span-3">
          <div className="card-luxe space-y-4 p-6">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════ تب سفارش‌ها — دادهٔ واقعی از /api/account/orders ══════════════════════════ */

/** اعتبارسنجی امن پاسخ سفارش‌ها (هم‌شکل PreviewOrder) */
function parseOrders(payload: unknown): PreviewOrder[] | null {
  if (typeof payload !== "object" || payload === null) return null;
  const raw = (payload as Record<string, unknown>)["orders"];
  if (!Array.isArray(raw)) return null;
  const orders: PreviewOrder[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) continue;
    const row = item as Record<string, unknown>;
    if (
      typeof row["orderNumber"] === "string" &&
      typeof row["createdAt"] === "string" &&
      typeof row["total"] === "number" &&
      Array.isArray(row["items"])
    ) {
      orders.push(row as unknown as PreviewOrder);
    }
  }
  return orders;
}

function OrdersTab() {
  /* loading → اسکلت | error → fallback نمایشی | ready → سفارش‌های واقعی */
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [orders, setOrders] = useState<PreviewOrder[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/account/orders")
      .then(async (res) => {
        if (!active) return;
        if (!res.ok) throw new Error("failed");
        const data: unknown = await res.json().catch(() => null);
        const parsed = parseOrders(data);
        if (parsed === null) throw new Error("bad shape");
        setOrders(parsed);
        setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, []);

  /* خطای سرور → fallback به دادهٔ نمایشی (طبق قرارداد فاز ۴) */
  const isFallback = status === "error";
  const list = isFallback ? PREVIEW_ORDERS : orders;

  return (
    <section className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold">سفارش‌های من</h2>
          {isFallback ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
              نمایشی
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-xs leading-6 text-muted-foreground">
          {isFallback
            ? "خواندن سفارش‌های واقعی ناموفق بود؛ دادهٔ نمایشی می‌بینید"
            : "سفارش‌های ثبت‌شدهٔ شما و وضعیت فعلی آن‌ها"}
        </p>
      </div>

      {status === "loading" ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      ) : list.length === 0 ? (
        <div className="card-luxe flex flex-col items-center px-6 py-14 text-center">
          <Package
            className="size-10 text-muted-foreground/40"
            aria-hidden="true"
          />
          <p className="mt-4 font-bold">هنوز سفارشی ثبت نکرده‌اید</p>
          <p className="mt-1 text-sm text-muted-foreground">
            اولین خرید خود را از فروشگاه شروع کنید
          </p>
          <Button asChild className="btn-metallic mt-6 h-11 rounded-xl px-8 font-bold">
            <Link href="/products">رفتن به فروشگاه</Link>
          </Button>
        </div>
      ) : (
        list.map((order) => (
          <article key={order.orderNumber} className="card-luxe p-5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <p className="font-bold">{toFa(order.orderNumber)}</p>
              <span className="text-xs text-muted-foreground">
                {faDateTime(order.createdAt)}
              </span>
              <Badge className={cn("border-transparent", STATUS_BADGE_CLASS[order.status])}>
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm">
                <span className="text-muted-foreground">جمع سفارش: </span>
                <span className="font-bold text-primary">
                  {formatToman(order.total)}
                </span>
              </p>
              <Button
                asChild
                variant="ghost"
                className="h-11 rounded-xl px-4 font-medium text-gold hover:text-gold-strong"
              >
                <Link href={`/account/orders/${order.orderNumber}`}>
                  مشاهدهٔ جزئیات
                </Link>
              </Button>
            </div>
          </article>
        ))
      )}
    </section>
  );
}

/* ══════════════════════════ تب اطلاعات شخصی ══════════════════════════ */

function ProfileTab({ user }: { user: MeUser }) {
  return (
    <section className="card-luxe p-6">
      <h2 className="text-lg font-bold">اطلاعات شخصی</h2>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="profile-name" className="text-sm font-medium">
            نام و نام خانوادگی
          </label>
          <Input
            id="profile-name"
            key={`${user.phone}-name`}
            defaultValue={user.fullName ?? ""}
            className="mt-2 h-11"
            placeholder="نام خود را وارد کنید"
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="profile-email" className="text-sm font-medium">
            ایمیل
          </label>
          <Input
            id="profile-email"
            key={`${user.phone}-email`}
            type="email"
            dir="ltr"
            defaultValue={user.email ?? ""}
            className="mt-2 h-11"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="profile-phone" className="text-sm font-medium">
            شمارهٔ موبایل
          </label>
          <Input
            id="profile-phone"
            dir="ltr"
            readOnly
            value={formatPhoneFa(user.phone)}
            className="mt-2 h-11 bg-muted text-center tracking-wide"
          />
          <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
            شمارهٔ موبایل، شناسهٔ ورود شماست و قابل تغییر نیست
          </p>
        </div>
      </div>

      {/* فاز ۴: PUT /api/account/profile */}
      <Button
        type="button"
        className="btn-metallic mt-6 h-12 rounded-xl px-8 font-bold"
        onClick={() => toast.info("ویرایش پروفایل در فاز ۴ فعال می‌شود")}
      >
        ذخیرهٔ تغییرات
      </Button>
    </section>
  );
}

/* ══════════════════ تب دفترچهٔ آدرس‌ها ══════════════════ */

function AddressesTab() {
  const addresses = useSyncExternalStore(
    subscribeAddresses,
    getAddressesSnapshot,
    getAddressesServerSnapshot,
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const cityOptions =
    IRAN_PROVINCES.find((row) => row.province === province)?.cities ?? [];

  function resetForm(): void {
    setProvince("");
    setCity("");
    setAddressLine("");
    setPostalCode("");
    setFormError(null);
  }

  function submitAddress(): void {
    if (province === "") {
      setFormError("استان را انتخاب کنید");
      return;
    }
    if (city === "") {
      setFormError("شهر را انتخاب کنید");
      return;
    }
    if (addressLine.trim().length < 10) {
      setFormError("نشانی کامل را وارد کنید");
      return;
    }
    const postal = toEnDigits(postalCode).replace(/\D/g, "");
    if (postal.length > 0 && !/^\d{10}$/.test(postal)) {
      setFormError("کد پستی باید ۱۰ رقم باشد");
      return;
    }

    saveAddresses([
      ...addresses,
      {
        id: makeAddressId(),
        province,
        city,
        addressLine: addressLine.trim(),
        postalCode: postal.length === 10 ? postal : null,
      },
    ]);
    toast.success("در حافظهٔ مرورگر ذخیره شد؛ همگام‌سازی در فاز ۴");
    setDialogOpen(false);
    resetForm();
  }

  function removeAddress(id: string): void {
    saveAddresses(addresses.filter((address) => address.id !== id));
    toast.success("آدرس حذف شد");
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">دفترچهٔ آدرس‌ها</h2>
        <Button
          type="button"
          className="btn-metallic h-11 rounded-xl px-5 font-bold"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="size-4" aria-hidden="true" />
          افزودن آدرس جدید
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="card-luxe flex flex-col items-center px-6 py-14 text-center">
          <MapPin
            className="size-10 text-muted-foreground/40"
            aria-hidden="true"
          />
          <p className="mt-4 font-bold">هنوز آدرسی ثبت نکرده‌اید</p>
          <p className="mt-1 text-sm text-muted-foreground">
            نشانی‌های پرکاربرد خود را برای ثبت سفارش سریع‌تر ذخیره کنید
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <li key={address.id} className="card-luxe p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-bold">
                    <MapPin className="size-4 shrink-0 text-gold" aria-hidden="true" />
                    {address.province} — {address.city}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {address.addressLine}
                  </p>
                  {address.postalCode ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      کد پستی: {toFa(address.postalCode)}
                    </p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9 shrink-0 rounded-full text-muted-foreground hover:text-destructive"
                  onClick={() => removeAddress(address.id)}
                  aria-label="حذف آدرس"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* دیالوگ افزودن آدرس — هم‌ساخت با فرم تسویه */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>افزودن آدرس جدید</DialogTitle>
            <DialogDescription>
              نشانی تحویل سفارش‌های شما
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="address-province" className="text-sm font-medium">
                  استان
                </label>
                <Select
                  value={province}
                  onValueChange={(value) => {
                    setProvince(value);
                    setCity("");
                  }}
                >
                  <SelectTrigger
                    id="address-province"
                    className="mt-2 h-11 w-full"
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
              </div>
              <div>
                <label htmlFor="address-city" className="text-sm font-medium">
                  شهر
                </label>
                <Select
                  value={city}
                  onValueChange={setCity}
                  disabled={province === ""}
                >
                  <SelectTrigger id="address-city" className="mt-2 h-11 w-full">
                    <SelectValue
                      placeholder={
                        province === "" ? "ابتدا استان را انتخاب کنید" : "انتخاب شهر"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {cityOptions.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label htmlFor="address-line" className="text-sm font-medium">
                نشانی کامل
              </label>
              <Textarea
                id="address-line"
                rows={3}
                className="mt-2 min-h-20"
                placeholder="خیابان، کوچه، پلاک، واحد…"
                value={addressLine}
                onChange={(event) => setAddressLine(event.target.value)}
              />
            </div>

            <div>
              <label htmlFor="address-postal" className="text-sm font-medium">
                کد پستی{" "}
                <span className="text-muted-foreground">(اختیاری)</span>
              </label>
              <Input
                id="address-postal"
                dir="ltr"
                inputMode="numeric"
                className="mt-2 h-11 text-center tracking-widest"
                placeholder="۱۲۳۴۵۶۷۸۹۰"
                value={postalCode}
                onChange={(event) => setPostalCode(event.target.value)}
              />
            </div>

            {formError !== null ? (
              <p className="text-xs text-destructive" role="alert">
                {formError}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl"
                onClick={() => setDialogOpen(false)}
              >
                انصراف
              </Button>
              <Button
                type="button"
                className="btn-metallic h-11 rounded-xl font-bold"
                onClick={submitAddress}
              >
                ثبت آدرس
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

/* ══════════════════════════ صفحه ══════════════════════════ */

export default function AccountPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const [user, setUser] = useState<MeUser | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("orders");

  /* گارد سشن — ۴۰۱ یا خطا → ورود */
  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then(async (res) => {
        if (!active) return;
        if (res.status === 401) {
          router.replace("/login?next=/account");
          return;
        }
        if (!res.ok) {
          toast.error("خطا در خواندن حساب کاربری؛ دوباره وارد شوید");
          router.replace("/login?next=/account");
          return;
        }
        const data: unknown = await res.json().catch(() => null);
        const meUser = readMeUser(data);
        if (meUser === null) {
          router.replace("/login?next=/account");
          return;
        }
        setUser(meUser);
        setStatus("ready");
      })
      .catch(() => {
        if (active) {
          toast.error("ارتباط با سرور برقرار نشد");
          router.replace("/login?next=/account");
        }
      });
    return () => {
      active = false;
    };
  }, [router]);

  async function logout(): Promise<void> {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("از حساب خود خارج شدید");
      router.push("/");
    } catch {
      toast.error("خروج ناموفق بود؛ لطفاً دوباره تلاش کنید");
    }
  }

  if (status !== "ready" || user === null) {
    return <AccountSkeleton />;
  }

  const displayName = user.fullName ?? "کاربر بسلامت";
  const avatarLetter = user.fullName?.trim().charAt(0) || user.phone.charAt(0);

  return (
    <div className="shell py-8 md:py-12">
      <h1 className="text-2xl font-black">حساب کاربری</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-4">
        {/* سایدبار */}
        <aside className="lg:col-span-1">
          <div className="card-luxe p-4 lg:sticky lg:top-24">
            {/* هدر کاربر */}
            <div className="flex items-center gap-3 border-b border-border/70 pb-4">
              <span
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-full text-lg font-black",
                  "bg-gold-soft/40 text-gold-strong dark:bg-gold-soft/15 dark:text-gold",
                )}
                aria-hidden="true"
              >
                {avatarLetter}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{displayName}</p>
                <p dir="ltr" className="mt-0.5 text-xs text-muted-foreground">
                  {formatPhoneFa(user.phone)}
                </p>
              </div>
              {user.role === "ADMIN" ? (
                <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-gold-foreground">
                  مدیر
                </span>
              ) : null}
            </div>

            {/* منو */}
            <nav className="mt-2 flex flex-col gap-1" aria-label="منوی حساب کاربری">
              {TAB_ITEMS.map((tab) => {
                const Icon = tab.icon;
                const active = tab.key === activeTab;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors",
                      active
                        ? "bg-accent font-semibold text-primary"
                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4 shrink-0",
                        active ? "text-gold" : "text-muted-foreground",
                      )}
                      aria-hidden="true"
                    />
                    {tab.label}
                  </button>
                );
              })}

              <div className="my-2 h-px bg-border/70" aria-hidden="true" />

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    className="flex h-11 items-center gap-3 rounded-lg px-3 text-sm text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut className="size-4 shrink-0" aria-hidden="true" />
                    خروج از حساب
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>خروج از حساب کاربری</AlertDialogTitle>
                    <AlertDialogDescription>
                      برای خرید بعدی باید دوباره با کد پیامکی وارد شوید. خارج
                      می‌شوید؟
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>ماندم</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-white hover:bg-destructive/90"
                      onClick={() => void logout()}
                    >
                      بله، خارج شو
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </nav>
          </div>
        </aside>

        {/* محتوای تب فعال */}
        <div className="min-w-0 lg:col-span-3">
          {activeTab === "orders" ? (
            <OrdersTab />
          ) : activeTab === "profile" ? (
            <ProfileTab user={user} />
          ) : (
            <AddressesTab />
          )}
        </div>
      </div>
    </div>
  );
}
