import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ items: [] });

  const items = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { name: { contains: q } },
        { category: { name: { contains: q } } },
        { collection: { name: { contains: q } } },
        { variants: { some: { sku: { contains: q } } } },
      ],
    },
    select: { id: true, name: true, slug: true },
    take: 6,
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ items });
}
