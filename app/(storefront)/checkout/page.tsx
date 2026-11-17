import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CheckoutForm from "@/components/CheckoutForm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Thanh toán" };

export default async function CheckoutPage() {
  const session = await getSession();
  let defaultAddress = null as null | { fullName: string; phone: string; line: string; ward: string | null; district: string; city: string };
  if (session) {
    defaultAddress = await prisma.address.findFirst({ where: { userId: session.id, isDefault: true }, select: { fullName: true, phone: true, line: true, ward: true, district: true, city: true } });
  }
  return (
    <CheckoutForm
      defaultEmail={session?.email ?? ""}
      defaultName={defaultAddress?.fullName ?? session?.name ?? ""}
      defaultPhone={defaultAddress?.phone ?? ""}
      defaultAddress={defaultAddress?.line ?? ""}
      defaultWard={defaultAddress?.ward ?? ""}
      defaultDistrict={defaultAddress?.district ?? ""}
      defaultCity={defaultAddress?.city ?? "TP. Hồ Chí Minh"}
    />
  );
}
