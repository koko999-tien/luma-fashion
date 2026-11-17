import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart } from "@/lib/cart";

const schema = z.object({ variantId: z.string().min(1), quantity: z.number().int().positive().max(99).default(1) });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Dữ liệu không hợp lệ" }, { status: 400 });

  const variant = await prisma.productVariant.findUnique({ where: { id: parsed.data.variantId }, include: { product: { select: { status: true } } } });
  if (!variant || variant.product.status !== "ACTIVE") return NextResponse.json({ message: "Sản phẩm không tồn tại" }, { status: 404 });
  if (variant.stock <= 0) return NextResponse.json({ message: "Phiên bản này đã hết hàng" }, { status: 409 });

  const cart = await getOrCreateCart();
  const existing = await prisma.cartItem.findUnique({ where: { cartId_variantId: { cartId: cart.id, variantId: variant.id } } });
  const newQty = Math.min((existing?.quantity ?? 0) + parsed.data.quantity, variant.stock);

  await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId: variant.id } },
    update: { quantity: newQty },
    create: { cartId: cart.id, variantId: variant.id, quantity: newQty },
  });
  return NextResponse.json({ ok: true, quantity: newQty });
}
