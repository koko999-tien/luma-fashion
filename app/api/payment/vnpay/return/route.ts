import { vnpay } from "@/lib/payments/vnpay";
import { handleVerifiedCallback, redirectAfterCallback } from "@/lib/payments/handleCallback";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const params: Record<string, string> = {};
  url.searchParams.forEach((v, k) => { params[k] = v; });
  const result = vnpay.verifyCallback(params);
  const outcome = await handleVerifiedCallback(result, "VNPAY");
  return redirectAfterCallback(process.env.SITE_URL ?? "http://localhost:3000", outcome.ok ? outcome.orderNumber : params["vnp_TxnRef"], outcome.ok);
}
