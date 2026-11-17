"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProductStatusToggle({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const toggle = async () => {
    if (busy) return;
    const next = status === "ACTIVE" ? "ARCHIVED" : "ACTIVE";
    if (!confirm(next === "ARCHIVED" ? "Ẩn sản phẩm này khỏi storefront?" : "Bán lại sản phẩm này?")) return;
    setBusy(true);
    await fetch(`/api/admin/products/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) });
    router.refresh();
    setBusy(false);
  };
  return (
    <button onClick={toggle} disabled={busy} className="text-[10px] font-bold uppercase text-white/50 hover:text-white border border-white/15 rounded-lg px-2 py-1 disabled:opacity-40">
      {status === "ACTIVE" ? "Lưu trữ" : "Bán lại"}
    </button>
  );
}
