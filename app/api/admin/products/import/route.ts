import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { parseCsv } from "@/lib/csv";
import { slugify } from "@/lib/slug";

const MAX_ROWS = 500;
const MAX_PRODUCTS = 200;

const bodySchema = z.object({ csv: z.string().min(10).max(2_000_000), mode: z.enum(["preview", "commit"]) });
const GENDERS = new Set(["MEN", "WOMEN", "UNISEX"]);

type ParsedRow = { line: number; name: string; description: string; categorySlug: string; collectionSlug: string; gender: string; basePrice: number; salePrice: number | null; isNew: boolean; isFeatured: boolean; isBestSeller: boolean; images: string[]; size: string; color: string; colorHex: string; stock: number; sku: string };
type RowError = { line: number; field: string; message: string };

function toBool(v: string): boolean {
  return /^(true|1|yes|co|x)$/i.test(v.trim());
}

async function parseAndValidate(csv: string): Promise<{ rows: ParsedRow[]; errors: RowError[]; products: number }> {
  const table = parseCsv(csv);
  const errors: RowError[] = [];
  if (table.length < 2) return { rows: [], errors: [{ line: 1, field: "file", message: "File CSV trống hoặc chỉ có header" }], products: 0 };

  const header = table[0].map((h) => h.trim().toLowerCase().replace(/^﻿/, ""));
  const col = (name: string) => header.indexOf(name);
  const requiredCols = ["name", "description", "categoryslug", "gender", "baseprice", "size", "color", "stock"];
  for (const c of requiredCols) if (col(c) === -1) errors.push({ line: 1, field: c, message: `Thiếu cột bắt buộc: ${c}` });
  if (errors.length) return { rows: [], errors, products: 0 };

  if (table.length - 1 > MAX_ROWS) return { rows: [], errors: [{ line: 1, field: "file", message: `Tối đa ${MAX_ROWS} dòng dữ liệu` }], products: 0 };

  const categorySlugs = new Set((await prisma.category.findMany({ select: { slug: true } })).map((c) => c.slug));
  const collectionSlugs = new Set((await prisma.collection.findMany({ select: { slug: true } })).map((c) => c.slug));

  const rows: ParsedRow[] = [];
  const skuSeen = new Map<string, number>();

  for (let i = 1; i < table.length; i++) {
    const r = table[i];
    const line = i + 1;
    const get = (name: string) => { const i = col(name); return i === -1 ? "" : (r[i] ?? "").trim(); };

    const name = get("name");
    const description = get("description");
    const categorySlug = get("categoryslug");
    const collectionSlug = get("collectionslug");
    const gender = get("gender").toUpperCase();
    const basePrice = Number(get("baseprice"));
    const saleRaw = get("saleprice");
    const salePrice = saleRaw === "" ? null : Number(saleRaw);
    const images = get("imageurls").split("|").map((s) => s.trim()).filter(Boolean);
    const size = get("size");
    const color = get("color");
    const colorHex = get("colorhex") || "#111111";
    const stock = Number(get("stock"));
    const sku = get("sku");

    const rowErr = (field: string, message: string) => errors.push({ line, field, message });
    if (!name) rowErr("name", "Thiếu tên sản phẩm");
    if (description.length < 5) rowErr("description", "Mô tả quá ngắn (tối thiểu 5 ký tự)");
    if (!categorySlugs.has(categorySlug)) rowErr("categorySlug", `Danh mục "${categorySlug}" không tồn tại`);
    if (collectionSlug && !collectionSlugs.has(collectionSlug)) rowErr("collectionSlug", `Bộ sưu tập "${collectionSlug}" không tồn tại`);
    if (!GENDERS.has(gender)) rowErr("gender", `Gender phải là MEN | WOMEN | UNISEX`);
    if (!Number.isInteger(basePrice) || basePrice <= 0) rowErr("basePrice", "Giá gốc phải là số nguyên dương");
    if (salePrice !== null && (!Number.isInteger(salePrice) || salePrice <= 0 || salePrice >= basePrice)) rowErr("salePrice", "Giá sale phải nhỏ hơn giá gốc");
    if (!size) rowErr("size", "Thiếu size");
    if (!color) rowErr("color", "Thiếu màu");
    if (!/^#[0-9a-fA-F]{6}$/.test(colorHex)) rowErr("colorHex", "Màu phải dạng #RRGGBB");
    if (!Number.isInteger(stock) || stock < 0) rowErr("stock", "Tồn kho phải là số nguyên ≥ 0");
    for (const img of images) { try { new URL(img); } catch { rowErr("imageUrls", `URL ảnh không hợp lệ: ${img.slice(0, 60)}`); } }
    if (sku) {
      if (skuSeen.has(sku)) rowErr("sku", `SKU trùng trong file (dòng ${skuSeen.get(sku)})`);
      else skuSeen.set(sku, line);
    }

    rows.push({ line, name, description, categorySlug, collectionSlug, gender, basePrice, salePrice, isNew: toBool(get("isnew")), isFeatured: toBool(get("isfeatured")), isBestSeller: toBool(get("isbestseller")), images, size, color, colorHex, stock, sku });
  }

  // SKU trùng với database
  const skus = rows.map((r) => r.sku).filter(Boolean);
  if (skus.length) {
    const existing = await prisma.productVariant.findMany({ where: { sku: { in: skus } }, select: { sku: true } });
    const existingSet = new Set(existing.map((e) => e.sku));
    for (const r of rows) if (r.sku && existingSet.has(r.sku)) errors.push({ line: r.line, field: "sku", message: `SKU "${r.sku}" đã tồn tại trong hệ thống` });
  }

  // Số sản phẩm unique
  const productKeys = new Set(rows.map((r) => slugify(r.name)));
  if (productKeys.size > MAX_PRODUCTS) errors.push({ line: 1, field: "file", message: `Tối đa ${MAX_PRODUCTS} sản phẩm mỗi lần import` });

  return { rows, errors, products: productKeys.size };
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 403 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Dữ liệu không hợp lệ" }, { status: 400 });
  const { csv, mode } = parsed.data;

  const { rows, errors, products } = await parseAndValidate(csv);
  if (errors.length > 0) {
    return NextResponse.json({ ok: false, mode, products, rows: rows.length, errors: errors.slice(0, 50) }, { status: 422 });
  }
  if (mode === "preview") {
    return NextResponse.json({ ok: true, mode, products, variants: rows.length, preview: rows.slice(0, 10) });
  }

  // COMMIT — 1 transaction, lỗi là rollback hết
  try {
    const created = await prisma.$transaction(async (tx) => {
      let seq = 0;
      const groups = new Map<string, ParsedRow[]>();
      for (const r of rows) {
        const key = slugify(r.name);
        groups.set(key, [...(groups.get(key) ?? []), r]);
      }
      const result: { name: string; slug: string; variants: number }[] = [];
      for (const [key, group] of groups) {
        const first = group[0];
        const category = await tx.category.findUniqueOrThrow({ where: { slug: first.categorySlug } });
        const collection = first.collectionSlug ? await tx.collection.findUnique({ where: { slug: first.collectionSlug } }) : null;
        let slug = key;
        if (await tx.product.findUnique({ where: { slug } })) slug = `${key}-import-${Date.now().toString(36)}`;
        const product = await tx.product.create({
          data: {
            slug, name: first.name, description: first.description,
            gender: first.gender, categoryId: category.id, collectionId: collection?.id ?? null,
            basePrice: first.basePrice, salePrice: first.salePrice,
            isNew: first.isNew, isFeatured: first.isFeatured, isBestSeller: first.isBestSeller,
            images: { create: first.images.map((url, i) => ({ url, sort: i })) },
            variants: {
              create: group.map((r) => {
                seq += 1;
                return {
                  sku: r.sku || `IM-${key.slice(0, 8).toUpperCase().replace(/-/g, "")}-${seq}`,
                  size: r.size, color: r.color, colorHex: r.colorHex, stock: r.stock,
                };
              }),
            },
          },
        });
        const variants = await tx.productVariant.findMany({ where: { productId: product.id } });
        for (const v of variants) {
          await tx.inventoryTransaction.create({ data: { variantId: v.id, delta: v.stock, previousQty: 0, newQty: v.stock, type: "INITIAL", reason: "CSV_IMPORT", adminId: admin.id } });
        }
        result.push({ name: product.name, slug: product.slug, variants: variants.length });
      }
      return result;
    });
    return NextResponse.json({ ok: true, mode, imported: created.length, products: created });
  } catch (e) {
    console.error("[import] failed:", e);
    return NextResponse.json({ ok: false, message: "Import thất bại — đã rollback, không có dữ liệu nào bị ghi. Kiểm tra log server." }, { status: 500 });
  }
}
