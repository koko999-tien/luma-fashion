/**
 * VNPay provider — theo tài liệu công khai của VNPay (sandbox).
 * CHƯA được test với merchant thật (cần VNPAY_TMN_CODE + VNPAY_HASH_SECRET).
 * Khi chưa cấu hình: configured=false, mọi lời gọi trả disabled — KHÔNG giả vờ thành công.
 */
import { createHmac } from "crypto";
import type { PaymentProvider, CreatePaymentInput, CreatePaymentResult, CallbackVerification } from "./types";

const VNPAY_URL = process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

function sortAndBuildQuery(params: Record<string, string>): string {
  return Object.keys(params).sort().map((k) => `${k}=${encodeURIComponent(params[k])}`).join("&");
}

export const vnpay: PaymentProvider = {
  code: "VNPAY",
  configured: Boolean(process.env.VNPAY_TMN_CODE && process.env.VNPAY_HASH_SECRET),

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    if (!this.configured) return { ok: false, disabled: true, error: "VNPay chưa cấu hình (VNPAY_TMN_CODE / VNPAY_HASH_SECRET)" };
    const tmnCode = process.env.VNPAY_TMN_CODE!;
    const hashSecret = process.env.VNPAY_HASH_SECRET!;

    const now = new Date();
    const pad = (n: number, len = 2) => String(n).padStart(len, "0");
    const createDate = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

    const params: Record<string, string> = {
      vnp_Version: "2.1.0", vnp_Command: "pay", vnp_TmnCode: tmnCode,
      vnp_Amount: String(Math.round(input.amount) * 100), vnp_CurrCode: "VND",
      vnp_TxnRef: input.orderNumber, vnp_OrderInfo: input.orderInfo, vnp_OrderType: "other",
      vnp_Locale: "vn", vnp_ReturnUrl: input.returnUrl, vnp_IpAddr: input.clientIp, vnp_CreateDate: createDate,
    };
    const hashData = sortAndBuildQuery(params);
    const secureHash = createHmac("sha512", hashSecret).update(hashData).digest("hex");
    return { ok: true, payUrl: `${VNPAY_URL}?${hashData}&vnp_SecureHash=${secureHash}` };
  },

  verifyCallback(params: Record<string, string>): CallbackVerification {
    const hashSecret = process.env.VNPAY_HASH_SECRET;
    if (!hashSecret) return { ok: false, reason: "VNPay chưa cấu hình" };
    const { vnp_SecureHash, ...rest } = params;
    if (!vnp_SecureHash) return { ok: false, reason: "Thiếu chữ ký vnp_SecureHash" };
    const expected = createHmac("sha512", hashSecret).update(sortAndBuildQuery(rest)).digest("hex");
    if (expected !== vnp_SecureHash) return { ok: false, reason: "Chữ ký không hợp lệ" };
    if (rest.vnp_ResponseCode !== "00") return { ok: false, reason: `VNPay trả mã lỗi ${rest.vnp_ResponseCode}` };
    const amount = Number(rest.vnp_Amount) / 100;
    if (!rest.vnp_TxnRef || !Number.isFinite(amount)) return { ok: false, reason: "Thiếu mã đơn hoặc số tiền" };
    return { ok: true, orderNumber: rest.vnp_TxnRef, amount, providerTxnId: rest.vnp_TransactionNo ?? "" };
  },
};
