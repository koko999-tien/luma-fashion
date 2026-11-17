"use client";
import { useMemo, useState } from "react";
import { Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import { useCart } from "./CartProvider";
import { formatVND, discountPercent, GENDER_LABEL } from "@/lib/format";
import WishlistButton from "./WishlistButton";

type Variant = { id: string; size: string; color: string; colorHex: string; stock: number; sku: string; priceOverride: number | null };
type Props = {
  product: { id: string; name: string; basePrice: number; salePrice: number | null; gender: string; sku?: string };
  variants: Variant[];
  rating: number | null;
  reviewCount: number;
};

export default function AddToCartPanel({ product, variants, rating, reviewCount }: Props) {
  const { refresh, openDrawer, toast } = useCart();
  const [size, setSize] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  const colors = useMemo(() => {
    const seen = new Map<string, string>();
    for (const v of variants) if (!seen.has(v.color)) seen.set(v.color, v.colorHex);
    return [...seen.entries()].map(([c, colorHex]) => ({ color: c, colorHex }));
  }, [variants]);
  const sizes = useMemo(() => [...new Set(variants.map((v) => v.size))], [variants]);
  const activeColor = color || colors[0]?.color || "";
  const activeSize = size || "";

  const stockOf = (s: string, c: string) => variants.find((v) => v.size === s && v.color === c)?.stock ?? 0;
  const selected = variants.find((v) => v.size === activeSize && v.color === activeColor);
  const price = selected?.priceOverride ?? product.salePrice ?? product.basePrice;
  const discount = product.salePrice ? Math.round((1 - product.salePrice / product.basePrice) * 100) : 0;
  const maxQty = selected?.stock ?? 0;

  const add = async (gotoCheckout: boolean) => {
    if (!activeSize) { toast("Vui lòng chọn size"); return; }
    if (!selected || selected.stock <= 0) { toast("Phiên bản này đã hết hàng"); return; }
    setAdding(true);
    try {
      const res = await fetch("/api/cart/add", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ variantId: selected.id, quantity: qty }) });
      const data = await res.json();
      if (!res.ok) { toast(data.message ?? "Không thêm được vào giỏ"); return; }
      await refresh();
      if (gotoCheckout) window.location.href = "/checkout";
      else { openDrawer(); }
    } catch {
      toast("Lỗi kết nối, thử lại nhé");
    } finally { setAdding(false); }
  };

  return (
    <div className="flex flex-col">
      <h1 className="font-display text-2xl sm:text-4xl font-extrabold leading-tight">{product.name}</h1>
      <div className="mt-2 flex items-center gap-3 text-xs text-gray2 flex-wrap">
        {rating !== null && <span className="flex items-center gap-1 font-semibold text-amber-600">★ {rating} <span className="text-gray2 font-normal">({reviewCount} đánh giá)</span></span>}
        <span>•</span>
        <span>{GENDER_LABEL[product.gender] ?? product.gender}</span>
        {selected && <><span>•</span><span>SKU: {selected.sku}</span></>}
      </div>

      <div className="mt-4 flex items-baseline gap-3">
        <span className="text-3xl font-extrabold text-accent">{formatVND(price)}</span>
        {product.salePrice && <span className="text-lg text-gray2 line-through">{formatVND(product.basePrice)}</span>}
        {discount > 0 && <span className="badge bg-accent text-white">-{discount}%</span>}
      </div>

      {/* Màu sắc */}
      <div className="mt-5">
        <p className="label">Màu sắc: <span className="text-ink normal-case font-semibold">{activeColor}</span></p>
        <div className="flex flex-wrap gap-2.5">
          {colors.map((c) => (
            <button key={c.color} onClick={() => setColor(c.color)} title={c.color} aria-pressed={activeColor === c.color} aria-label={`Màu ${c.color}`}
              className={`h-9 w-9 rounded-full border-2 transition ${activeColor === c.color ? "border-accent scale-115 ring-2 ring-accent/30" : "border-ink/10 hover:scale-110"}`} style={{ background: c.colorHex }} />
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <p className="label mb-0">Kích thước</p>
          <a href="#size-guide" className="text-[11px] text-accent underline underline-offset-2">Hướng dẫn chọn size</a>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {sizes.map((s) => {
            const stock = stockOf(s, activeColor);
            const disabled = stock <= 0;
            return (
              <button key={s} disabled={disabled} onClick={() => { setSize(s); setQty(1); }}
                className={`min-w-[48px] rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition disabled:opacity-35 disabled:line-through disabled:cursor-not-allowed ${activeSize === s ? "border-accent bg-accent/10 text-accent" : "border-stone2 hover:border-ink"}`}>
                {s}
              </button>
            );
          })}
        </div>
        {selected && <p className="mt-2 text-[11px] text-gray2">{selected.stock > 0 ? (selected.stock <= 5 ? `⚠ Chỉ còn ${selected.stock} sản phẩm!` : `Còn ${selected.stock} sản phẩm`) : "Hết hàng"}</p>}
      </div>

      {/* Số lượng + nút */}
      <div className="mt-5 flex items-stretch gap-3 flex-wrap sm:flex-nowrap">
        <div className="flex items-center rounded-2xl border border-stone2 bg-white">
          <button className="p-4 hover:text-accent" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Giảm"><Minus size={16} /></button>
          <span className="w-10 text-center font-bold">{qty}</span>
          <button className="p-4 hover:text-accent" onClick={() => setQty((q) => Math.min(maxQty || 1, q + 1))} aria-label="Tăng"><Plus size={16} /></button>
        </div>
        <button onClick={() => add(false)} disabled={adding || (selected !== undefined && selected.stock <= 0)} className="btn-accent flex-1 !py-4 disabled:opacity-50"><ShoppingBag size={18} />{adding ? "Đang thêm…" : "Thêm vào giỏ"}</button>
        <WishlistButton productId={product.id} className="!bg-white border border-stone2 !shadow-none !p-4" />
      </div>
      <button onClick={() => add(true)} disabled={adding} className="mt-2.5 btn border border-ink !py-4 text-sm font-bold uppercase tracking-wider hover:bg-ink hover:text-white disabled:opacity-50"><Zap size={17} /> Mua ngay</button>

      <p className="mt-4 text-[11px] text-gray2">🔒 Thanh toán an toàn • 🚚 Freeship đơn từ 499K • 🔄 Đổi trả 7 ngày</p>
    </div>
  );
}
