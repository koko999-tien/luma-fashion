import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";
import { formatVND, ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL } from "@/lib/format";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Đơn hàng của tôi" };

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800", CONFIRMED: "bg-blue-100 text-blue-800", PROCESSING: "bg-blue-100 text-blue-800",
  PACKED: "bg-indigo-100 text-indigo-800", SHIPPED: "bg-violet-100 text-violet-800", DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-700", RETURNED: "bg-orange-100 text-orange-800", REFUNDED: "bg-gray-200 text-gray-700",
};

export default async function MyOrders() {
  const session = await requireUser();
  const orders = await prisma.order.findMany({ where: { userId: session.id }, include: { items: { select: { id: true } } }, orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">Đơn hàng của tôi</h1>
      {orders.length === 0 ? (
        <div className="card p-12 mt-6 text-center"><p className="text-gray2">Chưa có đơn hàng nào.</p><Link href="/products" className="btn-accent mt-5">Mua sắm ngay</Link></div>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((o) => (
            <Link key={o.id} href={`/account/orders/${o.orderNumber}`} className="card p-4 sm:p-5 flex flex-wrap items-center gap-3 sm:gap-6 hover:border-ink transition-colors">
              <div className="min-w-[120px]"><p className="font-mono font-bold text-sm">{o.orderNumber}</p><p className="text-[10px] text-gray2">{new Date(o.createdAt).toLocaleDateString("vi-VN")}</p></div>
              <p className="text-xs text-gray2">{o.items.length} sản phẩm</p>
              <span className={`badge ${STATUS_COLOR[o.orderStatus] ?? "bg-gray-100"}`}>{ORDER_STATUS_LABEL[o.orderStatus]}</span>
              <span className="text-[10px] text-gray2 hidden sm:inline">Thanh toán: {PAYMENT_STATUS_LABEL[o.paymentStatus]}</span>
              <span className="ml-auto font-extrabold text-accent">{formatVND(o.total)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
