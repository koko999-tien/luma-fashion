"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import { useCart } from "./CartProvider";

export type CategoryRow = { id: string; name: string; slug: string; description: string | null; image: string | null; sort: number; active: boolean; _count: { products: number } };

export default function CategoryManager({ initial }: { initial: CategoryRow[] }) {
  const router = useRouter();
  const { toast } = useCart();
  const [rows, setRows] = useState(initial);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", image: "", sort: 0, active: true });

  const field = "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent placeholder-white/25";
  const label = "block text-[10px] font-bold uppercase tracking-widest text-white/45 mb-1";

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busyId) return;
    setBusyId("new");
    const res = await fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    toast(res.ok ? `✓ Đã tạo danh mục “${form.name}”` : data.message ?? "Có lỗi");
    setBusyId(null);
    if (res.ok) { setForm({ name: "", description: "", image: "", sort: 0, active: true }); setCreating(false); router.refresh(); }
  };

  const patch = async (id: string, data: Record<string, unknown>) => {
    setBusyId(id);
    const res = await fetch(`/api/admin/categories/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    toast(res.ok ? "✓ Đã lưu" : "Có lỗi");
    setBusyId(null);
    router.refresh();
  };

  const remove = async (row: CategoryRow) => {
    if (!confirm(`Xoá/ẩn danh mục “${row.name}”? ${row._count.products > 0 ? `Đang có ${row._count.products} sản phẩm — sẽ bị ẨN, không xoá.` : "Sẽ xoá vĩnh viễn."}`)) return;
    setBusyId(row.id);
    const res = await fetch(`/api/admin/categories/${row.id}`, { method: "DELETE" });
    const data = await res.json();
    toast(data.message ?? "✓ Xong");
    setBusyId(null);
    router.refresh();
  };

  return (
    <div className="grid lg:grid-cols-5 gap-5">
      <div className="lg:col-span-3 space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="rounded-2xl bg-white/5 border border-white/10 p-4 grid grid-cols-12 gap-2 items-center">
            <div className="col-span-12 sm:col-span-5 flex items-center gap-3">
              {r.image ? <img src={r.image} alt={r.name} className="h-14 w-11 object-cover rounded-lg bg-white/10" /> : <div className="h-14 w-11 rounded-lg bg-white/10 grid place-items-center text-white/30 text-[10px]">No img</div>}
              <div className="min-w-0">
                <input className={field} defaultValue={r.name} onBlur={(e) => e.target.value !== r.name && patch(r.id, { name: e.target.value })} aria-label="Tên danh mục" />
                <p className="mt-1 text-[9px] font-mono text-white/35">/{r.slug} • {r._count.products} sản phẩm</p>
              </div>
            </div>
            <input className={`${field} col-span-4 sm:col-span-3`} type="number" min={0} defaultValue={r.sort} onBlur={(e) => Number(e.target.value) !== r.sort && patch(r.id, { sort: Number(e.target.value) })} aria-label="Thứ tự hiển thị" title="Thứ tự hiển thị (nhỏ hiện trước)" />
            <label className="col-span-4 sm:col-span-2 flex items-center gap-2 text-[11px] text-white/60 cursor-pointer justify-center">
              <input type="checkbox" className="accent-[#B4532A]" defaultChecked={r.active} onChange={(e) => patch(r.id, { active: e.target.checked })} /> Hiển thị
            </label>
            <button onClick={() => remove(r)} disabled={busyId === r.id} className="col-span-4 sm:col-span-2 flex justify-end text-red-400 hover:text-red-300 disabled:opacity-40" aria-label="Xoá danh mục">
              {busyId === r.id ? <Loader2 size={17} className="animate-spin" /> : <Trash2 size={17} />}
            </button>
          </div>
        ))}
        {rows.length === 0 && <p className="text-white/35 text-sm">Chưa có danh mục.</p>}
      </div>

      <div className="lg:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-5 h-fit">
        <button onClick={() => setCreating((v) => !v)} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white"><Plus size={15} /> Thêm danh mục</button>
        {creating && (
          <form onSubmit={create} className="mt-4 space-y-3">
            <div><label className={label} htmlFor="cn">Tên *</label><input id="cn" required className={field} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Áo khoác" /></div>
            <div><label className={label} htmlFor="cd">Mô tả</label><input id="cd" className={field} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mô tả ngắn cho SEO & trang danh mục" /></div>
            <div><label className={label} htmlFor="ci">URL ảnh (hoặc upload sau)</label><input id="ci" type="url" className={field} value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://…" /></div>
            <div className="flex gap-3 items-center">
              <div className="w-24"><label className={label} htmlFor="cs">Thứ tự</label><input id="cs" type="number" min={0} className={field} value={form.sort} onChange={(e) => setForm({ ...form, sort: Number(e.target.value) })} /></div>
              <label className="flex items-center gap-2 text-[12px] text-white/60 cursor-pointer pt-4"><input type="checkbox" className="accent-[#B4532A]" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Hiển thị ngay</label>
            </div>
            <button type="submit" disabled={busyId === "new"} className="btn bg-accent text-white w-full py-3 text-xs font-bold uppercase tracking-wider hover:bg-accentdark disabled:opacity-60">{busyId === "new" ? <Loader2 size={15} className="animate-spin" /> : <><Save size={15} /> Lưu danh mục</>}</button>
          </form>
        )}
        <p className="mt-4 text-[10px] text-white/35 leading-relaxed">Xoá danh mục đang có sản phẩm sẽ chỉ ẨN (active=false) để không ảnh hưởng đơn hàng & sản phẩm. Slug tự sinh từ tên, có thể chỉnh qua URL nếu cần.</p>
      </div>
    </div>
  );
}
