"use client";
import { useRouter } from "next/navigation";

export default function BannerToggle({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const toggle = async () => {
    await fetch(`/api/admin/banners/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !active }) });
    router.refresh();
  };
  const remove = async () => {
    if (!confirm("Xoá banner này vĩnh viễn?")) return;
    await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
    router.refresh();
  };
  return (
    <div className="flex gap-2">
      <button onClick={toggle} className={`text-[10px] font-bold uppercase border rounded-lg px-2.5 py-1.5 ${active ? "border-orange-500/40 text-orange-400 hover:bg-orange-500/10" : "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"}`}>{active ? "Tắt" : "Bật"}</button>
      <button onClick={remove} className="text-[10px] font-bold uppercase border border-red-500/40 text-red-400 rounded-lg px-2.5 py-1.5 hover:bg-red-500/10">Xoá</button>
    </div>
  );
}
