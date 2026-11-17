import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { prisma } from "./prisma";
import { getSession } from "./auth";

const CART_COOKIE = "luma_cart_key";
export const FREE_SHIP_THRESHOLD_DEFAULT = 499000;
export const SHIP_FEES = { STANDARD: 30000, EXPRESS: 60000 } as const;

/** Lấy (hoặc tạo) giỏ hàng cho khách vãng lai / user đã đăng nhập */
export async function getOrCreateCart() {
  const session = await getSession();
  const store = await cookies();

  if (session) {
    const userCartKey = `user:${session.id}`;
    let cart = await prisma.cart.findUnique({ where: { cartKey: userCartKey } });
    if (!cart) {
      // Gộp giỏ khách vãng lai vào giỏ user nếu có
      const guestKey = store.get(CART_COOKIE)?.value;
      const guestCart = guestKey ? await prisma.cart.findUnique({ where: { cartKey: guestKey }, include: { items: true } }) : null;
      cart = await prisma.cart.create({ data: { cartKey: userCartKey, userId: session.id } });
      if (guestCart?.items.length) {
        for (const item of guestCart.items) {
          await prisma.cartItem.upsert({
            where: { cartId_variantId: { cartId: cart.id, variantId: item.variantId } },
            update: { quantity: { increment: item.quantity } },
            create: { cartId: cart.id, variantId: item.variantId, quantity: item.quantity },
          });
        }
        await prisma.cart.delete({ where: { id: guestCart.id } });
        store.delete(CART_COOKIE);
      }
    }
    return cart;
  }

  let key = store.get(CART_COOKIE)?.value;
  if (key) {
    const cart = await prisma.cart.findUnique({ where: { cartKey: key } });
    if (cart) return cart;
  }
  key = randomUUID();
  store.set(CART_COOKIE, key, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 60 });
  return prisma.cart.create({ data: { cartKey: key } });
}

export type CartViewItem = {
  id: string;
  variantId: string;
  quantity: number;
  sku: string;
  size: string;
  color: string;
  colorHex: string;
  unitPrice: number;
  stock: number;
  productId: string;
  productSlug: string;
  productName: string;
  image: string | null;
  lineTotal: number;
};

export async function getCartView() {
  const cart = await getOrCreateCart();
  const full = await prisma.cart.findUniqueOrThrow({
    where: { id: cart.id },
    include: {
      items: {
        include: {
          variant: {
            include: { product: { include: { images: { orderBy: { sort: "asc" }, take: 1 } } } },
          },
        },
        orderBy: { id: "asc" },
      },
    },
  });

  const items: CartViewItem[] = full.items.map((i) => {
    const p = i.variant.product;
    const unitPrice = i.variant.priceOverride ?? p.salePrice ?? p.basePrice;
    return {
      id: i.id,
      variantId: i.variantId,
      quantity: i.quantity,
      sku: i.variant.sku,
      size: i.variant.size,
      color: i.variant.color,
      colorHex: i.variant.colorHex,
      unitPrice,
      stock: i.variant.stock,
      productId: p.id,
      productSlug: p.slug,
      productName: p.name,
      image: p.images[0]?.url ?? null,
      lineTotal: unitPrice * i.quantity,
    };
  });

  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  return { cartId: full.id, items, subtotal };
}

/** Phí ship + kiểm tra free-ship threshold từ Settings (kèm phí vùng xa) */
export async function getShippingConfig() {
  const rows = await prisma.setting.findMany({ where: { key: { in: ["freeShipThreshold", "shipFeeStandard", "shipFeeExpress", "shipFeeRemote"] } } });
  const map = Object.fromEntries(rows.map((r) => [r.key, Number(r.value)]));
  return {
    freeShipThreshold: map.freeShipThreshold ?? FREE_SHIP_THRESHOLD_DEFAULT,
    standardFee: map.shipFeeStandard ?? SHIP_FEES.STANDARD,
    expressFee: map.shipFeeExpress ?? SHIP_FEES.EXPRESS,
    remoteFee: map.shipFeeRemote ?? 45000,
  };
}

const MAJOR_CITY_PATTERNS = [/h[oồ] ch[íi] minh/i, /hcm/i, /sài gòn/i, /hà nội/i, /ha noi/i];

/** Phí vận chuyển theo phương thức + vùng miền (HCM/HN: phí chuẩn, tỉnh khác: phí vùng xa) */
export function computeShipping(method: string, subtotal: number, cfg: { freeShipThreshold: number; standardFee: number; expressFee: number; remoteFee: number }, city?: string) {
  if (subtotal >= cfg.freeShipThreshold) return 0;
  if (method === "EXPRESS") return cfg.expressFee;
  const isMajor = city ? MAJOR_CITY_PATTERNS.some((re) => re.test(city)) : true;
  return isMajor ? cfg.standardFee : cfg.remoteFee;
}
