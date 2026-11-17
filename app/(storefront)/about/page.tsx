import { BRAND } from "@/lib/brand";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Về chúng tôi", description: "Câu chuyện và giá trị của LUMA Fashion — thời trang cao cấp thiết kế riêng cho người Việt." };

export default function AboutPage() {
  return (
    <div>
      <section className="relative h-[42vh] min-h-[280px] overflow-hidden">
        <Image src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=2000&q=80" alt="Xưởng thiết kế LUMA" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-ink/60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 h-full flex flex-col justify-end pb-8 text-white">
          <p className="text-[10px] uppercase tracking-[0.3em] text-amber-400">Our Story</p>
          <h1 className="font-display text-4xl sm:text-6xl font-extrabold mt-1">Về {BRAND.name}</h1>
        </div>
      </section>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 text-[15px] leading-8 text-ink/90">
        <p className="font-display text-2xl leading-snug">LUMA ra đời với một niềm tin giản dị: người Việt xứng đáng mặc những bộ đồ thật đẹp, thật chất lượng — với mức giá tử tế.</p>
        <div className="grid sm:grid-cols-3 gap-4 mt-10 text-center">
          {[["2019", "Thành lập tại TP.HCM"], ["12.000+", "Khách hàng tin tưởng"], ["150+", "Mẫu thiết kế mỗi năm"]].map(([n, d]) => (
            <div key={n} className="card p-6"><p className="font-display text-3xl font-extrabold text-accent">{n}</p><p className="text-xs text-gray2 mt-1">{d}</p></div>
          ))}
        </div>
        <h2 className="font-display text-2xl font-bold mt-12">Giá trị của chúng tôi</h2>
        <ul className="mt-3 list-disc pl-6 space-y-2">
          <li><b>Chất lượng thật:</b> vải kiểm định, đường may tỉ mỉ, ảnh chụp sản phẩm thật 100%.</li>
          <li><b>Thiết kế cho người Việt:</b> phom dáng, bảng size phù hợp vóc dáng Á Đông 18–40 tuổi.</li>
          <li><b>Dịch vụ tận tâm:</b> đổi trả 7 ngày, tư vấn size 1-1, giao hàng toàn quốc.</li>
        </ul>
        <h2 className="font-display text-2xl font-bold mt-10">Cửa hàng</h2>
        <p className="mt-2">{BRAND.address}<br />Hotline: {BRAND.phone} • {BRAND.email}<br />{BRAND.hours}</p>
      </div>
    </div>
  );
}
