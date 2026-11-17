import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";
import { formatVND, ORDER_STATUS_LABEL } from "@/lib/format";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import { Package, Heart, BadgeCheck } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Tài khoản của tôi" };

export default async function AccountOverview() {
  const session = await requireUser();
  const [orderCount, wishlistCount, recentOrders, user] = await Promise.all([
    prisma.order.count({ where: { userId: session.id } }),
    prisma.wishlistItem.count({ where: { userId: session.id } }),
    prisma.order.findMany({ where: { userId: session.id }, orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.user.findUnique({ where: { id: session.id }, select: { name: true, email: true, phone: true, createdAt: true } }),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">Xin chào, <span className="text-accent">{user?.name}</span> 👋</h1>
      <p className="text-sm text-gray2 mt-1">{user?.email} {user?.phone && `• ${user.phone}`} • Thành viên từ {user?.createdAt ? new Date(user.createdAt).getFullYear() : "—"}</p>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Link href="/account/orders" className="card p-5 hover:-translate-y-0.5 transition-transform"><Package size={22} className="text-accent" /><p className="mt-2 text-2xl font-extrabold">{orderCount}</p><p className="text-[11px] text-gray2 uppercase tracking-wide">Đơn hàng</p></Link>
        <Link href="/account/wishlist" className="card p-5 hover:-translate-y-0.5 transition-transform"><Heart size={22} className="text-accent" /><p className="mt-2 text-2xl font-extrabold">{wishlistCount}</p><p className="text-[11px] text-gray2 uppercase tracking-wide">Yêu thích</p></Link>
        <div className="card p-5"><BadgeCheck size={22} className="text-accent" /><p className="mt-2 text-sm font-extrabold">Thành viên</p><p className="text-[11px] text-gray2 uppercase tracking-wide">LUMA Member</p></div>
      </div>

      <div className="card p-6 mt-6">
        <h2 className="font-display text-lg font-bold">Đơn hàng gần đây</h2>
        {recentOrders.length === 0 ? (
          <p className="mt-3 text-sm text-gray2">Chưa có đơn hàng nào. <Link href="/products" className="text-accent font-semibold underline">Mua sắm ngay →</Link></p>
        ) : (
          <ul className="mt-3 divide-y divide-stone2">
            {recentOrders.map((o) => (
              <li key={o.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                <div><p className="font-mono font-bold">{o.orderNumber}</p><p className="text-[10px] text-gray2">{new Date(o.createdAt).toLocaleDateString("vi-VN")} • {ORDER_STATUS_LABEL[o.orderStatus]}</p></div>
                <div className="flex items-center gap-3"><span className="font-bold text-accent">{formatVND(o.total)}</span><Link href={`/account/orders/${o.orderNumber}`} className="text-[11px] font-bold underline underline-offset-2">Chi tiết</Link></div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ChangePasswordForm />
    </div>
  );
}
