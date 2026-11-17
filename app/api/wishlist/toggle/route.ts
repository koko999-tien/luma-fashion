import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const schema = z.object({ productId: z.string().min(1) });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Vui lòng đăng nhập" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Dữ liệu không hợp lệ" }, { status: 400 });

  const key = { userId_productId: { userId: session.id, productId: parsed.data.productId } };
  const existing = await prisma.wishlistItem.findUnique({ where: key });
  if (existing) {
    await prisma.wishlistItem.delete({ where: key });
    return NextResponse.json({ wishlisted: false });
  }
  await prisma.wishlistItem.create({ data: { userId: session.id, productId: parsed.data.productId } });
  return NextResponse.json({ wishlisted: true });
}
