import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductGallery from "@/components/ProductGallery";
import AddToCartPanel from "@/components/AddToCartPanel";
import ProductCard from "@/components/ProductCard";
import ReviewForm from "@/components/ReviewForm";
import { productCardInclude, avgRating } from "@/lib/products";
import { Star, Truck, RefreshCcw, Ruler, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await prisma.product.findUnique({ where: { slug }, select: { name: true, description: true, images: { take: 1, orderBy: { sort: "asc" } } } });
  if (!p) return { title: "Không tìm thấy sản phẩm" };
  return { title: p.name, description: p.description.slice(0, 160), openGraph: { images: p.images[0] ? [p.images[0].url] : [] } };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sort: "asc" } },
      variants: { orderBy: [{ color: "asc" }, { size: "asc" }] },
      category: true,
      collection: true,
      reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!product || product.status !== "ACTIVE") notFound();

  const rating = avgRating(product);
  const images = product.images.map((i) => i.url);
  const related = await prisma.product.findMany({
    where: { status: "ACTIVE", categoryId: product.categoryId, NOT: { id: product.id } },
    include: productCardInclude, take: 4, orderBy: { createdAt: "desc" },
  });

  const jsonLd = {
    "@context": "https://schema.org", "@type": "Product", name: product.name,
    image: images, description: product.description, sku: product.variants[0]?.sku,
    aggregateRating: rating ? { "@type": "AggregateRating", ratingValue: rating, reviewCount: product.reviews.length } : undefined,
    offers: { "@type": "Offer", price: product.salePrice ?? product.basePrice, priceCurrency: "VND", availability: product.variants.some((v) => v.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[11px] text-gray2 mb-5 flex-wrap" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink">Trang chủ</Link><ChevronRight size={12} />
        <Link href="/products" className="hover:text-ink">Sản phẩm</Link><ChevronRight size={12} />
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-ink">{product.category.name}</Link><ChevronRight size={12} />
        <span className="text-ink font-semibold line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 xl:gap-14">
        <ProductGallery images={images} name={product.name} />
        <div>
          <AddToCartPanel
            product={{ id: product.id, name: product.name, basePrice: product.basePrice, salePrice: product.salePrice, gender: product.gender }}
            variants={product.variants}
            rating={rating}
            reviewCount={product.reviews.length}
          />
        </div>
      </div>

      {/* Thông tin chi tiết + size guide */}
      <div id="size-guide" className="mt-12 grid lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-display text-xl font-bold">Mô tả sản phẩm</h2>
          <p className="mt-3 text-sm leading-7 text-ink/90">{product.description}</p>
          <dl className="mt-5 grid sm:grid-cols-3 gap-4 text-[12px]">
            <div className="rounded-xl bg-paper p-3"><dt className="font-bold">Chất liệu</dt><dd className="mt-1 text-gray2">{product.material ?? "—"}</dd></div>
            <div className="rounded-xl bg-paper p-3"><dt className="font-bold">Hướng dẫn bảo quản</dt><dd className="mt-1 text-gray2">{product.care ?? "—"}</dd></div>
            <div className="rounded-xl bg-paper p-3"><dt className="font-bold">Xuất xứ</dt><dd className="mt-1 text-gray2">{product.origin ?? "—"}</dd></div>
          </dl>

          <h3 className="mt-6 font-bold text-sm uppercase tracking-wider flex items-center gap-2"><Ruler size={16} /> Bảng size (tham khảo)</h3>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-[12px] border border-stone2 rounded-xl overflow-hidden">
              <thead className="bg-ink text-white"><tr><th className="py-2 px-3 text-left">Size</th><th className="py-2 px-3">Ngực (cm)</th><th className="py-2 px-3">Eo (cm)</th><th className="py-2 px-3">Cao (cm)</th></tr></thead>
              <tbody className="divide-y divide-stone2">
                {[["S", "84–88", "64–68", "158–164"], ["M", "88–94", "68–74", "164–170"], ["L", "94–100", "74–80", "170–176"], ["XL", "100–108", "80–88", "176–182"], ["XXL", "108–116", "88–96", "182+"]].map((r) => <tr key={r[0]}><td className="py-2 px-3 font-bold">{r[0]}</td><td className="text-center">{r[1]}</td><td className="text-center">{r[2]}</td><td className="text-center">{r[3]}</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-6 h-fit">
          <h2 className="font-display text-xl font-bold">Vận chuyển & Đổi trả</h2>
          <ul className="mt-4 space-y-3 text-[13px] text-ink/90">
            <li className="flex gap-2"><Truck size={17} className="text-accent shrink-0 mt-0.5" />Tiêu chuẩn 2–4 ngày (30K) • Hoả tốc trong ngày nội thành (60K). Freeship đơn từ 499K.</li>
            <li className="flex gap-2"><RefreshCcw size={17} className="text-accent shrink-0 mt-0.5" />Đổi trả miễn phí trong 7 ngày nếu lỗi từ shop hoặc sai size/mẫu.</li>
          </ul>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-12 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="font-display text-2xl font-bold">Đánh giá {rating && <span className="text-amber-500">★ {rating}</span>} <span className="text-sm font-sans text-gray2 font-normal">({product.reviews.length})</span></h2>
          <div className="mt-4 space-y-4">
            {product.reviews.length === 0 && <p className="text-sm text-gray2 card p-6 text-center">Chưa có đánh giá. Hãy là người đầu tiên!</p>}
            {product.reviews.map((r) => (
              <figure key={r.id} className="card p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-white text-sm font-bold">{r.user.name.charAt(0).toUpperCase()}</span>
                    <div><p className="text-sm font-bold">{r.user.name}</p><p className="text-[10px] text-gray2">{new Date(r.createdAt).toLocaleDateString("vi-VN")}</p></div>
                  </div>
                  <div className="flex gap-0.5 text-amber-500">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill={i < r.rating ? "currentColor" : "none"} strokeWidth={1.5} />)}</div>
                </div>
                {r.title && <p className="mt-3 text-sm font-semibold">{r.title}</p>}
                <blockquote className="mt-1 text-sm text-ink/90 leading-relaxed">{r.body}</blockquote>
              </figure>
            ))}
          </div>
        </div>
        <div className="h-fit"><ReviewForm productId={product.id} /></div>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold mb-5">Có thể bạn cũng thích</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">{related.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </section>
      )}
    </div>
  );
}
