import type { Metadata } from "next";
export const metadata: Metadata = { title: "Điều khoản sử dụng" };
export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <h1 className="font-display text-4xl font-extrabold">Điều khoản sử dụng</h1>
      <div className="mt-6 space-y-5 text-[15px] leading-7 text-ink/90">
        <section><h2 className="font-bold">1. Chấp nhận điều khoản</h2><p>Khi sử dụng luma.vn và đặt hàng tại LUMA, bạn đồng ý với các điều khoản dưới đây.</p></section>
        <section><h2 className="font-bold">2. Đặt hàng & giá</h2><p>Giá sản phẩm được niêm yết bằng VND và đã bao gồm VAT. LUMA có quyền điều chỉnh giá; đơn hàng đã xác nhận được giữ nguyên giá tại thời điểm đặt.</p></section>
        <section><h2 className="font-bold">3. Hủy đơn</h2><p>Bạn có thể yêu cầu huỷ trong vòng 2 giờ sau khi đặt. Sau thời điểm đó đơn đã vào quy trình đóng gói và không thể huỷ.</p></section>
        <section><h2 className="font-bold">4. Sở hữu trí tuệ</h2><p>Toàn bộ hình ảnh, thiết kế, logo và nội dung trên website thuộc sở hữu của LUMA Fashion. Không sao chép khi chưa được phép.</p></section>
        <section><h2 className="font-bold">5. Tranh chấp</h2><p>Mọi tranh chấp được ưu tiên giải quyết thương lượng. Caso không thành, áp dụng pháp luật Việt Nam tại Tòa án có thẩm quyền TP. Hồ Chí Minh.</p></section>
      </div>
    </div>
  );
}
