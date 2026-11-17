import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { BRAND } from "@/lib/brand";
import ProductCard from "@/components/ProductCard";
import { productCardInclude, avgRating } from "@/lib/products";
import { ArrowRight, Truck, RefreshCcw, BadgeCheck, Headset, Star } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [banner, categories, newArrivals, bestSellers, featuredCollection, reviews] = await Promise.all([
    prisma.banner.findFirst({ where: { active: true }, orderBy: { sort: "asc" } }),
    prisma.category.findMany({ where: { active: true }, orderBy: [{ sort: "asc" }, { name: "asc" }], take: 6 }),
    prisma.product.findMany({ where: { status: "ACTIVE", isNew: true }, include: productCardInclude, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.product.findMany({ where: { status: "ACTIVE", isBestSeller: true }, include: productCardInclude, orderBy: { basePrice: "desc" }, take: 8 }),
    prisma.collection.findFirst({ where: { slug: "thu-dong-2026" }, include: { _count: { select: { products: true } } } }),
    prisma.review.findMany({ include: { user: { select: { name: true } }, product: { select: { name: true, slug: true } } }, orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  const heroImage = banner?.image ?? "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2000&q=80";

  return (
    <>
      {/* ═══ HERO CAMPAIGN ═══ */}
      <section className="relative min-h-[86vh] sm:min-h-[92vh] flex items-end sm:items-center overflow-hidden bg-ink text-white">
        <Image src={heroImage} alt={banner?.headline ?? "LUMA Fashion campaign"} fill priority sizes="100vw" className="object-cover object-[62%_center]" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-transparent sm:bg-gradient-to-r sm:from-ink sm:via-ink/55 sm:to-transparent" />
        <div className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 pb-14 pt-40 sm:py-32">
          <div className="max-w-xl animate-fade-up">
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-amber-400">Bộ sưu tập Thu – Đông 2026</p>
            <h1 className="mt-4 font-display text-4xl sm:text-6xl xl:text-7xl font-extrabold leading-[1.05]">{banner?.headline ?? "ĐỊNH HÌNH PHONG CÁCH MỖI NGÀY"}</h1>
            <p className="mt-4 sm:mt-6 text-sm sm:text-base text-white/85 max-w-md leading-relaxed">{banner?.subtext ?? "Khám phá bộ sưu tập mới nhất — thiết kế dành cho phong cách sống hiện đại của người Việt."}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/products?gender=WOMEN" className="btn bg-white text-ink px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-amber-400">Khám phá Nữ</Link>
              <Link href="/products?gender=MEN" className="btn-ghost !border-white/40 uppercase tracking-wider text-xs sm:text-sm">Khám phá Nam</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SHOP BY CATEGORY ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray2">Danh mục</p>
            <h2 className="font-display text-2xl sm:text-4xl font-bold mt-1">Mua theo danh mục</h2>
          </div>
          <Link href="/products" className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:text-accent">Tất cả <ArrowRight size={14} /></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {categories.map((c) => (
            <Link key={c.slug} href={`/products?category=${c.slug}`} className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-ink">
              {c.image && <Image src={c.image} alt={c.name} fill sizes="(max-width:768px) 50vw, 16vw" className="object-cover opacity-80 group-hover:scale-105 group-hover:opacity-95 transition-all duration-700" />}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-4 text-white font-semibold text-sm tracking-wide">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══ TRUST BAR ═══ */}
      <section className="border-y border-stone2 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-[11px] sm:text-xs text-gray2">
          <span className="flex items-center justify-center gap-2"><Truck size={17} className="text-accent" /> Freeship đơn từ 499K</span>
          <span className="flex items-center justify-center gap-2"><RefreshCcw size={17} className="text-accent" /> Đổi trả 7 ngày</span>
          <span className="flex items-center justify-center gap-2"><BadgeCheck size={17} className="text-accent" /> Ảnh thật, đúng mô tả</span>
          <span className="flex items-center justify-center gap-2"><Headset size={17} className="text-accent" /> Hotline {BRAND.phone}</span>
        </div>
      </section>

      {/* ═══ NEW ARRIVALS ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-accent">New In</p>
            <h2 className="font-display text-2xl sm:text-4xl font-bold mt-1">Hàng mới về</h2>
          </div>
          <Link href="/products?sort=newest" className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:text-accent">Xem tất cả <ArrowRight size={14} /></Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* ═══ FEATURED COLLECTION — editorial asymmetric ═══ */}
      {featuredCollection && (
        <section className="grid lg:grid-cols-12 bg-ink text-white">
          <div className="relative lg:col-span-7 min-h-[380px] sm:min-h-[520px]">
            <Image src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=80" alt="Bộ sưu tập Thu Đông 2026 — campaign" fill sizes="(max-width:1024px) 100vw, 58vw" className="object-cover" />
          </div>
          <div className="lg:col-span-5 flex flex-col justify-center px-6 sm:px-14 py-14">
            <p className="text-[10px] uppercase tracking-[0.3em] text-amber-400">Featured Collection</p>
            <h2 className="mt-4 font-display text-3xl sm:text-5xl font-extrabold leading-tight">{featuredCollection.name}</h2>
            <p className="mt-4 text-white/75 leading-relaxed">{featuredCollection.description}</p>
            <p className="mt-3 text-[12px] text-white/50">{featuredCollection._count.products} sản phẩm đang có sẵn</p>
            <Link href={`/collection/${featuredCollection.slug}`} className="btn mt-8 bg-accent text-white px-7 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-accentdark w-fit">Khám phá bộ sưu tập <ArrowRight size={16} /></Link>
          </div>
        </section>
      )}

      {/* ═══ BEST SELLERS ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray2">Best Sellers</p>
            <h2 className="font-display text-2xl sm:text-4xl font-bold mt-1">Bán chạy nhất</h2>
          </div>
          <Link href="/products?sort=bestselling" className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:text-accent">Xem tất cả <ArrowRight size={14} /></Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {bestSellers.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* ═══ PROMOTIONAL BANNER ═══ */}
      <section className="relative overflow-hidden">
        <Image src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=2000&q=80" alt="The new season starts here" fill sizes="100vw" className="object-cover object-center" />
        <div className="absolute inset-0 bg-ink/60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center text-white">
          <p className="text-[10px] uppercase tracking-[0.35em] text-amber-400">Khuyến mãi đến -30%</p>
          <h2 className="mt-4 font-display text-4xl sm:text-6xl font-extrabold">THE NEW SEASON<br />STARTS HERE</h2>
          <Link href="/products?sale=true" className="btn mt-8 bg-white text-ink px-8 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-amber-400">Săn sale ngay</Link>
        </div>
      </section>

      {/* ═══ CUSTOMER REVIEWS (thật, từ database) ═══ */}
      {reviews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray2">Reviews</p>
          <h2 className="font-display text-2xl sm:text-4xl font-bold mt-1 mb-6">Khách hàng nói gì</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map((r) => (
              <figure key={r.id} className="card p-5 flex flex-col">
                <div className="flex gap-0.5 text-amber-500">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={15} fill={i < r.rating ? "currentColor" : "none"} strokeWidth={1.5} />)}</div>
                <blockquote className="mt-3 text-sm text-ink/90 leading-relaxed">“{r.body}”</blockquote>
                <figcaption className="mt-4 pt-3 border-t border-stone2 text-[11px] text-gray2">
                  <span className="font-bold text-ink">{r.user.name}</span> • <Link href={`/products/${r.product.slug}`} className="hover:text-accent">{r.product.name}</Link>
                  <span className="block mt-0.5">{new Date(r.createdAt).toLocaleDateString("vi-VN")}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
