# LUMA FASHION — SOURCE CODE AUDIT (2026-11-04)

Auditor: Tiếp quản dự án hiện có. Phương pháp: đọc trực tiếp cấu trúc, package.json, schema Prisma, toàn bộ API routes, lib/, app/. **Không sửa code khi chưa audit xong.**

---

## A. Tổng quan hiện trạng

| Hạng mục | Trạng thái | Ghi chú |
|---|---|---|
| Stack | ✅ | Next.js 15.5.29, TS 5.9.3, Prisma 6.19.3, React 19.3, Tailwind 3.4, Zod 4, bcryptjs, jose, recharts, lucide-react |
| Storefront | ✅ Hoạt động | Home, products (filter/sort/paginate), search+suggest, product detail (gallery/variant stock/wishlist/review), collection page |
| Cart | ✅ Hoạt động | Server-side cart (guest + user, merge khi login), kiểm tồn kho |
| Checkout | ✅ Hoạt động | COD + chuyển khoản; transaction trừ kho; mã đơn unique; **chưa gửi email xác nhận** |
| Account | ✅ Hoạt động | Register/login/logout/reset/change-password, orders history+detail, wishlist; **account pages từng crash với `getSession()!` — ĐÃ FIX (requireUser + redirect)** |
| Admin | ✅ Cơ bản | Dashboard (doanh thu, chart), Products (list/new/edit + tồn kho biến thể), Orders (đổi trạng thái + hoàn kho), Customers (khoá/mở), Coupons, Banners, Settings, Inventory (list) |
| Email | ❌ Chưa có | Password reset ghi log. Không có email order confirmation |
| Payment online | ⚠️ Khung | COD/BANK_TRANSFER; VNPay/MoMo/ZaloPay bị từ chối vì chưa cấu hình (đúng). Chưa có module provider riêng |
| Shipping | ⚠️ Cơ bản | Phí cố định + freeship threshold (Settings). Không có GHN/GHTK/Viettel Post integration, không có tracking number, không có vùng miền |
| Tests | ❌ Không có | Không file test nào |
| Migration files | ❌ Không có | Dùng `prisma db push`; không có thư mục `prisma/migrations` |
| Upload ảnh | ❌ Không có | Ảnh nhập qua URL; admin không upload trực tiếp |

---

## B. Vấn đề phát hiện (severity → solution)

### B1. Nghiệp vụ / chức năng còn thiếu

| # | File/khu vực | Vấn đề | Severity | Giải pháp |
|---|---|---|---|---|
| 1 | `app/admin` | Không có quản lý **Category** / **Collection** (tạo/sửa/ẩn/thứ tự/slug/SEO) | High | Thêm module admin + API + schema mở rộng (sort, active, description, ogImage) |
| 2 | `app/admin/products` | Chưa import CSV sản phẩm | High | `/api/admin/products/import` (preview + commit, transaction), template CSV tải về |
| 3 | `app/admin/orders` | Không export CSV | High | `/api/admin/orders/export` — UTF-8 BOM, escape, admin-only, filter q/status/payment/method/date |
| 4 | `lib/cart.ts` / orders | Không gửi email xác nhận/trạng thái | High | `lib/email.ts` + Resend provider (fallback log) + template HTML + `NotificationLog` |
| 5 | `lib/` | Không có payment provider modules VNPay/MoMo/ZaloPay (chỉ có check env) | High | `lib/payments/*` interface + HMAC verify + callback routes disabled-until-config |
| 6 | `lib/` | Không có shipping providers (GHN/GHTK/Viettel Post) | Medium | `lib/shipping/providers.ts` interface + config từ Settings; fee region-based |
| 7 | `prisma/schema.prisma` | `InventoryTransaction` thiếu `previousQty/newQty/type/adminId`; chưa có `NotificationLog`, `Category.description/sort/active`, `Collection.active/sort/featured`, order không có `shippingTracking` | Medium | Mở rộng schema (additive, không phá data), `db push` |
| 8 | `app/admin/products/[id]/edit` | Không upload ảnh, không liên kết ảnh-màu | Medium | `/api/admin/uploads` (validate magic bytes + size + random name, lưu `.uploads/` ngoài `public/`, serve qua `/api/files/[name]`) |
| 9 | `lib/auth.ts` | `AUTH_SECRET` fallback yếu nếu thiếu ở production | Medium | Fail-fast khi `NODE_ENV=production` mà không có `AUTH_SECRET` |
| 10 | `app/api/*` | Không rate limit cho login/register/forgot/checkout | Medium | `lib/rateLimit.ts` in-memory (per IP+route) |
| 11 | `app/admin/orders/[id]` | Không có guard chuyển trạng thái (VD: DELIVERED → PENDING vô nghĩa) | Medium | Bảng transition hợp lệ trong `lib/orderStatus.ts`, validate ở API |
| 12 | `app/api/checkout` | Không ghi `PARTIAL` khi email fail — OK (email không block); nhưng chưa log email attempt | Low | NotificationLog ghi mọi attempt |

