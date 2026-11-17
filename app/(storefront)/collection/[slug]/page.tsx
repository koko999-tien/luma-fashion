import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import { productCardInclude } from "@/lib/products";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const col = await prisma.collection.findUnique({ where: { slug } });
  return { title: col?.name ?? "Bộ sưu tập", description: col?.description ?? undefined };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = await prisma.collection.findUnique({ where: { slug } });
  if (!collection) notFound();

  const products = await prisma.product.findMany({ where: { status: "ACTIVE", collectionId: collection.id }, include: productCardInclude, orderBy: { createdAt: "desc" } });

  return (
    <>
      <section className="relative h-[38vh] min-h-[260px] overflow-hidden bg-ink text-white">
        {collection.image && <Image src={collection.image} alt={collection.name} fill priority sizes="100vw" className="object-cover opacity-70" />}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 h-full flex flex-col justify-end pb-8">
          <p className="text-[10px] uppercase tracking-[0.3em] text-amber-400">Collection</p>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold mt-1">{collection.name}</h1>
          {collection.description && <p className="mt-2 text-sm text-white/85 max-w-md">{collection.description}</p>}
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <nav className="text-[11px] text-gray2 mb-5 flex gap-2"><Link href="/" className="hover:text-ink">Trang chủ</Link><span>/</span><span className="text-ink font-semibold">{collection.name}</span></nav>
        {products.length === 0 ? (
          <p className="text-center text-gray2 py-16">Bộ sưu tập này đang được cập nhật sản phẩm. <Link href="/products" className="text-accent underline">Xem tất cả sản phẩm →</Link></p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        )}
      </div>
    </>
  );
}
