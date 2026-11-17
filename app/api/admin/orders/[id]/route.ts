import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { isValidTransition } from "@/lib/orderStatus";
import { sendEmail } from "@/lib/email";
import { orderStatusEmail, paymentConfirmedEmail, cancelledEmail } from "@/lib/emailTemplates";

const STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED", "REFUNDED"] as const;
const PAYMENT_STATUSES = ["UNPAID", "PENDING", "PAID", "FAILED", "REFUNDED"] as const;

const schema = z.object({
  orderStatus: z.enum(STATUSES).optional(),
  paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
  adminNote: z.string().trim().max(1000).optional().or(z.literal("")),
  shippingTracking: z.string().trim().max(100).optional().or(z.literal("")),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 403 });
  const { id } = await params;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Dữ liệu không hợp lệ" }, { status: 400 });
  const { orderStatus, paymentStatus, adminNote, shippingTracking } = parsed.data;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ message: "Không tìm thấy đơn hàng" }, { status: 404 });

  // Huỷ đơn → hoàn kho. CANCELLED là trạng thái cuối nên không thể hoàn kho 2 lần.
  const restoring = orderStatus === "CANCELLED" && order.orderStatus !== "CANCELLED";
  if (orderStatus && orderStatus !== order.orderStatus && !isValidTransition(order.orderStatus, orderStatus)) {
    return NextResponse.json({ message: `Không thể chuyển từ “${order.orderStatus}” sang “${orderStatus}”` }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    const data: Record<string, unknown> = {};
    if (orderStatus && orderStatus !== order.orderStatus) data.orderStatus = orderStatus;
    if (paymentStatus) data.paymentStatus = paymentStatus;
    if (adminNote !== undefined) data.adminNote = adminNote || null;
    if (shippingTracking !== undefined) data.shippingTracking = shippingTracking || null;
    if (Object.keys(data).length) await tx.order.update({ where: { id }, data });

    if (orderStatus && orderStatus !== order.orderStatus) {
      await tx.orderStatusHistory.create({ data: { orderId: id, status: orderStatus, note: adminNote || null } });
    }
    if (restoring) {
      // Hoàn kho đúng 1 lần: chỉ chạy khi chuyển SANG CANCELLED từ trạng thái khác (đã chặn ở trên)
      const items = await tx.orderItem.findMany({ where: { orderId: id } });
      for (const item of items) {
        if (!item.variantId) continue;
        const before = await tx.productVariant.findUniqueOrThrow({ where: { id: item.variantId }, select: { stock: true } });
        const after = before.stock + item.quantity;
        await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: after } });
        await tx.inventoryTransaction.create({ data: { variantId: item.variantId, delta: item.quantity, previousQty: before.stock, newQty: after, type: "ORDER_CANCEL_RESTORE", reason: "ORDER_CANCEL:" + order.orderNumber, adminId: admin.id } });
      }
    }
  });

  // Thông báo email cho khách — lỗi không ảnh hưởng kết quả cập nhật
  try {
    const full = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (full) {
      if (orderStatus && orderStatus !== order.orderStatus) {
        if (orderStatus === "CANCELLED") {
          const { subject, html } = cancelledEmail(full);
          await sendEmail({ type: "CANCELLED", to: full.email, subject, html, orderId: full.id });
        } else {
          const type = orderStatus === "SHIPPED" ? "SHIPPED" : orderStatus === "DELIVERED" ? "DELIVERED" : "ORDER_STATUS";
          const { subject, html } = orderStatusEmail(full, orderStatus);
          await sendEmail({ type, to: full.email, subject, html, orderId: full.id });
        }
      }
      if (paymentStatus === "PAID" && order.paymentStatus !== "PAID") {
        const { subject, html } = paymentConfirmedEmail(full);
        await sendEmail({ type: "PAYMENT_CONFIRMED", to: full.email, subject, html, orderId: full.id });
      }
    }
  } catch (e) {
    console.error("[admin/orders] gửi email thất bại:", e);
  }

  return NextResponse.json({ ok: true });
}
