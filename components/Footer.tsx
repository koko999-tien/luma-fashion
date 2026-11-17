import Link from "next/link";
import { BRAND } from "@/lib/brand";
import NewsletterForm from "./NewsletterForm";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const SOCIALS = [
  { href: BRAND.social.facebook, label: "Facebook", mark: "f" },
  { href: BRAND.social.instagram, label: "Instagram", mark: "IG" },
  { href: BRAND.social.tiktok, label: "TikTok", mark: "♪" },
  { href: BRAND.social.youtube, label: "YouTube", mark: "▶" },
];

export default function Footer() {
  const col = "text-[13px] text-white/70 hover:text-white transition-colors";
  return (
    <footer className="bg-ink text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-3">
          <Link href="/" className="font-display text-2xl font-extrabold tracking-[0.18em]">{BRAND.name}<span className="text-accent">.</span></Link>
          <p className="mt-3 text-[13px] text-white/70 leading-relaxed">{BRAND.tagline}. Thời trang cao cấp thiết kế riêng cho người Việt 18–40 tuổi.</p>
          <div className="mt-4 flex gap-3">
            {SOCIALS.map((s) => (
              <a key={s.label} href={s.href} aria-label={s.label} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-accent text-sm font-extrabold">{s.mark}</a>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400/90">Khách hàng</p>
          <ul className="mt-3 space-y-2">
            <li><Link className={col} href="/contact">Liên hệ</Link></li>
            <li><Link className={col} href="/faq">FAQ</Link></li>
            <li><Link className={col} href="/shipping">Vận chuyển</Link></li>
            <li><Link className={col} href="/returns">Đổi trả</Link></li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400/90">Công ty</p>
          <ul className="mt-3 space-y-2">
            <li><Link className={col} href="/about">Về chúng tôi</Link></li>
            <li><Link className={col} href="/privacy">Bảo mật</Link></li>
            <li><Link className={col} href="/terms">Điều khoản</Link></li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400/90">Cửa hàng</p>
          <ul className="mt-3 space-y-2 text-[13px] text-white/70">
            <li className="flex gap-2"><MapPin size={15} className="shrink-0 mt-0.5" />{BRAND.address}</li>
            <li className="flex gap-2"><Phone size={15} className="shrink-0 mt-0.5" />{BRAND.phone}</li>
            <li className="flex gap-2"><Mail size={15} className="shrink-0 mt-0.5" />{BRAND.email}</li>
            <li className="flex gap-2"><Clock size={15} className="shrink-0 mt-0.5" />{BRAND.hours}</li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400/90">Nhận ưu đãi 10%</p>
          <p className="mt-2 text-[13px] text-white/70">Đăng ký email để nhận mã giảm giá và tin bộ sưu tập mới.</p>
          <NewsletterForm />
          <div className="mt-5 flex flex-wrap items-center gap-2 text-[10px] text-white/50">
            <span className="rounded border border-white/20 px-2 py-1 font-bold">COD</span>
            <span className="rounded border border-white/20 px-2 py-1 font-bold">BANK TRANSFER</span>
            <span className="rounded border border-white/20 px-2 py-1 font-bold">VNPAY*</span>
            <span className="rounded border border-white/20 px-2 py-1 font-bold">MOMO*</span>
            <span className="w-full sm:w-auto">*Khi cấu hình cổng thanh toán</span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-white/50">
          <p>© {new Date().getFullYear()} {BRAND.name} Fashion. Bảo lưu mọi quyền.</p>
          <p>Thiết kế & vận hành bởi đội ngũ {BRAND.name}</p>
        </div>
      </div>
    </footer>
  );
}
