import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import FilterSidebar from "@/components/FilterSidebar";
import SortSelect from "@/components/SortSelect";
import { productCardInclude } from "@/lib/products";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sản phẩm", description: "Khám phá toàn bộ sản phẩm LUMA: áo, quần, đầm, phụ kiện. Lọc theo danh mục, giới tính, size, màu sắc và giá." };

const PAGE_SIZE = 12;
const PRICE_RANGES = [
  { key: "", label: "Tất cả" },
  { key: "0-300000", label: "Dưới 300K" },
  { key: "300000-500000", label: "300K – 500K" },
  { key: "500000-1000000", label: "500K – 1 triệu" },
  { key: "1000000-999999999", label: "Trên 1 triệu" },
];

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const get = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : sp[k]) ?? "";

  const category = get("category");
  const gender = get("gender");
  const collection = get("collection");
  const q = get("q").trim();
  const sale = get("sale") === "true";
  const size = get("size");
  const color = get("color");
  const priceRange = get("price");
  const sort = get("sort") || "recommended";
  const page = Math.max(1, Number(get("page")) || 1);

  const where: Record<string, unknown> = { status: "ACTIVE" };
  if (category) where.category = { slug: category };
  if (gender) where.gender = gender;
  if (collection) where.collection = { slug: collection };
  if (sale) where.salePrice = { not: null };
  if (q) where.OR = [
    { name: { contains: q } },
    { description: { contains: q } },
    { variants: { some: { sku: { contains: q } } } },
  ];
  if (size || color) where.variants = { some: { ...(size ? { size } : {}), ...(color ? { color } : {}) } };
  if (priceRange) {
    const [min, max] = priceRange.split("-").map(Number);
    where.AND = [
      { OR: [{ salePrice: { gte: min, lte: max } }, { salePrice: null, basePrice: { gte: min, lte: max } }] },
    ];
  }

  const orderBy =
    sort === "newest" ? { createdAt: "desc" as const }
    : sort === "price_asc" ? { basePrice: "asc" as const }
    : sort === "price_desc" ? { basePrice: "desc" as const }
    : [{ isBestSeller: "desc" as const }, { isFeatured: "desc" as const }, { createdAt: "desc" as const }];

  const [total, categories, allSizes, allColors] = await Promise.all([
    prisma.product.count({ where }),
    prisma.category.findMany({ where: { active: true }, orderBy: [{ sort: "asc" }, { name: "asc" }] }),
    prisma.productVariant.findMany({ select: { size: true }, distinct: ["size"], orderBy: { size: "asc" } }),
    prisma.productVariant.findMany({ select: { color: true, colorHex: true }, distinct: ["color"] }),
  ]);

  // Với sort=rating: xếp theo số lượng đánh giá (in-memory, đủ nhanh ở quy mô hiện tại)
  let products;
  if (sort === "rating") {
    const all = await prisma.product.findMany({ where, include: productCardInclude });
    all.sort((a, b) => b.reviews.length - a.reviews.length);
    products = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  } else {
    products = await prisma.product.findMany({ where, include: productCardInclude, orderBy, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE });
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const baseQuery = new URLSearchParams();
  for (const [k, v] of Object.entries({ category, gender, collection, q, size, color, price: priceRange, sort: sort === "recommended" ? "" : sort, sale: sale ? "true" : "" })) if (v) baseQuery.set(k, v);
  const pageUrl = (p: number) => { const qp = new URLSearchParams(baseQuery); qp.set("page", String(p)); return `/products?${qp}`; };

  const heading = q ? `Kết quả cho “${q}”` : sale ? "Khuyến mãi" : category ? categories.find((c) => c.slug === category)?.name ?? "Sản phẩm" : gender === "MEN" ? "Thời trang Nam" : gender === "WOMEN" ? "Thời trang Nữ" : collection ? "Bộ sưu tập" : "Tất cả sản phẩm";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="text-[11px] text-gray2 mb-4 flex gap-2" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink">Trang chủ</Link><span>/</span><span className="text-ink font-semibold">{heading}</span>
      </nav>

      <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold">{heading}</h1>
          <p className="mt-1 text-xs text-gray2">{total} sản phẩm{q && ` phù hợp với “${q}”`}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray2">
          <label htmlFor="sort" className="hidden sm:inline">Sắp xếp:</label>
          <SortSelect current={sort} />
        </div>
      </div>

      <div className="grid lg:grid-cols-[230px_1fr] gap-6">
        <FilterSidebar categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} sizes={allSizes.map((s) => s.size)} colors={allColors} current={{ category, gender, size, color, price: priceRange, sale, q }} priceRanges={PRICE_RANGES} />

        <div>
          {products.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="font-display text-2xl">Không tìm thấy sản phẩm 😔</p>
              <p className="text-sm text-gray2 mt-2">Thử bỏ bớt bộ lọc hoặc tìm với từ khoá khác.</p>
              <Link href="/products" className="btn-primary mt-6">Xoá tất cả bộ lọc</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Phân trang">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link key={p} href={pageUrl(p)} aria-current={p === page ? "page" : undefined}
                  className={`h-10 w-10 grid place-items-center rounded-lg text-sm font-semibold ${p === page ? "bg-ink text-white" : "bg-white border border-stone2 hover:border-ink"}`}>{p}</Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
