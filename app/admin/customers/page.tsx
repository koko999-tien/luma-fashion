import { prisma } from "@/lib/prisma";
import CustomerBlockToggle from "@/components/CustomerBlockToggle";
import { Search } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin – Khách hàng" };

export default async function AdminCustomers({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const where: Record<string, unknown> = { role: "CUSTOMER" };
  if (q) where.OR = [{ name: { contains: q } }, { email: { contains: q } }, { phone: { contains: q } }];

  const customers = await prisma.user.findMany({
    where,
    include: { _count: { select: { orders: true, reviews: true, wishlist: true } }, orders: { select: { total: true, orderStatus: true } } },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">Khách hàng <span className="text-white/30">({customers.length})</span></h1>
      <form className="mt-4 flex gap-2" method="get">
        <div className="flex items-center gap-2 flex-1 max-w-md rounded-xl bg-white/5 border border-white/10 px-4">
          <Search size={16} className="text-white/40" />
          <input name="q" defaultValue={q} placeholder="Tên, email hoặc SĐT…" className="bg-transparent outline-none py-2.5 w-full text-sm text-white placeholder-white/30" />
        </div>
        <button className="rounded-xl bg-white/10 px-5 text-sm font-semibold text-white hover:bg-white/15">Tìm</button>
      </form>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-[12px] min-w-[760px]">
          <thead className="bg-white/5 text-white/40 uppercase text-[10px] tracking-wider">
            <tr><th className="text-left px-4 py-3">Khách hàng</th><th className="text-left px-3 py-3">Liên hệ</th><th className="text-right px-3 py-3">Đơn</th><th className="text-right px-3 py-3">Tổng chi</th><th className="text-left px-3 py-3">Trạng thái</th><th className="px-3 py-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {customers.map((c) => {
              const spent = c.orders.filter((o) => !["CANCELLED", "REFUNDED", "RETURNED"].includes(o.orderStatus)).reduce((s, o) => s + o.total, 0);
              return (
                <tr key={c.id} className="hover:bg-white/5">
                  <td className="px-4 py-3"><div className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-full bg-accent/80 text-[11px] font-bold text-white">{c.name.charAt(0).toUpperCase()}</span><div><p className="font-semibold text-white">{c.name}</p><p className="text-[9px] text-white/35">Tham gia {new Date(c.createdAt).toLocaleDateString("vi-VN")}</p></div></div></td>
                  <td className="px-3 py-3 text-white/60"><p>{c.email}</p><p className="text-[10px]">{c.phone}</p></td>
                  <td className="px-3 py-3 text-right text-white/80">{c._count.orders}</td>
                  <td className="px-3 py-3 text-right font-bold text-amber-300">{spent.toLocaleString("vi-VN")}₫</td>
                  <td className="px-3 py-3"><span className={`badge ${c.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>{c.status === "ACTIVE" ? "Hoạt động" : "Đã khoá"}</span></td>
                  <td className="px-3 py-3 text-right"><CustomerBlockToggle id={c.id} status={c.status} /></td>
                </tr>
              );
            })}
            {customers.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-white/35">Không tìm thấy khách hàng.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
