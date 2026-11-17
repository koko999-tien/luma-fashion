import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const schema = z.object({ currentPassword: z.string().min(6), newPassword: z.string().min(6, "Mật khẩu mới tối thiểu 6 ký tự") });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Vui lòng đăng nhập" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.id } });
  const ok = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!ok) return NextResponse.json({ message: "Mật khẩu hiện tại không đúng" }, { status: 401 });

  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 10) } });
  return NextResponse.json({ ok: true, message: "Đổi mật khẩu thành công" });
}
