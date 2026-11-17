"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { KeyRound, Loader2 } from "lucide-react";

function ResetForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const { toast } = useCart();
  const token = sp.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast("Mật khẩu nhập lại không khớp"); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
      const data = await res.json();
      toast(data.message ?? (res.ok ? "Thành công" : "Có lỗi xảy ra"));
      if (res.ok) router.push("/login");
    } catch {
      toast("Lỗi kết nối");
    } finally { setBusy(false); }
  };

  if (!token) {
    return <div className="max-w-md mx-auto px-4 py-24 text-center"><h1 className="font-display text-2xl font-bold">Link không hợp lệ</h1><p className="text-sm text-gray2 mt-2">Thiếu token đặt lại mật khẩu. Vui lòng yêu cầu link mới.</p></div>;
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8">
        <KeyRound size={40} className="mx-auto text-accent" strokeWidth={1.5} />
        <h1 className="mt-4 font-display text-2xl font-extrabold text-center">Đặt lại mật khẩu</h1>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div><label className="label" htmlFor="pw">Mật khẩu mới *</label><input id="pw" required minLength={6} type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" /></div>
          <div><label className="label" htmlFor="cf">Nhập lại mật khẩu *</label><input id="cf" required type="password" className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" /></div>
          <button type="submit" disabled={busy} className="btn-accent w-full !py-3.5 disabled:opacity-60">{busy ? <Loader2 size={18} className="animate-spin" /> : "Cập nhật mật khẩu"}</button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetForm /></Suspense>;
}
