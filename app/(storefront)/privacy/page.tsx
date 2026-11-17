import type { Metadata } from "next";
export const metadata: Metadata = { title: "Chính sách bảo mật" };
export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <h1 className="font-display text-4xl font-extrabold">Chính sách bảo mật</h1>
      <div className="mt-6 space-y-5 text-[15px] leading-7 text-ink/90">
        <section><h2 className="font-bold">1. Dữ liệu chúng tôi thu thập</h2><p>Họ tên, email, số điện thoại, địa chỉ giao hàng và lịch sử đơn hàng — chỉ nhằm mục đích xử lý đơn hàng và chăm sóc khách hàng.</p></section>
        <section><h2 className="font-bold">2. Cách chúng tôi sử dụng dữ liệu</h2><ul className="list-disc pl-6 mt-1"><li>Xử lý, giao và hỗ trợ đổi trả đơn hàng.</li><li>Gửi thông báo đơn hàng; email marketing nếu bạn đăng ký (có thể huỷ bất cứ lúc nào).</li><li>Không bao giờ bán dữ liệu cá nhân cho bên thứ ba.</li></ul></section>
        <section><h2 className="font-bold">3. Bảo mật</h2><p>Mật khẩu được mã hoá một chiều bằng bcrypt. Phiên đăng nhập dùng JWT httpOnly, có thời hạn. Thông tin thanh toán online (VNPay/MoMo, khi kích hoạt) được xử lý trực tiếp bởi cổng thanh toán, LUMA không lưu trữ thông tin thẻ của bạn.</p></section>
        <section><h2 className="font-bold">4. Quyền của bạn</h2><p>Bạn có quyền yêu cầu xem, chỉnh sửa hoặc xoá dữ liệu cá nhân bằng cách email hello@luma.vn. LUMA phản hồi trong 7 ngày làm việc.</p></section>
      </div>
    </div>
  );
}
