import ContactForm from "@/components/ContactForm";
import { BRAND } from "@/lib/brand";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Liên hệ", description: "Liên hệ LUMA Fashion: hotline, email, địa chỉ cửa hàng và form gửi tin nhắn." };

export default function ContactPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid lg:grid-cols-2 gap-8">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-gray2">Contact</p>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold mt-1">Liên hệ với LUMA</h1>
        <p className="mt-3 text-gray2">Chúng tôi luôn sẵn sàng hỗ trợ bạn từ 8:00 đến 21:00 mỗi ngày.</p>
        <ul className="mt-8 space-y-4 text-sm">
          <li className="flex gap-3"><MapPin className="text-accent shrink-0" size={20} />{BRAND.address}</li>
          <li className="flex gap-3"><Phone className="text-accent shrink-0" size={20} />{BRAND.phone}</li>
          <li className="flex gap-3"><Mail className="text-accent shrink-0" size={20} />{BRAND.email}</li>
          <li className="flex gap-3"><Clock className="text-accent shrink-0" size={20} />{BRAND.hours}</li>
        </ul>
        <div className="mt-8 rounded-2xl overflow-hidden border border-stone2 h-52">
          <iframe title="Bản đồ LUMA" src="https://www.google.com/maps?q=Nguyễn+Thị+Minh+Khai+Quận+3+TP.HCM&output=embed" className="w-full h-full" loading="lazy" />
        </div>
      </div>
      <ContactForm />
    </div>
  );
}
