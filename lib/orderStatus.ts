/** Bảng chuyển trạng thái đơn hàng hợp lệ — chống chuyển vô nghĩa (vd: DELIVERED → PENDING) */
export const ORDER_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "RETURNED"],
  DELIVERED: ["RETURNED", "REFUNDED"],
  CANCELLED: [],            // trạng thái cuối — không khôi phục lại
  RETURNED: ["REFUNDED"],
  REFUNDED: [],             // trạng thái cuối
};

export function isValidTransition(from: string, to: string): boolean {
  if (from === to) return true; // giữ nguyên (cho phép cập nhật note/payment)
  return ORDER_TRANSITIONS[from]?.includes(to) ?? false;
}
