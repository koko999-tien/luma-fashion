"use client";
import { useState } from "react";
import { useCart } from "./CartProvider";
import { Loader2 } from "lucide-react";

export default function ChangePasswordForm() {
  const { toast } = useCart();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) { toast("Mật khẩu nhập lại không khớp"); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/change-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }) });
      const data = await res.json();
      toast(data.message ?? (res.ok ? "Thành công" : "Có lỗi"));
      if (res.ok) setForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch {
      toast("Lỗi kết nối");
    } finally { setBusy(false); }
  };

  return (
    <form id="security" onSubmit={submit} className="card p-6 mt-6">
      <h2 className="font-display text-lg font-bold">Đổi mật khẩu</h2>
      <div className="mt-3 grid sm:grid-cols-3 gap-3">
        <div><label className="label" htmlFor="cur">Mật khẩu hiện tại</label><input id="cur" required type="password" className="input" value={form.currentPassword} onChange={set("currentPassword")} autoComplete="current-password" /></div>
        <div><label className="label" htmlFor="np">Mật khẩu mới</label><input id="np" required minLength={6} type="password" className="input" value={form.newPassword} onChange={set("newPassword")} autoComplete="new-password" /></div>
        <div><label className="label" htmlFor="cf">Nhập lại mật khẩu mới</label><input id="cf" required type="password" className="input" value={form.confirm} onChange={set("confirm")} autoComplete="new-password" /></div>
      </div>
      <button type="submit" disabled={busy} className="btn-primary mt-4 !py-2.5 text-xs disabled:opacity-60">{busy ? <Loader2 size={15} className="animate-spin" /> : "Cập nhật mật khẩu"}</button>
    </form>
  );
}
