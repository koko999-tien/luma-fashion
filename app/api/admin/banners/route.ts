import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const schema = z.object({
  headline: z.string().trim().min(2).max(150),
  subtext: z.string().trim().max(300).optional().or(z.literal("")),
  image: z.string().url(),
  ctaText: z.string().trim().max(60).optional().or(z.literal("")),
  ctaUrl: z.string().trim().max(300).optional().or(z.literal("")),
  active: z.boolean().default(true),
  sort: z.number().int().min(0).default(0),
});

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 403 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  const d = parsed.data;
  const banner = await prisma.banner.create({ data: { headline: d.headline, subtext: d.subtext || null, image: d.image, ctaText: d.ctaText || null, ctaUrl: d.ctaUrl || null, active: d.active, sort: d.sort } });
  return NextResponse.json({ ok: true, id: banner.id });
}
