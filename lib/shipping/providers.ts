/**
 * Kiến trúc vận chuyển mở rộng — GHN / GHTK / Viettel Post.
 * Chưa có credential thật → configured=false. KHÔNG tuyên bố tích hợp live khi chưa test.
 * Phí vận chuyển theo vùng miền (HCM/HN vs các tỉnh) cấu hình qua Admin → Cài đặt.
 */
export type ShippingQuote = { fee: number; provider: string } | { error: string };

export interface ShippingProvider {
  readonly code: "GHN" | "GHTK" | "VIETTEL_POST";
  readonly configured: boolean;
  quote(input: { toProvinceName: string; toDistrictName?: string; weightGrams: number }): Promise<ShippingQuote>;
  createShipment(input: { orderNumber: string; toName: string; toPhone: string; toAddress: string; provinceName: string; districtName?: string; weightGrams: number; codAmount?: number }): Promise<{ trackingCode: string } | { error: string }>;
  track(trackingCode: string): Promise<{ status: string; raw?: unknown } | { error: string }>;
}

const GHN_BASE = process.env.GHN_BASE_URL || "https://dev-online-gateway.ghn.vn";
export const ghn: ShippingProvider = {
  code: "GHN",
  configured: Boolean(process.env.GHN_TOKEN && process.env.GHN_SHOP_ID),
  async quote(input) {
    if (!this.configured) return { error: "GHN chưa cấu hình (GHN_TOKEN / GHN_SHOP_ID)" };
    try {
      const res = await fetch(`${GHN_BASE}/shiip/public-api/v2/shipping-order/fee`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Token: process.env.GHN_TOKEN!, ShopId: process.env.GHN_SHOP_ID! },
        body: JSON.stringify({ service_type_id: 2, to_district_id: null, to_ward_code: null, province_name: input.toProvinceName, district_name: input.toDistrictName, weight: input.weightGrams, insurance_value: 0 }),
        signal: AbortSignal.timeout(12000),
      });
      const data = await res.json().catch(() => null) as { data?: { total?: number }; message?: string } | null;
      if (data?.data?.total != null) return { fee: data.data.total, provider: "GHN" };
      return { error: data?.message || `GHN HTTP ${res.status}` };
    } catch (e) { return { error: e instanceof Error ? e.message : "GHN không phản hồi" }; }
  },
  async createShipment(input) {
    if (!this.configured) return { error: "GHN chưa cấu hình" };
    try {
      const res = await fetch(`${GHN_BASE}/shiip/public-api/v2/shipping-order/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Token: process.env.GHN_TOKEN!, ShopId: process.env.GHN_SHOP_ID! },
        body: JSON.stringify({ to_name: input.toName, to_phone: input.toPhone, to_address: input.toAddress, to_province_name: input.provinceName, to_district_name: input.districtName, weight: input.weightGrams, cod_amount: input.codAmount ?? 0, note: input.orderNumber, content: `Đơn ${input.orderNumber}` }),
        signal: AbortSignal.timeout(12000),
      });
      const data = await res.json().catch(() => null) as { data?: { order_code?: string }; message?: string } | null;
      if (data?.data?.order_code) return { trackingCode: data.data.order_code };
      return { error: data?.message || `GHN HTTP ${res.status}` };
    } catch (e) { return { error: e instanceof Error ? e.message : "GHN không phản hồi" }; }
  },
  async track(trackingCode) {
    if (!this.configured) return { error: "GHN chưa cấu hình" };
    try {
      const res = await fetch(`${GHN_BASE}/shiip/public-api/v1/shipping-order/detail?order_code=${encodeURIComponent(trackingCode)}`, { headers: { Token: process.env.GHN_TOKEN! }, signal: AbortSignal.timeout(12000) });
      const data = await res.json().catch(() => null) as { data?: { status?: string } } | null;
      if (data?.data?.status) return { status: data.data.status, raw: data.data };
      return { error: `GHN HTTP ${res.status}` };
    } catch (e) { return { error: e instanceof Error ? e.message : "GHN không phản hồi" }; }
  },
};

const GHTK_BASE = process.env.GHTK_BASE_URL || "https://services.giaohangtietkiem.vn";
export const ghtk: ShippingProvider = {
  code: "GHTK",
  configured: Boolean(process.env.GHTK_TOKEN),
  async quote(input) {
    if (!this.configured) return { error: "GHTK chưa cấu hình (GHTK_TOKEN)" };
    try {
      const params = new URLSearchParams({ pick_province: "Hồ Chí Minh", pick_district: "Quận 3", province: input.toProvinceName, district: input.toDistrictName ?? "", weight: String(input.weightGrams), value: "0", transport: "road" });
      const res = await fetch(`${GHTK_BASE}/services/shipment/fee?${params}`, { headers: { Token: process.env.GHTK_TOKEN! }, signal: AbortSignal.timeout(12000) });
      const data = await res.json().catch(() => null) as { fee?: { fee?: number }; message?: string } | null;
      if (data?.fee?.fee != null) return { fee: data.fee.fee, provider: "GHTK" };
      return { error: data?.message || `GHTK HTTP ${res.status}` };
    } catch (e) { return { error: e instanceof Error ? e.message : "GHTK không phản hồi" }; }
  },
  async createShipment(input) {
    if (!this.configured) return { error: "GHTK chưa cấu hình" };
    try {
      const res = await fetch(`${GHTK_BASE}/services/shipment/order`, {
        method: "POST",
        headers: { Token: process.env.GHTK_TOKEN!, "Content-Type": "application/json" },
        body: JSON.stringify({ order: { id: input.orderNumber, pick_name: "LUMA Fashion", pick_money: input.codAmount ?? 0, name: input.toName, address: input.toAddress, province: input.provinceName, district: input.districtName, tel: input.toPhone, value: 0, weight: input.weightGrams, transport: "road" } }),
        signal: AbortSignal.timeout(12000),
      });
      const data = await res.json().catch(() => null) as { order?: { label_id?: string }; message?: string } | null;
      if (data?.order?.label_id) return { trackingCode: data.order.label_id };
      return { error: data?.message || `GHTK HTTP ${res.status}` };
    } catch (e) { return { error: e instanceof Error ? e.message : "GHTK không phản hồi" }; }
  },
  async track(trackingCode) {
    if (!this.configured) return { error: "GHTK chưa cấu hình" };
    try {
      const res = await fetch(`${GHTK_BASE}/services/shipment/v2/${encodeURIComponent(trackingCode)}`, { headers: { Token: process.env.GHTK_TOKEN! }, signal: AbortSignal.timeout(12000) });
      const data = await res.json().catch(() => null) as { order?: { status_text?: string } } | null;
      if (data?.order?.status_text) return { status: data.order.status_text, raw: data.order };
      return { error: `GHTK HTTP ${res.status}` };
    } catch (e) { return { error: e instanceof Error ? e.message : "GHTK không phản hồi" }; }
  },
};

const VIETTELPOST_BASE = process.env.VIETTELPOST_BASE_URL || "https://partner.viettelpost.vn";
export const viettelPost: ShippingProvider = {
  code: "VIETTEL_POST",
  configured: Boolean(process.env.VIETTELPOST_TOKEN),
  async quote(input) {
    if (!this.configured) return { error: "Viettel Post chưa cấu hình (VIETTELPOST_TOKEN)" };
    try {
      const res = await fetch(`${VIETTELPOST_BASE}/v2/categories/calculate/price`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "SUP_TOKEN": process.env.VIETTELPOST_TOKEN! },
        body: JSON.stringify({ SENDER_PROVINCE: 79, RECEIVER_PROVINCE: null, RECEIVER_PROVINCE_NAME: input.toProvinceName, WEIGHT: input.weightGrams, PRODUCT_TYPE: "HH", ORDER_SERVICE_ADD: "", ORDER_SERVICE: "SGN" }),
        signal: AbortSignal.timeout(12000),
      });
      const data = await res.json().catch(() => null) as { data?: { MONEY_COLLECTION?: number; MONEY_TOTAL?: number }; message?: string } | null;
      const fee = data?.data?.MONEY_TOTAL ?? data?.data?.MONEY_COLLECTION;
      if (fee != null) return { fee, provider: "VIETTEL_POST" };
      return { error: data?.message || `Viettel Post HTTP ${res.status}` };
    } catch (e) { return { error: e instanceof Error ? e.message : "Viettel Post không phản hồi" }; }
  },
  async createShipment() {
    if (!this.configured) return { error: "Viettel Post chưa cấu hình" };
    return { error: "Chưa triển khai createShipment — cần credential và test với tài khoản Viettel Post thật." };
  },
  async track(trackingCode) {
    if (!this.configured) return { error: "Viettel Post chưa cấu hình" };
    try {
      const res = await fetch(`${VIETTELPOST_BASE}/v2/categories/tracking?ORDER_NUMBER=${encodeURIComponent(trackingCode)}`, { headers: { "SUP_TOKEN": process.env.VIETTELPOST_TOKEN! }, signal: AbortSignal.timeout(12000) });
      const data = await res.json().catch(() => null) as { data?: { STATUS_NAME?: string } } | null;
      if (data?.data?.STATUS_NAME) return { status: data.data.STATUS_NAME, raw: data.data };
      return { error: `Viettel Post HTTP ${res.status}` };
    } catch (e) { return { error: e instanceof Error ? e.message : "Viettel Post không phản hồi" }; }
  },
};

export const shippingProviders = { GHN: ghn, GHTK: ghtk, VIETTEL_POST: viettelPost } as const;
export function getShippingProvider(code: string): ShippingProvider | null {
  return (shippingProviders as Record<string, ShippingProvider>)[code] ?? null;
}
