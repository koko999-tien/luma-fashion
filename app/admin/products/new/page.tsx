import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/ProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [categories, collections] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.collection.findMany({ orderBy: { name: "asc" } }),
  ]);
  return (
    <div className="max-w-4xl">
      <Link href="/admin/products" className="text-[12px] text-white/50 flex items-center gap-1.5 hover:text-white"><ArrowLeft size={14} /> Danh sách sản phẩm</Link>
      <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-2">Thêm sản phẩm mới</h1>
      <div className="mt-5 rounded-2xl bg-white/5 border border-white/10 p-5 sm:p-6">
        <ProductForm mode="new" categories={categories} collections={collections} />
      </div>
    </div>
  );
}
