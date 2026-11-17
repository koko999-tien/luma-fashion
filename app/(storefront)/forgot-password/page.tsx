"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { MailCheck, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const { toast } = useCart();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/auth/forgot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await res.json();
      setSent(true);
      if (data.devResetLink) setDevLink(data.devResetLink);
      toast("Nếu email tồn tại, link đặt lại đã được gửi đi.");
    } catch {
      toast("Lỗi kết nối");
    } finally { setBusy(false); }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8 text-center">
        <MailCheck size={44} className="mx-auto text-accent" strokeWidth={1.5} />
        <h1 className="mt-4 font-display text-2xl font-extrabold">Quên mật khẩu</h1>
        <p className="mt-1 text-sm text-gray2">Nhập email đăng ký, chúng tôi sẽ gửi link đặt lại mật khẩu.</p>
        {!sent ? (
          <form onSubmit={submit} className="mt-6 space-y-4 text-left">
            <div><label className="label" htmlFor="email">Email</label><input id="email" required type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ban@example.com" /></div>
            <button type="submit" disabled={busy} className="btn-accent w-full !py-3.5 disabled:opacity-60">{busy ? <Loader2 size={18} className="animate-spin" /> : "Gửi link đặt lại"}</button>
          </form>
        ) : (
          <div className="mt-6 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-900">
            <p>✅ Nếu email <b>{email}</b> tồn tại trong hệ thống, link đặt lại mật khẩu đã được gửi (hiệu lực 1 giờ).</p>
            {devLink && (
              <p className="mt-3 text-left text-[11px] break-all"><b>Chế độ development</b> (chưa cấu hình Email provider):<br /><a className="text-accent underline" href={devLink}>{devLink}</a></p>
            )}
          </div>
        )}
        <p className="mt-5 text-[13px] text-gray2"><Link href="/login" className="font-bold text-ink hover:text-accent">← Quay lại đăng nhập</Link></p>
      </div>
    </div>
  );
}
