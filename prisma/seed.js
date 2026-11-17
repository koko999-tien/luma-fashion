/**
 * Seed data cho LUMA Fashion (dữ liệu demo, tách biệt với production)
 * Chạy: npm run db:seed
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();
const IMG = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;

const IMG_POOL = {
  whiteTee: IMG("1521572163474-6864f9cf17ab"),
  tees: IMG("1618354691373-d851c5c3a990"),
  coloredTee: IMG("1618354691373-d851c5c3a990"),
  polo: IMG("1581655353564-df123a1eb820"),
  whiteShirt: IMG("1602810318383-e386cc2a3ccf"),
  blueShirt: IMG("1596755094514-f87e34085b2c"),
  blazer: IMG("1551028719-00167b16eac5"),
  suit: IMG("1594938298603-c8148c4dae35"),
  businessMan: IMG("1594938298603-c8148c4dae35"),
  suitModel: IMG("1617137984095-74e4e5e3613f"),
  phoneSuit: IMG("1516257984-b1b4d707412e"),
  jeans: IMG("1542272604-787c3835535d"),
  jeansLegs: IMG("1541099649105-f69ad21f3246"),
  floralDress: IMG("1595777457583-95e059d581b8"),
  redDress: IMG("1583496661160-fb5886a0aaaa"),
  yellowDress: IMG("1566174053879-31528523f8ae"),
  dress2: IMG("1509631179647-0177331693ae"),
  dress3: IMG("1544441893-675973e31985"),
  fashionRack: IMG("1445205170230-053b83016050"),
  rack2: IMG("1434389677669-e08b4cac3105"),
  streetFashion: IMG("1490481651871-ab68de25d43d"),
  womanRed: IMG("1503341504253-dff4815485f1"),
  womanPortrait: IMG("1524504388940-b1c1722653e1"),
  womanPortrait2: IMG("1524504388940-b1c1722653e1"),
  fashionWoman: IMG("1539109136881-3be0616acf4b"),
  modelColor: IMG("1539109136881-3be0616acf4b"),
  hatFashion: IMG("1469334031218-e382a71b716b"),
  shoppingWoman: IMG("1483985988355-763728e1935b"),
  shopping: IMG("1558769132-cb1aea458c5e"),
  manPortrait: IMG("1552374196-1ab2a1c593e8"),
  manPortrait2: IMG("1506794778202-cad84cf45f1d"),
  manStylish: IMG("1520975954732-35dd22299614"),
  manCoat: IMG("1520975954732-35dd22299614"),
  sunglasses: IMG("1572635196237-14b3f281503f"),
  sneaker: IMG("1549298916-b41d501d3772"),
  handbag: IMG("1584917865442-de89df76afd3"),
  watch: IMG("1523275335684-37898b6baf30"),
};

const CATEGORIES = [
  { slug: "ao", name: "Áo", image: IMG_POOL.whiteTee },
  { slug: "quan", name: "Quần", image: IMG_POOL.jeans },
  { slug: "vay-dam", name: "Váy & Đầm", image: IMG_POOL.floralDress },
  { slug: "giay", name: "Giày", image: IMG_POOL.sneaker },
  { slug: "tui-xach", name: "Túi xách", image: IMG_POOL.handbag },
  { slug: "phu-kien", name: "Phụ kiện", image: IMG_POOL.watch },
];

const COLLECTIONS = [
  { slug: "thu-dong-2026", name: "Thu – Đông 2026", description: "Chất liệu ấm áp, phom dáng hiện đại cho ngày se lạnh.", image: IMG_POOL.manCoat },
  { slug: "basic-essentials", name: "Basic Essentials", description: "Những món đồ cơ bản không bao giờ lỗi mốt.", image: IMG_POOL.tees },
  { slug: "cong-so", name: "Công Sở", description: "Thanh lịch, chỉn chu cho môi trường làm việc chuyên nghiệp.", image: IMG_POOL.businessMan },
  { slug: "streetwear", name: "Streetwear", description: "Năng động, cá tính cho nhịp sống đường phố.", image: IMG_POOL.streetFashion },
];

// [name, categorySlug, collectionSlug|null, gender, basePrice, salePrice|null, isNew, isFeatured, isBestSeller, imgMain, img2]
const PRODUCTS = [
  ["Áo Thun Basic Cotton 100%", "ao", "basic-essentials", "UNISEX", 199000, null, true, true, true, IMG_POOL.whiteTee, IMG_POOL.tees],
  ["Áo Thun Pima Cổ Tròn", "ao", "basic-essentials", "UNISEX", 249000, 189000, false, false, true, IMG_POOL.coloredTee, IMG_POOL.whiteTee],
  ["Áo Polo Cổ Bẻ Cao Cấp", "ao", "basic-essentials", "MEN", 329000, null, true, true, true, IMG_POOL.polo, IMG_POOL.whiteShirt],
  ["Áo Sơ Mi Oxford Trắng", "ao", "cong-so", "MEN", 389000, null, false, true, true, IMG_POOL.whiteShirt, IMG_POOL.blueShirt],
  ["Áo Sơ Mi Kẻ Sọc Hàn Quốc", "ao", "basic-essentials", "WOMEN", 349000, 279000, true, false, false, IMG_POOL.blueShirt, IMG_POOL.whiteShirt],
  ["Áo Blazer Công Sở Dáng Slim", "ao", "cong-so", "MEN", 899000, 749000, false, true, true, IMG_POOL.blazer, IMG_POOL.suitModel],
  ["Áo Vest Dáng Dài Nữ", "ao", "cong-so", "WOMEN", 1090000, 890000, true, true, false, IMG_POOL.fashionWoman, IMG_POOL.modelColor],
  ["Áo Thun Form Rộng Streetwear", "ao", "streetwear", "UNISEX", 229000, null, true, false, false, IMG_POOL.streetFashion, IMG_POOL.tees],
  ["Áo Khoác Dạ Thu Đông 2026", "ao", "thu-dong-2026", "MEN", 1290000, 990000, true, true, false, IMG_POOL.manCoat, IMG_POOL.blazer],
  ["Áo Nỉ Hoodie Oversize", "ao", "streetwear", "UNISEX", 459000, 389000, true, false, true, IMG_POOL.streetFashion, IMG_POOL.manPortrait],
  ["Quần Jean Xanh Ống Slim", "quan", "basic-essentials", "MEN", 459000, null, false, true, true, IMG_POOL.jeans, IMG_POOL.jeansLegs],
  ["Quần Jean Nữ Lưng Cao Ống Loe", "quan", "basic-essentials", "WOMEN", 429000, 349000, true, false, true, IMG_POOL.jeansLegs, IMG_POOL.jeans],
  ["Quần Tây Nam Ống Đứng", "quan", "cong-so", "MEN", 499000, null, false, false, true, IMG_POOL.businessMan, IMG_POOL.phoneSuit],
  ["Quần Âu Nữ Ống Rộng", "quan", "cong-so", "WOMEN", 469000, 399000, true, false, false, IMG_POOL.womanRed, IMG_POOL.fashionWoman],
  ["Quần Short Kaki Nam", "quan", "basic-essentials", "MEN", 299000, null, false, false, false, IMG_POOL.manStylish, IMG_POOL.manPortrait2],
  ["Quần Jean Rách Gối Streetwear", "quan", "streetwear", "UNISEX", 519000, 429000, true, false, false, IMG_POOL.jeans, IMG_POOL.streetFashion],
  ["Chân Váy Xếp Ly Dáng Chữ A", "vay-dam", "basic-essentials", "WOMEN", 359000, 289000, false, true, true, IMG_POOL.yellowDress, IMG_POOL.dress2],
  ["Đầm Midi Hoa Nhí Tay Phồng", "vay-dam", "thu-dong-2026", "WOMEN", 529000, 449000, true, true, true, IMG_POOL.floralDress, IMG_POOL.dress3],
  ["Đầm Dạ Hội Đỏ Sang Trọng", "vay-dam", "cong-so", "WOMEN", 1290000, null, false, true, false, IMG_POOL.redDress, IMG_POOL.dress2],
  ["Đầm Shirt Trắng Thanh Lịch", "vay-dam", "cong-so", "WOMEN", 599000, 499000, true, false, false, IMG_POOL.womanPortrait, IMG_POOL.dress3],
  ["Đầm Maxi Hoa Du Lịch", "vay-dam", "basic-essentials", "WOMEN", 489000, null, false, false, true, IMG_POOL.hatFashion, IMG_POOL.floralDress],
  ["Đầm Cocktail Đen Dự Tiệc", "vay-dam", "cong-so", "WOMEN", 1490000, 1190000, true, true, false, IMG_POOL.dress2, IMG_POOL.redDress],
  ["Chân Váy Midi Lụa Công Sở", "vay-dam", "cong-so", "WOMEN", 549000, null, false, false, false, IMG_POOL.womanPortrait2, IMG_POOL.yellowDress],
  ["Sneaker Unisex Trắng", "giay", "streetwear", "UNISEX", 749000, null, false, true, true, IMG_POOL.sneaker, IMG_POOL.shoppingWoman],
  ["Sneaker Phối Màu Đường Phố", "giay", "streetwear", "UNISEX", 829000, 699000, true, false, false, IMG_POOL.sneaker, IMG_POOL.streetFashion],
  ["Giày Tây Nam Da Thật", "giay", "cong-so", "MEN", 990000, null, false, false, true, IMG_POOL.manStylish, IMG_POOL.suitModel],
  ["Túi Xách Da Nữ Quai Xích", "tui-xach", null, "WOMEN", 649000, 549000, false, true, true, IMG_POOL.handbag, IMG_POOL.shoppingWoman],
  ["Túi Tote Da Mềm Công Sở", "tui-xach", "cong-so", "WOMEN", 799000, null, true, false, false, IMG_POOL.handbag, IMG_POOL.fashionWoman],
  ["Túi Đeo Chéo Streetwear", "tui-xach", "streetwear", "UNISEX", 399000, 329000, true, false, false, IMG_POOL.handbag, IMG_POOL.streetFashion],
  ["Đồng Hồ Nam Dây Da Classic", "phu-kien", null, "MEN", 990000, 790000, false, true, true, IMG_POOL.watch, IMG_POOL.manPortrait],
  ["Kính Mát Chống UV Unisex", "phu-kien", "streetwear", "UNISEX", 349000, null, true, false, false, IMG_POOL.sunglasses, IMG_POOL.manStylish],
  ["Thắt Lưng Da Bò Nam", "phu-kien", "cong-so", "MEN", 299000, 249000, false, false, false, IMG_POOL.manPortrait2, IMG_POOL.suit],
  ["Khăn Choàng Len Thu Đông", "phu-kien", "thu-dong-2026", "UNISEX", 259000, null, true, false, false, IMG_POOL.manCoat, IMG_POOL.rack2],
  ["Vest Nữ Kẻ Sọc Hiện Đại", "ao", "cong-so", "WOMEN", 1190000, 950000, true, false, false, IMG_POOL.modelColor, IMG_POOL.fashionWoman],
  ["Set Vest Nam Sự Kiện", "ao", "cong-so", "MEN", 1890000, 1590000, false, true, true, IMG_POOL.suitModel, IMG_POOL.suit],
  ["Áo Sơ Mi Linen Trắng Nam", "ao", "basic-essentials", "MEN", 379000, null, false, false, false, IMG_POOL.manPortrait, IMG_POOL.whiteShirt],
];

const SIZE_SETS = {
  giay: ["38", "39", "40", "41", "42", "43", "44"],
  "tui-xach": ["Free size"],
  "phu-kien": ["Free size"],
};
const CLOTHING_SIZES = ["S", "M", "L", "XL", "XXL"];
const COLORS = [
  ["Đen", "#111111"],
  ["Trắng", "#F5F5F5"],
  ["Navy", "#1F2A44"],
  ["Be", "#D8CBB8"],
  ["Xanh rêu", "#4A5240"],
];

function slugify(s) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("🧹 Xoá dữ liệu cũ...");
  await prisma.inventoryTransaction.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.couponUsage.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.category.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.address.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.user.deleteMany();

  console.log("👤 Tạo tài khoản...");
  const adminPass = await bcrypt.hash("Admin@123", 10);
  const customerPass = await bcrypt.hash("User@123", 10);
  const admin = await prisma.user.create({ data: { email: "admin@luma.vn", passwordHash: adminPass, name: "Quản Trị Viên", role: "ADMIN", phone: "0901234567" } });
  const customer = await prisma.user.create({ data: { email: "user@luma.vn", passwordHash: customerPass, name: "Nguyễn Minh Anh", role: "CUSTOMER", phone: "0987654321" } });
  await prisma.address.create({ data: { userId: customer.id, fullName: "Nguyễn Minh Anh", phone: "0987654321", line: "12 Nguyễn Hữu Cảnh", ward: "P.22", district: "Quận Bình Thạnh", city: "TP. Hồ Chí Minh", isDefault: true } });

  console.log("🗂️  Tạo danh mục & bộ sưu tập...");
  const catMap = {};
  for (const c of CATEGORIES) catMap[c.slug] = await prisma.category.create({ data: c });
  const colMap = {};
  for (const c of COLLECTIONS) colMap[c.slug] = await prisma.collection.create({ data: c });

  console.log("👕 Tạo 36 sản phẩm + biến thể...");
  const createdProducts = [];
  for (const [name, catSlug, colSlug, gender, basePrice, salePrice, isNew, isFeatured, isBestSeller, img, img2] of PRODUCTS) {
    const slug = slugify(name);
    const sizes = SIZE_SETS[catSlug] || CLOTHING_SIZES;
    const colorCount = catSlug === "phu-kien" || catSlug === "tui-xach" ? 3 : (gender === "WOMEN" ? 3 : 4);
    const colors = COLORS.slice(0, colorCount);
    const p = await prisma.product.create({
      data: {
        slug, name,
        description: `${name} — chất liệu cao cấp, phom dáng chuẩn, đường may tỉ mỉ. Sản phẩm thuộc bộ sưu tập ${colSlug ? COLLECTIONS.find(c => c.slug === colSlug).name : "LUMA Essentials"}, phù hợp mặc hằng ngày lẫn dịp đặc biệt.`,
        material: "Cotton pha / Polyester cao cấp (xem nhãn sản phẩm)",
        care: "Giặt máy ở 30°C, không tẩy, ủi ở nhiệt độ thấp",
        origin: "Made in Vietnam",
        gender, basePrice, salePrice,
        isNew, isFeatured, isBestSeller,
        categoryId: catMap[catSlug].id,
        collectionId: colSlug ? colMap[colSlug].id : null,
        images: { create: [{ url: img, sort: 0 }, { url: img2, sort: 1 }] },
        variants: {
          create: sizes.flatMap((size) =>
            colors.map(([color, colorHex], ci) => ({
              sku: `LM-${slug.slice(0, 12).toUpperCase().replace(/-/g, "")}-${size}-${ci + 1}`,
              size, color, colorHex,
              stock: [25, 40, 15, 30, 20][(size.length + ci) % 5],
            }))
          ),
        },
      },
    });
    createdProducts.push(p);
  }

  console.log("⭐ Tạo đánh giá (dữ liệu demo)...");
  const first = createdProducts[0];
  await prisma.review.create({ data: { productId: first.id, userId: customer.id, rating: 5, title: "Rất đáng tiền", body: "Áo mặc mát, form chuẩn như mô tả. Sẽ ủng hộ shop tiếp!" } });
  const polo = createdProducts[2];
  await prisma.review.create({ data: { productId: polo.id, userId: customer.id, rating: 5, title: "Vải đẹp", body: "Vải cá sấu dày dặn, mặc đi làm rất lịch sự." } });

  console.log("🎟️  Tạo mã giảm giá...");
  await prisma.coupon.createMany({
    data: [
      { code: "LUMA10", type: "PERCENT", value: 10, minOrder: 300000, maxDiscount: 100000, usageLimit: 500, active: true },
      { code: "GIAM50K", type: "FIXED", value: 50000, minOrder: 500000, usageLimit: 200, active: true },
      { code: "FREESHIP", type: "FIXED", value: 30000, minOrder: 0, usageLimit: 1000, active: true },
    ],
  });

  console.log("🖼️  Tạo banner & cài đặt...");
  await prisma.banner.createMany({
    data: [
      { headline: "ĐỊNH HÌNH PHONG CÁCH MỖI NGÀY", subtext: "Bộ sưu tập Thu – Đông 2026 đã có mặt", image: IMG_POOL.shopping, ctaText: "Khám phá ngay", ctaUrl: "/collection/thu-dong-2026", active: true, sort: 0 },
      { headline: "ƯU ĐÃI ĐẾN 30%", subtext: "Áp dụng cho sản phẩm được gắn nhãn sale", image: IMG_POOL.shoppingWoman, ctaText: "Xem khuyến mãi", ctaUrl: "/products?sale=true", active: true, sort: 1 },
    ],
  });
  await prisma.setting.createMany({
    data: [
      { key: "announcement", value: "Miễn phí vận chuyển cho đơn từ 499K • Đổi trả trong 7 ngày • Hotline 0901 234 567" },
      { key: "freeShipThreshold", value: "499000" },
      { key: "shipFeeStandard", value: "30000" },
      { key: "shipFeeExpress", value: "60000" },
    ],
  });

  console.log("📦 Tạo đơn hàng mẫu...");
  const variant = await prisma.productVariant.findFirst({ where: { productId: first.id, size: "M" } });
  const order = await prisma.order.create({
    data: {
      orderNumber: "LM" + Date.now().toString().slice(-8),
      userId: customer.id,
      customerName: customer.name, email: customer.email, phone: customer.phone,
      addressLine: "12 Nguyễn Hữu Cảnh", ward: "P.22", district: "Quận Bình Thạnh", city: "TP. Hồ Chí Minh",
      shippingMethod: "STANDARD", shippingFee: 0,
      paymentMethod: "COD", paymentStatus: "PAID", orderStatus: "DELIVERED",
      subtotal: 199000, discount: 0, total: 199000,
      items: { create: [{ variantId: variant.id, productName: first.name, sku: variant.sku, size: "M", color: variant.color, price: 199000, quantity: 1, image: IMG_POOL.whiteTee }] },
      statusHistory: { create: [{ status: "PENDING" }, { status: "CONFIRMED" }, { status: "SHIPPED" }, { status: "DELIVERED" }] },
    },
  });

  console.log("✅ Seed hoàn tất!");
  console.log("   Admin : admin@luma.vn / Admin@123");
  console.log("   User  : user@luma.vn  / User@123");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());



