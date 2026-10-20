/**
 * ابزارهای مشترک Route Handlerها — گارد ادمین و پاسخ‌های JSON فارسی
 * ─────────────────────────────────────────────────
 * همهٔ APIهای ادمین با requireAdmin گارد می‌شوند (نقش ADMIN الزامی است)؛
 * middleware فقط «وجود کوکی» را می‌سنجد و نقش همین‌جا عمیقاً بررسی می‌شود.
 */

import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getSessionUser, type SessionUser } from "@/server/session";

/** پاسخ ۴۰۱ استاندارد (فارسی) */
export function unauthorized(): NextResponse {
  return NextResponse.json({ message: "دسترسی غیرمجاز؛ ابتدا به‌عنوان مدیر وارد شوید." }, { status: 401 });
}

/** پاسخ ۴۰۰ استاندارد (فارسی) */
export function badRequest(message: string): NextResponse {
  return NextResponse.json({ message }, { status: 400 });
}

/** پاسخ ۴۰۴ استاندارد (فارسی) */
export function notFound(message = "رکورد مورد نظر پیدا نشد."): NextResponse {
  return NextResponse.json({ message }, { status: 404 });
}

/** گارد ادمین — کاربر سشن‌دار با نقش ADMIN، وگرنه null */
export async function requireAdmin(): Promise<SessionUser | null> {
  const user = await getSessionUser();
  if (user === null || user.role !== "ADMIN") return null;
  return user;
}

/** خواندن امن JSON بدنه (بدون throw) */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

/** نخستین پیام فارسی خطای zod */
export function zodMessage(error: ZodError): string {
  return error.issues[0]?.message ?? "ورودی نامعتبر است.";
}

/** خطای Prisma → پیام فارسی خوانا (کلید یونیک تکراری و…) */
export function prismaErrorMessage(error: unknown, fallback: string): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "";
  if (code === "P2002") return "مقدار تکراری است؛ اسلاگ/کلید یکتا باید متفاوت باشد.";
  if (code === "P2025") return "رکورد مورد نظر پیدا نشد.";
  return fallback;
}

/** اجرای wrapper مشترک: گارد ادمین + تبدیل خطا به پاسخ فارسی */
export async function adminHandler(
  handler: (admin: SessionUser) => Promise<NextResponse>,
): Promise<NextResponse> {
  const admin = await requireAdmin();
  if (admin === null) return unauthorized();
  try {
    return await handler(admin);
  } catch (error) {
    if (error instanceof ZodError) return badRequest(zodMessage(error));
    console.error("[api/admin] خطای غیرمنتظره:", error);
    return NextResponse.json(
      { message: "خطای غیرمنتظره‌ای رخ داد؛ لطفاً دوباره تلاش کنید." },
      { status: 500 },
    );
  }
}
