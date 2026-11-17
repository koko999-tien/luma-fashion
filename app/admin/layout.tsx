import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminNav from "@/components/AdminNav";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin");
  if (session.role !== "ADMIN") redirect("/?error=forbidden"); // chặn server-side, không dựa vào ẩn nút

  return (
    <div className="min-h-screen bg-[#16150f] text-[#e8e4df] grid lg:grid-cols-[240px_1fr]">
      <aside className="border-r border-white/10 p-5 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
        <div className="hidden lg:block px-2 pb-5 border-b border-white/10 mb-3">
          <Link href="/" className="font-display text-xl font-extrabold tracking-[0.18em] text-white">LUMA<span className="text-accent">.</span> <span className="text-[10px] align-top text-amber-400">ADMIN</span></Link>
          <p className="text-[10px] text-white/40 mt-1">Quản trị cửa hàng</p>
        </div>
        <AdminNav />
        <Link href="/" className="hidden lg:flex mt-auto items-center gap-2 px-3 py-3 text-[12px] text-white/50 hover:text-white"><ExternalLink size={14} /> Xem storefront</Link>
      </aside>
      <div className="p-4 sm:p-6 lg:p-8 overflow-x-hidden">{children}</div>
    </div>
  );
}
