import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 py-28 text-center">
      <p className="font-display text-8xl font-extrabold text-stone2">404</p>
      <h1 className="mt-2 font-display text-2xl font-bold">Trang này không tồn tại</h1>
      <p className="mt-2 text-sm text-gray2">Đường dẫn có thể đã thay đổi hoặc bị gỡ. Hãy bắt đầu lại từ trang chủ nhé.</p>
      <Link href="/" className="btn-primary mt-6">Về trang chủ</Link>
    </div>
  );
}
