"use client";
import { useState } from "react";
import { useCart } from "./CartProvider";
import { Send } from "lucide-react";

export default function NewsletterForm() {
  const { toast } = useCart();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await res.json();
      toast(data.message ?? (res.ok ? "Đăng ký thành công!" : "Có lỗi xảy ra"));
      if (res.ok) setEmail("");
    } catch {
      toast("Không kết nối được máy chủ. Thử lại sau nhé.");
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} className="mt-3 flex max-w-sm">
      <label className="sr-only" htmlFor="nl-email">Email nhận ưu đãi</label>
      <input id="nl-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ban@example.com" className="w-full rounded-l-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm placeholder-white/40 outline-none focus:border-amber-400" />
      <button type="submit" disabled={loading} className="rounded-r-lg bg-accent px-4 text-white hover:bg-accentdark disabled:opacity-60" aria-label="Đăng ký"><Send size={18} /></button>
    </form>
  );
}
