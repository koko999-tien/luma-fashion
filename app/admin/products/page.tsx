import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatVND } from "@/lib/format";
import ProductStatusToggle from "@/components/ProductStatusToggle";
import { Plus, Search } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin – Sản phẩm" };

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { q = "", status = "" } = await searchParams;
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (q) where.OR = [{ name: { contains: q } }, { variants: { some: { sku: { contains: q } } } }];

  const products = await prisma.product.findMany({
    where,
    include: { images: { take: 1, orderBy: { sort: "asc" } }, category: { select: { name: true } }, variants: { select: { stock: true } } },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">Sản phẩm <span className="text-white/30">({products.length})</span></h1>
        <div className="flex items-center gap-2">
          <Link href="/admin/products/import" className="rounded-xl border border-sky-400/40 text-sky-300 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider hover:bg-sky-400/10">⭱ Import CSV</Link>
          <Link href="/admin/products/new" className="btn bg-accent text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-accentdark"><Plus size={16} /> Thêm sản phẩm</Link>
        </div>
      </div>

      <form className="mt-4 flex flex-wrap gap-2" method="get">
        <div className="flex items-center gap-2 flex-1 min-w-[220px] rounded-xl bg-white/5 border border-white/10 px-4">
          <Search size={16} className="text-white/40" />
          <input name="q" defaultValue={q} placeholder="Tìm theo tên hoặc SKU…" className="bg-transparent outline-none py-2.5 w-full text-sm text-white placeholder-white/30" />
        </div>
        <select name="status" defaultValue={status} className="rounded-xl bg-white/5 border border-white/10 px-3 text-sm text-white outline-none">
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang bán</option>
          <option value="ARCHIVED">Đã lưu trữ</option>
        </select>
        <button className="rounded-xl bg-white/10 px-5 text-sm font-semibold text-white hover:bg-white/15">Lọc</button>
      </form>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-[12px] min-w-[820px]">
          <thead className="bg-white/5 text-white/40 uppercase text-[10px] tracking-wider">
            <tr><th className="text-left px-4 py-3">Sản phẩm</th><th className="text-left px-3 py-3">Danh mục</th><th className="text-right px-3 py-3">Giá</th><th className="text-right px-3 py-3">Tồn kho</th><th className="text-left px-3 py-3">Nhãn</th><th className="text-left px-3 py-3">TT</th><th className="px-3 py-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {products.map((p) => {
              const stock = p.variants.reduce((s, v) => s + v.stock, 0);
              return (
                <tr key={p.id} className="hover:bg-white/5">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      {p.images[0] && <div className="relative h-14 w-11 rounded-lg overflow-hidden bg-white/10 shrink-0"><Image src={p.images[0].url} alt={p.name} fill sizes="44px" className="object-cover" /></div>}
                      <div><p className="font-semibold text-white line-clamp-1 max-w-[220px]">{p.name}</p><p className="text-[10px] text-white/40 font-mono">{p.slug}</p></div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-white/70">{p.category.name}</td>
                  <td className="px-3 py-2.5 text-right"><span className="font-bold text-amber-300">{formatVND(p.salePrice ?? p.basePrice)}</span>{p.salePrice && <span className="block text-[9px] text-white/35 line-through">{formatVND(p.basePrice)}</span>}</td>
                  <td className={`px-3 py-2.5 text-right font-bold ${stock <= 5 ? "text-red-400" : "text-emerald-400"}`}>{stock}</td>
                  <td className="px-3 py-2.5"><span className="flex gap-1 flex-wrap">{p.isNew && <span className="badge bg-sky-500/20 text-sky-300">Mới</span>}{p.isFeatured && <span className="badge bg-violet-500/20 text-violet-300">Featured</span>}{p.isBestSeller && <span className="badge bg-amber-500/20 text-amber-300">Best</span>}</span></td>
                  <td className="px-3 py-2.5"><span className={`badge ${p.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white/50"}`}>{p.status === "ACTIVE" ? "Đang bán" : "Lưu trữ"}</span></td>
                  <td className="px-3 py-2.5 text-right"><div className="flex items-center justify-end gap-2"><Link href={`/products/${p.slug}`} target="_blank" className="text-[10px] text-white/40 hover:text-white">Xem ↗</Link><Link href={`/admin/products/${p.id}/edit`} className="text-[11px] font-bold text-sky-300 hover:text-sky-200 underline underline-offset-2">Sửa</Link><ProductStatusToggle id={p.id} status={p.status} /></div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
