import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().max(80).optional().or(z.literal("")),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  image: z.string().url().optional().or(z.literal("")),
  sort: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

function uniqueSlug(base: string, id?: string) {
  return prisma.category.findFirst({ where: { slug: base, NOT: id ? { id } : undefined } }).then(Boolean).then((exists) => (exists ? `${base}-2` : base));
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 403 });
  const categories = await prisma.category.findMany({ orderBy: [{ sort: "asc" }, { name: "asc" }], include: { _count: { select: { products: true } } } });
  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  const d = parsed.data;

  const base = d.slug ? slugify(d.slug) : slugify(d.name);
  const slug = await uniqueSlug(base || `danh-muc-${Date.now()}`);
  const category = await prisma.category.create({ data: { name: d.name, slug, description: d.description || null, image: d.image || null, sort: d.sort, active: d.active } });
  return NextResponse.json({ ok: true, id: category.id, slug });
}
