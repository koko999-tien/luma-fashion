"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Boxes, Users, TicketPercent, Image as ImageIcon, Settings, LogOut, FolderTree, Layers } from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/products", label: "Sản phẩm", icon: Package },
  { href: "/admin/categories", label: "Danh mục", icon: FolderTree },
  { href: "/admin/collections", label: "Bộ sưu tập", icon: Layers },
  { href: "/admin/orders", label: "Đơn hàng", icon: ShoppingCart },
  { href: "/admin/inventory", label: "Kho hàng", icon: Boxes },
  { href: "/admin/customers", label: "Khách hàng", icon: Users },
  { href: "/admin/coupons", label: "Mã giảm giá", icon: TicketPercent },
  { href: "/admin/banners", label: "Banner", icon: ImageIcon },
  { href: "/admin/settings", label: "Cài đặt", icon: Settings },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };
  const linkCls = (active: boolean) => `flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-[12.5px] font-semibold transition ${active ? "bg-accent text-white" : "text-white/60 hover:text-white hover:bg-white/5"}`;
  return (
    <nav className="flex lg:flex-col gap-1">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return <Link key={href} href={href} className={linkCls(active)}><Icon size={16} /> {label}</Link>;
      })}
      <button onClick={logout} className={`${linkCls(false)} text-red-400 hover:!bg-red-950/40`}><LogOut size={16} /> Đăng xuất</button>
    </nav>
  );
}
