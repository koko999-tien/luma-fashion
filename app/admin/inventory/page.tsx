import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AlertTriangle } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin – Kho hàng" };

export default async function AdminInventory() {
  const lowStock = await prisma.productVariant.findMany({
    where: { stock: { lte: 5 }, product: { status: "ACTIVE" } },
    include: { product: { select: { id: true, name: true, slug: true } } },
    orderBy: { stock: "asc" },
    take: 100,
  });
  const recentTx = await prisma.inventoryTransaction.findMany({ orderBy: { createdAt: "desc" }, take: 15, include: { variant: { include: { product: { select: { name: true } } } } } });

  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">Kho hàng</h1>
      <p className="text-[11px] text-white/40 mt-1">Tồn kho theo từng biến thể (size × màu). Điều chỉnh trong trang Sửa sản phẩm.</p>

      <div className="mt-5 rounded-2xl border border-red-500/25 bg-red-500/5 overflow-hidden">
        <h2 className="flex items-center gap-2 px-5 py-4 text-xs font-bold uppercase tracking-widest text-red-300 border-b border-red-500/15"><AlertTriangle size={15} /> Sắp hết / Hết hàng ({lowStock.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] min-w-[640px]">
            <thead className="text-white/35 uppercase text-[10px]"><tr><th className="text-left px-5 py-2">Sản phẩm</th><th className="text-left px-3 py-2">Size</th><th className="text-left px-3 py-2">Màu</th><th className="text-left px-3 py-2">SKU</th><th className="text-right px-5 py-2">Tồn</th><th className="px-3 py-2"></th></tr></thead>
            <tbody className="divide-y divide-white/5">
              {lowStock.map((v) => (
                <tr key={v.id}>
                  <td className="px-5 py-2.5 text-white/80 max-w-[240px] line-clamp-1">{v.product.name}</td>
                  <td className="px-3 py-2.5">{v.size}</td>
                  <td className="px-3 py-2.5">{v.color}</td>
                  <td className="px-3 py-2.5 font-mono text-[10px] text-white/40">{v.sku}</td>
                  <td className={`px-5 py-2.5 text-right font-extrabold ${v.stock === 0 ? "text-red-400" : "text-orange-400"}`}>{v.stock === 0 ? "HẾT" : v.stock}</td>
                  <td className="px-3 py-2.5 text-right"><Link href={`/admin/products/${v.product.id}/edit`} className="text-[10px] underline text-sky-300">Nhập kho</Link></td>
                </tr>
              ))}
              {lowStock.length === 0 && <tr><td colSpan={6} className="px-5 py-8 text-center text-white/35">Không có biến thể nào sắp hết 🎉</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
        <h2 className="px-5 py-4 text-xs font-bold uppercase tracking-widest text-white/60 border-b border-white/10">Lịch sử nhập/xuất kho</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] min-w-[640px]">
            <thead className="text-white/35 uppercase text-[10px]"><tr><th className="text-left px-5 py-2">Thời gian</th><th className="text-left px-3 py-2">Sản phẩm</th><th className="text-left px-3 py-2">SKU</th><th className="text-left px-3 py-2">Lý do</th><th className="text-right px-5 py-2">±SL</th></tr></thead>
            <tbody className="divide-y divide-white/5">
              {recentTx.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-5 py-2.5 text-white/60">{new Date(tx.createdAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}</td>
                  <td className="px-3 py-2.5 text-white/80 max-w-[220px] line-clamp-1">{tx.variant.product.name}</td>
                  <td className="px-3 py-2.5 font-mono text-[10px] text-white/40">{tx.variant.sku}</td>
                  <td className="px-3 py-2.5 text-white/55">{tx.reason}</td>
                  <td className={`px-5 py-2.5 text-right font-bold ${tx.delta >= 0 ? "text-emerald-400" : "text-red-400"}`}>{tx.delta >= 0 ? "+" : ""}{tx.delta}</td>
                </tr>
              ))}
              {recentTx.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-white/35">Chưa có giao dịch kho.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
