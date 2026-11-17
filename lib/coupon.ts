import { prisma } from "./prisma";

export type CouponResult = { ok: boolean; discount: number; message: string };

/** Kiểm tra + tính giảm giá coupon cho một subtotal (VND). Truyền userId để chặn dùng quá lượt/khách. */
export async function evaluateCoupon(code: string, subtotal: number, userId?: string | null): Promise<CouponResult> {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (!coupon || !coupon.active) return { ok: false, discount: 0, message: "Mã giảm giá không tồn tại hoặc đã ngừng áp dụng" };
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return { ok: false, discount: 0, message: "Mã giảm giá đã hết hạn" };
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) return { ok: false, discount: 0, message: "Mã giảm giá đã hết lượt sử dụng" };
  if (coupon.perCustomerLimit !== null && userId) {
    const used = await prisma.couponUsage.count({ where: { couponId: coupon.id, userId } });
    if (used >= coupon.perCustomerLimit) return { ok: false, discount: 0, message: "Bạn đã dùng hết lượt cho mã này" };
  }
  if (subtotal < coupon.minOrder) return { ok: false, discount: 0, message: `Đơn tối thiểu ${coupon.minOrder.toLocaleString("vi-VN")}₫ để dùng mã này` };

  let discount = coupon.type === "PERCENT" ? Math.floor((subtotal * coupon.value) / 100) : coupon.value;
  if (coupon.maxDiscount !== null) discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.min(discount, subtotal);
  return { ok: true, discount, message: `Áp dụng mã ${coupon.code}: giảm ${discount.toLocaleString("vi-VN")}₫` };
}
