import type { PaymentProvider } from "./types";
import { vnpay } from "./vnpay";
import { momo } from "./momo";
import { zaloPay } from "./zalopay";

export const paymentProviders = { VNPAY: vnpay, MOMO: momo, ZALOPAY: zaloPay } as const;

export function getPaymentProvider(code: string): PaymentProvider | null {
  const p = (paymentProviders as Record<string, PaymentProvider>)[code];
  return p ?? null;
}
