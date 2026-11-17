import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

export const productCardInclude = {
  images: { orderBy: { sort: "asc" as const }, take: 2 },
  variants: { select: { id: true, size: true, color: true, colorHex: true, stock: true, sku: true }, orderBy: [{ color: "asc" as const }, { size: "asc" as const }] },
  reviews: { select: { rating: true } },
  category: { select: { slug: true, name: true } },
} satisfies Prisma.ProductInclude;

export type ProductCardData = Prisma.ProductGetPayload<{ include: typeof productCardInclude }>;

export function avgRating(p: { reviews: { rating: number }[] }) {
  if (!p.reviews.length) return null;
  return Math.round((p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length) * 10) / 10;
}

export function uniqueColors(variants: { color: string; colorHex: string }[]) {
  const seen = new Map<string, string>();
  for (const v of variants) if (!seen.has(v.color)) seen.set(v.color, v.colorHex);
  return [...seen.entries()].map(([color, colorHex]) => ({ color, colorHex }));
}

export const cardSelect = productCardInclude;
