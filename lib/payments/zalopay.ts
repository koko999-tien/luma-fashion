/**
 * ZaloPay provider — theo tài liệu công khai ZaloPay (sandbox).
 * CHƯA test với merchant thật (cần ZALOPAY_APP_ID / ZALOPAY_KEY1 / ZALOPAY_KEY2).
 * Chưa cấu hình → configured=false.
 */
import { createHmac } from "crypto";
import type { PaymentProvider, CreatePaymentInput, CreatePaymentResult, CallbackVerification } from "./types";

const ZALOPAY_ENDPOINT = process.env.ZALOPAY_ENDPOINT || "https://sb-openapi.zalopay.vn/v2/create";

export const zaloPay: PaymentProvider = {
  code: "ZALOPAY",
  configured: Boolean(process.env.ZALOPAY_APP_ID && process.env.ZALOPAY_KEY1 && process.env.ZALOPAY_KEY2),

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    if (!this.configured) return { ok: false, disabled: true, error: "ZaloPay chưa cấu hình (ZALOPAY_APP_ID / ZALOPAY_KEY1 / ZALOPAY_KEY2)" };
    const app_id = process.env.ZALOPAY_APP_ID!;
    const key1 = process.env.ZALOPAY_KEY1!;

    const app_trans_id = `${new Date().toISOString().slice(2, 10).replace(/-/g, "")}_${Date.now()}`; // yyMMdd_...
    const zp_trans_token_type = "pay";
    const amount = Math.round(input.amount);
    const app_time = Date.now();
    const embed_data = "{}";
    const item = JSON.stringify([{ item_name: input.orderInfo, item_price: amount, item_quantity: 1 }]);

    const macData = [app_id, app_trans_id, "luma", amount, app_time, embed_data, item].join("|");
    const mac = createHmac("sha256", key1).update(macData).digest("hex");

    try {
      const res = await fetch(ZALOPAY_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ app_id: Number(app_id), app_user: "luma", app_time, amount, app_trans_id, embed_data, item, description: input.orderInfo, bank_code: "", callback_url: input.ipnUrl, redirect_url: input.returnUrl, mac, zp_trans_token_type }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await res.json().catch(() => null) as { return_code?: number; order_url?: string; return_message?: string } | null;
      if (!data) return { ok: false, error: `ZaloPay trả về không hợp lệ (HTTP ${res.status})` };
      if (data.return_code === 1 && data.order_url) return { ok: true, payUrl: data.order_url };
      return { ok: false, error: data.return_message || `ZaloPay từ chối (return_code ${data.return_code})` };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "ZaloPay không phản hồi" };
    }
  },

  verifyCallback(params: Record<string, string>): CallbackVerification {
    const key2 = process.env.ZALOPAY_KEY2;
    if (!key2) return { ok: false, reason: "ZaloPay chưa cấu hình" };
    const { mac, data } = params;
    if (!mac || !data) return { ok: false, reason: "Thiếu mac hoặc data" };
    const expected = createHmac("sha256", key2).update(data).digest("hex");
    if (expected !== mac) return { ok: false, reason: "Chữ ký không hợp lệ" };
    try {
      const parsed = JSON.parse(data) as { app_trans_id?: string; amount?: number; m_trans_id?: string | number };
      const embed = JSON.parse((parsed as { embed_data?: string }).embed_data ?? "{}") as { orderNumber?: string };
      const orderNumber = embed.orderNumber ?? parsed.app_trans_id ?? "";
      const amount = Number(parsed.amount);
      if (!orderNumber || !Number.isFinite(amount)) return { ok: false, reason: "Thiếu mã đơn hoặc số tiền" };
      return { ok: true, orderNumber, amount, providerTxnId: String(parsed.m_trans_id ?? "") };
    } catch {
      return { ok: false, reason: "Payload callback không hợp lệ" };
    }
  },
};
