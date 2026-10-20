/**
 * ابزار fetch مشترک پنل ادمین (سمت کلاینت)
 * ─────────────────────────────
 * هدر JSON می‌گذارد، پاسخ‌های غیر۲xx را به Error با پیام فارسی
 * (فیلد {message} سرور) تبدیل می‌کند. apiSend پوشش متدهای بدنه‌دار است.
 */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** پیام فارسی خطا از پاسخ سرور — با پیش‌فرض عمومی */
export async function readErrorMessage(response: Response): Promise<string> {
  const data: unknown = await response.json().catch(() => null);
  if (isRecord(data) && typeof data.message === "string" && data.message.length > 0) {
    return data.message;
  }
  return "خطای غیرمنتظره‌ای رخ داد؛ لطفاً دوباره تلاش کنید.";
}

/** fetch با هدر JSON و مدیریت خطای فارسی */
export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init?.body != null ? { "content-type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
  return (await response.json()) as T;
}

/** ارسال متد‌دار (POST/PUT/DELETE) با بدنهٔ JSON */
export function apiSend<T>(
  url: string,
  method: "POST" | "PUT" | "DELETE",
  body?: unknown,
): Promise<T> {
  return apiFetch<T>(url, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

/** آپلود فایل تصویر → {url} (POST /api/admin/upload) */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
  const data: unknown = await response.json();
  if (isRecord(data) && typeof data.url === "string") return data.url;
  throw new Error("پاسخ آپلود نامعتبر بود.");
}
