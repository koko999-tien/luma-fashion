import { prisma } from "@/lib/prisma";
import CollectionManager from "@/components/CollectionManager";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin – Bộ sưu tập" };

export default async function AdminCollections() {
  const [collections, products] = await Promise.all([
    prisma.collection.findMany({ orderBy: [{ sort: "asc" }, { name: "asc" }], include: { _count: { select: { products: true } } } }),
    prisma.product.findMany({ select: { id: true, name: true, collectionId: true }, orderBy: { name: "asc" } }),
  ]);
  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">Quản lý bộ sưu tập</h1>
      <p className="text-[11px] text-white/40 mt-1">Tạo / sửa / xoá bộ sưu tập, gán hoặc gỡ sản phẩm, đặt chế độ nổi bật cho trang chủ.</p>
      <div className="mt-5"><CollectionManager initial={collections.map((c) => ({ ...c }))} products={products} /></div>
    </div>
  );
}
