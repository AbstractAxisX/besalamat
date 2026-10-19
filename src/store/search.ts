/**
 * فروشگاه دیالوگ جستجو — zustand (بدون persist)
 * ─────────────────────────────
 * یک نمونهٔ دیالوگ در هدر رندر می‌شود؛ هر کامپوننتی (هیرو، نوار موبایل،
 * دکمهٔ شورت‌کات) می‌تواند از طریق این store آن را باز کند.
 */

import { create } from "zustand";

export interface SearchDialogState {
  open: boolean;
  openDialog: () => void;
  closeDialog: () => void;
  toggleDialog: () => void;
}

export const useSearchDialogStore = create<SearchDialogState>()((set) => ({
  open: false,
  openDialog: () => set({ open: true }),
  closeDialog: () => set({ open: false }),
  toggleDialog: () => set((state) => ({ open: !state.open })),
}));
