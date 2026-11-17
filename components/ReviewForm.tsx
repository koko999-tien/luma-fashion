"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { useCart } from "./CartProvider";

export default function ReviewForm({ productId }: { productId: string }) {
  const { toast } = useCart();
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, rating, title, body }) });
      const data = await res.json();
      if (res.status === 401) { toast("Vui lòng đăng nhập để đánh giá"); router.push(`/login?next=/products/${productId}`); return; }
      if (!res.ok) { toast(data.message ?? "Có lỗi xảy ra"); return; }
      toast("Cảm ơn bạn đã đánh giá!");
      setBody(""); setTitle("");
      router.refresh();
    } catch {
      toast("Lỗi kết nối");
    } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="card p-5">
      <h3 className="font-bold text-sm">Viết đánh giá của bạn</h3>
      <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Số sao">
        {[1, 2, 3, 4, 5].map((s) => (
          <button type="button" key={s} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} onClick={() => setRating(s)} aria-label={`${s} sao`} aria-pressed={rating === s}>
            <Star size={26} className="text-amber-500" fill={(hover || rating) >= s ? "currentColor" : "none"} strokeWidth={1.5} />
          </button>
        ))}
      </div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tiêu đề (tuỳ chọn)" className="input mt-3" maxLength={80} />
      <textarea required value={body} onChange={(e) => setBody(e.target.value)} placeholder="Chất vải, form, size có chuẩn không…" className="input mt-2 min-h-[90px]" minLength={5} maxLength={1000} />
      <button type="submit" disabled={busy} className="btn-primary mt-3 !py-2.5 text-xs disabled:opacity-60">{busy ? "Đang gửi…" : "Gửi đánh giá"}</button>
    </form>
  );
}
