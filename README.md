# LUMA Fashion — Modern Fashion E-commerce Platform

Nền tảng thương mại điện tử thời trang hoàn chỉnh: storefront cao cấp + giỏ hàng server-side + checkout thật + tài khoản khách hàng + trang quản trị (admin) với dashboard, quản lý sản phẩm/kho/đơn/mã giảm giá/banner.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Prisma ORM · SQLite (dev) / PostgreSQL (production) · JWT session (httpOnly cookie) · bcrypt · Recharts · Lucide icons

---

## 1. Chạy trên máy của bạn (3 bước)

```bash
cd D:\luma-fashion
npm install          # tự chạy prisma generate
npm run db:push      # tạo database SQLite (prisma/dev.db)
npm run db:seed      # nạp 36 sản phẩm mẫu + tài khoản + coupon + banner
npm run dev          # http://localhost:3000
```

Production build:
```bash
npm run build && npm start
```

### Tài khoản demo (tạo bởi seed)

| Vai trò | Email | Mật khẩu |
|---|---|---|
| **Admin** | admin@luma.vn | Admin@123 |
| **Khách hàng** | user@luma.vn | User@123 |

Admin đăng nhập tại `/login` → tự động vào `/admin`.

---

## 2. Tính năng đã hoạt động thật (test end-to-end ✔)

**Storefront**
- Trang chủ: hero campaign (quản lý qua Admin → Banner), danh mục, hàng mới về, best sellers, bộ sưu tập nổi bật, đánh giá thật từ database, newsletter (lưu DB, chặn trùng)
- Danh sách sản phẩm `/products`: lọc theo danh mục/giới tính/khoảng giá/size/màu/sale, sắp xếp, phân trang, đồng bộ URL query
- Tìm kiếm: `/search?q=...` + gợi ý autocomplete (`/api/search/suggest`)
- Chi tiết sản phẩm: gallery ảnh + lightbox, chọn màu (swatch)/size (kiểm tra tồn kho từng biến thể), hướng dẫn size, đánh giá, sản phẩm liên quan, JSON-LD structured data
- **Giỏ hàng server-side** (hoạt động cho cả khách vãng lai lẫn thành viên, tự gộp khi đăng nhập): thêm/xoá/đổi số lượng, kiểm tồn kho, lưu DB
- **Checkout thật**: thông tin nhận hàng → vận chuyển (tiêu chuẩn/hoả tốc, freeship ≥ 499K) → coupon (LUMA10/GIAM50K/FREESHIP) → COD hoặc chuyển khoản → tạo Order + OrderItems + trừ kho an toàn bằng transaction (chống oversell) + ghi lịch sử trạng thái
- Wishlist (lưu DB theo tài khoản), đánh giá sản phẩm, đổi mật khẩu, quên/đặt lại mật khẩu (token 1h)
- Trang tĩnh: Về LUMA, Liên hệ (lưu DB), FAQ, Vận chuyển, Đổi trả, Bảo mật, Điều khoản, 404

**Admin** (`/admin`, chỉ tài khoản role ADMIN — kiểm tra ở server)
- Dashboard: doanh thu theo ngày (7/30/90 ngày), đơn hàng, khách, sp đang bán, đơn chờ, hàng sắp hết + biểu đồ doanh thu theo danh mục + 6 đơn mới nhất
- Sản phẩm: danh sách, tìm theo tên/SKU, thêm mới (ảnh + biến thể), sửa giá/tồn kho từng biến thể, lưu trữ/bán lại
- Đơn hàng: lọc/tìm, chi tiết, **cập nhật trạng thái đơn & thanh toán**, huỷ đơn → tự hoàn kho, lịch sử trạng thái, ghi chú nội bộ
- Kho hàng: danh sách biến thể sắp hết (≤5) + lịch sử nhập/xuất
- Khách hàng: tìm, tổng chi tiêu, khoá/mở khoá tài khoản
- Mã giảm giá: tạo (PERCENT/FIXED, đơn tối thiểu, giảm tối đa, hạn, giới hạn lượt), bật/tắt
- Banner trang chủ: thêm/bật/tắt/xoá (headline, CTA, link, thứ tự)
- Cài đặt: thanh thông báo, ngưỡng freeship, phí ship

**Bảo mật**
- Mật khẩu bcrypt (10 rounds) · phiên JWT httpOnly (30 ngày) · admin check ở server, không dựa vào ẩn nút · khách chỉ xem đơn của mình · 400/401/403/404/409 chuẩn · transaction cho đặt hàng & huỷ đơn · không lưu thẻ thanh toán · `.env` không commit · Secure cookie tự bật khi `SITE_URL` là https

---

## 3. Cấu hình (`.env`)

Xem `.env.example`. Các biến:

| Biến | Bắt buộc | Mô tả |
|---|---|---|
| `DATABASE_URL` | ✔ | `file:./dev.db` (dev) · `postgresql://…` (production — đổi `provider` trong `prisma/schema.prisma` sang `postgresql` rồi `prisma db push`) |
| `AUTH_SECRET` | ✔ | Chuỗi bí mật JWT ≥ 32 ký tự |
| `SITE_URL` | ✔ | URL gốc — quyết định cookie `Secure` và sitemap |
| `RESEND_API_KEY` | — | Chưa có → email KHÔNG gửi, chỉ ghi NotificationLog (status=DISABLED) + server log. Có key → gửi thật qua Resend |
| `VNPAY_*` / `MOMO_*` | — | Chưa có → cổng online tự động **từ chối** (không giả vờ thanh toán thành công). Khi có merchant: triển khai handler callback + set `paymentStatus=PAID` sau khi xác thực chữ ký |

