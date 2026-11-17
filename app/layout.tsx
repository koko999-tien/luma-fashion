import type { Metadata } from "next";
import "./globals.css";
import { BRAND } from "@/lib/brand";
import CartProvider from "@/components/CartProvider";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: { default: `${BRAND.name} – Thời Trang Cao Cấp Việt Nam`, template: `%s | ${BRAND.name}` },
  description: "Thời trang nam nữ cao cấp: áo, quần, đầm, phụ kiện. Thiết kế riêng cho người Việt 18–40 tuổi. Freeship đơn từ 499K, đổi trả 7 ngày.",
  openGraph: { type: "website", locale: "vi_VN", siteName: BRAND.name },
};

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#111111" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
