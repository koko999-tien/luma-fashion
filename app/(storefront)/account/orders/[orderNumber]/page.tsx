import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";
import { formatVND, ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL, PAYMENT_STATUS_LABEL } from "@/lib/format";
import { CheckCircle2, Circle } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Chi tiết đơn hàng" };

const TIMELINE = ["PENDING", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "DELIVERED"];

export default async function OrderDetail({ params }: { params: Promise<{ orderNumber: string }> }) {
  const session = await requireUser();
  const { orderNumber } = await params;
  // Chỉ chủ đơn (hoặc admin) được xem — chống truy cập đơn của người khác
  const order = await prisma.order.findFirst({
    where: { orderNumber, ...(session.role !== "ADMIN" ? { userId: session.id } : {}) },
    include: { items: true, statusHistory: { orderBy: { createdAt: "asc" } } },
  });
  if (!order) notFound();

  const cancelled = order.orderStatus === "CANCELLED" || order.orderStatus === "RETURNED" || order.orderStatus === "REFUNDED";
  const currentIdx = TIMELINE.indexOf(order.orderStatus);

  return (
    <div>
      <nav className="text-[11px] text-gray2 flex gap-2"><Link href="/account/orders" className="hover:text-ink">← Đơn hàng của tôi</Link></nav>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold font-mono">{order.orderNumber}</h1>
        <span className="badge bg-ink text-white">{ORDER_STATUS_LABEL[order.orderStatus]}</span>
      </div>

      {/* Timeline */}
      {!cancelled && (
        <ol className="card mt-5 p-5 flex flex-wrap gap-y-4">
          {TIMELINE.map((step, i) => {
            const reached = i <= currentIdx;
            const hist = order.statusHistory.find((h) => h.status === step);
            return (
              <li key={step} className="flex items-center flex-1 min-w-[90px]">
                <div className="flex flex-col items-center text-center w-full">
                  {reached ? <CheckCircle2 size={20} className="text-green-600" /> : <Circle size={20} className="text-stone2" />}
                  <span className={`mt-1 text-[9px] sm:text-[10px] font-semibold ${reached ? "text-ink" : "text-gray2"}`}>{ORDER_STATUS_LABEL[step]}</span>
                  {hist && <span className="text-[8px] text-gray2">{new Date(hist.createdAt).toLocaleDateString("vi-VN")}</span>}
                </div>
                {i < TIMELINE.length - 1 && <div className={`h-0.5 flex-1 ${i < currentIdx ? "bg-green-500" : "bg-stone2"}`} />}
              </li>
            );
          })}
        </ol>
      )}

      <div className="grid md:grid-cols-5 gap-5 mt-5">
        <div className="card p-5 md:col-span-3">
          <h2 className="font-bold text-sm uppercase tracking-wider">Sản phẩm</h2>
          <ul className="mt-3 divide-y divide-stone2">
            {order.items.map((i) => (
              <li key={i.id} className="flex gap-3 py-3 items-center">
                {i.image && <div className="relative h-20 w-14 rounded-lg overflow-hidden bg-gray3 shrink-0"><Image src={i.image} alt={i.productName} fill sizes="56px" className="object-cover" /></div>}
                <div className="min-w-0 flex-1"><p className="text-[12px] font-semibold leading-snug">{i.productName}</p><p className="text-[10px] text-gray2">Size {i.size} • {i.color} • SKU {i.sku}</p><p className="text-[11px] text-gray2">× {i.quantity}</p></div>
                <span className="text-[12px] font-bold whitespace-nowrap">{formatVND(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 border-t border-stone2 pt-3 text-sm space-y-1.5 text-gray2">
            <div className="flex justify-between"><dt>Tạm tính</dt><dd>{formatVND(order.subtotal)}</dd></div>
            {order.discount > 0 && <div className="flex justify-between text-green-700"><dt>Giảm giá {order.couponCode && `(${order.couponCode})`}</dt><dd>-{formatVND(order.discount)}</dd></div>}
            <div className="flex justify-between"><dt>Phí vận chuyển</dt><dd>{order.shippingFee === 0 ? "Miễn phí" : formatVND(order.shippingFee)}</dd></div>
            <div className="flex justify-between font-extrabold text-base text-ink border-t border-stone2 pt-2"><dt>Tổng cộng</dt><dd className="text-accent">{formatVND(order.total)}</dd></div>
          </dl>
        </div>

        <div className="card p-5 md:col-span-2 h-fit text-[13px] space-y-3">
          <div><h2 className="font-bold text-sm uppercase tracking-wider">Giao hàng đến</h2><p className="mt-1">{order.customerName} • {order.phone}<br />{order.addressLine}{order.ward ? `, ${order.ward}` : ""}, {order.district}, {order.city}</p></div>
          <div><h2 className="font-bold text-xs uppercase tracking-wider">Thanh toán</h2><p className="mt-1">{PAYMENT_METHOD_LABEL[order.paymentMethod]}<br />Trạng thái: <b>{PAYMENT_STATUS_LABEL[order.paymentStatus]}</b></p>{order.shippingTracking && <p className="mt-1">Mã vận đơn: <b className="font-mono">{order.shippingTracking}</b></p>}</div>
          {order.note && <div><h2 className="font-bold text-sm uppercase tracking-wider">Ghi chú</h2><p className="mt-1 text-gray2">{order.note}</p></div>}
          {order.adminNote && <div><h2 className="font-bold text-sm uppercase tracking-wider">Ghi chú từ shop</h2><p className="mt-1 text-gray2">{order.adminNote}</p></div>}
        </div>
      </div>
    </div>
  );
}
