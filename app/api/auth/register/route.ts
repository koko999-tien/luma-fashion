import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/email";
import { welcomeEmail } from "@/lib/emailTemplates";
import { rateLimit, rateLimitResponse, clientIp } from "@/lib/rateLimit";

const schema = z.object({
  name: z.string().trim().min(2, "Tên quá ngắn").max(80),
  email: z.string().email(),
  phone: z.string().regex(/^[0-9]{9,11}$/, "Số điện thoại không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự").max(100),
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`register:${ip}`, 20, 3600); // 20 lần / giờ / IP
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });

  const email = parsed.data.email.toLowerCase();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ message: "Email này đã được đăng ký" }, { status: 409 });

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({ data: { name: parsed.data.name, email, phone: parsed.data.phone, passwordHash, role: "CUSTOMER" } });
  await createSession({ id: user.id, email: user.email, name: user.name, role: "CUSTOMER" });
  // Email chào mừng — lỗi không ảnh hưởng đăng ký
  try {
    const { subject, html } = welcomeEmail(user.name);
    await sendEmail({ type: "WELCOME", to: user.email, subject, html });
  } catch (e) { console.error("[register] welcome email failed:", e); }
  return NextResponse.json({ ok: true });
}
