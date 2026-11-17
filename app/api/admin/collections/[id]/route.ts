import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";

const schema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  slug: z.string().trim().max(80).optional().or(z.literal("")),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  image: z.string().url().optional().or(z.literal("")),
  sort: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  /** Gán / gỡ sản phẩm khỏi bộ sưu tập */
  productIdsToAdd: z.array(z.string().min(1)).max(200).optional(),
  productIdsToRemove: z.array(z.string().min(1)).max(200).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 403 });
  const { id } = await params;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  const d = parsed.data;

  let slugClash = false;
  try {
    await prisma.$transaction(async (tx) => {
      const data: Record<string, unknown> = {};
      if (d.name !== undefined) data.name = d.name;
      if (d.slug) {
        const slug = slugify(d.slug);
        const clash = await tx.collection.findFirst({ where: { slug, NOT: { id } } });
        if (clash) { slugClash = true; throw new Error("SLUG_EXISTS"); }
        data.slug = slug;
      }
      if (d.description !== undefined) data.description = d.description || null;
      if (d.image !== undefined) data.image = d.image || null;
      if (d.sort !== undefined) data.sort = d.sort;
      if (d.active !== undefined) data.active = d.active;
      if (d.isFeatured !== undefined) data.isFeatured = d.isFeatured;
      if (Object.keys(data).length) await tx.collection.update({ where: { id }, data });

      if (d.productIdsToAdd?.length) await tx.product.updateMany({ where: { id: { in: d.productIdsToAdd } }, data: { collectionId: id } });
      if (d.productIdsToRemove?.length) await tx.product.updateMany({ where: { id: { in: d.productIdsToRemove }, collectionId: id }, data: { collectionId: null } });
    });
  } catch (e) {
    if (slugClash) return NextResponse.json({ message: "Slug đã tồn tại" }, { status: 409 });
    throw e;
  }

  return NextResponse.json({ ok: true });
}

/** Xoá cứng nếu trống; nếu còn sản phẩm → gỡ liên kết + xoá (sản phẩm KHÔNG bị xoá) */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 403 });
  const { id } = await params;

  await prisma.$transaction([
    prisma.product.updateMany({ where: { collectionId: id }, data: { collectionId: null } }),
    prisma.collection.delete({ where: { id } }),
  ]);
  return NextResponse.json({ ok: true });
}
