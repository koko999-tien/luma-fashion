import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const schema = z.object({
  name: z.string().trim().min(2).max(150).optional(),
  description: z.string().trim().min(10).max(3000).optional(),
  material: z.string().trim().max(300).optional().or(z.literal("")),
  care: z.string().trim().max(300).optional().or(z.literal("")),
  origin: z.string().trim().max(100).optional().or(z.literal("")),
  gender: z.enum(["MEN", "WOMEN", "UNISEX"]).optional(),
  categoryId: z.string().min(1).optional(),
  collectionId: z.string().min(1).nullable().optional(),
  basePrice: z.number().int().positive().optional(),
  salePrice: z.number().int().positive().nullable().optional(),
  isNew: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
  images: z.array(z.string().min(1).max(500)).max(8).optional(),
  variantStocks: z.array(z.object({ variantId: z.string().min(1), stock: z.number().int().min(0) })).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 403 });
  const { id } = await params;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  const { variantStocks, images, ...data } = parsed.data;
  if (data.salePrice && data.basePrice && data.salePrice >= data.basePrice) {
    return NextResponse.json({ message: "Giá sale phải nhỏ hơn giá gốc" }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    const updateData: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) if (v !== undefined) updateData[k] = v === "" ? null : v;
    if (Object.keys(updateData).length) await tx.product.update({ where: { id }, data: updateData });

    if (images?.length) {
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.productImage.createMany({ data: images.map((url, i) => ({ productId: id, url, sort: i })) });
    }

    if (variantStocks?.length) {
      for (const { variantId, stock } of variantStocks) {
        const before = await tx.productVariant.findUniqueOrThrow({ where: { id: variantId } });
        const delta = stock - before.stock;
        if (delta !== 0) {
          await tx.productVariant.update({ where: { id: variantId }, data: { stock } });
          await tx.inventoryTransaction.create({ data: { variantId, delta, previousQty: before.stock, newQty: stock, type: "MANUAL_ADJUST", reason: "ADMIN_ADJUST", adminId: admin.id } });
        }
      }
    }
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 403 });
  const { id } = await params;
  // Không xoá cứng (giữ lịch sử đơn hàng) — chuyển sang ARCHIVED
  await prisma.product.update({ where: { id }, data: { status: "ARCHIVED" } });
  return NextResponse.json({ ok: true });
}
