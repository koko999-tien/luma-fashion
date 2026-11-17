import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatVND, ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL, PAYMENT_METHOD_LABEL } from "@/lib/format";
import { Search } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin – Đơn hàng" };

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; paymentStatus?: string; paymentMethod?: string; from?: string; to?: string }> }) {
  const { q = "", status = "", paymentStatus = "", paymentMethod = "", from = "", to = "" } = await searchParams;
  const where: Record<string, unknown> = {};
  if (status) where.orderStatus = status;
  if (paymentStatus) where.paymentStatus = paymentStatus;
  if (paymentMethod) where.paymentMethod = paymentMethod;
  if (from || to) {
    const range: Record<string, Date> = {};
    if (from) range.gte = new Date(`${from}T00:00:00`);
    if (to) range.lte = new Date(`${to}T23:59:59`);
    where.createdAt = range;
  }
  if (q) where.OR = [{ orderNumber: { contains: q } }, { customerName: { contains: q } }, { phone: { contains: q } }, { email: { contains: q } }];

  const orders = await prisma.order.findMany({ where, orderBy: { createdAt: "desc" }, take: 60, include: { _count: { select: { items: true } } } });

  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">Đơn hàng <span className="text-white/30">({orders.length})</span></h1>

      <form className="mt-4 flex flex-wrap gap-2" method="get">
        <div className="flex items-center gap-2 flex-1 min-w-[220px] rounded-xl bg-white/5 border border-white/10 px-4">
          <Search size={16} className="text-white/40" />
          <input name="q" defaultValue={q} placeholder="Mã đơn, tên khách, SĐT, email…" className="bg-transparent outline-none py-2.5 w-full text-sm text-white placeholder-white/30" />
        </div>
        <select name="status" defaultValue={status} className="rounded-xl bg-white/5 border border-white/10 px-3 text-sm text-white outline-none">
          <option value="">TT đơn: tất cả</option>
          {Object.entries(ORDER_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select name="paymentStatus" defaultValue={paymentStatus} className="rounded-xl bg-white/5 border border-white/10 px-3 text-sm text-white outline-none">
          <option value="">TT thanh toán: tất cả</option>
          {Object.entries(PAYMENT_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select name="paymentMethod" defaultValue={paymentMethod} className="rounded-xl bg-white/5 border border-white/10 px-3 text-sm text-white outline-none">
          <option value="">TTT toán: tất cả</option>
          {Object.entries(PAYMENT_METHOD_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input type="date" name="from" defaultValue={from} aria-label="Từ ngày" className="rounded-xl bg-white/5 border border-white/10 px-3 text-sm text-white outline-none" />
        <input type="date" name="to" defaultValue={to} aria-label="Đến ngày" className="rounded-xl bg-white/5 border border-white/10 px-3 text-sm text-white outline-none" />
        <button className="rounded-xl bg-white/10 px-5 text-sm font-semibold text-white hover:bg-white/15">Lọc</button>
        <a href={`/api/admin/orders/export?${new URLSearchParams(Object.fromEntries(Object.entries({ q, status, paymentStatus, paymentMethod, from, to }).filter(([, v]) => v)))}`} className="rounded-xl border border-emerald-400/40 text-emerald-300 px-5 py-2.5 text-sm font-semibold hover:bg-emerald-400/10" download>⭳ Export CSV</a>
      </form>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-[12px] min-w-[820px]">
          <thead className="bg-white/5 text-white/40 uppercase text-[10px] tracking-wider">
            <tr><th className="text-left px-4 py-3">Mã đơn</th><th className="text-left px-3 py-3">Khách</th><th className="text-left px-3 py-3">Ngày</th><th className="text-right px-3 py-3">SP</th><th className="text-right px-3 py-3">Tổng</th><th className="text-left px-3 py-3">ĐVVC</th><th className="text-left px-3 py-3">TT đơn</th><th className="text-left px-3 py-3">TT tiền</th><th className="px-3 py-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-white/5">
                <td className="px-4 py-3 font-mono font-bold text-sky-300">{o.orderNumber}</td>
                <td className="px-3 py-3"><p className="font-semibold text-white">{o.customerName}</p><p className="text-[10px] text-white/35">{o.phone}</p></td>
                <td className="px-3 py-3 text-white/60">{new Date(o.createdAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}</td>
                <td className="px-3 py-3 text-right text-white/70">{o._count.items}</td>
                <td className="px-3 py-3 text-right font-bold text-amber-300">{formatVND(o.total)}</td>
                <td className="px-3 py-3 text-white/60">{o.shippingMethod === "EXPRESS" ? "Hoả tốc" : "Tiêu chuẩn"}</td>
                <td className="px-3 py-3"><span className="badge bg-white/10 text-white/75">{ORDER_STATUS_LABEL[o.orderStatus]}</span></td>
                <td className="px-3 py-3"><span className={`badge ${o.paymentStatus === "PAID" ? "bg-emerald-500/20 text-emerald-300" : "bg-orange-500/20 text-orange-300"}`}>{PAYMENT_STATUS_LABEL[o.paymentStatus]}</span></td>
                <td className="px-3 py-3 text-right"><Link href={`/admin/orders/${o.id}`} className="text-[11px] font-bold text-sky-300 underline underline-offset-2 hover:text-sky-200">Chi tiết</Link></td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={9} className="px-4 py-10 text-center text-white/35">Không có đơn hàng phù hợp.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
