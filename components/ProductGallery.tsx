"use client";
import { useState, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const main = images[active] ?? "https://placehold.co/800x1000?text=LUMA";

  const step = useCallback((dir: 1 | -1) => setActive((a) => (a + dir + images.length) % images.length), [images.length]);

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gray3 group">
        <Image src={main} alt={name} fill priority sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
        <button onClick={() => setLightbox(true)} className="absolute bottom-4 right-4 rounded-full bg-white/90 p-3 shadow hover:scale-105 transition" aria-label="Xem ảnh toàn màn hình"><ZoomIn size={18} /></button>
        {images.length > 1 && (
          <>
            <button onClick={() => step(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2 shadow sm:opacity-0 sm:group-hover:opacity-100 transition" aria-label="Ảnh trước"><ChevronLeft size={20} /></button>
            <button onClick={() => step(1)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2 shadow sm:opacity-0 sm:group-hover:opacity-100 transition" aria-label="Ảnh tiếp"><ChevronRight size={20} /></button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 sm:grid-cols-5 gap-2">
          {images.map((url, i) => (
            <button key={i} onClick={() => setActive(i)} aria-label={`Ảnh ${i + 1}`} aria-current={i === active}
              className={`relative aspect-square overflow-hidden rounded-xl border-2 transition ${i === active ? "border-accent" : "border-transparent opacity-70 hover:opacity-100"}`}>
              <Image src={url} alt={`${name} ${i + 1}`} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-[95] bg-ink/95 flex items-center justify-center" role="dialog" aria-modal="true" aria-label={`${name} — toàn màn hình`}>
          <button onClick={() => setLightbox(false)} className="absolute right-4 top-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" aria-label="Đóng"><X size={22} /></button>
          <button onClick={() => step(-1)} className="absolute left-2 sm:left-6 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" aria-label="Ảnh trước"><ChevronLeft size={26} /></button>
          <Image src={main} alt={name} width={900} height={1125} className="max-h-[92vh] w-auto object-contain" />
          <button onClick={() => step(1)} className="absolute right-2 sm:right-6 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" aria-label="Ảnh tiếp"><ChevronRight size={26} /></button>
        </div>
      )}
    </div>
  );
}
