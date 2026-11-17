import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/ProductForm";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories, collections] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { variants: { orderBy: [{ color: "asc" }, { size: "asc" }] }, images: { orderBy: { sort: "asc" } } } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.collection.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <div className="max-w-4xl">
      <Link href="/admin/products" className="text-[12px] text-white/50 flex items-center gap-1.5 hover:text-white"><ArrowLeft size={14} /> Danh sách sản phẩm</Link>
      <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-2 line-clamp-1">Sửa: {product.name}</h1>
      <p className="text-[10px] font-mono text-white/35 mt-1">slug: {product.slug}</p>
      <div className="mt-5 rounded-2xl bg-white/5 border border-white/10 p-5 sm:p-6">
        <ProductForm
          mode="edit"
          productId={product.id}
          categories={categories}
          collections={collections}
          initial={{
            name: product.name, description: product.description, material: product.material ?? "", care: product.care ?? "", origin: product.origin ?? "",
            gender: product.gender, categoryId: product.categoryId, collectionId: product.collectionId ?? "",
            basePrice: product.basePrice, salePrice: product.salePrice,
            isNew: product.isNew, isFeatured: product.isFeatured, isBestSeller: product.isBestSeller, status: product.status,
          }}
          initialImages={product.images.map((i) => i.url)}
          variants={product.variants.map((v) => ({ id: v.id, size: v.size, color: v.color, stock: v.stock }))}
        />
      </div>
    </div>
  );
}
