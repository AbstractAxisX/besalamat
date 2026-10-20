"use client";

/**
 * ویرایشگر محصول — ساخت و ویرایش (react-hook-form + zod + useFieldArray)
 * ─────────────────────────────
 * بخش‌ها: اطلاعات اصلی / تصاویر (آپلود + چیدمان) / تنوع‌ها / مشخصات / سئو؛
 * نوار ذخیرهٔ چسبان پایین؛ POST /api/admin/products یا PUT /api/admin/products/[id].
 * اعداد قیمت به تومان (Int)؛ نمایش زندهٔ قالب‌بندی‌شدهٔ فارسی زیر فیلدها.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  IconAlertTriangle,
  IconArrowRight,
  IconChevronDown,
  IconCirclePlus,
  IconDeviceFloppy,
  IconListDetails,
  IconPhoto,
  IconPhotoUp,
  IconSeo,
  IconTag,
  IconTrash,
  IconUpload,
  IconX,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { formatTomanPlain, toEnDigits } from "@/lib/format";
import { apiFetch, apiSend, uploadImage } from "@/components/admin/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type {
  AdminBrandRow,
  AdminCategoryNode,
  AdminProductDetail,
} from "@/types/admin";

/* ── ابزارهای عددی (ورودی رشته‌ای → Int تومان) ── */

function toIntOrNull(value: string): number | null {
  const cleaned = toEnDigits(value).replace(/[^\d-]/g, "");
  if (cleaned.length === 0) return null;
  const parsed = Number.parseInt(cleaned, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

/** تبدیل متن به عدد لاتین قابل تایپ (ارقام فارسی هم پذیرفته می‌شود) */
function numericText(value: string): string {
  return toEnDigits(value).replace(/[^\d]/g, "");
}

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** اسلاگ ساده — فقط حروف لاتین باقی می‌ماند (عنوان فارسی → کاربر خودش وارد کند) */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const priceField = z
  .string()
  .refine((value) => (toIntOrNull(value) ?? 0) > 0, "قیمت معتبر نیست (تومان، عدد صحیح مثبت)");

const optionalPriceField = z.string().refine((value) => {
  if (value.trim().length === 0) return true;
  return (toIntOrNull(value) ?? 0) > 0;
}, "قیمت قبل از تخفیف معتبر نیست");

const stockField = z.string().refine((value) => {
  const parsed = toIntOrNull(value);
  return parsed !== null && parsed >= 0;
}, "موجودی معتبر نیست (عدد صحیح ≥ ۰)");

/* ── اسکیمای فرم (پیام‌های فارسی) ── */

const editorSchema = z.object({
  title: z.string().trim().min(2, "عنوان محصول را وارد کنید (حداقل ۲ حرف)"),
  slug: z
    .string()
    .trim()
    .regex(SLUG_REGEX, "اسلاگ فقط حروف کوچک لاتین، عدد و خط تیره — مثل omron-m2"),
  shortDescription: z.string(),
  description: z.string(),
  brandId: z.string(),
  categoryId: z.string(),
  price: priceField,
  comparePrice: optionalPriceField,
  stock: stockField,
  isActive: z.boolean(),
  isNew: z.boolean(),
  isFeatured: z.boolean(),
  seoTitle: z.string(),
  seoDescription: z.string(),
  images: z.array(
    z.object({
      url: z.string().trim().min(1, "نشانی تصویر را وارد کنید یا فایل بارگذاری کنید"),
      alt: z.string(),
    }),
  ),
  variants: z.array(
    z.object({
      title: z.string().trim().min(1, "عنوان تنوع را وارد کنید"),
      price: priceField,
      comparePrice: optionalPriceField,
      stock: stockField,
      isDefault: z.boolean(),
    }),
  ),
  specs: z.array(
    z.object({
      key: z.string().trim().min(1, "نام مشخصه را وارد کنید"),
      value: z.string().trim().min(1, "مقدار مشخصه را وارد کنید"),
    }),
  ),
});

type EditorValues = z.infer<typeof editorSchema>;

const CREATE_DEFAULTS: EditorValues = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  brandId: "",
  categoryId: "",
  price: "",
  comparePrice: "",
  stock: "0",
  isActive: true,
  isNew: false,
  isFeatured: false,
  seoTitle: "",
  seoDescription: "",
  images: [{ url: "", alt: "" }],
  variants: [],
  specs: [],
};

/** دستهٔ تخت با برچسب «والد › فرزند» */
interface FlatCategory {
  id: string;
  label: string;
  isActive: boolean;
}

function flattenCategories(
  nodes: AdminCategoryNode[],
  parentLabel: string | null = null,
): FlatCategory[] {
  const out: FlatCategory[] = [];
  for (const node of nodes) {
    const label = parentLabel === null ? node.title : `${parentLabel} › ${node.title}`;
    out.push({ id: node.id, label, isActive: node.isActive });
    out.push(...flattenCategories(node.children, label));
  }
  return out;
}

/* ── قالب بخش‌ها ── */

function Section({
  icon,
  title,
  description,
  action,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/50 px-4 py-3 md:px-6">
        <h2 className="flex items-center gap-2 text-sm font-black">
          <span className="text-muted-foreground" aria-hidden="true">
            {icon}
          </span>
          {title}
        </h2>
        {action}
      </header>
      <div className="space-y-4 p-4 md:p-6">{children}</div>
    </section>
  );
}

/** فیلد با برچسب + خطای فارسی */
function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor} className="text-sm font-bold">
        {label}
      </Label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

