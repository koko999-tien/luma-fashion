import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { toCsv } from "@/lib/csv";

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 403 });

  const sp = new URL(req.url).searchParams;
  const q = sp.get("q")?.trim() ?? "";
  const status = sp.get("status") ?? "";
  const paymentStatus = sp.get("paymentStatus") ?? "";
  const paymentMethod = sp.get("paymentMethod") ?? "";
  const shippingMethod = sp.get("shippingMethod") ?? "";
  const from = sp.get("from");
  const to = sp.get("to");

  const where: Record<string, unknown> = {};
  if (status) where.orderStatus = status;
  if (paymentStatus) where.paymentStatus = paymentStatus;
  if (paymentMethod) where.paymentMethod = paymentMethod;
  if (shippingMethod) where.shippingMethod = shippingMethod;
  if (from || to) {
    const range: Record<string, Date> = {};
    if (from) range.gte = new Date(`${from}T00:00:00.000Z`);
    if (to) range.lte = new Date(`${to}T23:59:59.999Z`);
    where.createdAt = range;
  }
  if (q) where.OR = [{ orderNumber: { contains: q } }, { customerName: { contains: q } }, { phone: { contains: q } }, { email: { contains: q } }];

  const orders = await prisma.order.findMany({
    where,
    include: { items: { select: { productName: true, sku: true, size: true, color: true, quantity: true, price: true } } },
    orderBy: { createdAt: "desc" },
    take: 5000,
  });

  const header = ["Ma don", "Ngay dat", "Khach hang", "Email", "SDT", "Dia chi", "San pham", "Tam tinh (VND)", "Giam gia (VND)", "Phi ship (VND)", "Tong cong (VND)", "Ma GG", "Van chuyen", "Thanh toan", "TT thanh toan", "TT don hang"];
  const rows = orders.map((o) => [
    o.orderNumber,
    o.createdAt.toISOString().slice(0, 19).replace("T", " "),
    o.customerName,
    o.email,
    o.phone,
    [o.addressLine, o.ward, o.district, o.city].filter(Boolean).join(", "),
    o.items.map((i) => `${i.productName} (${i.size}/${i.color}) x${i.quantity} [${i.sku}]`).join(" | "),
    o.subtotal,
    o.discount,
    o.shippingFee,
    o.total,
    o.couponCode ?? "",
    o.shippingMethod === "EXPRESS" ? "Hoa toc" : "Tieu chuan",
    o.paymentMethod,
    o.paymentStatus,
    o.orderStatus,
  ]);

  const csv = toCsv([header, ...rows]);
  const filename = `luma-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
