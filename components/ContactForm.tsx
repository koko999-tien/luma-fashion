"use client";
import { useState } from "react";
import { useCart } from "./CartProvider";
import { Loader2, Send } from "lucide-react";

export default function ContactForm() {
  const { toast } = useCart();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      toast(data.message ?? "Đã gửi!");
      if (res.ok) setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast("Lỗi kết nối");
    } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="card p-6 space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label" htmlFor="cn">Họ tên *</label><input id="cn" required className="input" value={form.name} onChange={set("name")} placeholder="Nguyễn Văn A" /></div>
        <div><label className="label" htmlFor="ce">Email *</label><input id="ce" required type="email" className="input" value={form.email} onChange={set("email")} placeholder="ban@example.com" /></div>
      </div>
      <div><label className="label" htmlFor="cs">Chủ đề</label><input id="cs" className="input" value={form.subject} onChange={set("subject")} placeholder="Tư vấn size, đổi trả, hợp tác…" /></div>
      <div><label className="label" htmlFor="cm">Nội dung *</label><textarea id="cm" required minLength={10} rows={4} className="input" value={form.message} onChange={set("message")} placeholder="Bạn cần hỗ trợ gì?" /></div>
      <button type="submit" disabled={busy} className="btn-accent disabled:opacity-60">{busy ? <Loader2 size={16} className="animate-spin" /> : <><Send size={16} /> Gửi tin nhắn</>}</button>
    </form>
  );
}
