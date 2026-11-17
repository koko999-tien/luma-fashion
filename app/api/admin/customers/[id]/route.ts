import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const schema = z.object({ status: z.enum(["ACTIVE", "BLOCKED"]) });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 403 });
  const { id } = await params;
  if (id === admin.id) return NextResponse.json({ message: "Không thể tự khoá chính mình" }, { status: 400 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Dữ liệu không hợp lệ" }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ message: "Không tìm thấy khách hàng" }, { status: 404 });
  if (target.role === "ADMIN") return NextResponse.json({ message: "Không thể khoá tài khoản quản trị" }, { status: 400 });

  await prisma.user.update({ where: { id }, data: { status: parsed.data.status } });
  return NextResponse.json({ ok: true });
}
