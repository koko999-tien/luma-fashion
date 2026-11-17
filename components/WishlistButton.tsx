"use client";
import { useState } from "react";
import { Heart } from "lucide-react";
import { useCart } from "./CartProvider";
import { useRouter } from "next/navigation";

export default function WishlistButton({ productId, className = "" }: { productId: string; className?: string }) {
  const { toast } = useCart();
  const router = useRouter();
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/wishlist/toggle", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId }) });
      const data = await res.json();
      if (res.status === 401) { toast("Vui lòng đăng nhập để dùng wishlist"); router.push("/login?next=/account/wishlist"); return; }
      setActive(Boolean(data.wishlisted));
      toast(data.wishlisted ? "♥ Đã thêm vào yêu thích" : "Đã xoá khỏi yêu thích");
    } catch {
      toast("Có lỗi xảy ra, thử lại nhé");
    } finally { setBusy(false); }
  };

  return (
    <button onClick={toggle} disabled={busy} aria-label={active ? "Xoá khỏi yêu thích" : "Thêm vào yêu thích"} aria-pressed={active}
      className={`rounded-full bg-white/90 backdrop-blur p-2 shadow hover:scale-110 transition-transform ${active ? "text-accent" : "text-ink"} ${className}`}>
      <Heart size={18} fill={active ? "currentColor" : "none"} />
    </button>
  );
}
