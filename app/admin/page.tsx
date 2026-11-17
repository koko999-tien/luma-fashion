import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatVND, ORDER_STATUS_LABEL } from "@/lib/format";
import RevenueChart from "@/components/RevenueChart";
import { DollarSign, ShoppingCart, Users, Package, Clock, Boxes, TrendingUp, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin – Tổng quan" };

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const { range = "30d" } = await searchParams;
  const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [paidAgg, orderCount, customerCount, productCount, pendingCount, lowStock, recentOrders, rangeOrders, catRevenue] = await Promise.all([
    prisma.order.aggregate({ where: { createdAt: { gte: since }, orderStatus: { notIn: ["CANCELLED", "REFUNDED", "RETURNED"] } }, _sum: { total: true } }),
    prisma.order.count({ where: { createdAt: { gte: since } } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.order.count({ where: { orderStatus: "PENDING" } }),
    prisma.productVariant.count({ where: { stock: { lte: 5 } } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6, select: { id: true, orderNumber: true, customerName: true, total: true, orderStatus: true, createdAt: true } }),
    prisma.order.findMany({ where: { createdAt: { gte: since }, orderStatus: { notIn: ["CANCELLED", "REFUNDED", "RETURNED"] } }, select: { total: true, createdAt: true } }),
    prisma.orderItem.groupBy({ by: ["sku"], _sum: { price: true, quantity: true }, where: { order: { createdAt: { gte: since } } } }),
  ]);

  // Doanh thu theo ngày
  const byDay = new Map<string, { revenue: number; orders: number }>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    byDay.set(d.toISOString().slice(5, 10).split("-").reverse().join("/"), { revenue: 0, orders: 0 });
  }
  for (const o of rangeOrders) {
    const key = o.createdAt.toISOString().slice(5, 10).split("-").reverse().join("/");
    const slot = byDay.get(key);
    if (slot) { slot.revenue += o.total; slot.orders += 1; }
  }
  const chartData = [...byDay.entries()].map(([date, v]) => ({ date, ...v }));

  // Doanh thu theo danh mục (qua productId của variant)
  const variants = await prisma.productVariant.findMany({ select: { sku: true, product: { select: { category: { select: { name: true } } } } } });
  const skuToCategory = new Map(variants.map((v) => [v.sku, v.product.category.name]));
  const catMap = new Map<string, number>();
  for (const row of catRevenue) {
    const cat = skuToCategory.get(row.sku) ?? "Khác";
    catMap.set(cat, (catMap.get(cat) ?? 0) + (row._sum.price ?? 0) * (row._sum.quantity ?? 0));
  }
  const byCategory = [...catMap.entries()].map(([name, revenue]) => ({ name, revenue })).sort((a, b) => b.revenue - a.revenue);

  const stats = [
    { label: `Doanh thu ${days} ngày`, value: formatVND(paidAgg._sum.total ?? 0), icon: DollarSign, tone: "text-emerald-400" },
    { label: `Đơn hàng ${days} ngày`, value: String(orderCount), icon: ShoppingCart, tone: "text-sky-400" },
    { label: "Khách hàng", value: String(customerCount), icon: Users, tone: "text-violet-400" },
    { label: "Sản phẩm đang bán", value: String(productCount), icon: Package, tone: "text-amber-400" },
    { label: "Đơn chờ xác nhận", value: String(pendingCount), icon: Clock, tone: pendingCount > 0 ? "text-orange-400" : "text-white/50" },
    { label: "Biến thể sắp hết (≤5)", value: String(lowStock), icon: Boxes, tone: lowStock > 0 ? "text-red-400" : "text-white/50" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">Tổng quan kinh doanh</h1>
          <p className="text-[11px] text-white/40 mt-1">Cập nhật theo thời gian thực từ database</p>
        </div>
        <div className="flex gap-1.5 text-[11px] font-bold">
          {[["7d", "7 ngày"], ["30d", "30 ngày"], ["90d", "90 ngày"]].map(([k, label]) => (
            <Link key={k} href={`/admin?range=${k}`} className={`rounded-full px-3.5 py-2 ${range === k ? "bg-accent text-white" : "bg-white/5 text-white/60 hover:text-white"}`}>{label}</Link>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <Icon size={18} className={tone} />
            <p className="mt-2 text-lg sm:text-xl font-extrabold text-white leading-tight">{value}</p>
            <p className="mt-1 text-[9px] sm:text-[10px] uppercase tracking-wide text-white/40">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-5"><RevenueChart data={chartData} byCategory={byCategory} /></div>

      <div className="mt-5 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white/60 flex items-center gap-2"><TrendingUp size={14} /> Đơn hàng mới nhất</h3>
          <Link href="/admin/orders" className="text-[11px] font-bold text-amber-400 flex items-center gap-1 hover:text-amber-300">Xem tất cả <ChevronRight size={13} /></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="text-white/40 uppercase text-[10px] tracking-wider"><tr><th className="text-left px-5 py-2.5">Mã đơn</th><th className="text-left px-3 py-2.5">Khách</th><th className="text-left px-3 py-2.5">Tổng</th><th className="text-left px-3 py-2.5">Trạng thái</th><th className="px-3 py-2.5"></th></tr></thead>
            <tbody className="divide-y divide-white/5">
              {recentOrders.map((o) => (
                <tr key={o.id} className="hover:bg-white/5">
                  <td className="px-5 py-3 font-mono font-bold">{o.orderNumber}</td>
                  <td className="px-3 py-3">{o.customerName}</td>
                  <td className="px-3 py-3 font-bold text-amber-300">{formatVND(o.total)}</td>
                  <td className="px-3 py-3 text-white/70">{ORDER_STATUS_LABEL[o.orderStatus]}</td>
                  <td className="px-3 py-3 text-right"><Link href={`/admin/orders/${o.id}`} className="text-[11px] underline underline-offset-2 hover:text-white">Chi tiết</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
