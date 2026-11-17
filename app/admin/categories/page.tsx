import { prisma } from "@/lib/prisma";
import CategoryManager from "@/components/CategoryManager";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin – Danh mục" };

export default async function AdminCategories() {
  const categories = await prisma.category.findMany({ orderBy: [{ sort: "asc" }, { name: "asc" }], include: { _count: { select: { products: true } } } });
  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">Quản lý danh mục</h1>
      <p className="text-[11px] text-white/40 mt-1">Thêm / sửa / ẩn / xoá danh mục sản phẩm. Xoá danh mục có sản phẩm sẽ chỉ ẩn, không phá dữ liệu.</p>
      <div className="mt-5"><CategoryManager initial={categories.map((c) => ({ ...c }))} /></div>
    </div>
  );
}
