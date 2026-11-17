/**
 * Xử lý callback/IPN dùng chung cho mọi cổng thanh toán.
 * Chỉ khi verify chữ ký + số tiền khớp đơn mới đánh dấu PAID — idempotent.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { paymentConfirmedEmail } from "@/lib/emailTemplates";
import type { CallbackVerification } from "./types";

export async function handleVerifiedCallback(result: CallbackVerification, provider: string): Promise<{ orderNumber?: string; ok: boolean; reason?: string }> {
  if (!result.ok) return { ok: false, reason: result.reason };

  const order = await prisma.order.findUnique({ where: { orderNumber: result.orderNumber }, include: { items: true } });
  if (!order) return { ok: false, reason: `Không tìm thấy đơn ${result.orderNumber}` };
  if (order.total !== result.amount) return { ok: false, reason: `Số tiền callback (${result.amount}) không khớp đơn (${order.total})` };

  // Idempotent: đã PAID rồi thì không gửi lại email / không đổi gì
  if (order.paymentStatus === "PAID") return { ok: true, orderNumber: order.orderNumber };

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: order.id }, data: { paymentStatus: "PAID" } });
    await tx.orderStatusHistory.create({ data: { orderId: order.id, status: order.orderStatus, note: `Thanh toán qua ${provider} — txn ${result.ok ? result.providerTxnId : ""}` } });
  });

  const { subject, html } = paymentConfirmedEmail(order);
  await sendEmail({ type: "PAYMENT_CONFIRMED", to: order.email, subject, html, orderId: order.id }).catch(() => null);
  return { ok: true, orderNumber: order.orderNumber };
}

export function redirectAfterCallback(siteUrl: string, orderNumber: string | undefined, ok: boolean) {
  const base = siteUrl.replace(/\/$/, "");
  const url = ok && orderNumber ? `${base}/order-confirmation?order=${encodeURIComponent(orderNumber)}&paid=1` : `${base}/order-confirmation?order=${encodeURIComponent(orderNumber ?? "")}&payment=failed`;
  return NextResponse.redirect(url);
}
