import type { Metadata } from "next";
export const metadata: Metadata = { title: "Câu hỏi thường gặp" };

const FAQS = [
  ["Làm sao chọn đúng size?", "Tham khảo bảng size trên trang chi tiết sản phẩm, hoặc nhắn hotline 0901 234 567 — bạn chỉ cần cho chúng tôi chiều cao và cân nặng."],
  ["Phí vận chuyển bao nhiêu?", "Tiêu chuẩn 30K (2–4 ngày), Hoả tốc 60K trong ngày (nội thành). Đơn từ 499K được FREESHIP toàn quốc."],
  ["Tôi được đổi trả trong bao lâu?", "7 ngày kể từ khi nhận hàng, áp dụng cho sản phẩm còn nguyên tem mác, chưa qua sử dụng, lỗi từ shop hoặc giao sai mẫu/size."],
  ["Khi nào đơn hàng được giao?", "Nội thành 1–2 ngày, ngoại thành 2–4 ngày. Hoả tốc giao trong 4 giờ (nội thành TP.HCM, đặt trước 15h)."],
  ["Tôi thanh toán bằng gì?", "COD, chuyển khoản ngân hàng. VNPay/MoMo sẽ sớm có mặt khi LUMA hoàn tất ký kết với cổng thanh toán."],
  ["Tôi muốn huỷ đơn hàng?", "Liên hệ hotline trong vòng 2 giờ sau khi đặt. Sau khi đơn đã chuyển sang trạng thái 'Đang xử lý' sẽ không huỷ được."],
];

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <p className="text-[10px] uppercase tracking-[0.3em] text-gray2">FAQ</p>
      <h1 className="font-display text-4xl font-extrabold mt-1">Câu hỏi thường gặp</h1>
      <div className="mt-8 divide-y divide-stone2 card">
        {FAQS.map(([q, a]) => (
          <details key={q} className="group p-5">
            <summary className="cursor-pointer font-semibold text-[15px] flex items-center justify-between gap-4 list-none">{q}<span className="text-accent transition-transform group-open:rotate-45 text-xl leading-none">+</span></summary>
            <p className="mt-3 text-sm text-gray2 leading-7">{a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
