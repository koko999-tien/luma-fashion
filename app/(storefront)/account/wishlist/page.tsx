import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";
import ProductCard from "@/components/ProductCard";
import { productCardInclude } from "@/lib/products";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sản phẩm yêu thích" };

export default async function WishlistPage() {
  const session = await requireUser();
  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.id, product: { status: "ACTIVE" } },
    include: { product: { include: productCardInclude } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">Sản phẩm yêu thích ♥</h1>
      {items.length === 0 ? (
        <div className="card p-12 mt-6 text-center"><p className="text-gray2">Chưa có sản phẩm yêu thích. Bấm ♥ ở bất kỳ sản phẩm nào để lưu lại.</p><Link href="/products" className="btn-accent mt-5">Khám phá sản phẩm</Link></div>
      ) : (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">{items.map((i) => <ProductCard key={i.id} product={i.product} />)}</div>
      )}
    </div>
  );
}
