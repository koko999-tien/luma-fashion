import { NextResponse } from "next/server";
import { z } from "zod";
import { randomInt } from "crypto";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getCartView, getShippingConfig, computeShipping } from "@/lib/cart";
import { evaluateCoupon } from "@/lib/coupon";
import { sendEmail } from "@/lib/email";
import { orderConfirmationEmail } from "@/lib/emailTemplates";
import { getPaymentProvider } from "@/lib/payments";
import { rateLimit, rateLimitResponse, clientIp } from "@/lib/rateLimit";

const schema = z.object({
  customerName: z.string().trim().min(2).max(80),
  email: z.string().email(),
  phone: z.string().regex(/^[0-9]{9,11}$/, "Số điện thoại không hợp lệ"),
  addressLine: z.string().trim().min(5).max(200),
  ward: z.string().trim().max(80).optional().or(z.literal("")),
  district: z.string().trim().min(1).max(80),
  city: z.string().trim().min(1).max(80),
  note: z.string().trim().max(500).optional().or(z.literal("")),
  shippingMethod: z.enum(["STANDARD", "EXPRESS"]),
  paymentMethod: z.enum(["COD", "BANK_TRANSFER", "VNPAY", "MOMO", "ZALOPAY"]),
  couponCode: z.string().trim().max(40).optional().or(z.literal("")),
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`checkout:${ip}`, 10, 60); // 10 đơn / phút / IP — chống spam đơn
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  const data = parsed.data;

  // Cổng thanh toán online: nếu chưa cấu hình → từ chối rõ ràng; nếu có → tạo link thanh toán sau khi tạo đơn
  const IS_ONLINE = ["VNPAY", "MOMO", "ZALOPAY"].includes(data.paymentMethod);
  if (IS_ONLINE && !getPaymentProvider(data.paymentMethod)?.configured) {
    return NextResponse.json({ message: `${data.paymentMethod} chưa được cấu hình trên hệ thống. Vui lòng chọn COD hoặc chuyển khoản.` }, { status: 400 });
  }

  const session = await getSession();
  const { items, subtotal, cartId } = await getCartView();
  if (items.length === 0) return NextResponse.json({ message: "Giỏ hàng trống" }, { status: 400 });

  // Coupon (nếu có)
  let discount = 0;
  let couponCode: string | null = null;
  if (data.couponCode) {
    const result = await evaluateCoupon(data.couponCode, subtotal, session?.id ?? null);
    if (!result.ok) return NextResponse.json({ message: result.message }, { status: 400 });
    discount = result.discount;
    couponCode = data.couponCode.trim().toUpperCase();
  }

  const shippingCfg = await getShippingConfig();
  const shippingFee = computeShipping(data.shippingMethod, subtotal - discount, shippingCfg, data.city);
  const total = subtotal - discount + shippingFee;
  const orderNumber = `LM${Date.now().toString().slice(-8)}${randomInt(10, 99)}`;
  const paymentStatus = data.paymentMethod === "COD" ? "UNPAID" : "PENDING";

  try {
    const orderId = await prisma.$transaction(async (tx) => {
      // Trừ kho an toàn (chỉ trừ khi đủ hàng) — chống oversell
      for (const item of items) {
        const before = await tx.productVariant.findUnique({ where: { id: item.variantId }, select: { stock: true } });
        if (!before) throw new Error(`INSUFFICIENT_STOCK:${item.productName}`);
        const updated = await tx.productVariant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count === 0) throw new Error(`INSUFFICIENT_STOCK:${item.productName}`);
        await tx.inventoryTransaction.create({ data: { variantId: item.variantId, delta: -item.quantity, previousQty: before.stock, newQty: before.stock - item.quantity, type: "ORDER_DEDUCTION", reason: "ORDER:" + orderNumber } });
      }

      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: session?.id ?? null,
          customerName: data.customerName, email: data.email.toLowerCase(), phone: data.phone,
          addressLine: data.addressLine, ward: data.ward || null, district: data.district, city: data.city,
          note: data.note || null,
          shippingMethod: data.shippingMethod, shippingFee,
          paymentMethod: data.paymentMethod, paymentStatus, orderStatus: "PENDING",
          subtotal, discount, total, couponCode,
          items: {
            create: items.map((i) => ({
              variantId: i.variantId, productName: i.productName, sku: i.sku, size: i.size, color: i.color,
              price: i.unitPrice, quantity: i.quantity, image: i.image,
            })),
          },
          statusHistory: { create: [{ status: "PENDING", note: "Đơn hàng được tạo" }] },
        },
      });

      if (couponCode) {
        await tx.coupon.update({ where: { code: couponCode }, data: { usedCount: { increment: 1 } } });
        await tx.couponUsage.create({ data: { couponId: (await tx.coupon.findUniqueOrThrow({ where: { code: couponCode } })).id, orderId: order.id, userId: session?.id ?? null } });
      }

      await tx.cartItem.deleteMany({ where: { cartId } });
      return order.id;
    });

    // Đơn đã tạo — nếu là thanh toán online, tạo link thanh toán
    let payUrl: string | undefined;
    if (IS_ONLINE) {
      const provider = getPaymentProvider(data.paymentMethod)!;
      const site = process.env.SITE_URL ?? "http://localhost:3000";
      const created = await provider.createPayment({
        orderNumber, amount: total, orderInfo: `Thanh toan don ${orderNumber}`,
        returnUrl: `${site}/api/payment/${data.paymentMethod.toLowerCase()}/return`,
        ipnUrl: `${site}/api/payment/${data.paymentMethod.toLowerCase()}/ipn`,
        clientIp: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1",
      });
      if (created.ok) payUrl = created.payUrl;
      else console.error(`[checkout] tạo link ${data.paymentMethod} thất bại:`, created.error);
      // Đơn vẫn được giữ ở trạng thái PENDING + UNPAID — khách có thể liên hệ shop để thanh toán
    }

    // Email xác nhận — KHÔNG được phép làm hỏng đơn hàng (đơn đã lưu)
    try {
      const full = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true } });
      const { subject, html } = orderConfirmationEmail(full);
      await sendEmail({ type: "ORDER_CONFIRMATION", to: full.email, subject, html, orderId: full.id });
    } catch (e) {
      console.error("[checkout] gửi email xác nhận thất bại:", e);
    }

    return NextResponse.json({ ok: true, orderNumber, orderId, total, ...(payUrl ? { payUrl } : {}) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.startsWith("INSUFFICIENT_STOCK:")) {
      return NextResponse.json({ message: `Sản phẩm "${msg.split(":")[1]}" vừa hết hàng. Vui lòng điều chỉnh giỏ hàng.` }, { status: 409 });
    }
    console.error("[checkout] failed:", e);
    return NextResponse.json({ message: "Không tạo được đơn hàng. Vui lòng thử lại." }, { status: 500 });
  }
}
