"use client";
import { useState } from "react";
import { useCart } from "./CartProvider";
import { Loader2, Save } from "lucide-react";

export default function SettingsForm({ initial }: { initial: Record<string, string> }) {
  const { toast } = useCart();
  const [announcement, setAnnouncement] = useState(initial.announcement ?? "");
  const [threshold, setThreshold] = useState(initial.freeShipThreshold ?? "499000");
  const [shipStd, setShipStd] = useState(initial.shipFeeStandard ?? "30000");
  const [shipExp, setShipExp] = useState(initial.shipFeeExpress ?? "60000");
  const [shipRemote, setShipRemote] = useState(initial.shipFeeRemote ?? "45000");
  const [busy, setBusy] = useState(false);

  const saveOne = async (key: string, value: string) => {
    const res = await fetch("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, value }) });
    return res.ok;
  };

  const save = async () => {
    if (busy) return;
    setBusy(true);
    const results = await Promise.all([
      saveOne("announcement", announcement),
      saveOne("freeShipThreshold", threshold),
      saveOne("shipFeeStandard", shipStd),
      saveOne("shipFeeExpress", shipExp),
      saveOne("shipFeeRemote", shipRemote),
    ]);
    setBusy(false);
    toast(results.every(Boolean) ? "✓ Đã lưu cài đặt" : "Có giá trị không hợp lệ");
  };

  const field = "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-accent";
  const label = "block text-[10px] font-bold uppercase tracking-widest text-white/45 mb-1.5";

  return (
    <div className="space-y-4">
      <div><label className={label} htmlFor="ann">Thanh thông báo (announcement bar)</label><input id="ann" className={field} value={announcement} onChange={(e) => setAnnouncement(e.target.value)} /></div>
      <div className="grid sm:grid-cols-4 gap-3">
        <div><label className={label} htmlFor="fs">Ngưỡng freeship (₫)</label><input id="fs" type="number" min={0} className={field} value={threshold} onChange={(e) => setThreshold(e.target.value)} /></div>
        <div><label className={label} htmlFor="ss">Phí ship tiêu chuẩn (₫)</label><input id="ss" type="number" min={0} className={field} value={shipStd} onChange={(e) => setShipStd(e.target.value)} /></div>
        <div><label className={label} htmlFor="se">Phí ship hoả tốc (₫)</label><input id="se" type="number" min={0} className={field} value={shipExp} onChange={(e) => setShipExp(e.target.value)} /></div>
        <div><label className={label} htmlFor="sr">Phí ship vùng xa (₫)</label><input id="sr" type="number" min={0} className={field} value={shipRemote} onChange={(e) => setShipRemote(e.target.value)} /></div>
      </div>
      <p className="text-[10px] text-white/35">HCM/Hà Nội: phí tiêu chuẩn. Tỉnh thành khác: phí vùng xa (đơn dưới ngưỡng freeship). Hoả tốc: một mức toàn quốc.</p>
      <button onClick={save} disabled={busy} className="btn bg-accent text-white px-8 py-3 text-xs font-bold uppercase tracking-wider hover:bg-accentdark disabled:opacity-60">{busy ? <Loader2 size={15} className="animate-spin" /> : <><Save size={15} /> Lưu cài đặt</>}</button>
    </div>
  );
}
