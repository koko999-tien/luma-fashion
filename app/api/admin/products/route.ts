import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const variantSchema = z.object({
  sku: z.string().trim().min(2).max(60).optional().or(z.literal("")),
  size: z.string().trim().min(1).max(10),
  color: z.string().trim().min(1).max(30),
  colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#111111"),
  stock: z.number().int().min(0).default(0),
  priceOverride: z.number().int().positive().nullable().optional(),
});

const schema = z.object({
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().min(10).max(3000),
  material: z.string().trim().max(300).optional().or(z.literal("")),
  care: z.string().trim().max(300).optional().or(z.literal("")),
  origin: z.string().trim().max(100).optional().or(z.literal("")),
  gender: z.enum(["MEN", "WOMEN", "UNISEX"]),
  categoryId: z.string().min(1),
  collectionId: z.string().min(1).nullable().optional(),
  basePrice: z.number().int().positive(),
  salePrice: z.number().int().positive().nullable().optional(),
  isNew: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  status: z.enum(["ACTIVE", "ARCHIVED"]).default("ACTIVE"),
  images: z.array(z.string().url()).min(1, "Cần ít nhất 1 ảnh").max(8),
  variants: z.array(variantSchema).min(1, "Cần ít nhất 1 biến thể").max(100),
});

import { slugify } from "@/lib/slug";

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  const d = parsed.data;
  if (d.salePrice && d.salePrice >= d.basePrice) return NextResponse.json({ message: "Giá sale phải nhỏ hơn giá gốc" }, { status: 400 });

  const base = slugify(d.name);
  let slug = base, i = 2;
  while (await prisma.product.findUnique({ where: { slug } })) slug = `${base}-${i++}`;

  const product = await prisma.product.create({
    data: {
      slug, name: d.name, description: d.description, material: d.material || null, care: d.care || null, origin: d.origin || null,
      gender: d.gender, categoryId: d.categoryId, collectionId: d.collectionId ?? null,
      basePrice: d.basePrice, salePrice: d.salePrice ?? null,
      isNew: d.isNew, isFeatured: d.isFeatured, isBestSeller: d.isBestSeller, status: d.status,
      images: { create: d.images.map((url, idx) => ({ url, sort: idx })) },
      variants: {
        create: d.variants.map((v, idx) => ({
          sku: v.sku || `LM-${slug.slice(0, 10).toUpperCase().replace(/-/g, "")}-${idx + 1}`,
          size: v.size, color: v.color, colorHex: v.colorHex, stock: v.stock, priceOverride: v.priceOverride ?? null,
        })),
      },
    },
  });
  return NextResponse.json({ ok: true, id: product.id, slug });
}
