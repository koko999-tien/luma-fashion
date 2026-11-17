"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

type Props = {
  categories: { slug: string; name: string }[];
  sizes: string[];
  colors: { color: string; colorHex: string }[];
  current: { category: string; gender: string; size: string; color: string; price: string; sale: boolean; q: string };
  priceRanges: { key: string; label: string }[];
};

export default function FilterSidebar({ categories, sizes, colors, current, priceRanges }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [open, setOpen] = useState(false);

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value); else params.delete(key);
    params.delete("page");
    router.push(`/products?${params}`);
  };
  const clearAll = () => router.push(current.q ? `/products?q=${encodeURIComponent(current.q)}` : "/products");
  const hasFilters = current.category || current.gender || current.size || current.color || current.price || current.sale;

  const section = (title: string, children: React.ReactNode) => (
    <fieldset className="border-b border-stone2 py-4">
      <legend className="text-[11px] font-bold uppercase tracking-widest text-ink mb-2.5">{title}</legend>
      {children}
    </fieldset>
  );
  const radio = (name: string, value: string, label: string, active: boolean) => (
    <label key={value || "all"} className="flex items-center gap-2 py-1 text-[13px] cursor-pointer hover:text-accent">
      <input type="radio" name={name} className="accent-[#B4532A]" checked={active} onChange={() => setParam(name, value)} />{label}
    </label>
  );

  const panel = (
    <div className="bg-white rounded-2xl border border-stone2/70 p-4">
      <div className="flex items-center justify-between mb-1">
        <p className="flex items-center gap-2 font-bold text-sm"><SlidersHorizontal size={16} /> Bộ lọc</p>
        {hasFilters && <button onClick={clearAll} className="text-[11px] font-bold text-accent flex items-center gap-1 hover:underline"><X size={12} /> Xoá lọc</button>}
      </div>

      {section("Khoảng giá", priceRanges.map((r) => radio("price", r.key, r.label, current.price === r.key)))}
      {section("Giới tính", <>
        {radio("gender", "", "Tất cả", !current.gender)}
        {radio("gender", "MEN", "Nam", current.gender === "MEN")}
        {radio("gender", "WOMEN", "Nữ", current.gender === "WOMEN")}
        {radio("gender", "UNISEX", "Unisex", current.gender === "UNISEX")}
      </>)}
      {section("Danh mục", <>
        {radio("category", "", "Tất cả", !current.category)}
        {categories.map((c) => radio("category", c.slug, c.name, current.category === c.slug))}
      </>)}
      {section("Size", (
        <div className="flex flex-wrap gap-1.5">
          {sizes.map((s) => (
            <button key={s} onClick={() => setParam("size", current.size === s ? "" : s)}
              className={`min-w-[40px] rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${current.size === s ? "border-accent bg-accent/10 text-accent" : "border-stone2 hover:border-ink"}`}>{s}</button>
          ))}
        </div>
      ))}
      {section("Màu sắc", (
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <button key={c.color} title={c.color} aria-label={`Màu ${c.color}`} aria-pressed={current.color === c.color} onClick={() => setParam("color", current.color === c.color ? "" : c.color)}
              className={`h-7 w-7 rounded-full border-2 ${current.color === c.color ? "border-accent ring-2 ring-accent/30 scale-110" : "border-ink/10"}`} style={{ background: c.colorHex }} />
          ))}
        </div>
      ))}
      {section("Khuyến mãi", (
        <label className="flex items-center gap-2 text-[13px] cursor-pointer">
          <input type="checkbox" className="accent-[#B4532A]" checked={current.sale} onChange={(e) => setParam("sale", e.target.checked ? "true" : "")} /> Chỉ hiện sản phẩm đang sale
        </label>
      ))}
    </div>
  );

  return (
    <>
      {/* Nút mở filter trên mobile */}
      <button onClick={() => setOpen(true)} className="lg:hidden btn-outline w-full mb-4 !py-2.5 text-xs"><SlidersHorizontal size={15} /> Bộ lọc</button>
      <aside className="hidden lg:block self-start sticky top-24">{panel}</aside>
      {open && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button className="absolute inset-0 bg-ink/55" onClick={() => setOpen(false)} aria-label="Đóng bộ lọc" />
          <div className="absolute left-0 top-0 h-full w-[88vw] max-w-xs overflow-y-auto bg-paper p-4 animate-drawer-left">
            <button className="mb-2 ml-auto block rounded-full bg-white p-2" onClick={() => setOpen(false)} aria-label="Đóng"><X size={18} /></button>
            {panel}
          </div>
        </div>
      )}
    </>
  );
}
