"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BadgePercent, CheckCircle2, Loader2, Truck, Zap, Banknote, Building2, CreditCard } from "lucide-react";
import { useCart } from "./CartProvider";
import { formatVND } from "@/lib/format";

type Props = {
  defaultEmail: string; defaultName: string; defaultPhone: string;
  defaultAddress: string; defaultWard: string; defaultDistrict: string; defaultCity: string;
};
const FREE_SHIP = 499000;

export default function CheckoutForm(p: Props) {
  const router = useRouter();
  const { items, subtotal, loading, refresh, toast } = useCart();

  const [form, setForm] = useState({
    customerName: p.defaultName, email: p.defaultEmail, phone: p.defaultPhone,
    addressLine: p.defaultAddress, ward: p.defaultWard, district: p.defaultDistrict, city: p.defaultCity, note: "",
  });
  const [shippingMethod, setShippingMethod] = useState<"STANDARD" | "EXPRESS">("STANDARD");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "BANK_TRANSFER">("COD");
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<{ ok: boolean; discount: number; message: string } | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const discount = coupon?.ok ? coupon.discount : 0;
  const shippingFee = useMemo(() => {
    const afterDiscount = subtotal - discount;
    if (afterDiscount >= FREE_SHIP) return 0;
    return shippingMethod === "EXPRESS" ? 60000 : 30000;
  }, [subtotal, discount, shippingMethod]);
  const total = subtotal - discount + shippingFee;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCheckingCoupon(true);
    try {
      const res = await fetch("/api/coupon/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: couponCode.trim(), subtotal }) });
      setCoupon(await res.json());
    } catch {
      setCoupon({ ok: false, discount: 0, message: "Không kiểm tra được mã. Thử lại nhé." });
    } finally { setCheckingCoupon(false); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return; // chống bấm trùng → tạo đơn kép
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, shippingMethod, paymentMethod, couponCode: coupon?.ok ? couponCode.trim() : "" }),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.message ?? "Có lỗi xảy ra"); setSubmitting(false); return; }
      await refresh();
      if (data.payUrl) { window.location.href = data.payUrl; return; } // chuyển sang cổng thanh toán
      router.push(`/order-confirmation?order=${encodeURIComponent(data.orderNumber)}`);
    } catch {
      toast("Lỗi kết nối. Vui lòng thử lại.");
      setSubmitting(false);
    }
  };

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-16"><div className="skeleton h-40" /></div>;
  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Giỏ hàng trống</h1>
        <p className="text-sm text-gray2 mt-2">Hãy thêm sản phẩm trước khi thanh toán.</p>
        <Link href="/products" className="btn-accent mt-6">Mua sắm ngay</Link>
      </div>
    );
  }

  const field = "input";
  const labelCls = "label";

  return (
    <form onSubmit={submit} className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-5 gap-6">
      {/* ─── Thông tin nhận hàng ─── */}
      <div className="lg:col-span-3 space-y-5">
        <h1 className="font-display text-3xl font-extrabold">Thanh toán</h1>

        <section className="card p-5">
          <h2 className="font-bold text-sm uppercase tracking-wider mb-3">1. Thông tin nhận hàng</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2"><label className={labelCls} htmlFor="cn">Họ và tên *</label><input id="cn" required className={field} value={form.customerName} onChange={set("customerName")} placeholder="Nguyễn Văn A" /></div>
            <div><label className={labelCls} htmlFor="em">Email *</label><input id="em" required type="email" className={field} value={form.email} onChange={set("email")} placeholder="ban@example.com" /></div>
            <div><label className={labelCls} htmlFor="ph">Số điện thoại *</label><input id="ph" required inputMode="numeric" pattern="[0-9]{9,11}" className={field} value={form.phone} onChange={set("phone")} placeholder="0901234567" /></div>
            <div className="sm:col-span-2"><label className={labelCls} htmlFor="ad">Địa chỉ (số nhà, đường) *</label><input id="ad" required className={field} value={form.addressLine} onChange={set("addressLine")} placeholder="Số 12 Nguyễn Hữu Cảnh" /></div>
            <div><label className={labelCls} htmlFor="wd">Phường / Xã</label><input id="wd" className={field} value={form.ward} onChange={set("ward")} placeholder="P.22" /></div>
            <div><label className={labelCls} htmlFor="dt">Quận / Huyện *</label><input id="dt" required className={field} value={form.district} onChange={set("district")} placeholder="Bình Thạnh" /></div>
            <div className="sm:col-span-2"><label className={labelCls} htmlFor="ct">Tỉnh / Thành phố *</label><input id="ct" required className={field} value={form.city} onChange={set("city")} placeholder="TP. Hồ Chí Minh" /></div>
            <div className="sm:col-span-2"><label className={labelCls} htmlFor="nt">Ghi chú cho shipper</label><textarea id="nt" rows={2} className={field} value={form.note} onChange={set("note")} placeholder="Gọi trước khi giao, giao giờ hành chính…" /></div>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-bold text-sm uppercase tracking-wider mb-3">2. Phương thức vận chuyển</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {([
              { v: "STANDARD", icon: Truck, title: "Tiêu chuẩn", desc: "2–4 ngày • 30K (free đơn ≥ 499K)" },
              { v: "EXPRESS", icon: Zap, title: "Hoả tốc", desc: "Trong ngày nội thành • 60K" },
            ] as const).map(({ v, icon: Icon, title, desc }) => (
              <label key={v} className={`flex items-start gap-3 rounded-2xl border-2 p-4 cursor-pointer transition ${shippingMethod === v ? "border-accent bg-accent/5" : "border-stone2 hover:border-ink"}`}>
                <input type="radio" name="ship" className="sr-only" checked={shippingMethod === v} onChange={() => setShippingMethod(v)} />
                <Icon size={22} className="mt-0.5 text-accent shrink-0" />
                <span><span className="block text-sm font-bold">{title}</span><span className="block text-[11px] text-gray2 mt-0.5">{desc}</span></span>
              </label>
            ))}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-bold text-sm uppercase tracking-wider mb-3">3. Thanh toán</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {([
              { v: "COD", icon: Banknote, title: "COD – Nhận hàng trả tiền", desc: "Kiểm tra hàng trước khi thanh toán" },
              { v: "BANK_TRANSFER", icon: Building2, title: "Chuyển khoản ngân hàng", desc: "Chuyển khoản theo nội dung đơn hàng" },
            ] as const).map(({ v, icon: Icon, title, desc }) => (
              <label key={v} className={`flex items-start gap-3 rounded-2xl border-2 p-4 cursor-pointer transition ${paymentMethod === v ? "border-accent bg-accent/5" : "border-stone2 hover:border-ink"}`}>
                <input type="radio" name="pay" className="sr-only" checked={paymentMethod === v} onChange={() => setPaymentMethod(v)} />
                <Icon size={22} className="mt-0.5 text-accent shrink-0" />
                <span><span className="block text-sm font-bold">{title}</span><span className="block text-[11px] text-gray2 mt-0.5">{desc}</span></span>
              </label>
            ))}
          </div>
          <p className="mt-2 flex items-center gap-2 text-[11px] text-gray2"><CreditCard size={13} /> VNPay / MoMo / ZaloPay: tích hợp sẵn kiến trúc, kích hoạt khi có thông tin merchant.</p>
        </section>
      </div>

      {/* ─── Tóm tắt + coupon ─── */}
      <aside className="lg:col-span-2">
        <div className="card p-5 lg:sticky lg:top-24">
          <h2 className="font-display text-xl font-bold">Đơn hàng của bạn</h2>
          <ul className="mt-4 max-h-64 overflow-y-auto divide-y divide-stone2">
            {items.map((i) => (
              <li key={i.id} className="flex gap-3 py-2.5 items-center">
                <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-gray3">{i.image && <Image src={i.image} alt={i.productName} fill sizes="48px" className="object-cover" />}</div>
                <div className="min-w-0 flex-1"><p className="text-[11px] font-semibold leading-snug line-clamp-2">{i.productName}</p><p className="text-[10px] text-gray2">{i.size} / {i.color} × {i.quantity}</p></div>
                <span className="text-[11px] font-bold">{formatVND(i.lineTotal)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex gap-2">
            <label className="sr-only" htmlFor="cp">Mã giảm giá</label>
            <input id="cp" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="LUMA10, GIAM50K…" className="input uppercase" />
            <button type="button" onClick={applyCoupon} disabled={checkingCoupon} className="btn border border-ink !px-4 text-xs font-bold hover:bg-ink hover:text-white whitespace-nowrap">{checkingCoupon ? <Loader2 size={15} className="animate-spin" /> : <><BadgePercent size={15} /> Áp dụng</>}</button>
          </div>
          {coupon && <p className={`mt-1.5 text-[11px] font-semibold flex items-center gap-1 ${coupon.ok ? "text-green-700" : "text-red-600"}`}>{coupon.ok && <CheckCircle2 size={12} />}{coupon.message}</p>}

          <dl className="mt-4 space-y-1.5 text-sm text-gray2">
            <div className="flex justify-between"><dt>Tạm tính</dt><dd>{formatVND(subtotal)}</dd></div>
            {discount > 0 && <div className="flex justify-between text-green-700"><dt>Giảm giá</dt><dd>-{formatVND(discount)}</dd></div>}
            <div className="flex justify-between"><dt>Phí vận chuyển</dt><dd>{shippingFee === 0 ? "Miễn phí 🎉" : formatVND(shippingFee)}</dd></div>
          </dl>
          <div className="mt-3 border-t border-stone2 pt-3 flex justify-between font-extrabold text-xl"><span>Tổng</span><span className="text-accent">{formatVND(total)}</span></div>

          <button type="submit" disabled={submitting} className="btn-accent w-full mt-4 !py-4 text-base disabled:opacity-60">
            {submitting ? <><Loader2 size={19} className="animate-spin" /> Đang xử lý…</> : "XÁC NHẬN ĐẶT HÀNG"}
          </button>
          <p className="mt-2 text-center text-[10px] text-gray2">Bằng việc đặt hàng, bạn đồng ý với <Link href="/terms" className="underline">Điều khoản sử dụng</Link> của {`LUMA`}.</p>
        </div>
      </aside>
    </form>
  );
}
