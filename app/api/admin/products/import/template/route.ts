import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 403 });

  const header = ["name", "description", "categorySlug", "collectionSlug", "gender", "basePrice", "salePrice", "isNew", "isFeatured", "isBestSeller", "imageUrls", "size", "color", "colorHex", "stock", "sku"];
  const example = [
    ["Áo Polo Basic", "Áo polo cotton piqué, form regular.", "ao", "basic-essentials", "MEN", "329000", "", "true", "false", "false", "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=900", "M", "Navy", "#1F2A44", "30", "POLO-NAVY-M"],
    ["Áo Polo Basic", "Áo polo cotton piqué, form regular.", "ao", "basic-essentials", "MEN", "329000", "", "true", "false", "false", "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=900", "L", "Navy", "#1F2A44", "25", "POLO-NAVY-L"],
  ];
  const csv = toCsv([header, ...example]);
  return new NextResponse(csv, {
    status: 200,
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="luma-product-import-template.csv"', "Cache-Control": "no-store" },
  });
}
