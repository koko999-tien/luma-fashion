import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const ALLOWED_KEYS = ["announcement", "freeShipThreshold", "shipFeeStandard", "shipFeeExpress", "shipFeeRemote"] as const;
const schema = z.object({ key: z.enum(ALLOWED_KEYS), value: z.string().trim().min(0).max(500) });

export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Dữ liệu không hợp lệ" }, { status: 400 });
  if (["freeShipThreshold", "shipFeeStandard", "shipFeeExpress", "shipFeeRemote"].includes(parsed.data.key) && Number.isNaN(Number(parsed.data.value))) {
    return NextResponse.json({ message: "Giá trị phải là số nguyên (VND)" }, { status: 400 });
  }

  await prisma.setting.upsert({ where: { key: parsed.data.key }, update: { value: parsed.data.value }, create: { key: parsed.data.key, value: parsed.data.value } });
  return NextResponse.json({ ok: true });
}
