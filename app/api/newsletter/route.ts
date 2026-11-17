import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({ email: z.string().email("Email không hợp lệ") });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Email không hợp lệ" }, { status: 400 });

  const email = parsed.data.email.toLowerCase();
  try {
    await prisma.newsletterSubscriber.create({ data: { email } });
    return NextResponse.json({ ok: true, message: "Đăng ký thành công! Bạn sẽ nhận mã giảm 10% qua email." });
  } catch {
    return NextResponse.json({ ok: true, duplicate: true, message: "Email này đã đăng ký trước đó. Cảm ơn bạn!" });
  }
}
