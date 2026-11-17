"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCart } from "./CartProvider";

type Option = { id: string; name: string };
type VariantRow = { id: string; size: string; color: string; stock: number };

export default function ProductForm({
  mode, categories, collections, productId, initial, variants, initialImages,
}: {
  mode: "new" | "edit";
  categories: Option[];
  collections: Option[];
  productId?: string;
  initial?: { name: string; description: string; material: string; care: string; origin: string; gender: string; categoryId: string; collectionId: string; basePrice: number; salePrice: number | null; isNew: boolean; isFeatured: boolean; isBestSeller: boolean; status: string };
  variants?: VariantRow[];
  initialImages?: string[];
}) {
  const router = useRouter();
  const { toast } = useCart();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    material: initial?.material ?? "",
    care: initial?.care ?? "",
    origin: initial?.origin ?? "Made in Vietnam",
    gender: initial?.gender ?? "UNISEX",
    categoryId: initial?.categoryId ?? categories[0]?.id ?? "",
    collectionId: initial?.collectionId ?? "",
    basePrice: initial?.basePrice ?? 299000,
    salePrice: initial?.salePrice ?? "" as number | string,
    isNew: initial?.isNew ?? false,
    isFeatured: initial?.isFeatured ?? false,
    isBestSeller: initial?.isBestSeller ?? false,
    status: initial?.status ?? "ACTIVE",
  });
  const [imagesText, setImagesText] = useState((initialImages ?? []).join("\n"));
  const [uploading, setUploading] = useState(false);
  const [variantsText, setVariantsText] = useState("S|Đen|#111111|20\nM|Đen|#111111|20\nL|Đen|#111111|20");
  const [stocks, setStocks] = useState<Record<string, number>>(Object.fromEntries((variants ?? []).map((v) => [v.id, v.stock])));

  const images = imagesText.split("\n").map((s) => s.trim()).filter(Boolean);

  const uploadFiles = async (fileList: FileList | null) => {
    if (!fileList?.length || uploading) return;
    setUploading(true);
    try {
      const fd = new FormData();
      for (const f of Array.from(fileList).slice(0, 10)) fd.append("files", f);
      const res = await fetch("/api/admin/uploads", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { toast(data.message ?? "Upload thất bại"); return; }
      setImagesText((prev) => [prev.trim(), ...(data.urls as string[])].filter(Boolean).join("\n"));
      toast(`✓ Đã upload ${data.urls.length} ảnh`);
    } catch {
      toast("Upload thất bại — kiểm tra kết nối");
    } finally { setUploading(false); }
  };

  const field = "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-accent placeholder-white/25";
  const label = "block text-[10px] font-bold uppercase tracking-widest text-white/45 mb-1.5";
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const submitNew = async () => {
    const variantLines = variantsText.split("\n").map((s) => s.trim()).filter(Boolean);
    const parsedVariants = variantLines.map((line) => {
      const [size, color, colorHex, stock] = line.split("|").map((s) => s.trim());
      return { size, color, colorHex: colorHex || "#111111", stock: Number(stock) || 0 };
    });
    const res = await fetch("/api/admin/products", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        basePrice: Number(form.basePrice),
        salePrice: form.salePrice === "" ? null : Number(form.salePrice),
        collectionId: form.collectionId || null,
        images,
        variants: parsedVariants,
      }),
    });
    const data = await res.json();
    if (!res.ok) { toast(data.message ?? "Có lỗi xảy ra"); return false; }
    toast("✓ Đã tạo sản phẩm");
    return true;
  };

  const submitEdit = async () => {
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        basePrice: Number(form.basePrice),
        salePrice: form.salePrice === "" ? null : Number(form.salePrice),
        collectionId: form.collectionId || null,
        variantStocks: (variants ?? []).map((v) => ({ variantId: v.id, stock: Number(stocks[v.id] ?? v.stock) })),
        images,
      }),
    });
    const data = await res.json();
    if (!res.ok) { toast(data.message ?? "Có lỗi xảy ra"); return false; }
    toast("✓ Đã lưu sản phẩm");
    return true;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const ok = mode === "new" ? await submitNew() : await submitEdit();
    setBusy(false);
    if (ok) { router.push("/admin/products"); router.refresh(); }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="md:col-span-2"><label className={label} htmlFor="n">Tên sản phẩm *</label><input id="n" required className={field} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Áo Sơ Mi Oxford Trắng" /></div>
        <div className="md:col-span-2"><label className={label} htmlFor="d">Mô tả *</label><textarea id="d" required className={`${field} min-h-[80px]`} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Chất vải…, form…, phù hợp…" /></div>
        <div><label className={label} htmlFor="m">Chất liệu</label><input id="m" className={field} value={form.material} onChange={(e) => set("material", e.target.value)} /></div>
        <div><label className={label} htmlFor="c">Bảo quản</label><input id="c" className={field} value={form.care} onChange={(e) => set("care", e.target.value)} /></div>
        <div><label className={label} htmlFor="o">Xuất xứ</label><input id="o" className={field} value={form.origin} onChange={(e) => set("origin", e.target.value)} /></div>
        <div><label className={label} htmlFor="g">Giới tính</label><select id="g" className={field} value={form.gender} onChange={(e) => set("gender", e.target.value)}><option value="MEN">Nam</option><option value="WOMEN">Nữ</option><option value="UNISEX">Unisex</option></select></div>
        <div><label className={label} htmlFor="cat">Danh mục *</label><select id="cat" className={field} value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div><label className={label} htmlFor="col">Bộ sưu tập</label><select id="col" className={field} value={form.collectionId} onChange={(e) => set("collectionId", e.target.value)}><option value="">— Không —</option>{collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div><label className={label} htmlFor="bp">Giá gốc (VND) *</label><input id="bp" required type="number" min={1000} className={field} value={form.basePrice} onChange={(e) => set("basePrice", e.target.value)} /></div>
        <div><label className={label} htmlFor="sp">Giá sale (để trống nếu không)</label><input id="sp" type="number" min={1000} className={field} value={form.salePrice} onChange={(e) => set("salePrice", e.target.value)} /></div>
      </div>

      <div className="flex flex-wrap gap-4 text-[13px] text-white/70">
        {([["isNew", "Hàng mới"], ["isFeatured", "Featured"], ["isBestSeller", "Bán chạy"]] as const).map(([k, lbl]) => (
          <label key={k} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="accent-[#B4532A]" checked={Boolean(form[k])} onChange={(e) => set(k, e.target.checked)} />{lbl}</label>
        ))}
        <label className="flex items-center gap-2 cursor-pointer"><span>Trạng thái:</span><select className="rounded-lg bg-white/5 border border-white/15 px-2 py-1 text-white" value={form.status} onChange={(e) => set("status", e.target.value)}><option value="ACTIVE">Đang bán</option><option value="ARCHIVED">Lưu trữ</option></select></label>
      </div>

      {/* Ảnh sản phẩm — upload thật hoặc URL; dòng đầu là ảnh chính */}
      <div>
        <label className={label} htmlFor="img">Ảnh sản phẩm (dòng đầu = ảnh chính){mode === "new" ? " *" : ""}</label>
        <textarea id="img" className={`${field} font-mono text-[11px] min-h-[90px]`} value={imagesText} onChange={(e) => setImagesText(e.target.value)} placeholder={"/api/files/… hoặc https://…\nmỗi dòng 1 ảnh"} required={mode === "new"} />
        <div className="mt-2 flex items-center gap-3 flex-wrap">
          <label className="rounded-lg border border-sky-400/40 text-sky-300 px-4 py-2 text-[11px] font-bold uppercase tracking-wider cursor-pointer hover:bg-sky-400/10">
            {uploading ? "Đang upload…" : "⭱ Upload từ máy tính"}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden" disabled={uploading} onChange={(e) => uploadFiles(e.target.files)} />
          </label>
          <span className="text-[10px] text-white/35">JPG, PNG, WEBP, GIF • tối đa 5MB/ảnh, 10 ảnh/lần. Ảnh lưu ngoài public, phục vụ an toàn qua /api/files.</span>
        </div>
        {images.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {images.map((url) => (
              <img key={url} src={url} alt="Ảnh sản phẩm" className="h-20 w-16 object-cover rounded-lg border border-white/10 bg-white/5 shrink-0" />
            ))}
          </div>
        )}
      </div>

      {mode === "new" && (
        <div><label className={label} htmlFor="var">Biến thể — mỗi dòng: <span className="text-amber-400">SIZE|MÀU|#HEX|TỒN KHO</span> *</label><textarea id="var" required className={`${field} font-mono text-[11px] min-h-[110px]`} value={variantsText} onChange={(e) => setVariantsText(e.target.value)} /></div>
      )}

      {mode === "edit" && variants && variants.length > 0 && (
        <div>
          <p className={label}>Tồn kho theo biến thể</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {variants.map((v) => (
              <label key={v.id} className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-[11px]"><span className="font-bold text-white/80">{v.size} • {v.color}</span><input type="number" min={0} className="mt-1.5 w-full rounded-lg bg-black/30 border border-white/10 px-2 py-1.5 text-white font-bold" value={stocks[v.id] ?? v.stock} onChange={(e) => setStocks((s) => ({ ...s, [v.id]: Number(e.target.value) }))} /></label>
            ))}
          </div>
        </div>
      )}

      <button type="submit" disabled={busy} className="btn bg-accent text-white px-8 py-3.5 text-sm font-bold uppercase tracking-wider hover:bg-accentdark disabled:opacity-60">{busy ? <><Loader2 size={16} className="animate-spin" /> Đang lưu…</> : mode === "new" ? "Tạo sản phẩm" : "Lưu thay đổi"}</button>
    </form>
  );
}
