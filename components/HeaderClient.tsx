"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Search, User, Heart, ShoppingBag, Menu, X, ChevronDown } from "lucide-react";
import { useCart } from "./CartProvider";
import CartDrawer from "./CartDrawer";
import { BRAND } from "@/lib/brand";

type Cat = { slug: string; name: string };
const MEN_LINKS = ["ao", "quan", "giay", "phu-kien"];
const WOMEN_LINKS = ["ao", "quan", "vay-dam", "tui-xach", "giay", "phu-kien"];

export default function HeaderClient({ announcement, categories, collections }: { announcement: string; categories: Cat[]; collections: Cat[] }) {
  const { count, openDrawer } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [openMenu, setOpenMenu] = useState<"menu" | "collections" | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const catName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;

  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);

  useEffect(() => {
    if (query.trim().length < 2) { setSuggestions([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(query.trim())}`);
        setSuggestions((await res.json()).items ?? []);
      } catch { setSuggestions([]); }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setSearchOpen(false); setMobileOpen(false); setOpenMenu(null); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const submitSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    window.location.href = `/search?q=${encodeURIComponent(q)}`;
  };

  const navBtn = "flex items-center gap-1 text-[13px] font-semibold uppercase tracking-wide hover:text-accent transition-colors py-4";

  return (
    <>
      {/* Announcement bar (admin chỉnh được trong Settings) */}
      <div className="bg-ink text-paper text-[11px] sm:text-[11.5px] text-center py-1.5 px-4 tracking-wide">{announcement}</div>

      <header className="sticky top-0 z-[60] bg-paper/90 backdrop-blur-md border-b border-stone2">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center gap-3">
            <button className="lg:hidden p-2 -ml-2" onClick={() => setMobileOpen((v) => !v)} aria-label="Mở menu">
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Link href="/" className="font-display text-2xl sm:text-[28px] font-extrabold tracking-[0.18em] leading-none">{BRAND.name}<span className="text-accent">.</span></Link>

            {/* Nav desktop */}
            <nav className="hidden lg:flex items-center gap-6 mx-auto" onMouseLeave={() => setOpenMenu(null)}>
              <Link href="/products?sort=newest" className={navBtn}>Hàng mới</Link>

              <button className={navBtn} onMouseEnter={() => setOpenMenu("menu")} aria-expanded={openMenu === "menu"}>
                Nam <ChevronDown size={14} />
              </button>
              <button className={navBtn} onMouseEnter={() => setOpenMenu("menu")} aria-expanded={openMenu === "menu"}>
                Nữ <ChevronDown size={14} />
              </button>
              <button className={navBtn} onMouseEnter={() => setOpenMenu("collections")} aria-expanded={openMenu === "collections"}>
                Bộ sưu tập <ChevronDown size={14} />
              </button>
              <Link href="/products?sale=true" className={`${navBtn} text-accent`}>Sale</Link>
              <Link href="/about" className={navBtn}>Về LUMA</Link>

              {/* Mega menu */}
              {openMenu === "menu" && (
                <div className="absolute left-0 right-0 top-full border-b border-stone2 bg-white shadow-2xl animate-overlay">
                  <div className="max-w-7xl mx-auto grid grid-cols-3 gap-8 px-8 py-8">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-gray2 mb-3">Thời trang Nam</p>
                      <ul className="space-y-2">
                        <li><Link href="/products?gender=MEN" className="font-semibold hover:text-accent">Tất cả đồ nam</Link></li>
                        {MEN_LINKS.map((s) => <li key={s}><Link href={`/products?gender=MEN&category=${s}`} className="text-sm text-gray2 hover:text-accent">{catName(s)}</Link></li>)}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-gray2 mb-3">Thời trang Nữ</p>
                      <ul className="space-y-2">
                        <li><Link href="/products?gender=WOMEN" className="font-semibold hover:text-accent">Tất cả đồ nữ</Link></li>
                        {WOMEN_LINKS.map((s) => <li key={s}><Link href={`/products?gender=WOMEN&category=${s}`} className="text-sm text-gray2 hover:text-accent">{catName(s)}</Link></li>)}
                      </ul>
                    </div>
                    <Link href="/collection/thu-dong-2026" className="group relative overflow-hidden rounded-2xl min-h-[190px] bg-ink text-white p-5 flex flex-col justify-end">
                      <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80" alt="Bộ sưu tập Thu Đông 2026" className="absolute inset-0 h-full w-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700" />
                      <span className="relative text-[10px] uppercase tracking-widest text-amber-300">Featured</span>
                      <span className="relative font-display text-xl font-bold">Thu – Đông 2026</span>
                      <span className="relative text-xs underline underline-offset-4">Khám phá bộ sưu tập →</span>
                    </Link>
                  </div>
                </div>
              )}
              {openMenu === "collections" && (
                <div className="absolute left-0 right-0 top-full border-b border-stone2 bg-white shadow-2xl animate-overlay">
                  <div className="max-w-7xl mx-auto px-8 py-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {collections.map((c) => (
                      <Link key={c.slug} href={`/collection/${c.slug}`} className="rounded-xl border border-stone2 px-4 py-4 hover:border-accent hover:-translate-y-0.5 transition-all">
                        <p className="font-semibold text-sm">{c.name}</p>
                        <p className="text-[11px] text-gray2 mt-1">Xem bộ sưu tập →</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </nav>

            {/* Icons */}
            <div className="flex items-center gap-0.5 sm:gap-1 ml-auto lg:ml-0">
              <button onClick={() => setSearchOpen(true)} className="p-2.5 rounded-full hover:bg-gray3" aria-label="Tìm kiếm"><Search size={21} strokeWidth={1.8} /></button>
              <Link href="/account" className="p-2.5 rounded-full hover:bg-gray3 hidden sm:block" aria-label="Tài khoản"><User size={21} strokeWidth={1.8} /></Link>
              <Link href="/account/wishlist" className="p-2.5 rounded-full hover:bg-gray3 hidden sm:block" aria-label="Yêu thích"><Heart size={21} strokeWidth={1.8} /></Link>
              <button onClick={openDrawer} className="p-2.5 rounded-full hover:bg-gray3 relative" aria-label="Giỏ hàng">
                <ShoppingBag size={21} strokeWidth={1.8} />
                {count > 0 && <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[10px] font-bold min-w-[19px] h-[19px] px-1 rounded-full grid place-items-center">{count > 99 ? "99+" : count}</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Search overlay */}
        {searchOpen && (
          <div className="absolute inset-x-0 top-0 z-[70] bg-white border-b border-stone2 shadow-xl animate-overlay">
            <div className="max-w-3xl mx-auto px-4 py-5">
              <form onSubmit={submitSearch} className="flex items-center gap-3 border-b-2 border-ink pb-2">
                <Search size={22} className="text-gray2 shrink-0" />
                <input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm áo, quần, đầm, túi, thương hiệu…" className="w-full bg-transparent outline-none text-base sm:text-lg" aria-label="Tìm kiếm sản phẩm" />
                <button type="button" onClick={() => { setSearchOpen(false); setQuery(""); }} aria-label="Đóng tìm kiếm"><X size={22} /></button>
              </form>
              <div className="pt-3 flex flex-wrap gap-2 text-xs text-gray2">
                <span className="font-semibold">Gợi ý:</span>
                {["Áo sơ mi", "Quần jean", "Đầm", "Sneaker", "LUMA10"].map((s) => (
                  <button key={s} className="rounded-full bg-gray3 px-3 py-1 hover:bg-stone2" onClick={() => { window.location.href = `/search?q=${encodeURIComponent(s)}`; }}>{s}</button>
                ))}
              </div>
              {suggestions.length > 0 && (
                <ul className="mt-3 divide-y divide-stone2">
                  {suggestions.map((s) => (
                    <li key={s.id}><Link href={`/products/${s.slug}`} onClick={() => setSearchOpen(false)} className="flex items-center gap-2 py-2.5 text-sm hover:text-accent"><Search size={14} className="text-gray2" />{s.name}</Link></li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 top-[calc(2.5rem+4rem)] z-[55] bg-ink/40" onClick={() => setMobileOpen(false)}>
            <div className="bg-paper h-full w-[86vw] max-w-sm overflow-y-auto p-6 animate-drawer-left" onClick={(e) => e.stopPropagation()}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray2">Danh mục</p>
              <ul className="mt-2 divide-y divide-stone2">
                <li><Link href="/products" className="block py-3.5 font-semibold" onClick={() => setMobileOpen(false)}>Tất cả sản phẩm</Link></li>
                <li><Link href="/products?gender=MEN" className="block py-3.5 font-semibold" onClick={() => setMobileOpen(false)}>Thời trang Nam</Link></li>
                <li><Link href="/products?gender=WOMEN" className="block py-3.5 font-semibold" onClick={() => setMobileOpen(false)}>Thời trang Nữ</Link></li>
                {categories.map((c) => <li key={c.slug}><Link href={`/products?category=${c.slug}`} className="block py-3.5 text-gray2" onClick={() => setMobileOpen(false)}>{c.name}</Link></li>)}
                <li><Link href="/products?sale=true" className="block py-3.5 font-bold text-accent" onClick={() => setMobileOpen(false)}>Sale 🔥</Link></li>
                <li><Link href="/about" className="block py-3.5" onClick={() => setMobileOpen(false)}>Về LUMA</Link></li>
                <li><Link href="/contact" className="block py-3.5" onClick={() => setMobileOpen(false)}>Liên hệ</Link></li>
                <li><Link href="/account" className="block py-3.5 font-semibold" onClick={() => setMobileOpen(false)}>Tài khoản của tôi</Link></li>
              </ul>
            </div>
          </div>
        )}
      </header>

      <CartDrawer />
    </>
  );
}
