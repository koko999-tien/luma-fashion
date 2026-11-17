"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./CartProvider";
import { Loader2 } from "lucide-react";

export default function CouponForm() {
  const router = useRouter();
  const { toast } = useCart();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ code: "", type: "PERCENT" as "PERCENT" | "FIXED", value: 10, minOrder: 300000, maxDiscount: 100000 as number | "", expiresAt: "", usageLimit: "" as number | "", perCustomerLimit: "" as number | "" });
  const set = (k: keyof typeof form, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const field = "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-accent placeholder-white/25";
  const label = "block text-[10px] font-bold uppercase tracking-widest text-white/45 mb-1.5";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const res = await fetch("/api/admin/coupons", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code, type: form.type, value: Number(form.value), minOrder: Number(form.minOrder),
        maxDiscount: form.type === "PERCENT" && form.maxDiscount !== "" ? Number(form.maxDiscount) : null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        usageLimit: form.usageLimit === "" ? null : Number(form.usageLimit),
        perCustomerLimit: form.perCustomerLimit === "" ? null : Number(form.perCustomerLimit),
      }),
    });
    const data = await res.json();
    toast(res.ok ? `✓ Đã tạo mã ${form.code.toUpperCase()}` : data.message ?? "Có lỗi");
    setBusy(false);
    if (res.ok) { setForm({ ...form, code: "" }); router.refresh(); }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div><label className={label} htmlFor="code">Mã *</label><input id="code" required className={`${field} uppercase font-mono`} value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase())} placeholder="SALE30" /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className={label} htmlFor="type">Loại</label><select id="type" className={field} value={form.type} onChange={(e) => set("type", e.target.value)}><option value="PERCENT">Giảm %</option><option value="FIXED">Giảm số tiền</option></select></div>
        <div><label className={label} htmlFor="value">{form.type === "PERCENT" ? "% giảm" : "Số tiền (₫)"} *</label><input id="value" required type="number" min={1} className={field} value={form.value} onChange={(e) => set("value", e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className={label} htmlFor="min">Đơn tối thiểu (₫)</label><input id="min" type="number" min={0} className={field} value={form.minOrder} onChange={(e) => set("minOrder", e.target.value)} /></div>
        {form.type === "PERCENT" && <div><label className={label} htmlFor="max">Giảm tối đa (₫)</label><input id="max" type="number" min={0} className={field} value={form.maxDiscount} onChange={(e) => set("maxDiscount", e.target.value)} /></div>}
      </div>
      <div><label className={label} htmlFor="exp">Hạn sử dụng</label><input id="exp" type="date" className={field} value={form.expiresAt} onChange={(e) => set("expiresAt", e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className={label} htmlFor="lim">Giới hạn lượt</label><input id="lim" type="number" min={1} className={field} value={form.usageLimit} onChange={(e) => set("usageLimit", e.target.value)} placeholder="∞" /></div>
        <div><label className={label} htmlFor="pcl">Giới hạn / khách</label><input id="pcl" type="number" min={1} className={field} value={form.perCustomerLimit} onChange={(e) => set("perCustomerLimit", e.target.value)} placeholder="∞" /></div>
      </div>
      <button type="submit" disabled={busy} className="btn bg-accent text-white w-full py-3 text-xs font-bold uppercase tracking-wider hover:bg-accentdark disabled:opacity-60">{busy ? <Loader2 size={15} className="animate-spin" /> : "Tạo mã"}</button>
    </form>
  );
}
