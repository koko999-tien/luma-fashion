import { NextResponse } from "next/server";
import { z } from "zod";
import { evaluateCoupon } from "@/lib/coupon";
import { getSession } from "@/lib/auth";
import { rateLimit, rateLimitResponse, clientIp } from "@/lib/rateLimit";

const schema = z.object({ code: z.string().min(1), subtotal: z.number().int().nonnegative() });

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`coupon:${ip}`, 30, 60);
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Dữ liệu không hợp lệ" }, { status: 400 });
  const session = await getSession();
  const result = await evaluateCoupon(parsed.data.code, parsed.data.subtotal, session?.id ?? null);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
