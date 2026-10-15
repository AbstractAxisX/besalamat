/**
 * فروشگاه سبد خرید — zustand + persist (localStorage)
 * ─────────────────────────────
 * فایل store خالص است و «use client» ندارد؛
 * کامپوننت‌های مصرف‌کننده با «الگوی mounted» مقدار پایدارِ پس از هایدریشن را
 * می‌خوانند تا با HTML سمت سرور اختلاف نیفتد.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { CartLine } from "@/types/shop";

export interface CartState {
  lines: CartLine[];
  /** مهر زمانی آخرین افزودن — کلید انیمیشن bump نشانگر سبد */
  lastAddedAt: number | null;
  addLine: (line: CartLine) => void;
  setQty: (productId: string, variantId: string | null, qty: number) => void;
  removeLine: (productId: string, variantId: string | null) => void;
  clear: () => void;
}

/** محدودسازی تعداد به بازهٔ ۱..maxQty */
function clampQty(qty: number, maxQty: number): number {
  const max = Math.max(1, maxQty);
  return Math.min(Math.max(1, Math.round(qty)), max);
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      lastAddedAt: null,

      addLine: (line) =>
        set((state) => {
          const index = state.lines.findIndex(
            (item) =>
              item.productId === line.productId &&
              item.variantId === line.variantId,
          );
          if (index !== -1) {
            const current = state.lines[index];
            if (current) {
              const lines = state.lines.slice();
              lines[index] = {
                ...current,
                qty: clampQty(current.qty + line.qty, current.maxQty),
              };
              return { lines, lastAddedAt: Date.now() };
            }
          }
          return {
            lines: [...state.lines, { ...line, qty: clampQty(line.qty, line.maxQty) }],
            lastAddedAt: Date.now(),
          };
        }),

      setQty: (productId, variantId, qty) =>
        set((state) => ({
          lines: state.lines.map((item) =>
            item.productId === productId && item.variantId === variantId
              ? { ...item, qty: clampQty(qty, item.maxQty) }
              : item,
          ),
        })),

      removeLine: (productId, variantId) =>
        set((state) => ({
          lines: state.lines.filter(
            (item) =>
              !(item.productId === productId && item.variantId === variantId),
          ),
        })),

      clear: () => set({ lines: [], lastAddedAt: null }),
    }),
    {
      name: "bs-cart",
      partialize: (state) => ({ lines: state.lines }),
    },
  ),
);

/** مجموع تعداد اقلام سبد */
export function cartCount(lines: CartLine[]): number {
  return lines.reduce((total, line) => total + line.qty, 0);
}

/** جمع سبد (تومان) — بدون هزینهٔ ارسال */
export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((total, line) => total + line.qty * line.unitPrice, 0);
}
