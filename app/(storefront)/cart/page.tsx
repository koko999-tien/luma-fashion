"use client";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { formatVND } from "@/lib/format";

export default function CartPage() {
  const { items, subtotal, loading, refresh, toast } = useCart();
  const freeShipAt = 499000;

  const change = async (itemId: string, quantity: number) => {
    await fetch("/api/cart/update", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemId, quantity }) });
    await refresh();
  };
  const remove = async (itemId: string) => {
    await fetch("/api/cart/remove", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemId }) });
    await refresh();
    toast("Đã xoá sản phẩm khỏi giỏ");
  };

  const remaining = Math.max(0, freeShipAt - subtotal);
  const progress = Math.min(100, (subtotal / freeShipAt) * 100);

  if (loading) {
    return <div className="max-w-6xl mx-auto px-4 py-16 grid gap-4"><div className="skeleton h-24" /><div className="skeleton h-24" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl sm:text-4xl font-extrabold flex items-center gap-3"><ShoppingBag /> Giỏ hàng <span className="text-accent">({items.length})</span></h1>

      {items.length === 0 ? (
        <div className="mt-10 text-center card p-16">
          <ShoppingBag size={56} className="mx-auto text-stone2" />
          <h2 className="mt-4 font-display text-2xl">Giỏ hàng đang trống</h2>
          <p className="text-sm text-gray2 mt-2">Khám phá hàng nghìn sản phẩm mới nhất của LUMA.</p>
          <Link href="/products" className="btn-accent mt-6">Bắt đầu mua sắm <ArrowRight size={16} /></Link>
        </div>
      ) : (
        <div className="mt-6 grid lg:grid-cols-3 gap-6">
          {/* Danh sách sản phẩm */}
          <div className="lg:col-span-2 space-y-3">
            {/* Thanh tiến trình freeship */}
            <div className="card p-4">
              <p className="text-xs font-semibold">{remaining > 0 ? <>Mua thêm <span className="text-accent">{formatVND(remaining)}</span> để được <b>FREESHIP</b> 🚚</> : <>Bạn được <b>FREESHIP</b> rồi! 🎉</>}</p>
              <div className="mt-2 h-2 rounded-full bg-gray3 overflow-hidden"><div className="h-full bg-accent transition-all duration-500" style={{ width: `${progress}%` }} /></div>
            </div>

            {items.map((i) => (
              <div key={i.id} className="card p-3 sm:p-4 flex gap-4">
                <Link href={`/products/${i.productSlug}`} className="relative h-32 w-24 sm:h-36 sm:w-28 shrink-0 overflow-hidden rounded-xl bg-gray3">
                  {i.image && <Image src={i.image} alt={i.productName} fill sizes="112px" className="object-cover" />}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${i.productSlug}`} className="text-sm font-semibold hover:text-accent line-clamp-2">{i.productName}</Link>
                  <p className="mt-1 text-[11px] text-gray2">Size <b>{i.size}</b> • Màu <b>{i.color}</b> • SKU {i.sku}</p>
                  <p className="mt-1.5 text-base font-extrabold text-accent">{formatVND(i.unitPrice)}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="inline-flex items-center rounded-full border border-stone2">
                      <button className="p-2 hover:text-accent" onClick={() => change(i.id, i.quantity - 1)} aria-label="Giảm số lượng"><Minus size={15} /></button>
                      <span className="w-9 text-center text-sm font-bold">{i.quantity}</span>
                      <button className="p-2 hover:text-accent" onClick={() => change(i.id, i.quantity + 1)} aria-label="Tăng số lượng"><Plus size={15} /></button>
                    </div>
                    <button className="p-2 text-gray2 hover:text-accent" onClick={() => remove(i.id)} aria-label="Xoá khỏi giỏ"><Trash2 size={18} /></button>
                  </div>
                </div>
              </div>
            ))}
            <Link href="/products" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray2 hover:text-ink pt-2">← Tiếp tục mua sắm</Link>
          </div>

          {/* Tóm tắt đơn hàng */}
          <aside className="card p-6 h-fit lg:sticky lg:top-24">
            <h2 className="font-display text-xl font-bold">Tóm tắt đơn hàng</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray2"><dt>Tạm tính ({items.reduce((s, i) => s + i.quantity, 0)} sản phẩm)</dt><dd>{formatVND(subtotal)}</dd></div>
              <div className="flex justify-between text-gray2"><dt>Phí vận chuyển</dt><dd>{subtotal >= freeShipAt ? "Miễn phí" : "Tính ở bước thanh toán"}</dd></div>
            </dl>
            <div className="mt-4 border-t border-stone2 pt-4 flex justify-between font-extrabold text-lg"><span>Tổng cộng</span><span className="text-accent">{formatVND(subtotal)}</span></div>
            <p className="mt-1 text-[10px] text-gray2">Mã giảm giá & phí ship được áp dụng tại bước thanh toán.</p>
            <Link href="/checkout" className="btn-accent w-full mt-5 !py-4">Tiến hành thanh toán <ArrowRight size={18} /></Link>
            <p className="mt-3 text-center text-[10px] text-gray2">🔒 Thông tin của bạn được bảo mật tuyệt đối</p>
          </aside>
        </div>
      )}
    </div>
  );
}
