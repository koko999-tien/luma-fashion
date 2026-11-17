"use client";
import { useRouter, useSearchParams } from "next/navigation";

export default function SortSelect({ current }: { current: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  return (
    <select
      aria-label="Sắp xếp sản phẩm"
      className="input !w-auto !py-2"
      defaultValue={current}
      onChange={(e) => {
        const params = new URLSearchParams(sp.toString());
        if (e.target.value === "recommended") params.delete("sort"); else params.set("sort", e.target.value);
        params.delete("page");
        router.push(`/products?${params}`);
      }}
    >
      <option value="recommended">Đề xuất</option>
      <option value="newest">Mới nhất</option>
      <option value="bestselling">Bán chạy</option>
      <option value="price_asc">Giá: Thấp → Cao</option>
      <option value="price_desc">Giá: Cao → Thấp</option>
      <option value="rating">Đánh giá cao</option>
    </select>
  );
}
