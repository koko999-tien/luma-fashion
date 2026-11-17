"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./CartProvider";
import { Loader2 } from "lucide-react";

export default function BannerForm() {
  const router = useRouter();
  const { toast } = useCart();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ headline: "", subtext: "", image: "", ctaText: "Khám phá ngay", ctaUrl: "/products", sort: 10 });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: k === "sort" ? Number(e.target.value) : e.target.value });
  const field = "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-accent placeholder-white/25";
  const label = "block text-[10px] font-bold uppercase tracking-widest text-white/45 mb-1.5";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const res = await fetch("/api/admin/banners", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    toast(res.ok ? "✓ Đã thêm banner" : data.message ?? "Có lỗi (URL ảnh phải hợp lệ)");
    setBusy(false);
    if (res.ok) { setForm({ ...form, headline: "", image: "" }); router.refresh(); }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div><label className={label} htmlFor="h">Headline *</label><input id="h" required className={field} value={form.headline} onChange={set("headline")} placeholder="ĐỊNH HÌNH PHONG CÁCH MỖI NGÀY" /></div>
      <div><label className={label} htmlFor="s">Phụ đề</label><input id="s" className={field} value={form.subtext} onChange={set("subtext")} placeholder="Bộ sưu tập Thu – Đông 2026" /></div>
      <div><label className={label} htmlFor="i">URL ảnh *</label><input id="i" required type="url" className={`${field} font-mono text-[11px]`} value={form.image} onChange={set("image")} placeholder="https://images.unsplash.com/photo-…" /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className={label} htmlFor="ct">Chữ nút (CTA)</label><input id="ct" className={field} value={form.ctaText} onChange={set("ctaText")} /></div>
        <div><label className={label} htmlFor="cu">Link nút</label><input id="cu" className={field} value={form.ctaUrl} onChange={set("ctaUrl")} placeholder="/products?sale=true" /></div>
      </div>
      <div><label className={label} htmlFor="so">Thứ tự (nhỏ hiện trước)</label><input id="so" type="number" min={0} className={field} value={form.sort} onChange={set("sort")} /></div>
      <button type="submit" disabled={busy} className="btn bg-accent text-white w-full py-3 text-xs font-bold uppercase tracking-wider hover:bg-accentdark disabled:opacity-60">{busy ? <Loader2 size={15} className="animate-spin" /> : "Thêm banner"}</button>
    </form>
  );
}
