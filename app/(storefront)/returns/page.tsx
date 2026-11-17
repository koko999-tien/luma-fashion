import type { Metadata } from "next";
export const metadata: Metadata = { title: "Chính sách đổi trả" };
export default function ReturnsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <h1 className="font-display text-4xl font-extrabold">Chính sách đổi trả & hoàn tiền</h1>
      <div className="mt-6 space-y-5 text-[15px] leading-7 text-ink/90">
        <section><h2 className="font-bold">1. Điều kiện đổi trả</h2><ul className="list-disc pl-6 mt-1"><li>Trong vòng <b>7 ngày</b> kể từ ngày nhận hàng.</li><li>Sản phẩm còn nguyên tem mác, chưa giặt, chưa qua sử dụng, còn đủ phụ kiện đi kèm.</li><li>Áp dụng khi: lỗi từ nhà sản xuất, giao sai mẫu/size/màu, hoặc bạn muốn đổi size (đổi size miễn phí 1 lần).</li></ul></section>
        <section><h2 className="font-bold">2. Quy trình</h2><ol className="list-decimal pl-6 mt-1"><li>Liên hệ hotline 0901 234 567 hoặc email hello@luma.vn kèm mã đơn hàng + ảnh sản phẩm.</li><li>LUMA xác nhận và gửi địa chỉ nhận hàng.</li><li>Sau khi nhận & kiểm tra (1–2 ngày), LUMA đổi mới hoặc hoàn tiền qua chuyển khoản trong 3–5 ngày làm việc.</li></ol></section>
        <section><h2 className="font-bold">3. Hoàn tiền</h2><p>Hoàn tiền qua chuyển khoản ngân hàng theo thông tin bạn cung cấp. Với COD, tiền hoàn được chuyển khoản trong 3–5 ngày làm việc sau khi shop nhận lại hàng.</p></section>
        <section><h2 className="font-bold">4. Không áp dụng đổi trả</h2><ul className="list-disc pl-6 mt-1"><li>Sản phẩm đồ lót, phụ kiện đã tháo seal.</li><li>Sản phẩm bị bẩn, hư hỏng do lỗi người dùng sau khi nhận.</li></ul></section>
      </div>
    </div>
  );
}
