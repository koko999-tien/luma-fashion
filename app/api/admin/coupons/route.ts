import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const schema = z.object({
  code: z.string().trim().min(2).max(40).transform((s) => s.toUpperCase()),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.number().int().positive(),
  minOrder: z.number().int().min(0).default(0),
  maxDiscount: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional().or(z.literal("")),
  usageLimit: z.number().int().positive().nullable().optional(),
  perCustomerLimit: z.number().int().positive().nullable().optional(),
  active: z.boolean().default(true),
});

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  const d = parsed.data;
  if (d.type === "PERCENT" && d.value > 100) return NextResponse.json({ message: "Phần trăm giảm tối đa 100" }, { status: 400 });

  try {
    const coupon = await prisma.coupon.create({
      data: { code: d.code, type: d.type, value: d.value, minOrder: d.minOrder, maxDiscount: d.maxDiscount ?? null, expiresAt: d.expiresAt ? new Date(d.expiresAt) : null, usageLimit: d.usageLimit ?? null, perCustomerLimit: d.perCustomerLimit ?? null, active: d.active },
    });
    return NextResponse.json({ ok: true, id: coupon.id });
  } catch {
    return NextResponse.json({ message: "Mã này đã tồn tại" }, { status: 409 });
  }
}
