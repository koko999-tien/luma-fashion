import { NextResponse } from "next/server";
import { zaloPay } from "@/lib/payments/zalopay";
import { handleVerifiedCallback } from "@/lib/payments/handleCallback";

export async function POST(req: Request) {
  const text = await req.text();
  let params: Record<string, string> = {};
  try {
    const json = JSON.parse(text) as Record<string, unknown>;
    for (const [k, v] of Object.entries(json)) params[k] = String(v);
  } catch {
    new URLSearchParams(text).forEach((v, k) => { params[k] = v; });
  }
  const outcome = await handleVerifiedCallback(zaloPay.verifyCallback(params), "ZALOPAY");
  return NextResponse.json({ return_code: outcome.ok ? 1 : -1, return_message: outcome.ok ? "success" : (outcome.reason ?? "invalid") });
}
