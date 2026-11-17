import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";

const schema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  slug: z.string().trim().max(80).optional().or(z.literal("")),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  image: z.string().url().optional().or(z.literal("")),
  sort: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 403 });
  const { id } = await params;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  const d = parsed.data;

  const data: Record<string, unknown> = {};
  if (d.name !== undefined) data.name = d.name;
  if (d.slug !== undefined) {
    if (d.slug) {
      const slug = slugify(d.slug);
      const clash = await prisma.category.findFirst({ where: { slug, NOT: { id } } });
      if (clash) return NextResponse.json({ message: "Slug đã tồn tại" }, { status: 409 });
      data.slug = slug;
    }
  }
  if (d.description !== undefined) data.description = d.description || null;
  if (d.image !== undefined) data.image = d.image || null;
  if (d.sort !== undefined) data.sort = d.sort;
  if (d.active !== undefined) data.active = d.active;

  await prisma.category.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
}

/** Xoá cứng nếu trống, lưu trữ (active=false) nếu đang có sản phẩm — không phá dữ liệu đơn hàng */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 403 });
  const { id } = await params;

  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    await prisma.category.update({ where: { id }, data: { active: false } });
    return NextResponse.json({ ok: true, archived: true, message: `Danh mục đang có ${count} sản phẩm — đã ẨN thay vì xoá.` });
  }
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true, archived: false });
}
