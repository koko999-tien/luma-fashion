import { prisma } from "@/lib/prisma";
import SettingsForm from "@/components/SettingsForm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin – Cài đặt" };

export default async function AdminSettings() {
  const rows = await prisma.setting.findMany();
  const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">Cài đặt cửa hàng</h1>
      <p className="text-[11px] text-white/40 mt-1">Các thay đổi áp dụng ngay cho storefront.</p>
      <div className="mt-5 rounded-2xl bg-white/5 border border-white/10 p-5 sm:p-6">
        <SettingsForm initial={settings} />
      </div>
    </div>
  );
}