---

## 4. Triển khai production (Vercel + PostgreSQL)

1. Đẩy code lên GitHub, import vào Vercel.
2. Tạo PostgreSQL (Supabase/Neon/Railway) → lấy connection string.
3. Sửa `prisma/schema.prisma`: `provider = "postgresql"`.
4. Vercel env: `DATABASE_URL`, `AUTH_SECRET` (random ≥32 ký tự), `SITE_URL=https://yourdomain.com`.
5. `npm run db:push && npm run db:seed` (local, trỏ DATABASE_URL sang production) để nạp dữ liệu mẫu — hoặc tự nhập sản phẩm qua trang Admin.
6. Đổi mật khẩu admin ngay sau khi seed.

---

## 5. Bản cập nhật v1.1 (2026-11-04)

**Quản trị đầy đủ hơn:**
- Quản lý **Danh mục** (`/admin/categories`): tạo/sửa/ẩn/xoá (xoá danh mục có sản phẩm chỉ ẩn, không phá dữ liệu), thứ tự hiển thị, ảnh, mô tả
- Quản lý **Bộ sưu tập** (`/admin/collections`): CRUD đầy đủ, gán/gỡ sản phẩm, chế độ Featured, slug tự sinh
- **Import sản phẩm CSV** (`/admin/products/import`): tải template, preview trước khi ghi, validate đầy đủ (giá, SKU trùng, danh mục/collection tồn tại), **1 lỗi là rollback toàn bộ** — không bao giờ import nửa vời
- **Export đơn hàng CSV** (`/admin/orders` → nút Export CSV): UTF-8 BOM (Excel đọc tiếng Việt đúng), chống CSV injection, lọc theo ngày/trạng thái/thanh toán/vận chuyển
- **Upload ảnh sản phẩm**: lưu ngoài public (`.uploads/`), kiểm magic bytes (không tin extension), tên file random, phục vụ an toàn qua `/api/files/<name>`; tối đa 5MB/ảnh
- Mã vận đơn (GHN/GHTK/Viettel Post) nhập ở chi tiết đơn — khách thấy ở `/account/orders/<mã>`; email SHIPPED kèm mã vận đơn
- Phí ship theo vùng miền: HCM/Hà Nội phí chuẩn, tỉnh khác phí vùng xa (cấu hình được trong Settings)
- Đổi trạng thái đơn có **kiểm tra chuyển trạng thái hợp lệ** (vd không thể DELIVERED → PENDING); CANCELLED là trạng thái cuối → không thể hoàn kho 2 lần; lịch sử kho ghi đầy đủ `previousQty/newQty/type/adminId`
- Mã giảm giá: thêm **giới hạn lượt dùng / mỗi khách**

**Email thật (Resend):** chào mừng, quên mật khẩu, xác nhận đơn, cập nhật trạng thái, xác nhận thanh toán, huỷ đơn — HTML theo thương hiệu LUMA, ghi **NotificationLog** mọi lượt gửi (`SENT` / `FAILED` / `DISABLED`). Chưa có `RESEND_API_KEY` → không gửi, chỉ log, không bao giờ báo "đã gửi".

**Thanh toán online:** module VNPay (HMAC-SHA512) / MoMo (HMAC-SHA256) / ZaloPay (HMAC-SHA256) — verify chữ ký callback ở server, idempotent, đối chiếu số tiền với đơn; chưa có merchant → cổng tự tắt.

**Bảo mật:** rate limit cho login/register/forgot/checkout/coupon-validate; `AUTH_SECRET` bắt buộc ở production (thiếu → lỗi rõ ràng, không chạy với secret mặc định).

**Tài liệu mới:** `docs/AUDIT.md` (audit chi tiết), `docs/POSTGRESQL_MIGRATION.md`, `docs/DEPLOYMENT.md`.

## 6. Giới hạn đã biết / việc cần làm khi lên thật

- Ảnh sản phẩm seed là ảnh mẫu Unsplash; ảnh bạn tự upload lưu ở `.uploads/` (cần object storage + backup khi deploy nhiều instance, xem `docs/DEPLOYMENT.md`).
- VNPay/MoMo/ZaloPay, GHN/GHTK/Viettel Post: **code thật, chưa test với merchant/tài khoản thật** — cần credential mới bật; tài liệu trong `docs/DEPLOYMENT.md`.
- Email chưa gửi khi chưa có `RESEND_API_KEY`; theo dõi `NotificationLog` để biết trạng thái.
- SQLite chỉ cho dev/demo; production dùng PostgreSQL theo `docs/POSTGRESQL_MIGRATION.md`.
- Rate limit đang in-memory (1 instance); multi-instance nên chuyển sang Redis/Upstash.
- Lọc theo `rating` sắp xếp in-memory (đủ nhanh ở quy mô vài nghìn sản phẩm).

---


## 6. Cấu trúc thư mục

```
app/(storefront)/   # Trang khách: home, products, cart, checkout, account…
app/admin/          # Trang quản trị (dark UI, tách biệt)
app/api/            # REST API: cart, checkout, auth, wishlist, reviews, admin/*
components/         # UI components (ProductCard, Header, FilterSidebar…)
lib/                # prisma, auth (JWT), cart, coupon, format, brand
prisma/schema.prisma  # 24 models
prisma/seed.js      # Dữ liệu demo (36 sản phẩm, 4 bộ sưu tập, 6 danh mục)
```
