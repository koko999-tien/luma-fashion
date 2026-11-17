"use client";
import { useRouter } from "next/navigation";

export default function CouponToggle({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const toggle = async () => {
    await fetch(`/api/admin/coupons/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !active }) });
    router.refresh();
  };
  return (
    <button onClick={toggle} className={`text-[10px] font-bold uppercase border rounded-lg px-2.5 py-1.5 ${active ? "border-orange-500/40 text-orange-400 hover:bg-orange-500/10" : "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"}`}>
      {active ? "Tạm dừng" : "Kích hoạt"}
    </button>
  );
}
