"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, Save, Link2, X } from "lucide-react";
import { useCart } from "./CartProvider";

export type CollectionRow = { id: string; name: string; slug: string; description: string | null; image: string | null; sort: number; active: boolean; isFeatured: boolean; _count: { products: number } };
export type ProductLite = { id: string; name: string; collectionId: string | null };

export default function CollectionManager({ initial, products }: { initial: CollectionRow[]; products: ProductLite[] }) {
  const router = useRouter();
  const { toast } = useCart();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", image: "", sort: 0, active: true, isFeatured: false });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pick, setPick] = useState("");

  const field = "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent placeholder-white/25";
  const label = "block text-[10px] font-bold uppercase tracking-widest text-white/45 mb-1";

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busyId) return;
    setBusyId("new");
    const res = await fetch("/api/admin/collections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    toast(res.ok ? `✓ Đã tạo “${form.name}”` : data.message ?? "Có lỗi");
    setBusyId(null);
    if (res.ok) { setForm({ name: "", description: "", image: "", sort: 0, active: true, isFeatured: false }); setCreating(false); router.refresh(); }
  };

  const patch = async (id: string, data: Record<string, unknown>) => {
    setBusyId(id);
    const res = await fetch(`/api/admin/collections/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    toast(res.ok ? "✓ Đã lưu" : (await res.json()).message ?? "Có lỗi");
    setBusyId(null);
    router.refresh();
  };

  const remove = async (row: CollectionRow) => {
    if (!confirm(`Xoá bộ sưu tập “${row.name}”? ${row._count.products} sản phẩm sẽ được gỡ khỏi collection, KHÔNG bị xoá.`)) return;
    setBusyId(row.id);
    const res = await fetch(`/api/admin/collections/${row.id}`, { method: "DELETE" });
    toast(res.ok ? "✓ Đã xoá bộ sưu tập" : "Có lỗi");
    setBusyId(null);
    router.refresh();
  };

  const assign = async (collectionId: string, addIds: string[], removeIds: string[]) => {
    setBusyId(collectionId);
    await fetch(`/api/admin/collections/${collectionId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productIdsToAdd: addIds, productIdsToRemove: removeIds }) });
    setBusyId(null);
    setPick("");
    router.refresh();
  };

  return (
    <div className="grid lg:grid-cols-5 gap-5">
      <div className="lg:col-span-3 space-y-2">
        {initial.map((r) => {
          const inCollection = products.filter((p) => p.collectionId === r.id);
          const notIn = products.filter((p) => p.collectionId !== r.id);
          return (
            <div key={r.id} className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-12 sm:col-span-5 flex items-center gap-3">
                  {r.image ? <img src={r.image} alt={r.name} className="h-14 w-20 object-cover rounded-lg bg-white/10" /> : <div className="h-14 w-20 rounded-lg bg-white/10 grid place-items-center text-white/30 text-[10px]">No img</div>}
                  <div className="min-w-0">
                    <input className={field} defaultValue={r.name} onBlur={(e) => e.target.value !== r.name && patch(r.id, { name: e.target.value })} aria-label="Tên bộ sưu tập" />
                    <p className="mt-1 text-[9px] font-mono text-white/35">/collection/{r.slug} • {r._count.products} sản phẩm</p>
                  </div>
                </div>
                <div className="col-span-6 sm:col-span-2 flex items-center justify-center gap-2 text-[11px] text-white/60">
                  <input type="checkbox" className="accent-[#B4532A]" defaultChecked={r.isFeatured} onChange={(e) => patch(r.id, { isFeatured: e.target.checked })} aria-label="Nổi bật" /> Featured
                </div>
                <label className="col-span-6 sm:col-span-2 flex items-center gap-2 text-[11px] text-white/60 cursor-pointer justify-center">
                  <input type="checkbox" className="accent-[#B4532A]" defaultChecked={r.active} onChange={(e) => patch(r.id, { active: e.target.checked })} /> Hiển thị
                </label>
                <div className="col-span-12 sm:col-span-3 flex justify-end gap-2">
                  <button onClick={() => setExpandedId(expandedId === r.id ? null : r.id)} className="text-[10px] font-bold uppercase text-sky-300 border border-sky-400/40 rounded-lg px-2.5 py-1.5 hover:bg-sky-400/10"><Link2 size={13} className="inline" /> Sản phẩm ({r._count.products})</button>
                  <button onClick={() => remove(r)} disabled={busyId === r.id} className="text-red-400 hover:text-red-300 disabled:opacity-40 p-1.5" aria-label="Xoá bộ sưu tập">{busyId === r.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={17} />}</button>
                </div>
              </div>
              {expandedId === r.id && (
                <div className="mt-3 border-t border-white/10 pt-3 grid sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-white/45">Trong bộ sưu tập</p>
                    <ul className="mt-1.5 space-y-1 max-h-44 overflow-y-auto">
                      {inCollection.map((p) => (
                        <li key={p.id} className="flex items-center justify-between gap-2 text-[11px] text-white/75 bg-white/5 rounded-lg px-2.5 py-1.5"><span className="line-clamp-1">{p.name}</span><button onClick={() => assign(r.id, [], [p.id])} className="text-red-400 hover:text-red-300 shrink-0" aria-label="Gỡ khỏi bộ sưu tập"><X size={14} /></button></li>
                      ))}
                      {inCollection.length === 0 && <li className="text-[11px] text-white/35">Chưa có sản phẩm.</li>}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-white/45">Thêm vào</p>
                    <div className="mt-1.5 flex gap-2">
                      <select className="flex-1 rounded-lg border border-white/15 bg-white/5 px-2 py-2 text-[11px] text-white" value={pick} onChange={(e) => setPick(e.target.value)} aria-label="Chọn sản phẩm để thêm">
                        <option value="">— Chọn sản phẩm —</option>
                        {notIn.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <button disabled={!pick || busyId === r.id} onClick={() => pick && assign(r.id, [pick], [])} className="rounded-lg bg-accent px-3 text-xs font-bold text-white disabled:opacity-40">Thêm</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {initial.length === 0 && <p className="text-white/35 text-sm">Chưa có bộ sưu tập.</p>}
      </div>

      <div className="lg:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-5 h-fit">
        <button onClick={() => setCreating((v) => !v)} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white"><Plus size={15} /> Thêm bộ sưu tập</button>
        {creating && (
          <form onSubmit={create} className="mt-4 space-y-3">
            <div><label className={label} htmlFor="cn">Tên *</label><input id="cn" required className={field} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Thu – Đông 2027" /></div>
            <div><label className={label} htmlFor="cd">Mô tả</label><textarea id="cd" rows={2} className={field} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Câu chuyện bộ sưu tập…" /></div>
            <div><label className={label} htmlFor="ci">URL banner</label><input id="ci" type="url" className={field} value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://…" /></div>
            <div className="flex flex-wrap gap-4 items-center text-[12px] text-white/60">
              <div className="w-20"><label className={label} htmlFor="cs">Thứ tự</label><input id="cs" type="number" min={0} className={field} value={form.sort} onChange={(e) => setForm({ ...form, sort: Number(e.target.value) })} /></div>
              <label className="flex items-center gap-2 cursor-pointer pt-4"><input type="checkbox" className="accent-[#B4532A]" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Hiển thị</label>
              <label className="flex items-center gap-2 cursor-pointer pt-4"><input type="checkbox" className="accent-[#B4532A]" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Nổi bật</label>
            </div>
            <button type="submit" disabled={busyId === "new"} className="btn bg-accent text-white w-full py-3 text-xs font-bold uppercase tracking-wider hover:bg-accentdark disabled:opacity-60">{busyId === "new" ? <Loader2 size={15} className="animate-spin" /> : <><Save size={15} /> Lưu bộ sưu tập</>}</button>
          </form>
        )}
        <p className="mt-4 text-[10px] text-white/35 leading-relaxed">Xoá bộ sưu tập sẽ <b>gỡ liên kết</b> sản phẩm (không xoá sản phẩm). “Featured” dành cho bộ sưu tập được làm banner editorial trang chủ.</p>
      </div>
    </div>
  );
}
