"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { LogIn, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const { toast, refresh } = useCart();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) { toast(data.message ?? "Đăng nhập thất bại"); return; }
      await refresh(); // gộp giỏ khách vào giỏ user
      toast(`Chào mừng trở lại, ${data.name}!`);
      router.push(sp.get("next") ?? (data.role === "ADMIN" ? "/admin" : "/account"));
      router.refresh();
    } catch {
      toast("Lỗi kết nối");
    } finally { setBusy(false); }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8">
        <h1 className="font-display text-3xl font-extrabold text-center">Đăng nhập</h1>
        <p className="mt-1.5 text-center text-sm text-gray2">Chào mừng bạn quay lại LUMA</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div><label className="label" htmlFor="email">Email</label><input id="email" required type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ban@example.com" autoComplete="email" /></div>
          <div><label className="label" htmlFor="pw">Mật khẩu</label><input id="pw" required type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" autoComplete="current-password" /></div>
          <div className="flex justify-end"><Link href="/forgot-password" className="text-[11px] text-accent font-semibold hover:underline">Quên mật khẩu?</Link></div>
          <button type="submit" disabled={busy} className="btn-accent w-full !py-3.5 disabled:opacity-60">{busy ? <Loader2 size={18} className="animate-spin" /> : <><LogIn size={18} /> Đăng nhập</>}</button>
        </form>
        <p className="mt-5 text-center text-[13px] text-gray2">Chưa có tài khoản? <Link href="/register" className="font-bold text-ink hover:text-accent">Đăng ký ngay</Link></p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
