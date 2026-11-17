"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { UserPlus, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { toast, refresh } = useCart();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast("Mật khẩu nhập lại không khớp"); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password }) });
      const data = await res.json();
      if (!res.ok) { toast(data.message ?? "Đăng ký thất bại"); return; }
      await refresh();
      toast("Đăng ký thành công! Chào mừng bạn đến với LUMA 🎉");
      router.push("/account");
      router.refresh();
    } catch {
      toast("Lỗi kết nối");
    } finally { setBusy(false); }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8">
        <h1 className="font-display text-3xl font-extrabold text-center">Tạo tài khoản</h1>
        <p className="mt-1.5 text-center text-sm text-gray2">Thành viên LUMA nhận ưu đãi sinh nhật & freeship</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div><label className="label" htmlFor="name">Họ và tên *</label><input id="name" required className="input" value={form.name} onChange={set("name")} placeholder="Nguyễn Văn A" autoComplete="name" /></div>
          <div><label className="label" htmlFor="email">Email *</label><input id="email" required type="email" className="input" value={form.email} onChange={set("email")} placeholder="ban@example.com" autoComplete="email" /></div>
          <div><label className="label" htmlFor="phone">Số điện thoại *</label><input id="phone" required inputMode="numeric" pattern="[0-9]{9,11}" className="input" value={form.phone} onChange={set("phone")} placeholder="0901234567" autoComplete="tel" /></div>
          <div><label className="label" htmlFor="pw">Mật khẩu (tối thiểu 6 ký tự) *</label><input id="pw" required type="password" minLength={6} className="input" value={form.password} onChange={set("password")} autoComplete="new-password" /></div>
          <div><label className="label" htmlFor="cf">Nhập lại mật khẩu *</label><input id="cf" required type="password" className="input" value={form.confirm} onChange={set("confirm")} autoComplete="new-password" /></div>
          <button type="submit" disabled={busy} className="btn-accent w-full !py-3.5 disabled:opacity-60">{busy ? <Loader2 size={18} className="animate-spin" /> : <><UserPlus size={18} /> Đăng ký</>}</button>
        </form>
        <p className="mt-5 text-center text-[13px] text-gray2">Đã có tài khoản? <Link href="/login" className="font-bold text-ink hover:text-accent">Đăng nhập</Link></p>
      </div>
    </div>
  );
}
