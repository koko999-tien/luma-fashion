import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailConfigured } from "@/lib/email";
import { passwordResetEmail } from "@/lib/emailTemplates";
import { rateLimit, rateLimitResponse, clientIp } from "@/lib/rateLimit";

const schema = z.object({ email: z.string().email() });

/**
 * Quên mật khẩu: tạo token 1h. Nếu chưa cấu hình Email provider, link được ghi vào server log
 * (và chỉ trả về client ở môi trường development để test được luồng).
 */
export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`forgot:${ip}`, 5, 300); // 5 lần / 5 phút / IP
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Email không hợp lệ" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  const generic = { message: "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi link đặt lại mật khẩu." };
  if (!user) return NextResponse.json(generic);

  const token = randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({ data: { userId: user.id, token, expiresAt: new Date(Date.now() + 60 * 60 * 1000) } });

  const resetUrl = `${process.env.SITE_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;
  const { subject, html } = passwordResetEmail(resetUrl);
  await sendEmail({ type: "PASSWORD_RESET", to: user.email, subject, html });
  if (!emailConfigured) {
    console.log(`[forgot-password] RESEND_API_KEY chưa cấu hình — link đặt lại: ${resetUrl}`);
  }

  return NextResponse.json(process.env.NODE_ENV !== "production" ? { ...generic, devResetLink: resetUrl } : generic);
}
