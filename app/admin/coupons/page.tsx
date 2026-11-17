import { prisma } from "@/lib/prisma";
import CouponForm from "@/components/CouponForm";
import CouponToggle from "@/components/CouponToggle";
import { formatVND } from "@/lib/format";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin – Mã giảm giá" };

export default async function AdminCoupons() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">Mã giảm giá</h1>
      <div className="mt-5 grid lg:grid-cols-3 gap-5">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 h-fit">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/45 mb-3">Tạo mã mới</h2>
          <CouponForm />
        </div>
        <div className="lg:col-span-2 overflow-x-auto rounded-2xl border border-white/10 h-fit">
          <table className="w-full text-[12px] min-w-[680px]">
            <thead className="bg-white/5 text-white/40 uppercase text-[10px] tracking-wider">
              <tr><th className="text-left px-4 py-3">Mã</th><th className="text-left px-3 py-3">Giảm</th><th className="text-right px-3 py-3">Đơn tối thiểu</th><th className="text-right px-3 py-3">Đã dùng</th><th className="text-left px-3 py-3">Hạn</th><th className="text-left px-3 py-3">TT</th><th className="px-3 py-3"></th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-mono font-extrabold text-amber-300">{c.code}</td>
                  <td className="px-3 py-3 text-white/80">{c.type === "PERCENT" ? `${c.value}%${c.maxDiscount ? ` (tối đa ${formatVND(c.maxDiscount)})` : ""}` : formatVND(c.value)}</td>
                  <td className="px-3 py-3 text-right text-white/70">{c.minOrder ? formatVND(c.minOrder) : "—"}</td>
                  <td className="px-3 py-3 text-right text-white/70">{c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ""}</td>
                  <td className="px-3 py-3 text-white/60">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("vi-VN") : "Không giới hạn"}</td>
                  <td className="px-3 py-3"><span className={`badge ${c.active ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white/45"}`}>{c.active ? "Đang chạy" : "Tạm dừng"}</span></td>
                  <td className="px-3 py-3 text-right"><CouponToggle id={c.id} active={c.active} /></td>
                </tr>
              ))}
              {coupons.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-white/35">Chưa có mã nào.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
