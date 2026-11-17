import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email(),
  subject: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Nội dung tối thiểu 10 ký tự").max(2000),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  await prisma.contactMessage.create({ data: { name: parsed.data.name, email: parsed.data.email.toLowerCase(), subject: parsed.data.subject || null, message: parsed.data.message } });
  return NextResponse.json({ ok: true, message: "Cảm ơn bạn! LUMA sẽ phản hồi trong 24h làm việc." });
}
