import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const schema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(80).optional().or(z.literal("")),
  body: z.string().trim().min(5, "Nhận xét tối thiểu 5 ký tự").max(1000),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Vui lòng đăng nhập để đánh giá" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId }, select: { id: true } });
  if (!product) return NextResponse.json({ message: "Sản phẩm không tồn tại" }, { status: 404 });

  // Mỗi khách 1 đánh giá / sản phẩm — cập nhật nếu đã đánh giá rồi
  const existing = await prisma.review.findFirst({ where: { productId: product.id, userId: session.id } });
  if (existing) {
    await prisma.review.update({ where: { id: existing.id }, data: { rating: parsed.data.rating, title: parsed.data.title || null, body: parsed.data.body } });
    return NextResponse.json({ ok: true, updated: true });
  }
  await prisma.review.create({ data: { productId: product.id, userId: session.id, rating: parsed.data.rating, title: parsed.data.title || null, body: parsed.data.body } });
  return NextResponse.json({ ok: true });
}
