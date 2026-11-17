"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CustomerBlockToggle({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    await fetch(`/api/admin/customers/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: status === "ACTIVE" ? "BLOCKED" : "ACTIVE" }) });
    router.refresh();
    setBusy(false);
  };
  return (
    <button onClick={toggle} disabled={busy} className={`text-[10px] font-bold uppercase border rounded-lg px-2.5 py-1.5 disabled:opacity-40 ${status === "ACTIVE" ? "border-red-500/40 text-red-400 hover:bg-red-500/10" : "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"}`}>
      {status === "ACTIVE" ? "Khoá" : "Mở khoá"}
    </button>
  );
}
