import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart } from "@/lib/cart";

const schema = z.object({ itemId: z.string().min(1), quantity: z.number().int().min(0).max(99) });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Dữ liệu không hợp lệ" }, { status: 400 });

  const cart = await getOrCreateCart();
  const item = await prisma.cartItem.findFirst({ where: { id: parsed.data.itemId, cartId: cart.id }, include: { variant: true } });
  if (!item) return NextResponse.json({ message: "Không tìm thấy sản phẩm trong giỏ" }, { status: 404 });

  if (parsed.data.quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: item.id } });
    return NextResponse.json({ ok: true, removed: true });
  }
  const qty = Math.min(parsed.data.quantity, item.variant.stock);
  await prisma.cartItem.update({ where: { id: item.id }, data: { quantity: qty } });
  return NextResponse.json({ ok: true, quantity: qty });
}
