import { NextResponse } from "next/server";
import { getCartView } from "@/lib/cart";

export async function GET() {
  const view = await getCartView();
  return NextResponse.json(view);
}
