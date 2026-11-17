import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

import { rateLimit, rateLimitResponse, clientIp } from "@/lib/rateLimit";

const schema = z.object({ email: z.string().email(), password: z.string().min(6) });

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`login:${ip}`, 10, 300); // 10 lần / 5 phút / IP
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Email hoặc mật khẩu không hợp lệ" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  const ok = user ? await bcrypt.compare(parsed.data.password, user.passwordHash) : false;
  if (!user || !ok) return NextResponse.json({ message: "Email hoặc mật khẩu không đúng" }, { status: 401 });
  if (user.status === "BLOCKED") return NextResponse.json({ message: "Tài khoản đã bị khoá. Vui lòng liên hệ hỗ trợ." }, { status: 403 });

  await createSession({ id: user.id, email: user.email, name: user.name, role: user.role as "CUSTOMER" | "ADMIN" });
  return NextResponse.json({ ok: true, role: user.role, name: user.name });
}
