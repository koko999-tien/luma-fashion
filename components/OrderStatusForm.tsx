"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCart } from "./CartProvider";
import { ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL } from "@/lib/format";

export default function OrderStatusForm({ orderId, orderStatus, paymentStatus, adminNote, shippingTracking }: { orderId: string; orderStatus: string; paymentStatus: string; adminNote: string; shippingTracking: string }) {
  const router = useRouter();
  const { toast } = useCart();
  const [status, setStatus] = useState(orderStatus);
  const [payment, setPayment] = useState(paymentStatus);
  const [note, setNote] = useState(adminNote);
  const [tracking, setTracking] = useState(shippingTracking);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderStatus: status, paymentStatus: payment, adminNote: note, shippingTracking: tracking }) });
      const data = await res.json();
      toast(res.ok ? "✓ Đã cập nhật đơn hàng" : data.message ?? "Có lỗi");
      if (res.ok) router.refresh();
    } catch {
      toast("Lỗi kết nối");
    } finally { setBusy(false); }
  };

  const field = "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-accent";
  const label = "block text-[10px] font-bold uppercase tracking-widest text-white/45 mb-1.5";

  return (
    <div className="space-y-4">
      <div>
        <label className={label} htmlFor="os">Trạng thái đơn hàng</label>
        <select id="os" className={field} value={status} onChange={(e) => setStatus(e.target.value)}>
          {Object.entries(ORDER_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <p className="mt-1 text-[10px] text-white/35">Chuyển sang “Đã huỷ” sẽ tự hoàn kho.</p>
      </div>
      <div>
        <label className={label} htmlFor="ps">Trạng thái thanh toán</label>
        <select id="ps" className={field} value={payment} onChange={(e) => setPayment(e.target.value)}>
          {Object.entries(PAYMENT_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <p className="mt-1 text-[10px] text-white/35">Chỉ đổi sang “Đã thanh toán” khi có bằng chứng (sao kê / biên lai).</p>
      </div>
      <div>
        <label className={label} htmlFor="tk">Mã vận đơn (GHN/GHTK/Viettel Post…)</label>
        <input id="tk" className={field} value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="VD: LQA123456789" />
      </div>
      <div>
        <label className={label} htmlFor="an">Ghi chú nội bộ (chỉ admin thấy)</label>
        <textarea id="an" rows={3} className={field} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ví dụ: khách hẹn giao sau 17h…" />
      </div>
      <button onClick={save} disabled={busy} className="btn bg-accent text-white w-full py-3 text-xs font-bold uppercase tracking-wider hover:bg-accentdark disabled:opacity-60">{busy ? <Loader2 size={15} className="animate-spin" /> : "Lưu thay đổi"}</button>
    </div>
  );
}
