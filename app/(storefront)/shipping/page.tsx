import type { Metadata } from "next";
export const metadata: Metadata = { title: "Chính sách vận chuyển" };
export default function ShippingPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <h1 className="font-display text-4xl font-extrabold">Chính sách vận chuyển</h1>
      <div className="mt-6 space-y-5 text-[15px] leading-7 text-ink/90">
        <section><h2 className="font-bold">1. Phí vận chuyển</h2><ul className="list-disc pl-6 mt-1"><li>Tiêu chuẩn: 30.000₫ — giao 2–4 ngày toàn quốc.</li><li>Hoả tốc: 60.000₫ — giao trong ngày nội thành (đặt trước 15h).</li><li><b>FREESHIP</b> cho đơn từ 499.000₫ (toàn quốc).</li></ul></section>
        <section><h2 className="font-bold">2. Thời gian xử lý</h2><p>Đơn hàng được xác nhận trong 30 phút giờ hành chính. Đơn đặt sau 21h xử lý vào sáng hôm sau.</p></section>
        <section><h2 className="font-bold">3. Đơn vị vận chuyển</h2><p>GHN, GHTK, Viettel Post. Mã vận đơn được gửi qua SMS/Zalo khi shop bàn giao cho đơn vị vận chuyển.</p></section>
        <section><h2 className="font-bold">4. Trường hợp giao chậm</h2><p>Thiên tai, dịch bệnh hoặc vùng sâu vùng xa có thể chậm 1–2 ngày. Shop chủ động liên hệ bạn trong các trường hợp này.</p></section>
      </div>
    </div>
  );
}
