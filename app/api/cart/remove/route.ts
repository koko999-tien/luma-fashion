import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart } from "@/lib/cart";

const schema = z.object({ itemId: z.string().min(1) });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Dữ liệu không hợp lệ" }, { status: 400 });
  const cart = await getOrCreateCart();
  await prisma.cartItem.deleteMany({ where: { id: parsed.data.itemId, cartId: cart.id } });
  return NextResponse.json({ ok: true });
}
