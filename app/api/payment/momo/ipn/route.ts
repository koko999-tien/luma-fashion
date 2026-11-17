import { NextResponse } from "next/server";
import { momo } from "@/lib/payments/momo";
import { handleVerifiedCallback } from "@/lib/payments/handleCallback";

export async function POST(req: Request) {
  const params: Record<string, string> = {};
  // MoMo gửi application/x-www-form-urlencoded hoặc JSON tuỳ cấu hình — hỗ trợ cả hai
  const text = await req.text();
  try {
    const json = JSON.parse(text) as Record<string, unknown>;
    for (const [k, v] of Object.entries(json)) params[k] = String(v);
  } catch {
    new URLSearchParams(text).forEach((v, k) => { params[k] = v; });
  }
  const outcome = await handleVerifiedCallback(momo.verifyCallback(params), "MOMO");
  // MoMo IPN yêu cầu HTTP 204 khi đã xử lý
  return new NextResponse(null, { status: outcome.ok ? 204 : 400 });
}
