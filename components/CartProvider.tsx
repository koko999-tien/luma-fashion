"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { CartViewItem } from "@/lib/cart";

type ToastFn = (msg: string) => void;
type CartContextType = {
  items: CartViewItem[];
  subtotal: number;
  count: number;
  loading: boolean;
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  refresh: () => Promise<void>;
  toast: ToastFn;
};
const CartContext = createContext<CartContextType | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartViewItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);

  const toast = useCallback<ToastFn>((msg) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      const data = await res.json();
      setItems(data.items ?? []);
      setSubtotal(data.subtotal ?? 0);
    } catch {
      // giữ nguyên giỏ cũ nếu mất mạng
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, subtotal, count, loading, isOpen, openDrawer: () => setIsOpen(true), closeDrawer: () => setIsOpen(false), refresh, toast }}>
      {children}
      {/* Toaster */}
      <div className="fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-2">
        {toasts.map((t) => (
          <div key={t.id} role="status" className="rounded-full bg-ink px-5 py-2.5 text-sm text-white shadow-xl animate-fade-up">{t.msg}</div>
        ))}
      </div>
    </CartContext.Provider>
  );
}