### B2. Kỹ thuật / nợ

| # | Vấn đề | Severity | Giải pháp |
|---|---|---|---|
| 13 | 7 thư mục rỗng ở root (`about/`, `contact/`…) — rác từ lệnh PowerShell trước | Low | Xoá (đã xoá) |
| 14 | `.env.example` dùng `EMAIL_PROVIDER_API_KEY`; chuẩn hoá sang `RESEND_API_KEY` | Low | Cập nhật docs + hỗ trợ cả hai |
| 15 | `next.config.mjs` khai báo webpack alias `@` thủ công — chạy tốt, giữ nguyên | Info | Không đổi |
| 16 | `getSession()!` pattern từng crash trang account → đã đổi sang `requireUser()` | ✅ Done | Giữ |
| 17 | Không có `prisma/migrations/` | Medium | Tạo baseline migration khi migrate Postgres |
| 18 | Ảnh Unsplash có thể 404 runtime — cần fallback | Low | Đã có `onerror` fallback ở một số nơi; bổ sung `placehold.co` fallback cho gallery chính |
| 19 | Footer/newsletter/contact hoạt động; `README` đã có nhưng chưa có hướng dẫn migrate Postgres/deploy | Medium | Viết `docs/POSTGRESQL_MIGRATION.md` + `docs/DEPLOYMENT.md` |

### B3. Bảo mật (rà soát)

| # | Vấn đề | Severity | Giải pháp |
|---|---|---|---|
| 20 | Login/register/forgot/checkout không rate-limit | Medium | `lib/rateLimit.ts` |
| 21 | `paymentStatus=PAID` admin có thể tự đặt — cần ghi audit | Low | Thêm `OrderStatusHistory` note bắt buộc khi set PAID? Hiện có `adminNote` + history; ghi rõ trong docs |
| 22 | CSV injection khi export (cell bắt đầu bằng `=`, `+`, `-`, `@`) | Medium | Escape + prefix `'` |
| 23 | Upload (khi thêm) phải kiểm magic bytes, không tin extension | Medium | `lib/uploads.ts` validate |
| 24 | Coupon: không giới hạn per-customer | Low | Ghi nhận qua CouponUsage; thêm check trong `evaluateCoupon(userId)` |

---

## C. Kế hoạch triển khai (theo thứ tự)

**STAGE D** — Category/Collection admin (CRUD + schema mở rộng)
**STAGE E** — CSV: template/import sản phẩm + export đơn hàng
**STAGE F** — Inventory transaction đầy đủ + order status transition guard
**STAGE G** — Email: lib + templates + gắn vào register/checkout/forgot/admin status
**STAGE H** — Payment modules (VNPay/MoMo/ZaloPay) + shipping provider interfaces
**STAGE I** — Security: rate limit, AUTH_SECRET fail-fast, CSV escaping, coupon per-user limit
**STAGE J** — Docs: Postgres migration guide, Deployment guide, README update, .env.example
**STAGE K** — Smoke test script + build + manual flow test

**Nguyên tắc:** giữ nguyên Next 15.5.29 / Prisma 6 / React 19 / Tailwind 3 — không nâng major version. Không đụng `D:\shop-thoi-trang`.