interface ProductEditorProps {
  mode: "create" | "edit";
  productId?: string;
}

export function ProductEditor({ mode, productId }: ProductEditorProps) {
  const router = useRouter();

  const [brands, setBrands] = useState<AdminBrandRow[]>([]);
  const [categories, setCategories] = useState<FlatCategory[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(mode === "create");
  const [saving, setSaving] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadTarget, setUploadTarget] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [seoOpen, setSeoOpen] = useState(false);

  const form = useForm<EditorValues>({
    resolver: zodResolver(editorSchema),
    defaultValues: CREATE_DEFAULTS,
  });
  const { register, control, handleSubmit, setValue, watch, reset, formState } = form;

  const imagesArray = useFieldArray({ control, name: "images" });
  const variantsArray = useFieldArray({ control, name: "variants" });
  const specsArray = useFieldArray({ control, name: "specs" });

  const watchedTitle = watch("title");
  const watchedSlug = watch("slug");
  const watchedPrice = watch("price");
  const watchedComparePrice = watch("comparePrice");

  /* ── واکشی برندها و دسته‌ها (برای Selectها) ── */
  useEffect(() => {
    let active = true;
    Promise.all([
      apiFetch<{ items: AdminBrandRow[] }>("/api/admin/brands").catch(() => ({ items: [] })),
      apiFetch<{ tree: AdminCategoryNode[] }>("/api/admin/categories").catch(() => ({ tree: [] })),
    ]).then(([brandsRes, categoriesRes]) => {
      if (!active) return;
      setBrands(brandsRes.items);
      setCategories(flattenCategories(categoriesRes.tree));
    });
    return () => {
      active = false;
    };
  }, []);

  /* ── واکشی محصول در حالت ویرایش ── */
  useEffect(() => {
    if (mode !== "edit" || productId === undefined) return;
    let active = true;
    apiFetch<{ product: AdminProductDetail }>(`/api/admin/products/${productId}`)
      .then((response) => {
        if (!active) return;
        const product = response.product;
        reset({
          title: product.title,
          slug: product.slug,
          shortDescription: product.shortDescription ?? "",
          description: product.description ?? "",
          brandId: product.brandId ?? "",
          categoryId: product.categoryId ?? "",
          price: String(product.price),
          comparePrice: product.comparePrice != null ? String(product.comparePrice) : "",
          stock: String(product.stock),
          isActive: product.isActive,
          isNew: product.isNew,
          isFeatured: product.isFeatured,
          seoTitle: product.seoTitle ?? "",
          seoDescription: product.seoDescription ?? "",
          images:
            product.images.length > 0
              ? product.images.map((image) => ({ url: image.url, alt: image.alt ?? "" }))
              : [{ url: "", alt: "" }],
          variants: product.variants.map((variant) => ({
            title: variant.title,
            price: String(variant.price),
            comparePrice:
              variant.comparePrice != null ? String(variant.comparePrice) : "",
            stock: String(variant.stock),
            isDefault: variant.isDefault,
          })),
          specs: product.specs.map((spec) => ({ key: spec.key, value: spec.value })),
        });
        setLoaded(true);
      })
      .catch((error: unknown) => {
        if (active) {
          setLoadError(error instanceof Error ? error.message : "بارگذاری محصول ناموفق بود");
        }
      });
    return () => {
      active = false;
    };
  }, [mode, productId, reset]);

  /* ── تولید خودکار اسلاگ از عنوان (فقط ساخت، تا وقتی کاربر دست نزده) ── */
  useEffect(() => {
    if (mode !== "create" || slugTouched) return;
    setValue("slug", slugify(watchedTitle ?? ""), { shouldValidate: false });
  }, [mode, slugTouched, watchedTitle, setValue]);

  /* ── ذخیره ── */
  const onSubmit = useCallback(
    (values: EditorValues): void => {
      setSaving(true);
      const payload = {
        title: values.title.trim(),
        slug: values.slug.trim(),
        shortDescription: values.shortDescription.trim() || null,
        description: values.description.trim() || null,
        brandId: values.brandId.length > 0 ? values.brandId : null,
        categoryId: values.categoryId.length > 0 ? values.categoryId : null,
        price: toIntOrNull(values.price) ?? 0,
        comparePrice:
          values.comparePrice.trim().length > 0 ? toIntOrNull(values.comparePrice) : null,
        stock: toIntOrNull(values.stock) ?? 0,
        isActive: values.isActive,
        isNew: values.isNew,
        isFeatured: values.isFeatured,
        seoTitle: values.seoTitle.trim() || null,
        seoDescription: values.seoDescription.trim() || null,
        images: values.images
          .filter((image) => image.url.trim().length > 0)
          .map((image, index) => ({
            url: image.url.trim(),
            alt: image.alt.trim() || null,
            sortOrder: index,
          })),
        variants: values.variants
          .filter((variant) => variant.title.trim().length > 0)
          .map((variant, index) => ({
            title: variant.title.trim(),
            price: toIntOrNull(variant.price) ?? 0,
            comparePrice:
              variant.comparePrice.trim().length > 0 ? toIntOrNull(variant.comparePrice) : null,
            stock: toIntOrNull(variant.stock) ?? 0,
            isDefault: variant.isDefault,
            sortOrder: index,
          })),
        specs: values.specs
          .filter((spec) => spec.key.trim().length > 0 && spec.value.trim().length > 0)
          .map((spec, index) => ({
            key: spec.key.trim(),
            value: spec.value.trim(),
            sortOrder: index,
          })),
      };

      const request =
        mode === "create"
          ? apiSend<{ product: { id: string } }>("/api/admin/products", "POST", payload)
          : apiSend<{ product: { id: string } }>(`/api/admin/products/${productId}`, "PUT", payload);

      request
        .then(() => {
          toast.success(mode === "create" ? "محصول جدید ساخته شد" : "تغییرات محصول ذخیره شد");
          router.push("/admin/products");
        })
        .catch((error: unknown) => {
          toast.error(error instanceof Error ? error.message : "ذخیرهٔ محصول ناموفق بود");
          setSaving(false);
        });
    },
    [mode, productId, router],
  );

  /* ── حذف (فقط ویرایش) ── */
  const handleDelete = useCallback(async (): Promise<void> => {
    if (productId === undefined) return;
    setDeleteBusy(true);
    try {
      await apiSend(`/api/admin/products/${productId}`, "DELETE");
      toast.success("محصول حذف شد");
      router.push("/admin/products");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حذف محصول ناموفق بود");
      setDeleteBusy(false);
    }
  }, [productId, router]);

  /* ── آپلود تصویر یک ردیف ── */
  const handleUpload = useCallback(
    async (index: number, file: File): Promise<void> => {
      setUploadingIndex(index);
      try {
        const url = await uploadImage(file);
        setValue(`images.${index}.url`, url, { shouldValidate: true });
        toast.success("تصویر بارگذاری شد");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "آپلود تصویر ناموفق بود");
      } finally {
        setUploadingIndex(null);
      }
    },
    [setValue],
  );

  /* آغاز بارگذاری برای یک ردیف — ورودی فایل مشترک */
  const triggerUpload = useCallback((index: number): void => {
    setUploadTarget(index);
    fileInputRef.current?.click();
  }, []);

  /* فقط یک تنوع می‌تواند پیش‌فرض باشد */
  const setDefaultVariant = useCallback(
    (index: number, checked: boolean): void => {
      const current = watch("variants");
      current.forEach((variant, otherIndex) => {
        variantsArray.update(otherIndex, {
          ...variant,
          isDefault: otherIndex === index ? checked : checked ? false : variant.isDefault,
        });
      });
    },
    [variantsArray, watch],
  );

  const pricePreview = useMemo(() => {
    const parsed = toIntOrNull(watchedPrice ?? "");
    return parsed !== null && parsed > 0 ? `${formatTomanPlain(parsed)} تومان` : null;
  }, [watchedPrice]);

  const comparePreview = useMemo(() => {
    const parsed = toIntOrNull(watchedComparePrice ?? "");
    return parsed !== null && parsed > 0 ? `${formatTomanPlain(parsed)} تومان` : null;
  }, [watchedComparePrice]);

  /* ── خطای بارگذاری ── */
  if (loadError !== null) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon" asChild aria-label="بازگشت">
            <Link href="/admin/products">
              <IconArrowRight className="size-5" stroke={1.75} aria-hidden="true" />
            </Link>
          </Button>
          <h1 className="text-xl font-black">ویرایش محصول</h1>
        </div>
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {loadError}
        </p>
      </div>
    );
  }

  /* ── اسکلت تا آماده‌شدن داده‌ها ── */
  if (!loaded) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-2">
      {/* ورودی فایل مشترک آپلود تصویر */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file !== undefined && uploadTarget !== null) {
            void handleUpload(uploadTarget, file);
          }
        }}
      />
      {/* سربرگ */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon" asChild aria-label="بازگشت به فهرست">
            <Link href="/admin/products">
              <IconArrowRight className="size-5" stroke={1.75} aria-hidden="true" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-black md:text-2xl">
              {mode === "create" ? "محصول جدید" : "ویرایش محصول"}
            </h1>
            {mode === "edit" && watchedSlug ? (
              <p dir="ltr" className="text-start text-xs text-muted-foreground">
                {watchedSlug}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                اطلاعات اصلی، تصاویر، تنوع‌ها و مشخصات محصول
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── اطلاعات اصلی ── */}
      <Section
        icon={<IconTag className="size-4.5" stroke={1.75} />}
        title="اطلاعات اصلی"
        description="عنوان، قیمت، موجودی و دسته‌بندی"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label="عنوان محصول"
            htmlFor="product-title"
            error={formState.errors.title?.message}
            className="md:col-span-2"
          >
            <Input
              id="product-title"
              placeholder="مثلاً فشارسنج بازویی امران مدل M2"
              {...register("title")}
              aria-invalid={formState.errors.title !== undefined}
            />
          </Field>

          <Field
            label="اسلاگ (نشانی یکتا)"
            htmlFor="product-slug"
            error={formState.errors.slug?.message}
            hint="فقط حروف کوچک لاتین، عدد و خط تیره — مثل omron-m2"
          >
            <Input
              id="product-slug"
              dir="ltr"
              placeholder="omron-m2"
              className="text-start"
              {...register("slug", {
                onChange: () => setSlugTouched(true),
              })}
              aria-invalid={formState.errors.slug !== undefined}
            />
          </Field>

          <Field
            label="دسته‌بندی"
            htmlFor="product-category"
            hint={categories.length === 0 ? "دسته‌ای ثبت نشده است" : undefined}
          >
            <Select
              value={watch("categoryId") || "none"}
              onValueChange={(value) => setValue("categoryId", value === "none" ? "" : value)}
            >
              <SelectTrigger id="product-category" className="w-full">
                <SelectValue placeholder="انتخاب دسته…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— بدون دسته —</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.label}
                    {category.isActive ? "" : " (غیرفعال)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field
            label="برند"
            htmlFor="product-brand"
            hint={brands.length === 0 ? "برندی ثبت نشده است" : undefined}
          >
            <Select
              value={watch("brandId") || "none"}
              onValueChange={(value) => setValue("brandId", value === "none" ? "" : value)}
            >
              <SelectTrigger id="product-brand" className="w-full">
                <SelectValue placeholder="انتخاب برند…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— بدون برند —</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field
            label="قیمت (تومان)"
            htmlFor="product-price"
            error={formState.errors.price?.message}
            hint={pricePreview ?? "قیمت فروش به تومان"}
          >
            <Input
              id="product-price"
              dir="ltr"
              inputMode="numeric"
              placeholder="2450000"
              className="text-start"
              {...register("price", {
                setValueAs: (value: string) => numericText(value),
              })}
              aria-invalid={formState.errors.price !== undefined}
            />
          </Field>

          <Field
            label="قیمت قبل از تخفیف (اختیاری)"
            htmlFor="product-compare-price"
            error={formState.errors.comparePrice?.message}
            hint={comparePreview ?? "برای نمایش خط خورده روی قیمت"}
          >
            <Input
              id="product-compare-price"
              dir="ltr"
              inputMode="numeric"
              placeholder="2950000"
              className="text-start"
              {...register("comparePrice", {
                setValueAs: (value: string) => numericText(value),
              })}
              aria-invalid={formState.errors.comparePrice !== undefined}
            />
          </Field>

          <Field
            label="موجودی"
            htmlFor="product-stock"
            error={formState.errors.stock?.message}
            hint="موجودی انبار (برای محصول تنوع‌دار، موجودی هر تنوع جداگانه زیرِ بخش تنوع‌ها ست می‌شود)"
          >
            <Input
              id="product-stock"
              dir="ltr"
              inputMode="numeric"
              placeholder="10"
              className="text-start"
              {...register("stock", {
                setValueAs: (value: string) => numericText(value),
              })}
              aria-invalid={formState.errors.stock !== undefined}
            />
          </Field>

          <Field label="توضیح کوتاه" htmlFor="product-short" className="md:col-span-2">
            <Textarea
              id="product-short"
              rows={2}
              placeholder="یک پاراگراف معرفی کوتاه برای کارت محصول و سئو"
              {...register("shortDescription")}
            />
          </Field>

          <Field
            label="توضیح کامل"
            htmlFor="product-description"
            hint="متن کامل صفحهٔ محصول (HTML ساده مجاز است)"
            className="md:col-span-2"
          >
            <Textarea
              id="product-description"
              rows={6}
              placeholder="مشخصات کامل، طرز استفاده و نکات مهم محصول…"
              {...register("description")}
            />
          </Field>

          {/* سوییچ‌ها */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 md:col-span-2">
            <label className="flex cursor-pointer items-center gap-2">
              <Switch checked={watch("isActive")} onCheckedChange={(checked) => setValue("isActive", checked)} />
              <span className="text-sm font-bold">فعال در فروشگاه</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <Switch checked={watch("isNew")} onCheckedChange={(checked) => setValue("isNew", checked)} />
              <span className="text-sm font-bold">بدج «جدید»</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <Switch
                checked={watch("isFeatured")}
                onCheckedChange={(checked) => setValue("isFeatured", checked)}
              />
              <span className="text-sm font-bold">محصول ویژه</span>
            </label>
          </div>
        </div>

        {/* سئو — جمع‌شونده */}
        <Collapsible open={seoOpen} onOpenChange={setSeoOpen}>
          <Separator />
          <CollapsibleTrigger className="flex w-full items-center justify-between py-3 text-sm font-bold text-muted-foreground hover:text-foreground">
            <span className="flex items-center gap-2">
              <IconSeo className="size-4.5" stroke={1.75} aria-hidden="true" />
              تنظیمات سئو (اختیاری)
            </span>
            <IconChevronDown
              className={cn("size-4 transition-transform", seoOpen && "rotate-180")}
              stroke={1.75}
              aria-hidden="true"
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4">
            <Field
              label="عنوان سئو"
              htmlFor="product-seo-title"
              hint="خالی بماند = عنوان محصول"
            >
              <Input id="product-seo-title" {...register("seoTitle")} />
            </Field>
            <Field
              label="توضیحات سئو"
              htmlFor="product-seo-description"
              hint="خالی بماند = توضیح کوتاه محصول"
            >
              <Textarea id="product-seo-description" rows={2} {...register("seoDescription")} />
            </Field>
          </CollapsibleContent>
        </Collapsible>
      </Section>

      {/* ── تصاویر ── */}
      <Section
        icon={<IconPhoto className="size-4.5" stroke={1.75} />}
        title="تصاویر"
        description="نخستین تصویر، تصویر اصلی محصول است"
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => imagesArray.append({ url: "", alt: "" })}
          >
            <IconCirclePlus className="size-4" stroke={1.75} aria-hidden="true" />
            افزودن تصویر
          </Button>
        }
      >
        <div className="space-y-3">
          {imagesArray.fields.length === 0 ? (
            <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
              تصویری اضافه نشده است — «افزودن تصویر» را بزنید.
            </p>
          ) : null}

          {imagesArray.fields.map((field, index) => {
            const url = watch(`images.${index}.url`);
            const urlError = formState.errors.images?.[index]?.url?.message;
            return (
              <div
                key={field.id}
                className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-start"
              >
                {/* پیش‌نمایش + نشان اصلی */}
                <div className="relative shrink-0">
                  {url ? (
                    <img
                      src={url}
                      alt={watch(`images.${index}.alt`) || "پیش‌نمایش تصویر محصول"}
                      className="size-20 rounded-xl border object-cover"
                    />
                  ) : (
                    <span
                      className="flex size-20 items-center justify-center rounded-xl border bg-muted text-muted-foreground"
                      aria-hidden="true"
                    >
                      <IconPhoto className="size-7" stroke={1.75} />
                    </span>
                  )}
                  {index === 0 ? (
                    <span className="absolute -start-1 -top-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-black text-primary-foreground">
                      اصلی
                    </span>
                  ) : null}
                </div>

                {/* فیلدها */}
                <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
                  <Field
                    label="نشانی تصویر"
                    htmlFor={`image-url-${index}`}
                    error={urlError}
                    className="sm:col-span-2"
                  >
                    <div className="flex gap-2">
                      <Input
                        id={`image-url-${index}`}
                        dir="ltr"
                        placeholder="/placeholders/product-1-a.svg یا نشانی آپلودشده"
                        className="text-start"
                        {...register(`images.${index}.url` as const)}
                      />
                      <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={uploadingIndex === index}
                          onClick={() => triggerUpload(index)}
                          aria-label="بارگذاری تصویر از سیستم"
                          title="بارگذاری از سیستم"
                        >
                          {uploadingIndex === index ? (
                            <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : (
                            <IconUpload className="size-4" stroke={1.75} aria-hidden="true" />
                          )}
                        </Button>
                    </div>
                  </Field>
                  <Field label="متن جایگزین (alt)" htmlFor={`image-alt-${index}`}>
                    <Input
                      id={`image-alt-${index}`}
                      placeholder="مثلاً فشارسنج امران از نمای روبه‌رو"
                      {...register(`images.${index}.alt` as const)}
                    />
                  </Field>

                  {/* جابه‌جایی و حذف */}
                  <div className="flex items-end justify-end gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-8"
                      disabled={index === 0}
                      onClick={() => imagesArray.move(index, index - 1)}
                      aria-label="انتقال به بالا"
                      title="انتقال به بالا (نزدیک‌تر به اصلی)"
                    >
                      <span aria-hidden="true">↑</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-8"
                      disabled={index === imagesArray.fields.length - 1}
                      onClick={() => imagesArray.move(index, index + 1)}
                      aria-label="انتقال به پایین"
                      title="انتقال به پایین"
                    >
                      <span aria-hidden="true">↓</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => imagesArray.remove(index)}
                      aria-label="حذف تصویر"
                      title="حذف تصویر"
                    >
                      <IconTrash className="size-4" stroke={1.75} aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <IconPhotoUp className="size-4" stroke={1.75} aria-hidden="true" />
            فایل‌های PNG، JPG و WebP تا حداکثر ۵ مگابایت — با دکمهٔ بارگذاری کنار فیلد نشانی.
          </p>
        </div>
      </Section>

      {/* ── تنوع‌ها ── */}
      <Section
        icon={<IconListDetails className="size-4.5" stroke={1.75} />}
        title="تنوع‌ها"
        description="مثلاً سایز یا رنگ — قیمت و موجودی هر تنوع جداگانه"
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() =>
              variantsArray.append({
                title: "",
                price: "",
                comparePrice: "",
                stock: "0",
                isDefault: false,
              })
            }
          >
            <IconCirclePlus className="size-4" stroke={1.75} aria-hidden="true" />
            افزودن تنوع
          </Button>
        }
      >
        {variantsArray.fields.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            تنوعی تعریف نشده است — محصول تک‌موجودی است.
          </p>
        ) : (
          <div className="space-y-3">
            {variantsArray.fields.map((field, index) => {
              const rowErrors = formState.errors.variants?.[index];
              return (
                <div key={field.id} className="rounded-lg border p-3">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                    <Field
                      label="عنوان تنوع"
                      htmlFor={`variant-title-${index}`}
                      error={rowErrors?.title?.message}
                      className="md:col-span-4"
                    >
                      <Input
                        id={`variant-title-${index}`}
                        placeholder="مثلاً سایز بزرگ"
                        {...register(`variants.${index}.title` as const)}
                      />
                    </Field>
                    <Field
                      label="قیمت (تومان)"
                      htmlFor={`variant-price-${index}`}
                      error={rowErrors?.price?.message}
                      className="md:col-span-2"
                    >
                      <Input
                        id={`variant-price-${index}`}
                        dir="ltr"
                        inputMode="numeric"
                        className="text-start"
                        {...register(`variants.${index}.price` as const, {
                          setValueAs: (value: string) => numericText(value),
                        })}
                      />
                    </Field>
                    <Field
                      label="قبل از تخفیف"
                      htmlFor={`variant-compare-${index}`}
                      error={rowErrors?.comparePrice?.message}
                      className="md:col-span-2"
                    >
                      <Input
                        id={`variant-compare-${index}`}
                        dir="ltr"
                        inputMode="numeric"
                        className="text-start"
                        {...register(`variants.${index}.comparePrice` as const, {
                          setValueAs: (value: string) => numericText(value),
                        })}
                      />
                    </Field>
                    <Field
                      label="موجودی"
                      htmlFor={`variant-stock-${index}`}
                      error={rowErrors?.stock?.message}
                      className="md:col-span-2"
                    >
                      <Input
                        id={`variant-stock-${index}`}
                        dir="ltr"
                        inputMode="numeric"
                        className="text-start"
                        {...register(`variants.${index}.stock` as const, {
                          setValueAs: (value: string) => numericText(value),
                        })}
                      />
                    </Field>
                    <div className="flex items-end justify-between gap-2 md:col-span-2">
                      <label className="flex cursor-pointer flex-col items-center gap-1">
                        <Switch
                          checked={watch(`variants.${index}.isDefault`)}
                          onCheckedChange={(checked) => setDefaultVariant(index, checked)}
                        />
                        <span className="text-xs font-bold text-muted-foreground">پیش‌فرض</span>
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => variantsArray.remove(index)}
                        aria-label="حذف تنوع"
                      >
                        <IconX className="size-4" stroke={1.75} aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* ── مشخصات ── */}
      <Section
        icon={<IconListDetails className="size-4.5" stroke={1.75} />}
        title="مشخصات فنی"
        description="جفت‌های «نام ↔ مقدار» مثل منبع تغذیه: نیکل-کادمیوم"
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => specsArray.append({ key: "", value: "" })}
          >
            <IconCirclePlus className="size-4" stroke={1.75} aria-hidden="true" />
            افزودن مشخصه
          </Button>
        }
      >
        {specsArray.fields.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            مشخصه‌ای ثبت نشده است.
          </p>
        ) : (
          <div className="space-y-3">
            {specsArray.fields.map((field, index) => {
              const rowErrors = formState.errors.specs?.[index];
              return (
                <div key={field.id} className="flex flex-col gap-2 sm:flex-row sm:items-start">
                  <Field
                    label="نام"
                    htmlFor={`spec-key-${index}`}
                    error={rowErrors?.key?.message}
                    className="flex-1"
                  >
                    <Input
                      id={`spec-key-${index}`}
                      placeholder="مثلاً منبع تغذیه"
                      {...register(`specs.${index}.key` as const)}
                    />
                  </Field>
                  <Field
                    label="مقدار"
                    htmlFor={`spec-value-${index}`}
                    error={rowErrors?.value?.message}
                    className="flex-1"
                  >
                    <Input
                      id={`spec-value-${index}`}
                      placeholder="مثلاً ۴ عدد باتری قلمی"
                      {...register(`specs.${index}.value` as const)}
                    />
                  </Field>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="mt-6 size-9 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => specsArray.remove(index)}
                    aria-label="حذف مشخصه"
                  >
                    <IconTrash className="size-4" stroke={1.75} aria-hidden="true" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* ── نوار ذخیرهٔ چسبان ── */}
      <div className="sticky bottom-0 z-20 -mx-4 border-t bg-card/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {mode === "edit" ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <IconAlertTriangle className="size-4" stroke={1.75} aria-hidden="true" />
                  حذف محصول
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>حذف محصول</AlertDialogTitle>
                  <AlertDialogDescription>
                    آیا از حذف «{watch("title") || "این محصول"}» مطمئن هستید؟ این عمل
                    بازگشت‌پذیر نیست.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleteBusy}>انصراف</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={deleteBusy}
                    onClick={(event) => {
                      event.preventDefault();
                      void handleDelete();
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteBusy ? "در حال حذف…" : "حذف کن"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <p className="text-xs text-muted-foreground">
              پس از ذخیره، محصول در فهرست و (در صورت فعال‌بودن) در فروشگاه نمایش داده می‌شود.
            </p>
          )}
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" asChild disabled={saving}>
              <Link href="/admin/products">انصراف</Link>
            </Button>
            <Button type="submit" disabled={saving} className="gap-1.5 font-bold">
              {saving ? (
                <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <IconDeviceFloppy className="size-4" stroke={1.75} aria-hidden="true" />
              )}
              {mode === "create" ? "ساخت محصول" : "ذخیرهٔ تغییرات"}
            </Button>
          </div>
        </div>
        {Object.keys(formState.errors).length > 0 ? (
          <p className="mt-2 text-xs font-medium text-destructive">
            برخی فیلدها ناقص‌اند — پیام‌های قرمز هر بخش را بررسی کنید.
          </p>
        ) : null}
      </div>
    </form>
  );
}
