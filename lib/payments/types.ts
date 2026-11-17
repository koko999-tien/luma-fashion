export type CreatePaymentInput = {
  orderNumber: string;
  amount: number;
  orderInfo: string;
  returnUrl: string;
  ipnUrl: string;
  clientIp: string;
};

export type CreatePaymentResult =
  | { ok: true; payUrl: string }
  | { ok: false; disabled?: boolean; error: string };

export type CallbackVerification =
  | { ok: true; orderNumber: string; amount: number; providerTxnId: string }
  | { ok: false; reason: string };

export interface PaymentProvider {
  readonly code: "VNPAY" | "MOMO" | "ZALOPAY";
  readonly configured: boolean;
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  verifyCallback(params: Record<string, string>): CallbackVerification;
}
