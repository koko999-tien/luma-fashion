"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, Heart, ShieldCheck, LogOut } from "lucide-react";

const LINKS = [
  { href: "/account", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/account/orders", label: "Đơn hàng của tôi", icon: Package },
  { href: "/account/wishlist", label: "Sản phẩm yêu thích", icon: Heart },
];

export default function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };
  return (
    <nav className="flex lg:flex-col gap-1 overflow-x-auto">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = href === "/account" ? pathname === "/account" : pathname.startsWith(href);
        return (
          <Link key={href} href={href} className={`flex items-center gap-2.5 whitespace-nowrap rounded-xl px-4 py-3 text-[13px] font-semibold transition ${active ? "bg-ink text-white" : "text-gray2 hover:bg-gray3"}`}>
            <Icon size={17} /> {label}
          </Link>
        );
      })}
      <div className="hidden lg:block border-t border-stone2 my-2" />
      <Link href="/account#security" className="flex items-center gap-2.5 whitespace-nowrap rounded-xl px-4 py-3 text-[13px] font-semibold text-gray2 hover:bg-gray3"><ShieldCheck size={17} /> Đổi mật khẩu</Link>
      <button onClick={logout} className="flex items-center gap-2.5 whitespace-nowrap rounded-xl px-4 py-3 text-[13px] font-semibold text-red-600 hover:bg-red-50"><LogOut size={17} /> Đăng xuất</button>
    </nav>
  );
}
