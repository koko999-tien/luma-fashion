export const formatVND = (n: number) => n.toLocaleString("vi-VN") + "₫";

export const GENDER_LABEL: Record<string, string> = { MEN: "Nam", WOMEN: "Nữ", UNISEX: "Unisex" };

export const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ xác nhận", CONFIRMED: "Đã xác nhận", PROCESSING: "Đang xử lý", PACKED: "Đã đóng gói",
  SHIPPED: "Đang giao", DELIVERED: "Đã giao", CANCELLED: "Đã huỷ", RETURNED: "Đã trả hàng", REFUNDED: "Đã hoàn tiền",
};

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  COD: "Thanh toán khi nhận hàng (COD)", BANK_TRANSFER: "Chuyển khoản ngân hàng",
  VNPAY: "VNPay", MOMO: "Ví MoMo", ZALOPAY: "ZaloPay",
};

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  UNPAID: "Chưa thanh toán", PENDING: "Chờ thanh toán", PAID: "Đã thanh toán", FAILED: "Thất bại", REFUNDED: "Đã hoàn tiền",
};

export const priceOf = (p: { basePrice: number; salePrice: number | null }) => p.salePrice ?? p.basePrice;
export const discountPercent = (p: { basePrice: number; salePrice: number | null }) =>
  p.salePrice ? Math.round((1 - p.salePrice / p.basePrice) * 100) : 0;
