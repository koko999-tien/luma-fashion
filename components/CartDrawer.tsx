"use client";
import { useCart } from "./CartProvider";
import { formatVND } from "@/lib/format";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

async function updateItem(itemId: string, quantity: number) {
  await fetch("/api/cart/update", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemId, quantity }) });
}
async function removeItem(itemId: string) {
  await fetch("/api/cart/remove", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemId }) });
}

export default function CartDrawer() {
  const { items, subtotal, isOpen, closeDrawer, refresh, toast } = useCart();
  if (!isOpen) return null;

  const change = async (itemId: string, quantity: number) => {
    await updateItem(itemId, quantity);
    await refresh();
  };
  const remove = async (itemId: string) => {
    await removeItem(itemId);
    await refresh();
    toast("Đã xoá sản phẩm khỏi giỏ");
  };

  return (
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-label="Giỏ hàng">
      <button className="absolute inset-0 bg-ink/55 animate-overlay cursor-default" onClick={closeDrawer} aria-label="Đóng giỏ hàng" />
      <aside className="absolute right-0 top-0 flex h-full w-[min(430px,100vw)] flex-col bg-white shadow-2xl animate-drawer">
        <div className="flex items-center justify-between border-b border-stone2 px-5 py-4">
          <h2 className="font-display text-lg font-bold flex items-center gap-2"><ShoppingBag size={20} /> Giỏ hàng của bạn</h2>
          <button onClick={closeDrawer} className="rounded-full p-2 hover:bg-gray3" aria-label="Đóng"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="mt-20 text-center">
              <ShoppingBag size={48} className="mx-auto text-stone2" />
              <p className="mt-4 font-semibold">Giỏ hàng đang trống</p>
              <p className="text-sm text-gray2 mt-1">Hãy chọn cho mình vài món đồ thật đẹp nhé!</p>
              <button onClick={closeDrawer} className="btn-primary mt-6">Tiếp tục mua sắm</button>
            </div>
          ) : (
            items.map((i) => (
              <div key={i.id} className="flex gap-3 rounded-2xl bg-paper p-3 border border-stone2/60">
                <Link href={`/products/${i.productSlug}`} onClick={closeDrawer} className="relative h-28 w-20 shrink-0 overflow-hidden rounded-xl bg-stone2">
                  {i.image && <Image src={i.image} alt={i.productName} fill sizes="80px" className="object-cover" />}
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold leading-snug line-clamp-2">{i.productName}</p>
                  <p className="mt-1 text-[11px] text-gray2">Size {i.size} • {i.color}</p>
                  <p className="text-[13px] font-bold text-accent mt-1">{formatVND(i.unitPrice)}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="inline-flex items-center rounded-full border border-stone2 bg-white">
                      <button className="p-1.5 hover:text-accent" onClick={() => change(i.id, i.quantity - 1)} aria-label="Giảm số lượng"><Minus size={14} /></button>
                      <span className="w-8 text-center text-xs font-bold">{i.quantity}</span>
                      <button className="p-1.5 hover:text-accent" onClick={() => change(i.id, i.quantity + 1)} aria-label="Tăng số lượng"><Plus size={14} /></button>
                    </div>
                    <button className="p-1.5 text-gray2 hover:text-accent" onClick={() => remove(i.id)} aria-label="Xoá khỏi giỏ"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-stone2 p-5 bg-white">
            <div className="flex justify-between text-sm text-gray2"><span>Tạm tính</span><span>{formatVND(subtotal)}</span></div>
            <div className="mt-1 flex justify-between font-bold text-base"><span>Tổng cộng</span><span className="text-accent">{formatVND(subtotal)}</span></div>
            <p className="mt-1 text-[11px] text-gray2">Phí ship & mã giảm giá được áp dụng tại bước thanh toán.</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link href="/cart" onClick={closeDrawer} className="btn-outline !py-3 text-center text-[13px]">Xem giỏ hàng</Link>
              <Link href="/checkout" onClick={closeDrawer} className="btn-accent !py-3 text-center text-[13px]">Thanh toán</Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
