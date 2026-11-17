import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CheckCircle2, Building2 } from "lucide-react";
import { formatVND, ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL } from "@/lib/format";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Đặt hàng thành công", robots: { index: false } };

export default async function OrderConfirmation({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order: orderNumber } = await searchParams;
  const order = orderNumber ? await prisma.order.findUnique({ where: { orderNumber }, include: { items: true } }) : null;

  if (!order) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Không tìm thấy đơn hàng</h1>
        <p className="text-sm text-gray2 mt-2">Mã đơn không tồn tại hoặc đã bị xoá.</p>
        <Link href="/" className="btn-primary mt-6">Về trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 text-center">
      <CheckCircle2 size={72} className="mx-auto text-green-600" strokeWidth={1.4} />
      <h1 className="mt-5 font-display text-3xl sm:text-4xl font-extrabold">Đặt hàng thành công!</h1>
      <p className="mt-2 text-gray2">Cảm ơn <b>{order.customerName}</b>! LUMA đã nhận đơn và sẽ sớm liên hệ xác nhận.</p>

      <div className="card p-5 mt-6 text-left text-sm">
        <div className="flex flex-wrap justify-between gap-2 border-b border-stone2 pb-3">
          <div><p className="label mb-0">Mã đơn hàng</p><p className="font-mono font-bold text-base">{order.orderNumber}</p></div>
          <div className="text-right"><p className="label mb-0">Tổng thanh toán</p><p className="font-extrabold text-accent text-base">{formatVND(order.total)}</p></div>
        </div>
        <ul className="py-3 divide-y divide-stone2">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-3 py-2"><span className="line-clamp-1">{i.productName} <span className="text-gray2">({i.size}/{i.color}) × {i.quantity}</span></span><span className="font-semibold whitespace-nowrap">{formatVND(i.price * i.quantity)}</span></li>
          ))}
        </ul>
        <div className="border-t border-stone2 pt-3 grid sm:grid-cols-2 gap-2 text-xs text-gray2">
          <p>Trạng thái: <b className="text-ink">{ORDER_STATUS_LABEL[order.orderStatus]}</b></p>
          <p>Thanh toán: <b className="text-ink">{PAYMENT_METHOD_LABEL[order.paymentMethod]}</b></p>
          <p className="sm:col-span-2">Giao đến: {order.addressLine}{order.ward ? `, ${order.ward}` : ""}, {order.district}, {order.city}</p>
        </div>

        {order.paymentMethod === "BANK_TRANSFER" && (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-[13px]">
            <p className="flex items-center gap-2 font-bold"><Building2 size={16} /> Thông tin chuyển khoản</p>
            <p className="mt-1.5">Ngân hàng: <b>Vietcombank – CN Q.3</b><br />Chủ TK: <b>CONG TY TNHH LUMA FASHION</b><br />Số TK: <b>0123456789</b><br />Nội dung: <b className="font-mono">{order.orderNumber}</b> — Số tiền: <b>{formatVND(order.total)}</b></p>
            <p className="mt-1.5 text-[11px] text-amber-800">Đơn chỉ được xử lý sau khi phòng kế toán xác nhận đã nhận tiền (thường trong 1–2 giờ làm việc).</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <Link href="/account/orders" className="btn-outline !py-3 text-xs">Xem đơn hàng của tôi</Link>
        <Link href="/products" className="btn-accent !py-3 text-xs">Tiếp tục mua sắm</Link>
      </div>
    </div>
  );
}
