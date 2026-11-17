"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, X, ShoppingBag } from "lucide-react";
import { formatVND, discountPercent } from "@/lib/format";
import { useCart } from "./CartProvider";
import WishlistButton from "./WishlistButton";
import type { ProductCardData } from "@/lib/products";
import { avgRating, uniqueColors } from "@/lib/products";

export default function ProductCard({ product }: { product: ProductCardData }) {
  const { refresh, openDrawer, toast } = useCart();
  const [quickView, setQuickView] = useState(false);
  const [size, setSize] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [adding, setAdding] = useState(false);

  const price = product.salePrice ?? product.basePrice;
  const discount = discountPercent(product);
  const rating = avgRating(product);
  const colors = uniqueColors(product.variants);
  const sizes = useMemo(() => [...new Set(product.variants.map((v) => v.size))], [product.variants]);
  const hoverImg = product.images[1]?.url ?? product.images[0]?.url;
  const mainImg = product.images[0]?.url ?? "https://placehold.co/600x750?text=LUMA";

  const availability = (s: string, c: string) =>
    product.variants.filter((v) => v.size === s && (!c || v.color === c)).reduce((acc, v) => ({ ...acc, [v.color]: v.stock }), {} as Record<string, number>);

  const openQuickView = () => {
    setSize(sizes[0] ?? "");
    setColor(colors[0]?.color ?? "");
    setQuickView(true);
  };

  const variant = product.variants.find((v) => v.size === size && v.color === color);
  const outOfStock = variant ? variant.stock <= 0 : false;

  const addToCart = async (gotoCheckout = false) => {
    if (!size || !color) { toast("Vui lòng chọn size và màu"); return; }
    if (!variant) { toast("Phiên bản này không tồn tại"); return; }
    if (variant.stock <= 0) { toast("Phiên bản này đã hết hàng"); return; }
    setAdding(true);
    try {
      const res = await fetch("/api/cart/add", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ variantId: variant.id, quantity: 1 }) });
      const data = await res.json();
      if (!res.ok) { toast(data.message ?? "Không thêm được vào giỏ"); return; }
      await refresh();
      setQuickView(false);
      if (gotoCheckout) window.location.href = "/checkout";
      else { openDrawer(); toast("✓ Đã thêm vào giỏ hàng"); }
    } catch {
      toast("Lỗi kết nối, thử lại nhé");
    } finally { setAdding(false); }
  };

  return (
    <>
      <article className="group card overflow-hidden flex flex-col">
        <div className="relative aspect-[4/5] overflow-hidden bg-gray3">
          <Link href={`/products/${product.slug}`} aria-label={product.name}>
            <Image src={mainImg} alt={product.name} fill sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw" className="object-cover transition-opacity duration-500 group-hover:opacity-0" />
            <Image src={hoverImg} alt={`${product.name} — ảnh thứ hai`} fill sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw" className="object-cover absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </Link>
          <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
            {product.isNew && <span className="badge bg-ink text-white">Mới</span>}
            {discount > 0 && <span className="badge bg-accent text-white">-{discount}%</span>}
          </div>
          <WishlistButton productId={product.id} className="absolute right-2.5 top-2.5" />
          <button onClick={openQuickView} className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white/95 backdrop-blur px-4 py-2 text-[11px] font-bold uppercase tracking-wider opacity-100 sm:opacity-0 sm:group-hover:opacity-100 translate-y-0 sm:translate-y-2 sm:group-hover:translate-y-0 transition-all shadow hover:bg-ink hover:text-white">
            <Eye size={14} /> Xem nhanh
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-1 p-3.5">
          <p className="text-[10px] uppercase tracking-widest text-gray2">{product.category?.name}</p>
          <Link href={`/products/${product.slug}`} className="text-[13px] font-semibold leading-snug line-clamp-2 hover:text-accent min-h-[2.4em]">{product.name}</Link>
          <div className="flex items-center gap-1.5 text-[11px] text-gray2">
            {rating && <span>★ {rating}</span>}
            <span className="flex gap-1 ml-auto">{colors.slice(0, 4).map((c) => <span key={c.color} title={c.color} className="h-3 w-3 rounded-full border border-ink/15" style={{ background: c.colorHex }} />)}</span>
          </div>
          <div className="mt-auto flex items-baseline gap-2 pt-1">
            <span className="text-[15px] font-extrabold text-accent">{formatVND(price)}</span>
            {product.salePrice && <span className="text-[11px] text-gray2 line-through">{formatVND(product.basePrice)}</span>}
          </div>
        </div>
      </article>

      {/* Quick view modal */}
      {quickView && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`Xem nhanh ${product.name}`}>
          <button className="absolute inset-0 bg-ink/60 animate-overlay" onClick={() => setQuickView(false)} aria-label="Đóng" />
          <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white shadow-2xl animate-fade-up grid sm:grid-cols-2">
            <button onClick={() => setQuickView(false)} className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 hover:bg-gray3" aria-label="Đóng"><X size={18} /></button>
            <div className="relative aspect-[4/5] sm:aspect-auto sm:min-h-[420px] bg-gray3">
              <Image src={mainImg} alt={product.name} fill sizes="(max-width:640px) 100vw, 320px" className="object-cover rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none" />
            </div>
            <div className="p-5 flex flex-col">
              <h3 className="font-display text-lg font-bold leading-snug">{product.name}</h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-accent">{formatVND(price)}</span>
                {product.salePrice && <span className="text-sm text-gray2 line-through">{formatVND(product.basePrice)}</span>}
              </div>
              <div className="mt-4">
                <p className="label">Màu sắc</p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button key={c.color} onClick={() => setColor(c.color)} title={c.color} aria-label={`Màu ${c.color}`} aria-pressed={color === c.color}
                      className={`h-8 w-8 rounded-full border-2 transition ${color === c.color ? "border-accent scale-110 ring-2 ring-accent/30" : "border-ink/10"}`} style={{ background: c.colorHex }} />
                  ))}
                </div>
              </div>
              <div className="mt-3">
                <p className="label">Kích thước</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => {
                    const stock = availability(s, color)[color] ?? 0;
                    const disabled = stock <= 0;
                    return (
                      <button key={s} disabled={disabled} onClick={() => setSize(s)}
                        className={`min-w-[44px] rounded-lg border px-3 py-2 text-sm font-semibold transition disabled:opacity-35 disabled:line-through ${size === s ? "border-accent bg-accent/10 text-accent" : "border-stone2 hover:border-ink"}`}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
              {variant && <p className="mt-2 text-[11px] text-gray2">{variant.stock > 0 ? `Còn ${variant.stock} sản phẩm` : "Hết hàng"} • SKU: {variant.sku}</p>}
              <div className="mt-auto pt-4 grid grid-cols-1 gap-2">
                <button disabled={adding || outOfStock || !variant} onClick={() => addToCart(false)} className="btn-accent w-full disabled:opacity-50"><ShoppingBag size={17} />{outOfStock ? "Hết hàng" : adding ? "Đang thêm…" : "Thêm vào giỏ"}</button>
                <button disabled={adding || outOfStock || !variant} onClick={() => addToCart(true)} className="text-xs font-semibold text-gray2 underline underline-offset-4 hover:text-ink disabled:opacity-50">Mua ngay & thanh toán</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
