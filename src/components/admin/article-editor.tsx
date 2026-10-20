"use client";

/**
 * ادیتور مقاله — ساخت (/admin/articles/new) و ویرایش (/admin/articles/[id])
 * ─────────────────────────────
 * بخش‌های کارت‌دار (اطلاعات اصلی / متن و تصویر / انتشار) + سئوی جمع‌شونده؛
 * دسته با کامبوباکس جستجودار؛ نوار ذخیرهٔ چسبان تمام‌عرض؛
 * تاریخ انتشار به‌صورت خودکار هنگام انتشار ثبت می‌شود.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  IconArrowRight,
  IconChevronDown,
  IconDeviceFloppy,
  IconExternalLink,
  IconNews,
  IconPhoto,
  IconSend,
  IconSeo,
  IconTrash,
} from "@tabler/icons-react";

import { toFa } from "@/lib/format";
import { faDate } from "@/lib/jalali";
import { apiFetch, apiSend } from "@/components/admin/api";
import { Combobox } from "@/components/admin/combobox";
import { DeleteConfirm } from "@/components/admin/delete-confirm";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type {
  AdminArticleCategoryRow,
  AdminArticleDetailRow,
} from "@/types/admin";

interface ArticleEditorProps {
  mode: "new" | "edit";
  articleId?: string;
}

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

interface ArticleForm {
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  coverUrl: string;
  categoryId: string;
  isPublished: boolean;
  seoTitle: string;
  seoDescription: string;
}

const EMPTY_FORM: ArticleForm = {
  title: "",
  slug: "",
  excerpt: "",
  contentHtml: "",
  coverUrl: "",
  categoryId: "",
  isPublished: false,
  seoTitle: "",
  seoDescription: "",
};

/** اسلاگ ساده — فقط حروف لاتین/اعداد باقی می‌مانند (عنوان فارسی → خالی) */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** قالب بخش‌های فرم — هم‌سان با ویرایشگر محصول (سربرگ آیکون‌دار + توضیح) */
function Section({
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

export function ArticleEditor({ mode, articleId }: ArticleEditorProps) {
  const router = useRouter();
  const [loaded, setLoaded] = useState(mode === "new");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState<ArticleForm>(EMPTY_FORM);
  const [categories, setCategories] = useState<AdminArticleCategoryRow[]>([]);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [deleting, setDeleting] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  /* بارگذاری: دسته‌ها همیشه + جزئیات مقاله در حالت ویرایش */
  useEffect(() => {
    let active = true;
    const detailPromise =
      mode === "edit" && articleId !== undefined
        ? apiFetch<{ article: AdminArticleDetailRow }>(`/api/admin/articles/${articleId}`)
        : Promise.resolve(null);

    Promise.all([apiFetch<{ categories: AdminArticleCategoryRow[] }>("/api/admin/articles"), detailPromise])
      .then(([listResponse, detail]) => {
        if (!active) return;
        setCategories(listResponse.categories);
        if (detail !== null) {
          setForm({
            title: detail.article.title,
            slug: detail.article.slug,
            excerpt: detail.article.excerpt,
            contentHtml: detail.article.contentHtml,
            coverUrl: detail.article.coverUrl,
            categoryId: detail.article.categoryId ?? "",
            isPublished: detail.article.isPublished,
            seoTitle: detail.article.seoTitle ?? "",
            seoDescription: detail.article.seoDescription ?? "",
          });
          setPublishedAt(detail.article.publishedAt);
          setSlugTouched(true);
        }
        setLoaded(true);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLoadError(error instanceof Error ? error.message : "بارگذاری مقاله ناموفق بود");
      });
    return () => {
      active = false;
    };
  }, [mode, articleId]);

  /* پیشنهاد خودکار نامک از روی عنوان (فقط برای حروف لاتین) */
  const suggestedSlug = useMemo(() => slugify(form.title), [form.title]);

  const submit = useCallback(async (): Promise<void> => {
    if (form.title.trim().length < 2) {
      toast.error("عنوان مقاله را وارد کنید (حداقل ۲ حرف)");
      return;
    }
    if (!SLUG_REGEX.test(form.slug.trim())) {
      toast.error("نامک فقط حروف کوچک لاتین، عدد و خط تیره — مثل home-blood-pressure");
      return;
    }
    if (form.coverUrl.trim().length === 0) {
      toast.error("تصویر جلد مقاله را بارگذاری یا نشانی آن را وارد کنید");
      return;
    }
    if (form.excerpt.trim().length < 5) {
      toast.error("چکیدهٔ مقاله را وارد کنید (حداقل ۵ حرف)");
      return;
    }
    if (form.contentHtml.trim().length < 10) {
      toast.error("متن مقاله را وارد کنید (حداقل ۱۰ حرف)");
      return;
    }
    setSaving(true);
    const body = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      coverUrl: form.coverUrl.trim(),
      excerpt: form.excerpt.trim(),
      contentHtml: form.contentHtml,
      categoryId: form.categoryId.length > 0 ? form.categoryId : null,
      seoTitle: form.seoTitle.trim().length > 0 ? form.seoTitle.trim() : null,
      seoDescription: form.seoDescription.trim().length > 0 ? form.seoDescription.trim() : null,
      isPublished: form.isPublished,
      /* در ویرایش، تاریخ انتشار قبلی حفظ می‌شود؛ سرور در صورت خالی‌بودن و انتشار، اکنون را می‌گذارد */
      publishedAt: mode === "edit" ? publishedAt : null,
    };
    try {
      if (mode === "edit" && articleId !== undefined) {
        await apiSend(`/api/admin/articles/${articleId}`, "PUT", body);
        toast.success(form.isPublished ? "مقاله ذخیره و منتشر شد" : "مقاله ذخیره شد (پیش‌نویس)");
      } else {
        await apiSend("/api/admin/articles", "POST", body);
        toast.success(form.isPublished ? "مقاله ساخته و منتشر شد" : "پیش‌نویس مقاله ساخته شد");
      }
      router.push("/admin/articles");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ذخیرهٔ مقاله ناموفق بود");
      setSaving(false);
    }
  }, [form, mode, articleId, publishedAt, router]);

  const confirmDelete = useCallback(async (): Promise<void> => {
    if (articleId === undefined) return;
    setDeleteBusy(true);
    try {
      await apiSend(`/api/admin/articles/${articleId}`, "DELETE");
      toast.success("مقاله حذف شد");
      router.push("/admin/articles");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حذف مقاله ناموفق بود");
      setDeleteBusy(false);
    }
  }, [articleId, router]);

  /* ── خطای بارگذاری ── */
  if (loadError !== null) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon" asChild aria-label="بازگشت">
            <Link href="/admin/articles">
              <IconArrowRight className="size-5" stroke={1.75} aria-hidden="true" />
            </Link>
          </Button>
          <h1 className="text-lg font-bold">ویرایش مقاله</h1>
        </div>
        <p className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {loadError}
        </p>
      </div>
    );
  }

  /* ── اسکلت ── */
  if (!loaded) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-2">
      {/* سربرگ */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon" asChild aria-label="بازگشت به فهرست">
            <Link href="/admin/articles">
              <IconArrowRight className="size-5" stroke={1.75} aria-hidden="true" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-bold">
              {mode === "edit" ? "ویرایش مقاله" : "مقالهٔ جدید"}
            </h1>
            {mode === "edit" && publishedAt !== null ? (
              <p className="mt-0.5 text-xs text-muted-foreground">
                انتشار: {faDate(publishedAt)}
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-muted-foreground">
                عنوان، متن HTML، جلد و انتشار در مجلهٔ سلامت
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {mode === "edit" && form.isPublished ? (
            <Button type="button" variant="outline" size="sm" asChild className="gap-1.5">
              <a href={`/blog/${form.slug}`} target="_blank" rel="noreferrer">
                مشاهده در مجله
                <IconExternalLink className="size-4" stroke={1.75} aria-hidden="true" />
              </a>
            </Button>
          ) : null}
          {mode === "edit" ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setDeleting(true)}
            >
              <IconTrash className="size-4" stroke={1.75} aria-hidden="true" />
              حذف
            </Button>
          ) : null}
        </div>
      </div>

      {/* اطلاعات اصلی */}
      <Section
        icon={<IconNews className="size-4.5" stroke={1.75} />}
        title="اطلاعات اصلی"
        description="عنوان و نامک یکتای مقاله در مجله"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="article-title" className="text-xs font-semibold">
              عنوان *
            </Label>
            <Input
              id="article-title"
              value={form.title}
              onChange={(event) => setForm((f) => ({ ...f, title: event.target.value }))}
              placeholder="مثلاً: راهنمای انتخاب فشارسنج خانگی"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="article-slug" className="text-xs font-semibold">
              نامک *
            </Label>
            <div className="flex gap-2">
              <Input
                id="article-slug"
                dir="ltr"
                className="text-start font-mono"
                value={form.slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setForm((f) => ({ ...f, slug: event.target.value.toLowerCase() }));
                }}
                placeholder="home-blood-pressure"
              />
              {suggestedSlug.length > 0 && form.slug !== suggestedSlug ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => setForm((f) => ({ ...f, slug: suggestedSlug }))}
                  title={`پیشنهاد: ${suggestedSlug}`}
                >
                  خودکار
                </Button>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">
              {slugTouched || suggestedSlug.length === 0
                ? "نشانی مقاله در مجله — مثل /blog/home-blood-pressure"
                : "برای عنوان‌های فارسی، نامک را دستی وارد کنید"}
            </p>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="article-excerpt" className="text-xs font-semibold">
            چکیده *
          </Label>
          <Textarea
            id="article-excerpt"
            rows={2}
            value={form.excerpt}
            onChange={(event) => setForm((f) => ({ ...f, excerpt: event.target.value }))}
            placeholder="یک تا دو خط معرفی که در فهرست مجله و شبکه‌های اجتماعی نمایش داده می‌شود"
          />
        </div>
      </Section>

      {/* متن و جلد */}
      <Section
        icon={<IconPhoto className="size-4.5" stroke={1.75} />}
        title="متن و تصویر"
        description="جلد افقی ۸:۵ و متن کامل مقاله (HTML)"
      >
        <ImageUploadField
          ratio="landscape"
          label="تصویر جلد *"
          value={form.coverUrl}
          onChange={(url) => setForm((f) => ({ ...f, coverUrl: url }))}
          hint="نسبت افقی ۸:۵ — مثل بندانگشتی مجله"
        />
        <div className="space-y-1.5">
          <Label htmlFor="article-content" className="text-xs font-semibold">
            متن مقاله * (HTML)
          </Label>
          <Textarea
            id="article-content"
            dir="rtl"
            rows={14}
            value={form.contentHtml}
            onChange={(event) => setForm((f) => ({ ...f, contentHtml: event.target.value }))}
            className="min-h-72 font-mono text-[13px] leading-7"
            placeholder="<p>متن مقاله با تگ‌های HTML…</p>"
          />
          <p className="text-xs leading-5 text-muted-foreground">
            HTML مجاز است — پاراگراف <span dir="ltr" className="font-mono">&lt;p&gt;</span>، تیترها
            <span dir="ltr" className="font-mono"> &lt;h2&gt;/&lt;h3&gt;</span> و لیست‌ها؛ متن پیش‌فرض
            راست‌به‌چپ نمایش داده می‌شود.
          </p>
        </div>
      </Section>

      {/* انتشار و دسته */}
      <Section
        icon={<IconSend className="size-4.5" stroke={1.75} />}
        title="انتشار"
        description="دستهٔ موضوعی و وضعیت نمایش در مجلهٔ سلامت"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">دستهٔ مقاله</Label>
            <Combobox
              options={categories.map((category) => ({
                value: category.id,
                label: category.title,
              }))}
              value={form.categoryId}
              onValueChange={(value) => setForm((f) => ({ ...f, categoryId: value }))}
              placeholder="انتخاب دسته…"
              searchPlaceholder="جستجوی دسته…"
              emptyText="دسته‌ای با این نام پیدا نشد."
              clearLabel="بدون دسته"
              ariaLabel="دستهٔ مقاله"
            />
            <p className="text-xs text-muted-foreground">
              {toFa(categories.length)} دسته فعال است — با تایپ نام، جستجو کنید.
            </p>
          </div>
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 py-2">
              <span className="text-xs font-semibold">انتشار در مجلهٔ سلامت</span>
              <Switch
                checked={form.isPublished}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, isPublished: checked }))}
                aria-label="انتشار مقاله"
              />
            </label>
            <p className="text-xs leading-5 text-muted-foreground">
              {form.isPublished
                ? publishedAt !== null
                  ? `منتشرشده از ${faDate(publishedAt)} — با هر ذخیره به‌روز می‌شود`
                  : "با اولین ذخیره، تاریخ انتشار امروز ثبت می‌شود"
                : "پیش‌نویس — فقط در پنل دیده می‌شود"}
            </p>
          </div>
        </div>
      </Section>

      {/* سئو (جمع‌شونده) */}
      <Collapsible className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xs">
        <CollapsibleTrigger className="flex w-full items-center justify-between border-b border-border/50 bg-muted/40 px-5 py-3.5 text-sm font-bold hover:bg-muted/60">
          <span className="flex items-center gap-2">
            <IconSeo className="size-4.5 text-muted-foreground" stroke={1.75} aria-hidden="true" />
            سئو (اختیاری)
          </span>
          <IconChevronDown
            className="size-4 text-muted-foreground transition-transform [[data-state=open]>&]:rotate-180"
            stroke={1.75}
            aria-hidden="true"
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-5 px-5 py-5">
          <div className="space-y-1.5">
            <Label htmlFor="article-seo-title" className="text-xs font-semibold">
              عنوان سئو
            </Label>
            <Input
              id="article-seo-title"
              value={form.seoTitle}
              onChange={(event) => setForm((f) => ({ ...f, seoTitle: event.target.value }))}
              placeholder="خالی = همان عنوان مقاله"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="article-seo-desc" className="text-xs font-semibold">
              توضیح سئو
            </Label>
            <Textarea
              id="article-seo-desc"
              rows={2}
              value={form.seoDescription}
              onChange={(event) => setForm((f) => ({ ...f, seoDescription: event.target.value }))}
              placeholder="توضیح متا برای نتایج جست‌وجو (حدود ۱۵۰ حرف)"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* نوار ذخیرهٔ چسبان — هم‌سان با ویرایشگر محصول */}
      <div className="sticky bottom-0 z-20 -mx-4 border-t border-border/60 bg-card/95 px-4 py-3 backdrop-blur-sm md:-mx-8 md:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-muted-foreground">
            {form.isPublished
              ? "این مقاله در مجلهٔ سلامت قابل مشاهده است."
              : "این مقاله پیش‌نویس است و فقط در پنل دیده می‌شود."}
          </p>
          <div className="flex shrink-0 gap-2">
            <Button type="button" variant="ghost" asChild disabled={saving}>
              <Link href="/admin/articles">انصراف</Link>
            </Button>
            <Button type="button" className="gap-1.5 font-semibold" disabled={saving} onClick={() => void submit()}>
              <IconDeviceFloppy className="size-4" stroke={1.75} aria-hidden="true" />
              {saving ? "در حال ذخیره…" : mode === "edit" ? "ذخیرهٔ مقاله" : "ساخت مقاله"}
            </Button>
          </div>
        </div>
      </div>

      {/* تأیید حذف */}
      <DeleteConfirm
        open={deleting}
        onOpenChange={setDeleting}
        title="حذف مقاله"
        description={
          form.title.trim().length > 0
            ? `مقالهٔ «${form.title}» برای همیشه حذف می‌شود؛ این کار برگشت‌پذیر نیست.`
            : "این مقاله برای همیشه حذف می‌شود؛ این کار برگشت‌پذیر نیست."
        }
        busy={deleteBusy}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
