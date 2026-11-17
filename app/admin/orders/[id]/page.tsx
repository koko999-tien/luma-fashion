import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatVND, ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL, PAYMENT_STATUS_LABEL } from "@/lib/format";
import OrderStatusForm from "@/components/OrderStatusForm";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin – Chi tiết đơn hàng" };

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true, statusHistory: { orderBy: { createdAt: "asc" } }, user: { select: { id: true, email: true } } } });
  if (!order) notFound();

  return (
    <div className="max-w-6xl">
      <Link href="/admin/orders" className="text-[12px] text-white/50 flex items-center gap-1.5 hover:text-white"><ArrowLeft size={14} /> Danh sách đơn hàng</Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-xl sm:text-2xl font-extrabold text-white">{order.orderNumber}</h1>
        <span className="badge bg-white/10 text-white/70">{new Date(order.createdAt).toLocaleString("vi-VN")}</span>
      </div>

      <div className="mt-5 grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/45">Sản phẩm</h2>
            <ul className="mt-3 divide-y divide-white/5">
              {order.items.map((i) => (
                <li key={i.id} className="flex gap-3 py-3 items-center">
                  {i.image && <div className="relative h-16 w-12 rounded-lg overflow-hidden bg-white/10 shrink-0"><Image src={i.image} alt={i.productName} fill sizes="48px" className="object-cover" /></div>}
                  <div className="min-w-0 flex-1"><p className="text-[12px] font-semibold text-white/90 line-clamp-2">{i.productName}</p><p className="text-[10px] text-white/40">Size {i.size} • {i.color} • SKU {i.sku} × {i.quantity}</p></div>
                  <span className="text-[11px] font-bold text-amber-300 whitespace-nowrap">{formatVND(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-3 border-t border-white/10 pt-3 text-[12px] space-y-1.5 text-white/60">
              <div className="flex justify-between"><dt>Tạm tính</dt><dd>{formatVND(order.subtotal)}</dd></div>
              {order.discount > 0 && <div className="flex justify-between text-emerald-400"><dt>Giảm giá {order.couponCode && `(${order.couponCode})`}</dt><dd>-{formatVND(order.discount)}</dd></div>}
              <div className="flex justify-between"><dt>Phí vận chuyển</dt><dd>{order.shippingFee === 0 ? "Miễn phí" : formatVND(order.shippingFee)}</dd></div>
              <div className="flex justify-between font-extrabold text-base text-white border-t border-white/10 pt-2"><dt>Tổng cộng</dt><dd className="text-amber-400">{formatVND(order.total)}</dd></div>
            </dl>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-[13px] text-white/75 space-y-3">
            <div><h2 className="text-[10px] font-bold uppercase tracking-widest text-white/45">Người nhận</h2><p className="mt-1">{order.customerName} • {order.phone}<br />{order.email}{order.user && <span className="text-sky-400"> (thành viên)</span>}</p></div>
            <div><h2 className="text-[10px] font-bold uppercase tracking-widest text-white/45">Địa chỉ giao</h2><p className="mt-1">{order.addressLine}{order.ward ? `, ${order.ward}` : ""}, {order.district}, {order.city}</p></div>
            {order.note && <div><h2 className="text-[10px] font-bold uppercase tracking-widest text-white/45">Ghi chú khách</h2><p className="mt-1">{order.note}</p></div>}
            <div><h2 className="text-[10px] font-bold uppercase tracking-widest text-white/45">Thanh toán</h2><p className="mt-1">{PAYMENT_METHOD_LABEL[order.paymentMethod]} — <b className={order.paymentStatus === "PAID" ? "text-emerald-400" : "text-orange-400"}>{PAYMENT_STATUS_LABEL[order.paymentStatus]}</b></p></div>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/45">Lịch sử trạng thái</h2>
            <ol className="mt-3 space-y-2 text-[12px]">
              {order.statusHistory.map((h) => (
                <li key={h.id} className="flex items-start gap-2 text-white/70"><CheckCircle2 size={13} className="mt-0.5 text-emerald-400 shrink-0" /><span><b>{ORDER_STATUS_LABEL[h.status] ?? h.status}</b> — {new Date(h.createdAt).toLocaleString("vi-VN")}{h.note && <span className="text-white/40"> • {h.note}</span>}</span></li>
              ))}
            </ol>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-5 h-fit lg:sticky lg:top-6">
          <h2 className="font-display text-lg font-bold text-white">Cập nhật đơn hàng</h2>
          <div className="mt-4"><OrderStatusForm orderId={order.id} orderStatus={order.orderStatus} paymentStatus={order.paymentStatus} adminNote={order.adminNote ?? ""} shippingTracking={order.shippingTracking ?? ""} /></div>
        </div>
      </div>
    </div>
  );
}
