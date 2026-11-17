import { prisma } from "@/lib/prisma";
import Image from "next/image";
import BannerForm from "@/components/BannerForm";
import BannerToggle from "@/components/BannerToggle";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin – Banner" };

export default async function AdminBanners() {
  const banners = await prisma.banner.findMany({ orderBy: { sort: "asc" } });
  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">Banner trang chủ</h1>
      <p className="text-[11px] text-white/40 mt-1">Banner đang bật đầu tiên (sort nhỏ nhất) làm hero trang chủ.</p>
      <div className="mt-5 grid lg:grid-cols-3 gap-5">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 h-fit">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/45 mb-3">Thêm banner</h2>
          <BannerForm />
        </div>
        <div className="lg:col-span-2 space-y-4">
          {banners.map((b) => (
            <div key={b.id} className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex flex-col sm:flex-row">
              <div className="relative h-40 sm:h-auto sm:w-56 shrink-0">
                <Image src={b.image} alt={b.headline} fill sizes="220px" className="object-cover" />
              </div>
              <div className="p-4 flex-1">
                <p className="text-[9px] uppercase tracking-widest text-amber-400/80">Sort {b.sort} • {b.active ? "Đang hiển thị" : "Đã tắt"}</p>
                <p className="mt-1 font-display font-bold text-white leading-snug">{b.headline}</p>
                {b.subtext && <p className="mt-1 text-[11px] text-white/50">{b.subtext}</p>}
                {b.ctaUrl && <p className="mt-1 text-[10px] text-sky-400 font-mono line-clamp-1">{b.ctaText ?? "CTA"} → {b.ctaUrl}</p>}
                <div className="mt-3"><BannerToggle id={b.id} active={b.active} /></div>
              </div>
            </div>
          ))}
          {banners.length === 0 && <p className="text-white/35 text-sm">Chưa có banner — hero đang dùng ảnh mặc định.</p>}
        </div>
      </div>
    </div>
  );
}
