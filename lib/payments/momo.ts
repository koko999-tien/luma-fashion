/**
 * MoMo provider — theo tài liệu công khai MoMo (sandbox).
 * CHƯA test với merchant thật (cần MOMO_PARTNER_CODE / MOMO_ACCESS_KEY / MOMO_SECRET_KEY).
 * Chưa cấu hình → configured=false, không giả vờ thanh toán.
 */
import { createHmac } from "crypto";
import type { PaymentProvider, CreatePaymentInput, CreatePaymentResult, CallbackVerification } from "./types";

const MOMO_ENDPOINT = process.env.MOMO_ENDPOINT || "https://test-payment.momo.vn/v2/gateway/api/create";

export const momo: PaymentProvider = {
  code: "MOMO",
  configured: Boolean(process.env.MOMO_PARTNER_CODE && process.env.MOMO_ACCESS_KEY && process.env.MOMO_SECRET_KEY),

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    if (!this.configured) return { ok: false, disabled: true, error: "MoMo chưa cấu hình (MOMO_PARTNER_CODE / MOMO_ACCESS_KEY / MOMO_SECRET_KEY)" };
    const partnerCode = process.env.MOMO_PARTNER_CODE!;
    const accessKey = process.env.MOMO_ACCESS_KEY!;
    const secretKey = process.env.MOMO_SECRET_KEY!;

    const requestId = `${partnerCode}-${Date.now()}`;
    const orderId = input.orderNumber;
    const amount = Math.round(input.amount);
    const requestType = "captureWallet";
    const extraData = "";
    const orderInfo = input.orderInfo;

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${input.ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${input.returnUrl}&requestId=${requestId}&requestType=${requestType}`;
    const signature = createHmac("sha256", secretKey).update(rawSignature).digest("hex");

    try {
      const res = await fetch(MOMO_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerCode, partnerName: "LUMA", storeId: "LUMA", requestId, amount, orderId, orderInfo, redirectUrl: input.returnUrl, ipnUrl: input.ipnUrl, lang: "vi", extraData, requestType, signature }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await res.json().catch(() => null) as { resultCode?: number; payUrl?: string; message?: string } | null;
      if (!data) return { ok: false, error: `MoMo trả về không hợp lệ (HTTP ${res.status})` };
      if (data.resultCode === 0 && data.payUrl) return { ok: true, payUrl: data.payUrl };
      return { ok: false, error: data.message || `MoMo từ chối (resultCode ${data.resultCode})` };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "MoMo không phản hồi" };
    }
  },

  verifyCallback(params: Record<string, string>): CallbackVerification {
    const accessKey = process.env.MOMO_ACCESS_KEY; const secretKey = process.env.MOMO_SECRET_KEY;
    if (!accessKey || !secretKey) return { ok: false, reason: "MoMo chưa cấu hình" };
    const { signature, ...rest } = params;
    if (!signature) return { ok: false, reason: "Thiếu chữ ký" };
    const rawSignature = `accessKey=${accessKey}&amount=${rest.amount}&extraData=${rest.extraData ?? ""}&message=${rest.message}&orderId=${rest.orderId}&orderInfo=${rest.orderInfo}&orderType=${rest.orderType}&partnerCode=${rest.partnerCode}&payType=${rest.payType}&requestId=${rest.requestId}&responseTime=${rest.responseTime}&resultCode=${rest.resultCode}&transId=${rest.transId}`;
    const expected = createHmac("sha256", secretKey).update(rawSignature).digest("hex");
    if (expected !== signature) return { ok: false, reason: "Chữ ký không hợp lệ" };
    if (rest.resultCode !== "0") return { ok: false, reason: `MoMo trả resultCode ${rest.resultCode}` };
    const amount = Number(rest.amount);
    if (!rest.orderId || !Number.isFinite(amount)) return { ok: false, reason: "Thiếu mã đơn hoặc số tiền" };
    return { ok: true, orderNumber: rest.orderId, amount, providerTxnId: rest.transId ?? "" };
  },
};
